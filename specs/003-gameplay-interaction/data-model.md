# Data Model: Gameplay Interaction

## Entity: CanvasStroke

Represents a single freehand drawing stroke on the canvas.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | Yes | Unique stroke identifier |
| `points` | `{ x: number, y: number }[]` | Yes | Array of points forming the polyline (min 2) |
| `color` | `string` | Yes | Stroke color (default `"#000000"` for MVP) |
| `width` | `number` | Yes | Stroke width in pixels (default `3` for MVP) |

**Constraints**:
- `points` must have at least 2 entries (start + at least one move)
- `color` is preserved for future extensibility; MVP uses single default
- `width` is preserved for future extensibility; MVP uses single default

## Entity: Guess

Represents a single guess submitted by a participant.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `participantId` | `string` | Yes | ID of the participant who submitted the guess |
| `text` | `string` | Yes | The guess text (trimmed by server) |
| `isCorrect` | `boolean` | Yes | Whether the guess matched the secret word |
| `timestamp` | `string` (ISO 8601) | Yes | When the guess was submitted |

**Constraints**:
- `participantId` must reference an existing participant in the room
- `participantId` must not be the room's `drawerId`
- `text` after trimming must be non-empty
- `text` comparison is case-insensitive (`toLowerCase()`)

## Entity Extensions

### Room (extended)

The existing `Room` interface gains three new fields:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `canvasStrokes` | `CanvasStroke[]` | `[]` | Current canvas state (full array of strokes) |
| `guesses` | `Guess[]` | `[]` | All guesses submitted this round (ordered by submission) |
| `scores` | `Record<string, number>` | `{}` | Map of participantId → score (0 or 100) |

### RoomSnapshot (extended)

The existing `RoomSnapshot` interface gains three new fields:

| Field | Type | Description |
|-------|------|-------------|
| `canvasStrokes` | `CanvasStroke[]` | Current canvas state — visible to all players |
| `guesses` | `Guess[]` | All guesses this round — visible to all players |
| `scores` | `Record<string, number>` | Score map — visible to all players |

## State Transitions

### Canvas State
- **Initial**: `canvasStrokes = []` (when room is created / game starts)
- **Draw stroke**: drawer draws → full array POSTed → server replaces `canvasStrokes`
- **Clear canvas**: drawer clears → empty array POSTed → server sets `canvasStrokes = []`
- **No change**: `canvasStrokes` stays as-is between polling cycles

### Guess State
- **Initial**: `guesses = []`, `scores = {}` (when game starts)
- **Submit guess**: new `Guess` appended to `guesses` array; `scores[participantId]` updated
- **No changes**: guesses and scores are append-only during the round

## Validation Rules

| Input | Rule | Error Message |
|-------|------|---------------|
| Canvas strokes POST body | Must be a valid JSON array of CanvasStroke objects | N/A (Zod parse error) |
| Guess text | `.trim().min(1)` after Zod parse | "Guess cannot be empty" |
| Guess participantId | Must not be room's drawerId | "Drawer cannot submit guesses" |
| Canvas participantId | Must be room's drawerId | "Only the drawer can update the canvas" |
