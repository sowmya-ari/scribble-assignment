# Game API Contracts — First Round Setup

## Base URL

```
http://localhost:3001
```

## Authentication

None. Requests are identified by `participantId` query/body parameter.

---

## GET /rooms/:code — Fetch Room Snapshot

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| participantId | `string` | No | Viewer's participant ID; determines word visibility |

### Response (status: "lobby")

```json
{
  "room": {
    "code": "ABCD",
    "status": "lobby",
    "participants": [
      { "id": "uuid-1", "name": "Alice", "joinedAt": "2026-06-17T..." }
    ],
    "hostId": "uuid-1",
    "drawerId": null,
    "secretWord": null,
    "roundNumber": 0,
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

### Response (status: "playing", viewer is drawer)

```json
{
  "room": {
    "code": "ABCD",
    "status": "playing",
    "participants": [
      { "id": "uuid-1", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-2", "name": "Bob", "joinedAt": "..." }
    ],
    "hostId": "uuid-1",
    "drawerId": "uuid-1",
    "secretWord": "pizza",
    "roundNumber": 1,
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

### Response (status: "playing", viewer is NOT drawer)

```json
{
  "room": {
    "code": "ABCD",
    "status": "playing",
    "participants": [
      { "id": "uuid-1", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-2", "name": "Bob", "joinedAt": "..." }
    ],
    "hostId": "uuid-1",
    "drawerId": "uuid-1",
    "roundNumber": 1,
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

### Behavior

- `secretWord` is `null` when lobby status (game hasn't started)
- `secretWord` is the word string when `participantId === drawerId`
- `secretWord` is omitted (field absent) when `participantId !== drawerId`
- `drawerId` is `null` when lobby status
- `drawerId` is set to the host's ID when game transitions to playing

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 404 | Room not found | `{ "message": "Unable to load room" }` |

---

## POST /rooms/:code/start — Start Game (unchanged, but sets new fields)

### Request Body

```json
{
  "participantId": "uuid-1"
}
```

### Response

```json
{
  "success": true
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 403 | Caller is not the host | `{ "message": "Only the host can start the game" }` |
| 400 | Fewer than 2 players | `{ "message": "At least 2 players are required to start" }` |
| 409 | Game already started | `{ "message": "Game has already started" }` |
| 404 | Room not found | `{ "message": "Room not found" }` |

### Server-side Side Effects

On success, the server:
1. Sets `room.status = "playing"`
2. Sets `room.drawerId = room.hostId`
3. Selects `room.secretWord` deterministically from `STARTER_WORDS`
4. Sets `room.currentRound = 1`
