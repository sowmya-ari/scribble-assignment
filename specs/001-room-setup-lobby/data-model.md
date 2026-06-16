# Data Model: Room Setup & Lobby

## Entity: Room

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Unique 4-char alphanumeric identifier (uppercase, excludes ambiguous chars: O/0/I/1) |
| `hostId` | `string` | UUID of the player designated as host |
| `status` | `"lobby"` | Current room state (future: "in-progress", "finished") |
| `participants` | `Participant[]` | Ordered list of players in the room (join order) |
| `createdAt` | `string` | ISO 8601 timestamp of room creation |
| `updatedAt` | `string` | ISO 8601 timestamp of last mutation |

### State Transitions

```
[lobby]  ← All operations stay in lobby until game starts (future phase)
```

## Entity: Participant

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID assigned on join |
| `name` | `string` | Display name chosen by the player (required, non-empty) |
| `joinedAt` | `string` | ISO 8601 timestamp of joining |

## Snapshot (public-facing)

The `RoomSnapshot` is what clients receive:

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Room code |
| `status` | `"lobby"` | Room status |
| `participants` | `Participant[]` | All participants in the room |
| `hostId` | `string` | UUID of the current host |

## Key Rules

- **Host transfer**: When host leaves, the participant with the earliest `joinedAt` among remaining players becomes the new host. If no players remain, the room is deleted.
- **Capacity**: `participants.length` must not exceed 8.
- **Code uniqueness**: Guaranteed by retry loop on generation. Codes are recycled when rooms are deleted.
- **No duplicate players**: A participant cannot join a room they are already in (checked by `participantId`).
