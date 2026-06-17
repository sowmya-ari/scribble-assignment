# Tasks: Gameplay Interaction

**Input**: Design documents from `/specs/003-gameplay-interaction/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Tests**: Backend unit test tasks are included per the Constitution ("All business logic in the backend store must have unit tests"). Frontend test tasks are not included unless explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project state is clean before feature work begins.

- [ ] T001 Verify both backend and frontend build and type-check without errors (`cd backend && npx tsc --noEmit`, `cd frontend && npx tsc --noEmit`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend shared data models that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Add `CanvasStroke` and `Guess` interfaces to `backend/src/models/game.ts`
- [ ] T003 [P] Extend `Room` interface in `backend/src/models/game.ts` with `canvasStrokes: CanvasStroke[]`, `guesses: Guess[]`, `scores: Record<string, number>`
- [ ] T004 [P] Extend `RoomSnapshot` interface in `backend/src/models/game.ts` with `canvasStrokes: CanvasStroke[]`, `guesses: Guess[]`, `scores: Record<string, number>`
- [ ] T005 [P] Extend frontend `RoomSnapshot` interface in `frontend/src/services/api.ts` with `canvasStrokes`, `guesses`, `scores`
- [ ] T006 Initialize `canvasStrokes`, `guesses`, `scores` fields in `startGame()` in `backend/src/services/roomStore.ts`
- [ ] T007 Update `toRoomSnapshot()` in `backend/src/services/roomStore.ts` to include `canvasStrokes`, `guesses`, `scores`

**Checkpoint**: Foundation ready — data models extended, snapshots include new fields. User story implementation can now begin.

---

## Phase 3: User Story 1 — Canvas Drawing and Sync (Priority: P1) 🎯 MVP

**Goal**: The drawer can draw freehand strokes on a canvas and clear it. The canvas state is synced to all players via polling.

**Independent Test**: Open two browser tabs in the same room. Tab A is the drawer. Draw lines on the canvas. Tab B (guesser) sees the same lines within 2 seconds. Clear the canvas on Tab A. Tab B sees the cleared canvas within 2 seconds.

### Backend Implementation

- [ ] T008 [P] [US1] Add `canvasUpdateSchema` Zod schema in `backend/src/api/schemas.ts` (validates `participantId: string`, `strokes: CanvasStroke[]`)
- [ ] T009 [P] [US1] Implement `saveCanvas(code: string, participantId: string, strokes: CanvasStroke[])` service in `backend/src/services/roomStore.ts` — replaces `room.canvasStrokes`, validates participantId matches drawerId
- [ ] T010 [US1] Add `PUT /rooms/:code/canvas` route in `backend/src/api/rooms.ts` using `canvasUpdateSchema` and `saveCanvas()`

### Frontend Implementation

- [ ] T011 [P] [US1] Create `Canvas` drawing component in `frontend/src/components/Canvas.tsx` — HTML Canvas 2D with pointer events, freehand stroke capture, full-state POST on each stroke end
- [ ] T012 [P] [US1] Add `saveCanvas(code: string, participantId: string, strokes: CanvasStroke[])` method to API service in `frontend/src/services/api.ts`
- [ ] T013 [US1] Integrate `Canvas` component into `GamePage` in `frontend/src/pages/GamePage.tsx` — show canvas in game area, pass drawer/guesser context, render received strokes on poll
- [ ] T014 [US1] Add clear canvas button to `Canvas` component in `frontend/src/components/Canvas.tsx` — POSTs empty stroke array on clear

### Backend Tests

- [ ] T015 [P] [US1] Unit tests for `saveCanvas()` in `backend/src/services/roomStore.test.ts` — drawer can save, non-drawer rejected, empty array clears
- [ ] T016 [P] [US1] Unit tests for `canvasUpdateSchema` in `backend/src/api/schemas.test.ts` — valid body, missing participantId, invalid strokes

**Checkpoint**: At this point, Canvas Drawing and Sync works end-to-end — drawer draws, guessers see, clear propagates.

---

## Phase 4: User Story 2 — Guess Submission and Validation (Priority: P2)

**Goal**: Guessers can submit guesses, which are trimmed, case-insensitively compared, empty/whitespace-only guesses are rejected, and the drawer cannot submit guesses.

**Independent Test**: Open Tab B as guesser. Type " PIZZA " (spaces, wrong case) — accepted as correct. Type "   " — error "Guess cannot be empty". Type "pasta" — recorded as incorrect. Tab A (drawer) gets error if they try to guess.

### Backend Implementation

- [ ] T017 [P] [US2] Add `submitGuessSchema` Zod schema in `backend/src/api/schemas.ts` (validates `participantId: string`, `text: string` with `.trim().min(1, "Guess cannot be empty")`)
- [ ] T018 [P] [US2] Implement `submitGuess(code: string, participantId: string, text: string)` service in `backend/src/services/roomStore.ts` — trims, case-insensitive compares, rejects empty, rejects drawer, records guess, updates score to 100 if correct
- [ ] T019 [US2] Add `POST /rooms/:code/guesses` route in `backend/src/api/rooms.ts` using `submitGuessSchema` and `submitGuess()`, returns `{ success, isCorrect, guess }`

### Frontend Implementation

- [ ] T020 [P] [US2] Add `submitGuess(code: string, participantId: string, text: string)` method to API service in `frontend/src/services/api.ts`
- [ ] T021 [US2] Update `GuessForm` in `frontend/src/components/GuessForm.tsx` to submit guess to API via `roomStore`, display error messages, show submission state
- [ ] T022 [US2] Disable `GuessForm` for drawer in `frontend/src/pages/GamePage.tsx` — drawer sees a message instead of the form

### Backend Tests

- [ ] T023 [P] [US2] Unit tests for `submitGuess()` in `backend/src/services/roomStore.test.ts` — correct match, incorrect match, empty rejection, drawer rejection, already-correct stays 100
- [ ] T024 [P] [US2] Unit tests for `submitGuessSchema` in `backend/src/api/schemas.test.ts` — valid body, empty text, whitespace-only text, missing fields

**Checkpoint**: At this point, Guess Submission and Validation works — guessers can submit, validation enforced, drawers blocked.

---

## Phase 5: User Story 3 — Guess History and Scoring (Priority: P3)

**Goal**: All guesses are recorded in a shared guess history visible to all players via polling. Correct guesses award 100 points, incorrect award 0. All players start at 0.

**Independent Test**: Tab B guesses correctly → score shows 100, history shows correct guess. Tab C guesses incorrectly → score stays 0, history shows incorrect guess. Tab A (drawer) and Tab B both see same history and scores.

### Backend Implementation

*Note: Guess recording and score calculation were implemented in `submitGuess()` during US2. This phase focuses on ensuring scores are properly exposed via the snapshot.*

- [ ] T025 [US3] Verify `toRoomSnapshot()` includes current `scores` and `guesses` from the room in `backend/src/services/roomStore.ts`

### Frontend Implementation

- [ ] T026 [P] [US3] Create `GuessHistory` component in `frontend/src/components/GuessHistory.tsx` — renders list of guesses from `room.guesses`, shows participant name, guess text, correct/incorrect indicator
- [ ] T027 [P] [US3] Update `Scoreboard` component in `frontend/src/components/Scoreboard.tsx` to display real scores from `room.scores` alongside participant names, sorted by score descending
- [ ] T028 [US3] Integrate `GuessHistory` into `GamePage` in `frontend/src/pages/GamePage.tsx` — replace or augment the `ResultPanel` area with guess history

### Backend Tests

- [ ] T029 [P] [US3] Unit tests for score inclusion in snapshot in `backend/src/services/roomStore.test.ts` — scores start at 0, update after correct guess, correct guesser stays at 100

**Checkpoint**: At this point, all user stories are functional — drawing syncs, guesses validate, scores and history display to all players.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error states, and final validation.

- [ ] T030 Handle canvas POST failure in `frontend/src/components/Canvas.tsx` — show error indicator per spec clarification ("Canvas save failed — draw again to retry")
- [ ] T031 Handle drawer page refresh — verify existing canvas state is preserved and re-synced via polling in `frontend/src/pages/GamePage.tsx`
- [ ] T032 Add CSS styles for canvas, guess history, scoreboard updates in `frontend/src/styles/app.css`
- [ ] T033 Run full test suite: `cd backend && npx vitest run && cd ../frontend && npx vitest run`
- [ ] T034 Run quickstart.md validation scenarios — canvas sync, guess submission, scoring, history

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify project is clean
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational completion
  - US1 (Canvas Drawing) is P1 MVP — no dependency on US2/US3
  - US2 (Guess Submission) is P2 — no dependency on US1/US3
  - US3 (Guess History/Scoring) is P3 — the backend work (score calculation) is done in US2 T018, but frontend display (GuessHistory, Scoreboard updates) are independent
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within Each User Story

- Models/types before services
- Services before routes
- Backend before frontend (except where noted)
- Tests after implementation

### Parallel Opportunities

- **Phase 2**: T002, T003, T004, T005 are all [P] — different files, can run in parallel
- **Phase 3 (US1)**:
  - T008 (schema), T009 (service), T011 (Canvas component), T012 (API service) can run in parallel
  - T010 (route) depends on T008+T009
  - T013 (GamePage integration) depends on T011+T012
- **Phase 4 (US2)**:
  - T017 (schema), T018 (service), T020 (API service) can run in parallel
  - T019 (route) depends on T017+T018
  - T021 (GuessForm) depends on T020
- **Phase 5 (US3)**:
  - T026 (GuessHistory), T027 (Scoreboard) can run in parallel
- **Different stories** can run in parallel if team capacity allows (US1 ≠ US2 ≠ US3)

---

## Parallel Example: User Story 1

```bash
# Launch all models/types for User Story 1 together:
Task: "Add canvasUpdateSchema in backend/src/api/schemas.ts"
Task: "Implement saveCanvas() service in backend/src/services/roomStore.ts"
Task: "Create Canvas component in frontend/src/components/Canvas.tsx"
Task: "Add saveCanvas() to API service in frontend/src/services/api.ts"

# Then after these complete:
Task: "Add PUT /rooms/:code/canvas route in backend/src/api/rooms.ts"
Task: "Integrate Canvas into GamePage in frontend/src/pages/GamePage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Canvas Drawing & Sync)
4. **STOP and VALIDATE**: Canvas sync works across two browser tabs
5. Option to deploy/demo with canvas drawing working

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Canvas) → Test independently → Canvas sync works ✅
3. Add User Story 2 (Guesses) → Test independently → Guess validation works ✅
4. Add User Story 3 (History/Scoring) → Test independently → Scores and history display ✅
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:
1. Complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Canvas)
   - Developer B: User Story 2 (Guesses)
   - Developer C: User Story 3 (History/Scoring)
3. Stories are independent — no shared file conflicts between frontend components or backend endpoints

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- T001 is verification only — run `tsc --noEmit` in both projects
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
