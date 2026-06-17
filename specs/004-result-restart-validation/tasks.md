# Tasks: Result, Restart & Final Validation

**Input**: Design documents from `/specs/004-result-restart-validation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Tests**: Backend unit test tasks are included per the Constitution ("All business logic in the backend store must have unit tests"). Frontend test tasks are not included unless explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project state is clean before feature work begins.

- [ ] T001 Verify both backend and frontend build and type-check without errors (`cd backend && npx tsc --noEmit`, `cd frontend && npx tsc --noEmit`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend shared data models that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Add `"finished"` to `RoomStatus` type in `backend/src/models/game.ts` (change to `"lobby" | "playing" | "finished"`)
- [ ] T003 [P] Update `toRoomSnapshot()` in `backend/src/services/roomStore.ts` to handle `"finished"` status — `secretWord` is visible to ALL players (not just drawer) when status is `"finished"`

**Checkpoint**: Foundation ready — RoomStatus includes "finished", snapshot returns correct data for finished rounds.

---

## Phase 3: User Story 1 — Round End and Result Display (Priority: P1)

**Goal**: The host can end the active round. All players see a result view showing the secret word, final scores, and complete guess history. No further drawing or guessing is accepted.

**Independent Test**: Open three browser tabs in the same room (Tab A = drawer/host, Tabs B and C = guessers). Have Tab B guess correctly. Host clicks "End Round". Verify all three tabs transition to a result view within 2 seconds showing: the secret word, Tab B's score of 100, Tab C's score of 0, and all guesses. Verify guess/drawing actions are rejected.

### Backend Implementation

- [ ] T004 [P] [US1] Add `endRoundSchema` Zod schema in `backend/src/api/schemas.ts` (validates `participantId: string`)
- [ ] T005 [P] [US1] Implement `endRound(code: string, participantId: string)` service in `backend/src/services/roomStore.ts` — validates host, validates status is "playing", transitions to "finished"
- [ ] T006 [US1] Add `POST /rooms/:code/end-round` route in `backend/src/api/rooms.ts` using `endRoundSchema` and `endRound()`

### Frontend Implementation

- [ ] T007 [P] [US1] Add `endRound(code: string, participantId: string)` method to API service in `frontend/src/services/api.ts`
- [ ] T008 [P] [US1] Create `GuessHistory` component in `frontend/src/components/GuessHistory.tsx` — renders list of guesses from `room.guesses`, shows participant name, guess text, correct/incorrect indicator
- [ ] T009 [P] [US1] Update `Scoreboard` component in `frontend/src/components/Scoreboard.tsx` to display real scores from `room.scores` alongside participant names, sorted by score descending
- [ ] T010 [P] [US1] Create `ResultView` component in `frontend/src/components/ResultView.tsx` — displays secret word, final scores (via Scoreboard), guess history (via GuessHistory), and restart button (disabled initially, wired in US2)
- [ ] T011 [US1] Integrate end-round button and `ResultView` into `GamePage` in `frontend/src/pages/GamePage.tsx` — host sees "End Round" button during gameplay; when status transitions to "finished", render `ResultView` instead of game UI

### Backend Tests

- [ ] T012 [P] [US1] Unit tests for `endRound()` in `backend/src/services/roomStore.test.ts` — host can end round, non-host rejected, wrong status rejected, finished → finished is no-op
- [ ] T013 [P] [US1] Unit tests for `endRoundSchema` in `backend/src/api/schemas.test.ts` — valid body, missing participantId

**Checkpoint**: At this point, host can end a round and all players see the result view with secret word, scores, and guess history.

---

## Phase 4: User Story 2 — Restart to Lobby (Priority: P2)

**Goal**: The host can restart the game from the result view. All players return to the lobby with the participant list preserved and all round state cleared.

**Independent Test**: After result view is shown (US1), verify the host sees a "Restart Game" button. Click it. Verify all tabs transition to lobby within 2 seconds with same participants, no scores/guesses/canvas visible. Verify host can start a new game.

### Backend Implementation

- [ ] T014 [P] [US2] Add `restartSchema` Zod schema in `backend/src/api/schemas.ts` (validates `participantId: string`)
- [ ] T015 [P] [US2] Implement `restartGame(code: string, participantId: string)` service in `backend/src/services/roomStore.ts` — validates host, validates status is "finished", clears round state (secretWord → null, canvasStrokes → [], guesses → [], scores → {}, drawerId → null), preserves participants
- [ ] T016 [US2] Add `POST /rooms/:code/restart` route in `backend/src/api/rooms.ts` using `restartSchema` and `restartGame()`

### Frontend Implementation

- [ ] T017 [P] [US2] Add `restartGame(code: string, participantId: string)` method to API service in `frontend/src/services/api.ts`
- [ ] T018 [US2] Wire "Restart Game" button in `frontend/src/components/ResultView.tsx` — calls `api.restartGame()`, on success the lobby is rendered automatically via polling

### Backend Tests

- [ ] T019 [P] [US2] Unit tests for `restartGame()` in `backend/src/services/roomStore.test.ts` — host can restart, state cleared, participants preserved, non-host rejected, wrong status rejected, lobby → lobby is no-op
- [ ] T020 [P] [US2] Unit tests for `restartSchema` in `backend/src/api/schemas.test.ts` — valid body, missing participantId

**Checkpoint**: At this point, all user stories are functional — round ends with result display, restart returns to lobby with participants preserved.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error states, and final validation.

- [ ] T021 Handle end-round/restart failure in frontend — show error message if action fails (e.g., network error, non-host attempt)
- [ ] T022 Add CSS styles for result view, guess history, scoreboard updates in `frontend/src/app.css`
- [ ] T023 Run full test suite: `cd backend && npx vitest run && cd ../frontend && npx vitest run`
- [ ] T024 Run quickstart.md validation scenarios — end round, result display, restart to lobby, authorization, host refresh

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify project is clean
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-4)**: All depend on Foundational completion
  - US1 (Round End and Result Display) is P1 — no dependency on US2
  - US2 (Restart to Lobby) is P2 — depends on US1 (restart button lives in ResultView)
- **Polish (Phase 5)**: Depends on all user stories being complete

### Within Each User Story

- Models/types before services
- Services before routes
- Backend before frontend (except where noted)
- Tests after implementation

### Parallel Opportunities

- **Phase 2**: T002, T003 are both [P] — different files, can run in parallel
- **Phase 3 (US1)**:
  - T004 (schema), T005 (service), T007 (API service), T008 (GuessHistory), T009 (Scoreboard), T010 (ResultView) can run in parallel
  - T006 (route) depends on T004+T005
  - T011 (GamePage integration) depends on T006+T007+T008+T009+T010
- **Phase 4 (US2)**:
  - T014 (schema), T015 (service), T017 (API service) can run in parallel
  - T016 (route) depends on T014+T015
  - T018 (ResultView button) depends on T016+T017
- **Different stories**: US1 must complete before US2

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Round End and Result Display)
4. **STOP and VALIDATE**: Round end works across three browser tabs
5. Option to deploy/demo with round end and result display working

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Round End) → Test independently → Round end and result display works ✅
3. Add User Story 2 (Restart) → Test independently → Restart to lobby works ✅
4. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- T001 is verification only — run `tsc --noEmit` in both projects
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
