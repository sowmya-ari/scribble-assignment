---
description: "Task list for Room Setup & Lobby feature"
---

# Tasks: Room Setup & Lobby

**Input**: Design documents from `specs/001-room-setup-lobby/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks included in Phase 6.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Parallelizable (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps to user story (US1–US6)
- All descriptions include exact file paths

---

## Phase 1: Setup

*No setup tasks needed — project already initialized with Express, React, Vitest, Zod.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Model, schema, and type changes that all user stories depend on.

⚠️ **CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Update `Room` interface to add `hostId: string` in `backend/src/models/game.ts`
- [x] T002 [P] Update `RoomSnapshot` to include `hostId` field in `backend/src/models/game.ts`
- [x] T003 [P] Update `createRoomSchema` and `joinRoomSchema` — make `playerName` required (non-empty string) in `backend/src/api/schemas.ts`
- [x] T004 [P] Add `leaveRoomSchema` and handle 409 status in `backend/src/api/schemas.ts`
- [x] T005 [P] Update frontend API types to include `hostId` in `RoomSnapshot` in `frontend/src/services/api.ts`
- [x] T006 [P] Add `leaveRoom(code, participantId)` function to frontend API service in `frontend/src/services/api.ts`
- [x] T007 Update `roomStore` state to expose `hostId` from room snapshot in `frontend/src/state/roomStore.ts`

**Checkpoint**: Foundation ready — all user stories can now begin.

---

## Phase 3: User Story 1 + 2 + 3 — Create, Join, and Lobby (Priority: P1) 🎯 MVP

**Goal**: Players can create rooms (become host), join via code, and see the lobby auto-refresh every ~2s.

**Independent Test**: Open two browser tabs. Tab A creates a room — lobby shows code and "Host" badge. Tab B joins with that code — both tabs show both players within 3 seconds.

### Implementation

- [x] T008 [US1] Update `createRoom()` to store creator's participant ID as `hostId` in `backend/src/services/roomStore.ts`
- [x] T009 [US1] Update `toRoomSnapshot()` to include `hostId` in output in `backend/src/services/roomStore.ts`
- [x] T010 [US2] Add capacity check in `joinRoom()` — reject if participants.length >= 8 in `backend/src/services/roomStore.ts`
- [x] T011 [US2] Update `POST /rooms/:code/join` to return 409 for full rooms in `backend/src/api/rooms.ts`
- [x] T012 [US2] Improve frontend join form validation (empty code — "Please enter a room code") in `frontend/src/pages/JoinRoomPage.tsx`
- [x] T013 [US3] Add auto-polling with `setInterval` on LobbyPage mount (~2s) with cleanup on unmount in `frontend/src/pages/LobbyPage.tsx`
- [x] T014 [US3] Show connection warning on polling failure in `frontend/src/pages/LobbyPage.tsx`
- [x] T015 [US3] Display host indicator ("Host" badge) next to host player in lobby in `frontend/src/pages/LobbyPage.tsx`

**Checkpoint**: MVP complete — create, join, lobby auto-refresh all work independently.

---

## Phase 4: User Story 4 — Host Starts Game (Priority: P1)

**Goal**: Only the host can start the game once 2+ players are present.

**Independent Test**: Tab A (host) sees "Start Game" button. Tab B (non-host) does not. Clicking start in Tab A transitions both tabs to game view.

### Implementation

- [x] T016 [P] [US4] Add `startGame` endpoint — `POST /rooms/:code/start` with `participantId` body, verify host + player count in `backend/src/api/rooms.ts`
- [x] T017 [P] [US4] Add `startGameSchema` and wire 403 (not host) / 400 (<2 players) errors in `backend/src/api/schemas.ts`
- [x] T018 [P] [US4] Add `startGame()` service function — verify caller is host and room has >=2 players in `backend/src/services/roomStore.ts`
- [x] T019 [P] [US4] Add `startGame()` action to frontend roomStore in `frontend/src/state/roomStore.ts`
- [x] T020 [US4] Show "Start Game" button only for host, disabled with message when <2 players in `frontend/src/pages/LobbyPage.tsx`
- [x] T021 [US4] Add frontend API function `startGame(code, participantId)` in `frontend/src/services/api.ts`

**Checkpoint**: Host can start game. Non-hosts cannot.

---

## Phase 5: User Story 5 + 6 — Leave Room & Room Cleanup (Priority: P2/P3)

**Goal**: Players can leave rooms. Host transfers automatically to next player. Rooms clean up when the last player departs.

**Independent Test**: Tab A creates room, Tab B joins. Tab A leaves — Tab B becomes host. Both leave — old room code is dead.

### Implementation

- [x] T022 [US5] Add `leaveRoom(participantId, room)` service function — remove participant, promote next if host, delete if empty in `backend/src/services/roomStore.ts`
- [x] T023 [US5] Add `POST /rooms/:code/leave` endpoint in `backend/src/api/rooms.ts`
- [x] T024 [US5] Add `leaveRoom()` action to frontend roomStore in `frontend/src/state/roomStore.ts`
- [x] T025 [US5] Add "Leave Room" button to LobbyPage for all players in `frontend/src/pages/LobbyPage.tsx`

**Checkpoint**: All P1 + P2 + P3 stories complete.

---

## Phase 6: Tests

**Purpose**: Verify backend service logic and frontend API service.

- [x] T026 [P] Add unit test for host designation on create in `backend/src/services/roomStore.test.ts`
- [x] T027 [P] Add unit test for capacity enforcement (join when full) in `backend/src/services/roomStore.test.ts`
- [x] T028 [P] Add unit test for host transfer on leave in `backend/src/services/roomStore.test.ts`
- [x] T029 [P] Add unit test for room cleanup on last departure in `backend/src/services/roomStore.test.ts`
- [x] T030 [P] Add unit test for start-game host check in `backend/src/services/roomStore.test.ts`
- [x] T031 [P] Add API test for `leaveRoom` request in `frontend/src/services/api.test.ts`
- [x] T032 [P] Add test verifying existing code generation still produces unique 4-char codes in `backend/src/services/roomStore.test.ts`
- [x] T033 [P] Add test verifying existing invalid code throws RoomError in `backend/src/services/roomStore.test.ts`
- [x] T034 [P] Add test verifying room isolation — two rooms with same player names don't interfere in `backend/src/services/roomStore.test.ts`
- [x] T035 Run `npm test` in both `backend/` and `frontend/` — all tests passing

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Blocks |
|-------|-----------|--------|
| Phase 2 (Foundational) | — | Phase 3, 4, 5 |
| Phase 3 (US1-3 MVP) | Phase 2 | — |
| Phase 4 (US4) | Phase 2 | — |
| Phase 5 (US5-6) | Phase 2 | — |
| Phase 6 (Tests) | Phase 3, 4, 5 | — |

### User Story Dependencies

- **US1–3 (Phase 3)**: Depends on Phase 2. No cross-story dependencies within phase.
- **US4 (Phase 4)**: Depends on Phase 2 only. Independent of US1-3.
- **US5–6 (Phase 5)**: Depends on Phase 2 only. Independent of US1-4.

### Within Each Phase

- Tasks marked [P] can run in parallel (different files, no ordering)
- Non-[P] tasks must run sequentially within their phase

### Parallel Opportunities

- All Phase 2 tasks marked [P] can run concurrently
- Phases 3, 4, and 5 can run in parallel once Phase 2 completes (3 independent teams/streams)
- All Phase 6 [P] tests can run concurrently
- Total [P] tasks: 9

---

## Parallel Execution Examples

### Phase 3 (MVP) — Backend + Frontend in parallel

```bash
# Backend tasks (parallel):
Task: T008 Update createRoom() to set hostId in roomStore.ts
Task: T010 Add capacity check to joinRoom() in roomStore.ts
Task: T011 Update POST /rooms/:code/join for 409 in rooms.ts

# Frontend tasks (parallel):
Task: T012 Improve join form validation in JoinRoomPage.tsx
Task: T013 Add auto-polling to LobbyPage.tsx
Task: T015 Display host badge in LobbyPage.tsx
```

### Phase 4 + Phase 5 — Both can start after Phase 2

```bash
# Phase 4 (parallel):
Task: T016 Add startGame endpoint in rooms.ts
Task: T017 Add startGameSchema in schemas.ts
Task: T018 Add startGame() service in roomStore.ts

# Phase 5 (parallel):
Task: T022 Add leaveRoom() service in roomStore.ts
Task: T023 Add leave endpoint in rooms.ts
```

---

## Implementation Strategy

### MVP First (Phase 2 + Phase 3 only)

1. Complete Phase 2: Foundational (model/schema changes)
2. Complete Phase 3: US1-3 (create, join, lobby with auto-polling)
3. **STOP and VALIDATE** using Quickstart Scenarios 1 + 2
4. All P1 stories operational — ready to demo

### Incremental Delivery

| Step | Phases | Delivers |
|------|--------|----------|
| 1 | Phase 2 + 3 | MVP: create/join/lobby with host badge |
| 2 | Phase 4 | Host-only start game |
| 3 | Phase 5 | Leave room with host transfer + cleanup |
| 4 | Phase 6 | Test coverage for all logic |

### Parallel Team Strategy

With multiple developers:
1. Team completes Phase 2 (Foundational) together
2. Once Phase 2 is done:
   - Developer A: Phase 3 (MVP)
   - Developer B: Phase 4 (host start game)
   - Developer C: Phase 5 (leave/cleanup)
3. Phase 6 (tests) written as each developer finishes their phase

---

## Notes

- [P] tasks = different files, no dependencies — can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify existing tests still pass after each phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
