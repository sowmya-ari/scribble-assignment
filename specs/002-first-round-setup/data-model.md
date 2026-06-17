# Data Model: First Round Setup

## Room (extended from Scenario 1)

| Field | Type | Description |
|-------|------|-------------|
| code | `string` | 4-char uppercase alphanumeric, unique |
| status | `"lobby" \| "playing"` | Current room phase |
| participants | `Participant[]` | Players in the room |
| hostId | `string` | Creator's participant ID (first player) |
| drawerId | `string \| null` | Current round's drawer participant ID; set when game starts |
| secretWord | `string \| null` | Word for current round; set when game starts |
| currentRound | `number` | Current round number (starts at 1) |
| createdAt | `string` (ISO 8601) | Room creation timestamp |
| updatedAt | `string` (ISO 8601) | Last modification timestamp |

### Validation Rules

- `drawerId` MUST be one of the participant IDs in `participants`
- `secretWord` MUST be selected from `STARTER_WORDS`
- `currentRound` MUST be ≥ 1

### State Transitions

```
lobby ──(host starts game with ≥2 players)──> playing
  │                                              │
  │                                              │
  └── room destroyed when last player leaves ────┘
```

On transition to `"playing"`:
1. `drawerId` ← `hostId` (host is always first drawer)
2. `secretWord` ← deterministically selected from starter list
3. `currentRound` ← 1

## RoomSnapshot (extended — API response shape)

| Field | Type | Description |
|-------|------|-------------|
| code | `string` | Room code |
| status | `"lobby" \| "playing"` | Current phase |
| participants | `Participant[]` | Player list |
| hostId | `string` | Host participant ID |
| drawerId | `string \| null` | Current drawer (non-null when playing) |
| secretWord | `string \| null \| undefined` | Word shown only to drawer; `undefined` for non-drawers |
| roundNumber | `number` | Current round (1-based) |
| availableWords | `string[]` | Starter word list (unchanged) |
| roles | `ParticipantRole[]` | `["drawer", "guesser"]` (unchanged) |

### Conditional Exposure

- `secretWord` is `string` (the word) when requesting `participantId === drawerId`
- `secretWord` is `undefined` when requesting `participantId !== drawerId`
- `secretWord` is `null` when game has not started yet (status === "lobby")

## Participant (unchanged)

| Field | Type | Description |
|-------|------|-------------|
| id | `string` (UUID) | Unique participant identifier |
| name | `string` | Display name, trimmed of whitespace |
| joinedAt | `string` (ISO 8601) | When the player joined |

## Round (future — not needed for this feature)

The `Round` entity is reserved for future multi-round support. For the first-round feature, all round state is stored directly on the `Room` entity (`drawerId`, `secretWord`, `currentRound`).
