# Data Model: Result, Restart & Final Validation

## Entity: Room (Extended)

Adds a new status value and no new fields — existing round data (canvasStrokes, guesses, scores) is reused for the result view.

### RoomStatus

| Value | Description |
|-------|-------------|
| `"lobby"` | Room open for joining, no active round (existing) |
| `"playing"` | Round is active — drawing and guessing allowed (existing) |
| `"finished"` | Round has ended — result view displayed, no drawing/guessing accepted (new) |

### State Transitions

| From | To | Trigger | Authorized By |
|------|----|---------|---------------|
| lobby | playing | `startGame` | Host |
| playing | finished | `endRound` | Host |
| finished | lobby | `restartGame` | Host |

### Data Cleanup on Restart

When `restartGame` transitions `finished → lobby`, the following fields are reset:

| Field | Reset Value |
|-------|-------------|
| `status` | `"lobby"` |
| `secretWord` | `null` |
| `canvasStrokes` | `[]` |
| `guesses` | `[]` |
| `scores` | `{}` |
| `drawerId` | `null` |

The following fields are preserved:
- `code` (room code unchanged)
- `participants` (player list preserved)
- `hostId` (unchanged, follows existing host-transfer rules if host left)
- `createdAt` (room creation time preserved)

### RoomSnapshot (Extended)

| Field | Status "lobby" | Status "playing" | Status "finished" |
|-------|----------------|-------------------|-------------------|
| `secretWord` | `null` | `string` (drawer only) / `undefined` (guessers) | `string` (all players) |
| `canvasStrokes` | `[]` | Current strokes | Final strokes (last saved state) |
| `guesses` | `[]` | Guesses so far | All round guesses |
| `scores` | `{}` | Current scores | Final scores |
| `drawerId` | `null` | Current drawer | Last drawer of the round |
