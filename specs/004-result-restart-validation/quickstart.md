# Quickstart: Result, Restart & Final Validation

## Prerequisites

- Backend server running (`cd backend && npm run dev`)
- Frontend dev server running (`cd frontend && npm run dev`)
- At least 2 browser tabs open in the same room with a game started

## Validation Scenarios

### Scenario 1: End Round and Result Display

1. **Setup**: Open 3 browser tabs (Tab A = host/drawer, Tabs B/C = guessers). Start a game. Have Tab B submit a correct guess.
2. **Action**: As the host (Tab A), trigger "End Round".
3. **Verify**:
   - Tab A, B, C all show the result view within 2 seconds
   - The secret word is displayed to all players
   - Tab B's score shows 100, Tab C's score shows 0
   - All guesses (correct and incorrect) are listed in the guess history
   - Final canvas strokes are visible
4. **Verify rejection**: Try to submit a guess on Tab B or C — should fail with "Round has ended". Try to draw on Tab A — should fail.

### Scenario 2: Restart to Lobby

1. **Setup**: From the result view (Scenario 1).
2. **Action**: As the host (Tab A), click "Restart Game".
3. **Verify**:
   - All tabs transition to the lobby view within 2 seconds
   - All 3 participants are still present in the player list
   - Secret word field is not visible (null)
   - Canvas is blank
   - No guesses visible
   - Scores are empty/reset
4. **Verify new game**: Host clicks "Start Game". A new round begins with a new secret word.

### Scenario 3: Authorization (Non-Host Rejection)

1. **Setup**: From the game view or result view.
2. **Action**: As a non-host (Tab B or C), attempt to end the round or restart.
3. **Verify**: Action is rejected with a clear error message.

### Scenario 4: Host Refresh During Result View

1. **Setup**: From the result view.
2. **Action**: Host refreshes their browser tab.
3. **Verify**: The result view is restored — secret word, scores, guesses, and canvas are all visible.

## Running Tests

```bash
cd backend && npx vitest run
```
