# Opal Shift: design reference

Distilled from the pitch deck (circulated under the working title "Prismwild"). Rules below were proposed for prototype testing; the alpha may already differ. Where it does, flag the difference rather than changing code or this doc.

## Format
- 1v1 online, about 4–6 minutes, built for repeat matches.
- iPhone first, with compact and expanded (foldable) layouts that expose the same information. Support compatible iPhones and iPads so a new device doesn't limit the opponent pool.

## Match rules (proposed)
- Each player brings three creatures. Beta: both players use the starter trio.
- Turn: 15 s secret planning, then 5 s simultaneous resolution.
- Each creature gets a movement path plus one action: basic attack or special ability.
- Shared team energy: 2 per turn, no banking. Each special ability costs 1.
- Uncontested control of the central prism scores 1 point. Contested or empty scores nothing. First to 3 wins.
- Cap of 12 normal turns. At the cap, higher score wins; if tied, up to 3 sudden-death turns, then a draw.
- Defeated creatures sit out one turn, then return at spawn.

## Creatures
| Creature | Role | Kit |
|---|---|---|
| Rookit | Defender | Frontal shield. Strong on the objective, vulnerable from behind |
| Veyl | Flanker | Dash around cover. Punishes exposed targets, risks isolation |
| Klyra | Scout | Reveal a chosen area. Exposes ambushes, costs energy |
| Tessel | Disruptor | Post-beta |
| Nymbra | Trickster | Post-beta |

## Arena
First arena: Opal Coast. Central prism objective, shell cover that rewards patience, a root bridge that invites flanks, quiet play surfaces that keep creatures and paths readable. **Maps will be larger than the deck concept.**

## Cosmetics and fairness
- Purchases are cosmetic only. Every player has equal competitive access.
- Skins preserve silhouette, hitbox, and ability timing. Skin effects never hide attacks or objectives.
- Team symbols accompany team color.
- Beta collection: three Rookit skin treatments and an inspect-and-equip screen. Specimen garden is post-beta. No trading, crossbreeding, or loot boxes in launch scope.

## Closed beta scope
- One arena; Rookit, Veyl, Klyra; private 1v1 rooms via room codes; short tutorial.
- Server-validated orders, reconnect support, turn deadlines, match results.
- After beta: Tessel and Nymbra, ranked matchmaking, specimen garden, more arenas.

## Architecture
- Game client: touch controls, compact and expanded layouts.
- Authoritative match service: locks secret orders, validates actions, resolves turns.
- One simulation rule set shared by server and client preview; server outcome wins.
- Persistent collection: ownership and mastery stored separately from competitive match stats.
- Required tests: identical orders give identical results, reconnect restores the correct turn, duplicate requests, timeout behavior.

## Open decisions: larger maps
Owner decisions. Agents flag these; they don't resolve them.
1. Target map dimensions, and whether size varies by arena.
2. Movement distance per 5 s resolution window relative to spawn-to-prism distance. Larger maps with unchanged movement mean more turns spent walking.
3. Whether 12 turns still fits the 4–6 minute target and still allows a first-to-3 finish.
4. One central prism, or multiple or rotating objectives to keep engagement on a larger map.
5. Camera on the compact layout: pan/zoom behavior while planning, and how to show off-screen creatures and threats.
6. Klyra's reveal radius and any fog-of-war rules; hidden information matters more on a larger board.
7. Performance budget on the minimum supported device at the largest map size.
