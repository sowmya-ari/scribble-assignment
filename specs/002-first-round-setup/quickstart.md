# Quickstart: First Round Setup

## Prerequisites

- Backend running: `cd backend && npm run dev`
- Frontend running: `cd frontend && npm run dev`
- Two browser tabs open to `http://localhost:5173`

## Validation Scenarios

### Scenario 1: Player Name Trimming

1. In Tab A, click **Create Room**
2. Enter `"  Alice  "` (with spaces) as the player name
3. Click **Create and Continue**
4. **Expect**: Lobby shows "Alice" (trimmed, no spaces) in the player list
5. Go back to landing page
6. Click **Create Room** again
7. Enter `"   "` (only spaces) as the player name
8. Click **Create and Continue**
9. **Expect**: Error message "Player name is required" or similar — room is NOT created

### Scenario 2: First Round — Drawer Assignment and Word

1. In Tab A, create a room with name "Alice" → lobby loads
2. In Tab B, click **Join Room**, enter "Bob" and the room code from Tab A → lobby loads
3. In Tab A (host), verify you see a **"Start Game"** button
4. In Tab B (non-host), verify there is **no** "Start Game" button
5. In Tab A, click **Start Game**
6. **Expect**: Both tabs navigate to the game screen within 3 seconds
7. **Expect**: Tab A shows a **"Drawer" badge** next to "Alice" in the player list
8. **Expect**: Tab B shows a **"Drawer" badge** next to "Alice" in the player list
9. **Expect**: Tab A (drawer) sees the secret word displayed prominently
10. **Expect**: Tab B (guesser) does NOT see the secret word

### Scenario 3: Word Persists on Refresh

1. Complete Scenario 2
2. In Tab A, refresh the browser
3. **Expect**: Tab A still shows the game screen (redirects from landing page via polling)
4. **Expect**: Tab A still sees the secret word

### Scenario 4: API Word Isolation

1. Complete Scenario 2
2. Using browser dev tools or curl, make a request:
   ```
   GET http://localhost:3001/rooms/ABCD?participantId=<Tab-B-participantId>
   ```
3. **Expect**: Response contains `"secretWord": null` (or field is absent)
4. Make the same request with Tab A's participantId:
   ```
   GET http://localhost:3001/rooms/ABCD?participantId=<Tab-A-participantId>
   ```
5. **Expect**: Response contains the actual secret word in `"secretWord"`

## Expected Results Summary

| # | Scenario | Expected Outcome | Critical? |
|---|----------|-----------------|-----------|
| 1 | Name trimming | "  Alice  " → "Alice" | Yes |
| 2 | Whitespace rejection | "   " → error shown | Yes |
| 3 | Drawer assigned | Host has "Drawer" badge | Yes |
| 4 | Word visible to drawer | Drawer sees word | Yes |
| 5 | Word hidden from guesser | Guesser doesn't see word | Yes |
| 6 | Word survives refresh | Drawer still sees word after F5 | Yes |
| 7 | API isolation | Non-drawer API call gets null word | Yes |
