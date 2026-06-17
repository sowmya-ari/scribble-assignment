# API Contracts: Gameplay Interaction

## Base URL: `http://localhost:3001`

All endpoints follow the existing Express + Zod pattern. Errors return `{ message: string }` with appropriate HTTP status codes.

---

## PUT /rooms/:code/canvas

Update the drawing canvas state (full replacement).

### Request

```
PUT /rooms/ABCD/canvas
Content-Type: application/json

{
  "participantId": "uuid-string",
  "strokes": [
    {
      "id": "stroke-uuid",
      "points": [{ "x": 10, "y": 20 }, { "x": 50, "y": 80 }],
      "color": "#000000",
      "width": 3
    }
  ]
}
```

### Response (200)

```json
{ "success": true }
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid body (Zod parse error) |
| 403 | participantId is not the room's drawer |
| 404 | Room not found |

---

## POST /rooms/:code/guesses

Submit a guess for the secret word.

### Request

```
POST /rooms/ABCD/guesses
Content-Type: application/json

{
  "participantId": "uuid-string",
  "text": "  pizza  "
}
```

### Response (200) — correct guess

```json
{
  "success": true,
  "isCorrect": true,
  "guess": {
    "participantId": "uuid-string",
    "text": "pizza",
    "isCorrect": true,
    "timestamp": "2026-06-17T12:00:00.000Z"
  }
}
```

### Response (200) — incorrect guess

```json
{
  "success": true,
  "isCorrect": false,
  "guess": {
    "participantId": "uuid-string",
    "text": "pasta",
    "isCorrect": false,
    "timestamp": "2026-06-17T12:00:00.000Z"
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Empty/whitespace-only guess after trim ("Guess cannot be empty") |
| 403 | Drawer tries to guess ("Drawer cannot submit guesses") |
| 404 | Room not found |

---

## GET /rooms/:code (extended)

The existing room snapshot endpoint now includes three additional fields.

### Response (200) — playing status (drawer view)

```json
{
  "room": {
    "code": "ABCD",
    "status": "playing",
    "participants": [...],
    "hostId": "uuid",
    "drawerId": "uuid",
    "secretWord": "pizza",
    "roundNumber": 1,
    "canvasStrokes": [...],
    "guesses": [...],
    "scores": { "uuid1": 100, "uuid2": 0 },
    "availableWords": [...],
    "roles": ["drawer", "guesser"]
  }
}
```

### Response (200) — playing status (guesser view)

```json
{
  "room": {
    "code": "ABCD",
    "status": "playing",
    "participants": [...],
    "hostId": "uuid",
    "drawerId": "uuid",
    "secretWord": undefined,
    "roundNumber": 1,
    "canvasStrokes": [...],
    "guesses": [...],
    "scores": { "uuid1": 100, "uuid2": 0 },
    "availableWords": [...],
    "roles": ["drawer", "guesser"]
  }
}
```
