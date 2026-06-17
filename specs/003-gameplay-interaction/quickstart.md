# Quickstart: Gameplay Interaction Validation

## Prerequisites

- Backend running: `cd backend && npm run dev`
- Frontend running: `cd frontend && npm run dev`
- Two browser tabs open to `http://localhost:5173`

## Validation Scenarios

### 1. Canvas Drawing Sync

1. **Tab A** (host): Create room → Start game → becomes drawer
2. **Tab B**: Join room with same code → becomes guesser
3. **Tab A**: Draw a few lines on the canvas
4. **Tab B**: Wait ≤2s → canvas shows the same lines
5. **Tab A**: Click "Clear Canvas"
6. **Tab B**: Wait ≤2s → canvas is blank

### 2. Guess Submission — Correct

1. **Tab B** (guesser): Type "  pizza  " (with spaces, lowercase) and submit
2. **Result**: Guess marked as correct, score shows 100

### 3. Guess Submission — Incorrect

1. **Tab B** (guesser): Type "pasta" and submit
2. **Result**: Guess recorded as incorrect, score remains 0

### 4. Empty Guess Rejection

1. **Tab B** (guesser): Submit empty or whitespace-only text
2. **Result**: Error message "Guess cannot be empty" displayed, no guess recorded

### 5. Drawer Cannot Guess

1. **Tab A** (drawer): Submit any text in guess form (if enabled)
2. **Result**: Guess form is disabled for the drawer, or submission returns error

### 6. Guess History Visible to All

1. **Tab B**: Submit a guess
2. **Tab A**: Wait ≤2s → sees the guess appear in history
3. **Tab B**: Confirms own guess in history

### 7. Canvas State Persists on Refresh

1. **Tab A**: Draw several strokes
2. **Tab A**: Refresh the page
3. **Tab A**: Canvas still shows the same strokes (re-synced via polling)

### 8. Multiple Correct Guessers

1. Create a room with 3+ players (Tab A drawer, Tab B and Tab C guessers)
2. Both guessers submit the correct word
3. **Result**: Both score 100 independently

### 9. Already-Correct Guesser Stays at 100

1. Tab B achieves 100 points
2. Tab B submits another guess (correct or incorrect)
3. **Result**: Tab B's score remains 100

## Running Tests

```bash
# Backend tests
cd backend && npx vitest run

# Frontend tests
cd frontend && npx vitest run
```

Expected: All existing tests pass plus new tests for canvas storage, guess validation, and scoring.

## Data Model Reference

See [data-model.md](./data-model.md) for entity definitions and validation rules.

## API Contract Reference

See [contracts/api.md](./contracts/api.md) for endpoint specifications.
