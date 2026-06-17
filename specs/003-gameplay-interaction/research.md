# Research: Gameplay Interaction

## Decision Log

| # | Decision | Rationale | Alternatives Considered |
|---|----------|-----------|------------------------|
| 1 | Canvas POST: full state replacement on each draw/clear | Simpler, no race conditions, aligns with polling pattern | Individual stroke appending, periodic full-state timer |
| 2 | Stroke color/width: fixed defaults (black #000000, 3px) | Keeps MVP simple, no color picker needed | Preset palette, free color/width selection |
| 3 | POST failure: error indicator, no auto-retry | Simple UX, next draw auto-retries | Silent ignore, auto-retry with backoff |
| 4 | Canvas endpoint: `PUT /rooms/:code/canvas` with full stroke array | RESTful, idempotent (PUT replaces), consistent with full-state approach | POST (non-idempotent), PATCH (partial) |
| 5 | Guess endpoint: `POST /rooms/:code/guesses` | New resource collection under room, standard REST pattern | POST /rooms/:code/guess (singular) |
| 6 | Scores: server-side calculation on guess submission | Single source of truth, prevents client tampering | Client-side calculation |
| 7 | Canvas component: HTML Canvas 2D with pointer events | No dependencies needed, widely supported, sufficient for freehand drawing | react-konva (extra dep), SVG (slower for many strokes) |

## Research Details

### 1. HTML Canvas Freehand Drawing

The `<canvas>` element with the 2D rendering context is sufficient for freehand drawing:

- **Pointer events** (`pointerdown`, `pointermove`, `pointerup`) provide unified mouse+touch handling
- Each stroke = array of `{x, y}` points captured during `pointermove`
- Stroke ends on `pointerup`, the completed stroke is added to local state
- On each stroke completion, the full stroke array is POSTed to the server
- Canvas clear: reset local state and POST empty array
- On polling response, render received strokes by iterating the array and drawing each polyline

**Pattern**:
```
canvas.addEventListener("pointerdown", startStroke)
canvas.addEventListener("pointermove", continueStroke)  # only if drawing
canvas.addEventListener("pointerup", endStroke)           # save stroke + POST full state
```

### 2. API Endpoints

#### PUT /rooms/:code/canvas
- **Body**: `{ participantId: string, strokes: CanvasStroke[] }`
- **Validation**: participantId must match room's drawerId
- **Action**: Replaces `room.canvasStrokes` with the provided array
- **Response**: `{ success: true }`
- **Errors**: 403 (not drawer), 404 (room not found), 400 (invalid body)

#### POST /rooms/:code/guesses
- **Body**: `{ participantId: string, text: string }`
- **Validation**: participantId must not be the drawer; text trimmed, checked for empty
- **Action**: Compares trimmed lowercase text against secret word, records guess, updates score
- **Response**: `{ success: true, isCorrect: boolean, guess: Guess }`
- **Errors**: 403 (drawer cannot guess), 400 (empty guess, invalid body), 404 (room not found)

### 3. RoomSnapshot Extension

The existing `RoomSnapshot` interface is extended with:
- `canvasStrokes: CanvasStroke[]` — always included for all viewers
- `guesses: Guess[]` — always included for all viewers
- `scores: Record<string, number>` — always included for all viewers
- `participants` entries updated to include `score: number` (for convenience, derived from scores map)

### 4. Guess Validation & Scoring

- Trim input: `text.trim()`
- Case-insensitive comparison: `trimmed.toLowerCase() === secretWord.toLowerCase()`
- Empty rejection: after trim, check length > 0; `z.string().trim().min(1)` on Zod schema
- Drawer rejection: check `participantId !== room.drawerId`
- Scoring: `scores[participantId] = (guess.isCorrect ? 100 : (scores[participantId] ?? 0))` — only set to 100, never decrease; if already 100 and correct again, stays 100

### 5. Existing Code Patterns to Follow

**Backend route pattern** (from `rooms.ts`):
- `try/catch` with `handleRoomError` for `RoomError` instances
- Express `Router` pattern, `next(error)` for error forwarding
- Zod schema parse for request validation

**Frontend API service pattern** (from `api.ts`):
- `request<T>` wrapper with `Content-Type: application/json`
- Methods return typed promises
- Error handling via `throw new Error()`

**RoomStore pattern** (from `roomStore.ts`):
- `withLoading()` wrapper for async operations
- `setRoomSnapshot()` to update state from poll response
- Methods like `fetchRoom()`, `createRoom()`, etc.

**GamePage polling pattern**:
- `useEffect` with `setInterval` at 2000ms
- `poll()` function that calls `roomStore.fetchRoom()`
- Cleanup on unmount

**Test patterns** (from `roomStore.test.ts` and `api.test.ts`):
- `vitest` with `describe`/`it`/`expect`
- Backend: direct function calls on roomStore, assert on returned data
- Frontend: `vi.stubGlobal("fetch", vi.fn())` for mocking HTTP
