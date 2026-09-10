# Large-map audit

**Base commit:** `c584760eccf3677936b5ba13f25f50e6f026b12f`  
**Scope:** Report only. No game code, contracts, assets, tests, or configuration changed.

## Summary

The alpha assumes one global 15 × 11 map in the simulation, client, tests, bot, documentation, and persisted room state. Map geometry is not represented by a data object or stable map identifier. The browser client renders every tile into one fixed-aspect-ratio CSS grid and has no camera, pan, zoom, culling, or off-screen threat model. These constraints are coherent for the current alpha but block substantially larger or variable-size arenas.

The highest-risk coupling is `lib/game/engine.ts`: it owns map dimensions, static shell content, objective geometry, initial spawns, respawns, and bot navigation alongside resolution rules and shared wire-state types. That crosses Rules & server, Contracts, and Map content lanes.

## Code and content findings

| Location | Current assumption | Owning lane | Suggested fix |
|---|---|---|---|
| `lib/game/engine.ts:6` | `Game` has no map ID, map version, dimensions, static layers, or spawn/objective references. A saved room can only be interpreted against whatever global constants the deployed code currently has. | Contracts | In an owner-approved contract PR, add a stable map reference/version to match state and define a data-driven map schema. Decide whether static geometry is embedded or resolved from a versioned catalog. |
| `lib/game/engine.ts:7` | Width and height are global constants `W=15` and `H=11`. | Rules & server | Pass a validated map definition into initialization, validation, visibility, resolution, and bot logic; derive bounds from it. |
| `lib/game/engine.ts:8` | Eight shell cells are a global coordinate list. There is no per-map content source. | Map content | Move shell/blocked-cell coordinates into versioned map data, validated to be in bounds and not overlap objectives or spawns. |
| `lib/game/engine.ts:12-14` | Bounds and shell checks close over globals; the objective is always the Manhattan-radius-one area around `{x:7,y:5}`. | Rules & server / Map content | Make geometry helpers accept a map. Represent objective cells or zones in map data instead of reconstructing the current five-cell shape from a fixed center. |
| `lib/game/engine.ts:15` | Initial spawns are hardcoded at x=1/13 and y=3/5/7. This also assumes exactly three creatures and a horizontal left-versus-right map. | Map content | Define ordered spawn slots per team in map data. Validate capacity and use the same source for initial spawn and respawn. |
| `lib/game/engine.ts:16` | Reachability is bounded by creature movement, but every call depends on global `inside` and `shell` helpers. | Rules & server | Thread map data through pathfinding. Add a largest-fixture test and benchmark after target dimensions are chosen. |
| `lib/game/engine.ts:17` | Line of sight samples each segment at four samples per tile. Work grows with long sight lines, and rounding can revisit cells. | Rules & server | Replace or validate against a deterministic grid-ray traversal; benchmark longest valid sight lines on the largest fixture before changing behavior. |
| `lib/game/engine.ts:18-19` | Concealment scans every shell and friendly unit; `view`, validation, attacks, and the bot call these helpers repeatedly. The fixed reveal distance is two tiles. | Rules & server | Index blocked cells for constant-time lookup and profile visibility as map area grows. Keep reveal distance unchanged until Open Decision 6 is resolved. |
| `lib/game/engine.ts:25` | Respawn duplicates the hardcoded home coordinates and searches an entire fixed-height column using `H`. | Rules & server / Map content | Centralize spawn selection around the map's ordered spawn slots or zones. Define a deterministic fallback order in map data. |
| `lib/game/engine.ts:27` | First-to-three scoring and the 12-turn cap are hardcoded in resolution. Larger travel distances could end games before meaningful objective interaction. | Rules & server | Do not tune yet. Move match parameters into an owner-approved rules configuration only after Open Decisions 2–4 are answered. |
| `lib/game/engine.ts:28` | The bot scores movement by distance to the fixed center `{x:7,y:5}`; candidate sorting repeatedly evaluates visibility and range. | Rules & server | Derive goals from map objectives, use a deterministic tie-breaker, and benchmark candidate evaluation on the largest fixture. |
| `lib/game/rooms.ts:1,11,16` | Room creation always calls global `initial()`; resolution receives no map; persisted rooms have no map catalog/version context. | Rules & server | After the contract is approved, choose a map at room creation, persist its stable reference, and resolve against the matching immutable map version. |
| `db/schema.ts:2` | The room table stores match state as opaque JSON without a separate map ID/version. | Contracts | Decide whether the map reference belongs only inside versioned state or also in indexed columns for operations/migration. Do not migrate until the contract is approved. |
| `app/page.tsx:5,34-36` | The client imports global `W/H`, announces a literal “15 by 11” arena, and renders `W*H` interactive DOM buttons every render. | Client & UX | Read dimensions from visible match/map data, generate accessible dimensions dynamically, and measure full-grid DOM cost at the target maximum. Add culling/virtualization only if measurement requires it. |
| `app/page.tsx:37` | The center prism glyph is rendered only at literal `{x:7,y:5}`, even though objective styling uses `objective(p)`. | Client & UX / Map content | Render objective markers from map objective data; distinguish scoring cells from the optional visual anchor. |
| `app/page.tsx:33,47,50` | The HUD and help copy assume a 12-turn, first-to-three, single-prism match. | Client & UX | Bind HUD/help to approved rules metadata. Do not alter the values until Open Decisions 2–4 are made. |
| `app/globals.css:6` | The arena grid is fixed to 15 columns, 11 rows, and a 15/11 aspect ratio. `overflow:hidden` prevents a larger surface from exposing off-screen content. Decorative roots are positioned as percentages of the whole current arena. | Client & UX | Set grid dimensions/aspect from CSS variables or inline map metadata. Put decoration in a map layer. Introduce an explicit viewport instead of clipping a full-board grid. |
| `app/globals.css:7` | Wide screens still cap a full-board arena at 70svh and repeat the 15/11 ratio; there are no camera or zoom limits. | Client & UX | Define camera state, min/max zoom, fit-to-map behavior, and focus transitions after Open Decision 5. |
| `app/globals.css:8` | Compact layout shrinks the same full map into one column; it has no pan/zoom, off-screen creature indicators, minimap, or safe-area behavior for a large board. | Client & UX | Prototype touch pan/zoom and selected-creature focus, with visible off-screen threat/objective cues and information parity across layouts. |
| `tests/engine.test.mjs:4-11` | Tests assert literal 15/11 bounds, current shell/center coordinates, x=14/y=10, x=6/7/8, and a 12-turn loop. Only the alpha map is exercised. | Rules & server / Map content | Keep alpha fixtures, add a largest-map fixture after dimensions are chosen, and parameterize assertions from fixture data. Add determinism and performance coverage for both. |
| `tests/rooms.test.mjs:17-20` | Room tests use only `initial()`; reconnect and concurrent resolution are never tested with a map reference/version. | Rules & server | After the contract change, assert that create/join/resume/resolve preserve the selected map version and cannot switch geometry mid-match. |
| `AGILE.md:9,21` | Product notes call 15 × 11 “enlarged” and require a readable full-map camera. | Shared config / owner | Update terminology and camera acceptance criteria only after the target dimensions and compact-camera decision are made. |
| `README.md:9` | User-facing rules promise a five-tile prism and 12-turn resolution. | Shared config / owner | Keep accurate for the alpha; revise only when approved rules change. |

## Performance assumptions requiring measurement

- Client rendering cost currently scales with total tile count because `app/page.tsx:36` creates one button per tile and scans units/orders/destinations during each tile render.
- Reachability is bounded by movement range, but visibility, shell lookup, bot scoring, and full-board rendering will grow with map size or sight-line length.
- No minimum supported device, frame-time target, memory ceiling, maximum DOM-node count, or largest-map benchmark exists.
- The current 1672 × 941 coast art is used as atmosphere rather than a tile-accurate map, so larger interactive geometry needs its own decoration/content strategy.
- Server state is JSON parsed and serialized on each room request. Larger static map data should not be duplicated into every turn snapshot unless measurement supports that choice.

## Design decisions, mapped to the design reference

These are owner decisions, not code fixes.

1. **Open Decision 1 — dimensions and variation:** choose the target largest width/height and whether every arena shares one size. This unlocks the map schema, largest fixture, viewport limits, and performance budget.
2. **Open Decision 2 — movement versus travel:** decide the acceptable spawn-to-first-contact and spawn-to-objective turns while preserving the five-second resolution window.
3. **Open Decision 3 — match length:** validate whether 12 normal turns still yields a 4–6 minute match and enough opportunity to reach first-to-three.
4. **Open Decision 4 — objective topology:** decide whether large maps keep one central prism, use several simultaneous zones, or rotate the active objective.
5. **Open Decision 5 — compact camera:** decide fit-to-map versus player-controlled pan/zoom, focus behavior during planning/resolution, and how off-screen creatures, attacks, and objectives are signaled.
6. **Open Decision 6 — reveal and fog:** decide Klyra's reveal geometry, whether shell concealment remains local, and what information a player receives about off-screen threats.
7. **Open Decision 7 — performance floor:** name the minimum supported device and budgets for frame time, memory, server resolution latency, and network snapshot size at the largest map.

## Recommended dependency order

1. Owner resolves Open Decisions 1 and 5 enough to define a testable maximum map and compact camera.
2. Owner-approved contract PR introduces map identity/version and a data-driven map schema.
3. Map-content PR expresses the existing 15 × 11 Opal Coast as the first fixture without changing rules.
4. Rules/server PR removes global geometry from initialization, validation, visibility, resolution, respawn, and bot logic; tests both alpha and largest fixtures.
5. Client/UX PR consumes the map schema, adds a viewport and accessible off-screen cues, and benchmarks the target device.
6. Playtest informs Open Decisions 2–4 and 6; performance evidence informs Decision 7.
