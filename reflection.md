# Reflection

## What did the starter already have?

The starter template provided the foundational scaffolding for a multiplayer drawing game:

- **Room creation**: An API endpoint to create a new game room with a unique 4-character code and a single host participant. The room was stored in an in-memory `Map<string, Room>`.
- **Room joining**: An endpoint allowing a second player to join an existing room by code, with basic validation (room exists, not full).
- **Lobby**: A frontend page (`LobbyPage`) that displays after creating or joining a room, showing the participant list, room code, and a "Start Game" button. It used 2-second polling to refresh room state.
- **Routing**: React Router v6 navigation between pages (`/`, `/create-room`, `/join-room`, `/lobby`, `/game`) with session restoration from `sessionStorage`.
- **In-memory storage**: All room state lived in a `Map<string, Room>` in `roomStore.ts`. No database dependency. Room cleanup happened automatically when the last participant left.

## What did you add?

The project was extended from a basic lobby + placeholder game into a functional multiplayer drawing game across two scenarios:

### Scenario 3 — Gameplay Interaction

- **Host tracking**: The host is the first participant to create the room. Host transfer logic was added so that if the host leaves, the next-joined participant automatically becomes the new host.
- **Polling**: Extended the existing 2-second polling to sync canvas strokes, guesses, and room state across all participants. Polling runs on both `GamePage` and `LobbyPage`, with automatic navigation between them based on room status (`lobby` → `playing` → `finished`).
- **Start game flow**: Only the host can start the game. Validation ensures at least 2 players are present. On start, the room transitions from `"lobby"` to `"playing"`, a secret word is deterministically selected from a word list, a drawer is assigned, and `currentRound` is set to 1.
- **Drawer assignment**: On game start, the host is assigned as the drawer. The drawer sees the secret word; guessers do not. This role determines who can draw on the canvas versus who can submit guesses.
- **Secret word visibility**: The `toRoomSnapshot()` function controls secret word exposure based on room status and viewer role: `null` in lobby, visible only to the drawer during `"playing"`, and visible to all when `"finished"`.
- **Drawing canvas**: A real-time canvas component was built using the HTML5 Canvas API with Pointer Events. Strokes are tracked via a ref for instant visual feedback during drawing, then committed and synced to the server on pointer-up. A "Clear Canvas" button lets the drawer reset. The server stores canvas strokes and the polling mechanism distributes them to all players.
- **Guess validation**: A `GuessForm` component allows guessers to submit text guesses. The server validates case-insensitively against the secret word, rejects empty guesses, prevents the drawer from guessing, and rejects actions when the round is not active. The `submitGuess` endpoint returns `isCorrect` to the submitter, and the frontend displays "Correct!" or "Incorrect" feedback.
- **Scoring**: A correct guess awards 100 points. The score is recorded per participant in a `scores` map on the room. Guesses from already-correct players do not overwrite their score. Incorrect guessers get a score of 0 recorded once. The `Scoreboard` component displays all participants sorted by score descending.

### Scenario 4 — Result, Restart & Final Validation

- **Results**: When the host ends the round, the room transitions from `"playing"` to `"finished"`. A `ResultView` component renders the secret word, final scores, and complete guess history to all players. The `GuessHistory` component shows each guess with the participant name, text, and a correct/incorrect badge. The final canvas state is also visible on the result screen. The `toRoomSnapshot()` function returns `secretWord` to all players when status is `"finished"`.
- **Restart flow**: Only the host can restart from the result view. The `restartGame` service clears all round-specific state (`secretWord → null`, `canvasStrokes → []`, `guesses → []`, `scores → {}`, `drawerId → null`, `currentRound → 0`) while preserving the participant list and room code. The room transitions back to `"lobby"`, and all players are automatically redirected to the lobby page via polling, ready to start a new game.

## AI Usage

- **Used Spec Kit for specification**: The project followed a structured specification workflow using Speckit commands (`/speckit.specify`, `/speckit.checklist`, `/speckit.implement`). Each feature was preceded by a spec document covering functional requirements, edge cases, acceptance criteria, and success criteria, along with supporting artifacts (plan, data model, research log, API contracts, quickstart guide).
- **Reviewed AI output before implementation**: AI-generated code, test cases, and documentation were reviewed for correctness, consistency with existing patterns, and alignment with the spec before being committed. The AI was instructed to follow project conventions (TypeScript strict mode, Zod validation, no WebSockets, no databases).
- **Updated artifacts incrementally**: As the implementation progressed, spec documents, task lists, and design artifacts were kept in sync with code changes. Tasks were marked off in `tasks.md` after completion, and discrepancies found during validation (e.g., error message mismatches, missing navigation logic) were corrected in both code and documentation.
