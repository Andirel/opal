# Agile delivery · Opal Shift

## Product goal

Validate whether secret simultaneous orders plus shell cover create a readable, replayable one-on-one rivalry in a bright alien world. The first slice must let a player finish and restart a match before adding progression or monetization.

## Sprint 1 · playable vertical slice · implemented

- Enlarged 15 × 11 arena with eight shell cells, five prism cells and full-map view.
- Three creature roles per team, movement, guard, strikes, concealment, simultaneous damage, respawn and bounded match results.
- Training bot, private room creation/join/resume/forfeit, secret server-validated orders.
- Lobby, battle controls, visible combat log, rules and cosmetic previews using existing art.
- Deterministic engine and room lifecycle tests; TypeScript and production build gates.

Definition of done: a complete match ends under the rules; illegal orders are rejected; rival orders and concealed positions remain private; both seats see the same resolved round; exact source is preserved and deployed privately.

## Sprint 2 · playtest and iterate · next

1. Conduct at least five two-person sessions on phones and desktop. Observe missed taps, rule misunderstandings, meaningful use of shells, first-match completion and rematch intent.
2. Review ties and guard-heavy stalemates. Tune only after watching actual play; candidates include a rotating prism or a contest-break mechanic.
3. Improve movement/action animation and teach target lock versus auto-target. Preserve readable full-map camera.
4. Add reconnect deadlines, abandonment handling and rematch negotiation for private rooms.
5. Test deployed room behavior and mobile browsers, keyboard access, reduced motion, safe areas, orientation and slow network conditions.

Acceptance: new players can explain why a point scored and can finish a duel without developer help. No production transport or device issues remain unresolved before widening access.

## Sprint 3 · progression and native path · backlog

- Account-backed collection ownership, earnable cosmetic unlocks and inspectable rarity. Cosmetic fairness remains invariant.
- Friend invitations and access model, then matchmaking and abuse protection only when justified by player demand.
- Original game-ready creature assets, animation, sound controls and hit effects.
- Confirm currently published Apple SDK/device requirements before native packaging, performance budgets, signing and TestFlight submission. Do not assume a rumored device shape or launch date.

## Known alpha boundaries

No ranked ladder, payments, collection economy, public matchmaking, audio, spectator mode, inactivity timer or native iOS build. Artwork previews are presentation crops; board pieces are functional tokens. Skin selection is local appearance preference and is not sent to the rival yet.
