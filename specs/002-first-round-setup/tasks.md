# Tasks: First Round Setup

**Input**: Design documents from `specs/002-first-round-setup/`

**Prerequisites**: plan.md, spec.md (required), research.md, data-model.md, contracts/game-api.md

**Tests**: Test tasks are included as requested in the spec (FR-001 through FR-011 are all testable).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup

**Purpose**: No project initialization needed — project is already set up with Express, React, TypeScript, Vitest.

No tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Model and type changes that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 Add `drawerId`, `secretWord`, and `currentRound` fields to `Room` interface in `backend/src/models/game.ts`
- [ ] T002 [P] Add `drawerId`, `roundNumber`, and optional `secretWord` to `RoomSnapshot` interface in `backend/src/models/game.ts`
- [ ] T003 [P] Update frontend `RoomSnapshot` type to include `drawerId`, `roundNumber`, and optional `secretWord` in `frontend/src/services/api.ts`
- [ ] T004 Add `selectWord(roomCode: string, words: readonly string[]): string` pure function to `backend/src/services/roomStore.ts` (djb2 hash of room code modulo word list length)

**Checkpoint**: Foundation ready — models and types support drawer ID, secret word, and round number. US1 and US2 can now begin.

---

## Phase 3: User Story 1 — Player Name Trimming and Validation (Priority: P1) 🎯 MVP

**Goal**: Player names are trimmed of leading/trailing whitespace; empty or whitespace-only names are rejected with a clear message.

**Independent Test**: Open the app, create a room with name "  Alice  " — lobby shows "Alice". Try creating with name "   " — error message displayed, room not created.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Add `.trim()` to player name in `createParticipant()` function in `backend/src/services/roomStore.ts`
- [ ] T006 [P] [US1] Add `.trim()` and empty-string guard before submit in `frontend/src/pages/CreateRoomPage.tsx`
- [ ] T007 [P] [US1] Add `.trim()` and empty-string guard before submit in `frontend/src/pages/JoinRoomPage.tsx`

**Checkpoint**: US1 complete — names are trimmed and whitespace-only names rejected.

---

## Phase 4: User Story 2 — First Round Begins with Drawer and Secret Word (Priority: P1)

**Goal**: When the host starts the game, the host becomes the drawer, a secret word is deterministically selected and exposed only to the drawer. A "Drawer" badge identifies the drawer in the player list.

**Independent Test**: Create room with two players (Tab A host, Tab B guest). Host clicks Start Game. Tab A shows the word and a "Drawer" badge. Tab B shows no word but sees the host with a "Drawer" badge. Both tabs navigate to game screen.

### Backend Implementation

- [ ] T008 [US2] Update `startGame()` in `backend/src/services/roomStore.ts` to set `room.drawerId = room.hostId`, `room.secretWord = selectWord(room.code, STARTER_WORDS)`, and `room.currentRound = 1`
- [ ] T009 [US2] Update `toRoomSnapshot()` in `backend/src/services/roomStore.ts` to include `drawerId`, `roundNumber`, and conditionally include `secretWord` only when `viewerParticipantId === room.drawerId`
- [ ] T010 [US2] Update `getRoom()` in `backend/src/services/roomStore.ts` to handle the new fields in the cloned room (no changes needed — `structuredClone` handles it automatically)

### Frontend Implementation

- [ ] T011 [P] [US2] Add `drawerId`, `roundNumber`, and `secretWord` to roomStore state exposure in `frontend/src/state/roomStore.ts`
- [ ] T012 [P] [US2] Add `.drawer-badge` CSS class in `frontend/src/styles/app.css` (reuse `.host-badge` pattern, change text to "Drawer")
- [ ] T013 [US2] Update `frontend/src/pages/GamePage.tsx` to display the secret word when viewer is the drawer, and show "Drawer" badge next to the drawer's name in the player list

### Tests

- [ ] T014 [P] [US2] Add unit test for deterministic word selection in `backend/src/services/roomStore.test.ts` — same room code always returns same word
- [ ] T015 [P] [US2] Add unit test for drawer assignment on start in `backend/src/services/roomStore.test.ts` — `drawerId === hostId` after start
- [ ] T016 [P] [US2] Add unit test for conditional word exposure in `backend/src/services/roomStore.test.ts` — drawer sees word, guesser sees null
- [ ] T017 [US2] Update test for `startGame` in `backend/src/services/roomStore.test.ts` — verify `currentRound` is 1 and `secretWord` is non-null

**Checkpoint**: US2 complete — first round starts with drawer, word, and conditional exposure. Both stories independently testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] T018 Run `npm test` in both `backend/` and `frontend/` — all tests passing
- [ ] T019 Run `npx tsc --noEmit` in both `backend/` and `frontend/` — zero type errors
- [ ] T020 Run `npx vitest run --coverage` in `backend/` and verify ≥80% coverage
- [ ] T021 Validate all 4 quickstart scenarios manually with two browser tabs

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Blocks |
|-------|-----------|--------|
| Phase 2 (Foundational) | — | Phase 3, 4 |
| Phase 3 (US1) | Phase 2 | — |
| Phase 4 (US2) | Phase 2 | — |
| Phase 5 (Polish) | Phase 3, 4 | — |

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. No dependencies on US2.
- **US2 (P1)**: Can start after Phase 2. No dependencies on US1 — fully independent story.

### Within Each User Story

- Models before services
- Services before frontend integration
- Story complete before moving to polish phase

### Parallel Opportunities

- All Phase 2 tasks marked [P] can run in parallel (T002, T003)
- US1 tasks T005, T006, T007 can run in parallel
- US2 tasks T011, T012 can run in parallel; T008, T009 must be sequential
- US2 test tasks T014, T015, T016 can run in parallel

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 2: Foundational (model/type changes)
2. Complete Phase 3: US1 — name trimming
3. **STOP and VALIDATE**: Test US1 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 2 + Phase 3 → MVP (name trimming ready)
2. Phase 4 → First round features added on top

### Parallel Execution Examples

```bash
# Phase 2: Models can be done in parallel
Task: "Add drawerId, secretWord, currentRound to Room interface"
Task: "Update RoomSnapshot with drawerId, roundNumber, secretWord?"

# US2: Backend and frontend types can be done in parallel
Task: "Update toRoomSnapshot with conditional word exposure"
Task: "Add drawer-badge CSS class"
```
