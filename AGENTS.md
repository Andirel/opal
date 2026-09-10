# AGENTS.md — Opal Shift

Single source of truth for every coding agent in this repo. Codex (GPT-6 Astra) reads this file natively; Claude Code reads it through `CLAUDE.md`. Humans edit this file. Agents don't, unless an issue explicitly says to.

## Repo owner: fill in once
- Engine / language:
- Build command:
- Test command (must pass before any PR):
- Lint / format command:
- Then replace the example paths in the Lanes table with this repo's real directories.

## The game
Opal Shift is a 1v1 competitive creature-tactics game for iPhone, with compact and expanded (foldable) layouts. Each player fields three creatures. Both players set orders in secret (15 s), then all orders resolve simultaneously (5 s). Uncontested control of the objective scores a point; first to three wins. Full design reference: `docs/design/opal-shift-design.md`.

### Naming: hard rules
- The title is **Opal Shift**. "Prismwild" was the pitch-deck working title. It must not appear in code, UI strings, bundle IDs, store copy, save data keys, or docs.
- **"prism" is not the old title.** The central prism is the scoring objective. When removing "Prismwild", do not rename `prism` / `Prism` identifiers, assets, or rules text. Only the token `Prismwild` (any casing) is the old title.
- Unchanged names: arena Opal Coast; creatures Rookit, Veyl, Klyra, Tessel, Nymbra; skins Tideglass, Eclipse, Relic, Aurora.

### Maps are bigger than the pitch deck
The deck's Opal Coast art is not the target scale. Final dimensions are not locked (see Open Decisions in the design doc). Until they are:
- Never hardcode map width/height, grid or tile counts, spawn coordinates, or camera bounds. Read them from map data.
- Test pathfinding, reveal/line-of-sight, and turn resolution against the largest map fixture in the repo, not only the alpha map.
- Do not change movement range, turn cap, turn timers, or scoring to make large maps "work." Flag the problem in the PR; those are design calls for the repo owner.

## Lanes
Two agents build in parallel. Each owns a lane. No agent edits files outside its lane unless its issue names them.

| Lane | Default owner | Example paths | Scope |
|---|---|---|---|
| Rules & server | Claude | `sim/`, `server/` | Deterministic turn resolution, order validation, secret-order locking, turn deadlines, reconnect, match results |
| Client & UX | Astra | `client/`, `ui/` | Rendering, camera and pan/zoom for large maps, touch order entry, compact/expanded layouts, tutorial, collection screen |
| Contracts | Repo owner | `contracts/` | Order schema, match-state snapshot, map data schema, network messages |
| Map content | Assigned per issue | `content/maps/` | One agent per map file at a time |
| Shared config | Repo owner | `AGENTS.md`, `CLAUDE.md`, CI, engine/project settings, build settings | Agents propose changes in the PR description only |

## Contracts
Both lanes depend on `contracts/`. If a task needs a contract change:
1. Stop feature work. Open a separate PR that changes only `contracts/` plus its tests, titled `contract: <change>`.
2. Don't build on the change until it's merged to `main`.
3. Rebase the feature branch onto `main` afterward.

## Simulation rules
- One rule set is shared by server and client. The server result is authoritative; the client only previews.
- Resolution is deterministic: same map + same orders + same seed produce an identical result. Every rules change ships with a determinism test.
- The client receives only what its player may see. The opponent's orders are never sent before resolution.
- Late, duplicate, or invalid orders can never change a result.

## Git workflow
- Never push to `main`. Branch names: `claude/<issue#>-<slug>` or `astra/<issue#>-<slug>`.
- One issue, one branch, one PR. Aim for under ~400 changed lines excluding generated files and art; split larger work.
- Before opening a PR: rebase on latest `main`, run build and tests, fix failures. Never skip, delete, or loosen a test to get green.
- Don't reformat or reorganize code your task doesn't touch.
- Scene, prefab, and map files merge badly. Touch only the ones your issue names. If one conflicts, stop and report it in the PR; don't hand-merge.
- Any new dependency needs a one-line justification in the PR.

## Handoff
Agents share no memory. The PR description is the handoff: fill in every section of `.github/pull_request_template.md`. Put questions and assumptions there or in the issue, not in code comments.

## Reviews
- Claude reviews Astra's PRs; Astra reviews Claude's. The repo owner merges.
- Check against this file and the issue's acceptance criteria. Always flag: lane violations, contract drift, nondeterminism, hardcoded map dimensions, leftover "Prismwild", hidden information reaching the client.

## When code and docs disagree
The alpha may differ from the design doc. Don't silently "fix" either one. Flag the mismatch in the PR and follow the issue's instructions.
