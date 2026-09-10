# Opal Shift · playable alpha 01

A browser MVP of a competitive creature tactics game. The attached direction takes precedence: current name Opal Shift, bright alien coast, zoomed-out arena, tactical shell obstacles, existing artwork preserved without regeneration. Veyl remains a creature name.

## Play

Choose **Play training**, select Veyl, Rookit or Klyra, then tap a highlighted tile and choose **Guard** or **Strike**. Every creature can move and act each turn. Tap the selected creature's current tile to cancel its movement. Strike auto-targets the nearest visible enemy unless a specific target is selected. Lock in orders to resolve both sides together.

Hold any tile in the five-tile prism zone without an enemy in the zone to score. First to three points wins. After twelve turns, higher score wins and ties draw. Knockouts return next turn. Contested landing destinations cancel all involved movements; crossing paths and swapping positions are allowed. Shells block movement, sight and attacks, and conceal adjacent creatures from enemies beyond two tiles. Guard reduces each incoming hit by one. Movement range is shortest walkable orthogonal path distance; attack range is Manhattan distance with shell sight checks.

Private duels use a six-character code. Both players need access to the deployed app. Credentials are device-session seat tokens, hashed in the database; keep the browser session to resume. Rooms expire after 24 hours. Orders and hidden enemy positions are never returned to the rival. Turns wait for both players; there is no inactivity timeout in this alpha. Leaving forfeits.

Rookit's three skins are freely available alpha previews. Skin preference is stored on the device; progression, ownership and payments are not implemented. All skins have identical stats.

## Implementation

- `app/page.tsx`: lobby, responsive board, command panel, rooms, help and cosmetic preview.
- `app/globals.css`: bright coastal battlefield, translucent roots and shell geometry, original-art crops.
- `lib/game/engine.ts`: shared deterministic rules, validation, fog filtering, training bot.
- `lib/game/rooms.ts`: server-authoritative room lifecycle using D1 prepared SQL and optimistic concurrency.
- `app/api/rooms/route.ts`: Cloudflare binding and request entrypoints.
- `db/schema.ts`, `drizzle/`: persistent room schema and deployment migration.
- `tests/`: rules and real SQLite-backed handler integration tests.
- Optional feature-detected WebMCP `opal_shift_state` exposes only the current player's visible state.

## Development and validation

Use the existing pnpm lockfile and Sites execution profile. Run `node --experimental-strip-types --test tests/*.test.mjs` on Node 24 and `pnpm exec tsc --noEmit`. Build with the Sites build helper in the configured environment. Do not run a competing development server if a managed preview owns the project.

This is a web MVP, not an App Store binary. No unreleased iPhone-specific hardware or SDK behavior is assumed. Browser/device interaction and two-person playtesting remain release gates before a public beta. Server-handler tests run against SQLite with a D1-compatible adapter, not against the production D1 service.
