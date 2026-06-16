# Quickstart: Room Setup & Lobby

## Prerequisites

- Both backend and frontend dev servers running:
  - Backend: `cd backend && npm run dev` (port 3001)
  - Frontend: `cd frontend && npm run dev` (port 5173)

## Validation Scenarios

### Scenario 1: Create, Join, Lobby, Start (Happy Path)

1. Open Browser A → `http://localhost:5173`
2. Click **"Create Room"**
3. Enter name `Alice`, click create → redirected to lobby
4. Verify lobby shows room code and "Alice (Host)" in player list
5. Open Browser B → `http://localhost:5173`
6. Click **"Join Room"**
7. Enter name `Bob`, enter the room code from Browser A → click join
8. Verify both browsers show `Alice (Host)` and `Bob` in player list
9. Wait ~2s — verify both browsers auto-update without manual refresh
10. In Browser A, verify "Start Game" button is visible
11. In Browser B, verify "Start Game" button is **not** visible
12. Click "Start Game" in Browser A → verify both browsers transition

### Scenario 2: Invalid Code Rejection

1. Open Browser → `http://localhost:5173`
2. Click **"Join Room"**
3. Enter empty code → verify error: "Please enter a room code"
4. Enter code `ZZZZ` → click join → verify error: "Room not found"

### Scenario 3: Host Transfer on Leave

1. Create room with `Alice` in Browser A → lobby
2. Join with `Bob` in Browser B → lobby
3. Join with `Charlie` in Browser C → lobby
4. Browser A (Alice, host) clicks "Leave Room"
5. Verify Browser A returns to start page
6. Verify Browser B and C show `Alice` removed, `Bob` is now host
7. Verify "Start Game" button now appears in Browser B

### Scenario 4: Room Cleanup

1. Create room with `Alice` → lobby
2. Join with `Bob` → lobby
3. Both click "Leave Room"
4. Verify both return to start page
5. Try joining with the old room code → verify error: "Room not found"

### Scenario 5: Room Capacity

1. Create room → lobby
2. 7 other players join (total 8)
3. 9th player tries to join → verify error: "Room is full"

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Expected Test Coverage

- Backend: `roomStore` tests cover create, join, leave, host transfer, capacity, cleanup, code generation
- Frontend: API service tests cover create/join/fetch/leave calls
