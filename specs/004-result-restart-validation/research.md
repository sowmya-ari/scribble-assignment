# Research: Result, Restart & Final Validation

## Decision Log

| # | Decision | Rationale | Alternatives Considered |
|---|----------|-----------|------------------------|
| 1 | Round-end API: `POST /rooms/:code/end-round` | Simple action endpoint, follows existing REST pattern. Server transitions status to "finished". | `PUT /rooms/:code/status` (over-engineered), `POST /rooms/:code/finish` (similar) |
| 2 | Restart API: `POST /rooms/:code/restart` | Mirror of end-round, clears state and returns to lobby. | `POST /rooms/:code/start` again (semantically different — starts from lobby, not finished) |
| 3 | State idempotency: end-round on "finished" = no-op, restart on "lobby" = no-op | Simplifies client logic — no need to check current state before making request | Strict state machine (throw error on invalid transition) |
| 4 | Result view: new `ResultView` component rendered by `GamePage` based on room status | Keeps routing simple — no new route needed, just conditional rendering in GamePage | Separate route `/room/:code/result` (more complex routing) |
| 5 | Canvas visibility on result screen: final canvas state displayed | Provides full round context alongside scores and guesses | Hide canvas (loses visual context of the round) |
| 6 | Error message for rejected actions during "finished": "Round has ended" | Simple, matches EC-03, consistent with existing error patterns | Different messages per action type (over-engineered) |
| 7 | Host transfer: if host leaves during result view, new host inherits restart ability | Follows existing host-transfer pattern from Scenario 1 | Block restart if original host left (bad UX) |

## Research Details

### 1. State Machine: Room Status Transitions

```
lobby ──(startGame)──▶ playing ──(endRound)──▶ finished ──(restartGame)──▶ lobby
                         ▲                                                  │
                         └──────────────────────────────────────────────────┘
                         (no direct path — must go through finished)
```

Valid transitions:
- `lobby → playing`: Host starts game (existing)
- `playing → finished`: Host ends round (new)
- `finished → lobby`: Host restarts game (new)
- `finished → playing`: Not valid — must go through lobby
- `lobby → finished`: Not valid — no active round to end

### 2. Idempotency Rules

| Current Status | Action | Result |
|----------------|--------|--------|
| playing | endRound | ✅ Transitions to finished |
| finished | endRound | ✅ No-op (already finished) |
| lobby | endRound | ❌ Error: "No active round to end" |
| finished | restartGame | ✅ Transitions to lobby |
| lobby | restartGame | ✅ No-op (already in lobby) |
| playing | restartGame | ❌ Error: "Round is still active — end it first" |

### 3. Data Cleanup on Restart

On restart, the following fields are reset:
- `secretWord` → `null`
- `canvasStrokes` → `[]`
- `guesses` → `[]`
- `scores` → `{}`
- `currentRound` → maintain or reset? Decision: reset to 0 (new game). The spec assumes restart creates a fresh game state.

Wait, actually currentRound is interesting. If we restart to lobby and the host starts a new game, `startGame` would set currentRound to 1. So restart should reset to 0 (or not touch it, and let startGame set it). I'll follow the existing pattern — startGame sets currentRound, so restart just clears round data.

### 4. Secret Word Visibility on Result Screen

When `status === "finished"`, the secret word is visible to ALL players (including guessers). This is a change from `status === "playing"` where guessers see `undefined` for secretWord. The `toRoomSnapshot` function needs to handle this new status value.

### 5. GuessHistory and Scoreboard Reuse

The result view needs to display guess history and scores. These can be built as shared components used by both the game view (Scenario 3 Phase 5) and the result view. This plan includes building:
- `GuessHistory` component (renders list of guesses with participant name, text, correct/incorrect indicator)
- `Scoreboard` update (displays real scores from `room.scores`, sorted descending)
