# API Contracts: Result, Restart & Final Validation

## POST /rooms/:code/end-round

Ends the active round. The room transitions from "playing" to "finished" status.

**Request Body**:

```json
{
  "participantId": "string (required)"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "room": { "...": "RoomSnapshot with status: 'finished', secretWord visible to all" }
}
```

**Error Responses**:

| Status | Condition |
|--------|-----------|
| 404 | Room not found |
| 403 | Participant is not the host |
| 409 | Room is not in "playing" status (e.g., already finished, still in lobby) |

---

## POST /rooms/:code/restart

Restarts the game from the result view. The room transitions from "finished" to "lobby" status. All round state is cleared; participants are preserved.

**Request Body**:

```json
{
  "participantId": "string (required)"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "room": { "...": "RoomSnapshot with status: 'lobby', secretWord: null, scores: {}, guesses: [], canvasStrokes: []" }
}
```

**Error Responses**:

| Status | Condition |
|--------|-----------|
| 404 | Room not found |
| 403 | Participant is not the host |
| 409 | Room is not in "finished" status |

---

## GET /rooms/:code (Extended)

Existing snapshot endpoint. When status is "finished", the response includes:

- `secretWord`: visible to ALL players (unlike "playing" where guessers see undefined)
- `canvasStrokes`: final strokes from the round
- `guesses`: all guesses recorded during the round
- `scores`: final scores as of round end
- `status`: `"finished"`
