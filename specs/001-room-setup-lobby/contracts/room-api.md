# Room API Contracts

Base URL: `/rooms`

## POST /rooms — Create Room

Creates a new room and designates the creator as host.

**Request Body:**
```json
{
  "playerName": "Alice"
}
```

**Response** (201):
```json
{
  "participantId": "uuid-alice-123",
  "room": {
    "code": "X7KF",
    "status": "lobby",
    "participants": [
      {
        "id": "uuid-alice-123",
        "name": "Alice",
        "joinedAt": "2026-06-16T12:00:00.000Z"
      }
    ],
    "hostId": "uuid-alice-123"
  }
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | `playerName` missing or empty |

---

## POST /rooms/:code/join — Join Room

Joins an existing room by code. Case-insensitive.

**Request Body:**
```json
{
  "playerName": "Bob"
}
```

**Response** (200):
```json
{
  "participantId": "uuid-bob-456",
  "room": {
    "code": "X7KF",
    "status": "lobby",
    "participants": [
      {
        "id": "uuid-alice-123",
        "name": "Alice",
        "joinedAt": "2026-06-16T12:00:00.000Z"
      },
      {
        "id": "uuid-bob-456",
        "name": "Bob",
        "joinedAt": "2026-06-16T12:00:01.000Z"
      }
    ],
    "hostId": "uuid-alice-123"
  }
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | `playerName` missing or empty |
| 404 | Room code not found |
| 409 | Room is full (8 players max) |

---

## GET /rooms/:code — Get Room State

Used for polling. Returns current room state filtered by participant identity.

**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `participantId` | `string` | No | Filters participant-specific data (future use) |

**Response** (200):
```json
{
  "room": {
    "code": "X7KF",
    "status": "lobby",
    "participants": [
      {
        "id": "uuid-alice-123",
        "name": "Alice",
        "joinedAt": "2026-06-16T12:00:00.000Z"
      },
      {
        "id": "uuid-bob-456",
        "name": "Bob",
        "joinedAt": "2026-06-16T12:00:01.000Z"
      }
    ],
    "hostId": "uuid-alice-123"
  }
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 404 | Room code not found |

---

## POST /rooms/:code/leave — Leave Room

Removes a participant from a room. If the host leaves, the next player is promoted to host. If the last player leaves, the room is deleted.

**Request Body:**
```json
{
  "participantId": "uuid-alice-123"
}
```

**Response** (200):
```json
{
  "success": true
}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | `participantId` missing |
| 404 | Room or participant not found |
