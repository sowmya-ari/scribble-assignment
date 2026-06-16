# Discovery Notes

## Incomplete Behaviours

1. **Game lifecycle never progresses past "lobby"**
   The backend only supports `RoomStatus = "lobby"` (`backend/src/models/game.ts:4`). No endpoint to start a game, assign roles, or manage rounds. The "Start Game" button on `LobbyPage` navigates to `/game` but does nothing on the backend.

2. **Guess submission is a dead end**
   `GuessForm.tsx:8` has an empty `handleSubmit` — no API call, no validation. There's no backend endpoint for guesses either. `ResultPanel` and `Scoreboard` render hardcoded placeholders.

3. **No automatic room refresh**
   `LobbyPage` requires manual "Refresh Room" button clicks. No `setInterval`-based polling, so users won't see new joiners without manual action.

4. **Rooms are never cleaned up**
   `backend/src/services/roomStore.ts` uses a `Map<string, Room>` that only grows. No TTL, no game-end deletion — abandoned rooms accumulate indefinitely.

5. **Broken default API URL**
   `frontend/src/services/api.ts:22` has a fallback URL with a `/bug` suffix:
   ```ts
   const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/bug";
   ```
   Without an env var override (`VITE_API_URL`), all API calls resolve to `http://localhost:3001/bug/*`, which the backend responds to with 404. A `frontend/.env.local` file was created to work around this, but the source still has the typo.

## Assumptions

1. **Single-process, in-memory only** — All game state lives in a `Map`. No database, no shared state, no horizontal scaling. If the server restarts, every room is lost.

2. **Room code space is sufficient** — 4 chars × 30-char alphabet (~810k combinations). Uses collision retry loop. Omits confusing chars (I, O, 0, 1) for readability.

3. **HTTP polling at ~2-second intervals is acceptable** — `AGENTS.md` explicitly forbids WebSockets and SSE. A ~2 s poll interval is assumed acceptable latency for all real-time updates (lobby joins, drawing strokes, guess submissions, round-end transitions). This is consistent with the existing manual-refresh pattern in `LobbyPage` but must be extended to `GamePage` and automated via `setInterval`.

## Files

- `backend/src/app.ts` — Express app setup (CORS, JSON, routes)
- `backend/src/api/router.ts` — Route definitions
- `backend/src/api/rooms.ts` — Room CRUD routes
- `backend/src/services/roomStore.ts` — In-memory room state management
- `backend/src/models/game.ts` — Backend type definitions
- `backend/src/seed/starterData.ts` — Starter words and roles
- `frontend/src/services/api.ts` — API client
- `frontend/src/state/roomStore.ts` — Frontend state management
- `frontend/src/pages/LobbyPage.tsx` — Room lobby
- `frontend/src/pages/GamePage.tsx` — Game page (stub)
- `frontend/src/components/GuessForm.tsx` — Guess form (empty handler)
