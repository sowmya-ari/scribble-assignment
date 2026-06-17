# Feature Specification: Gameplay Interaction

**Feature Branch**: `003-gameplay-interaction`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Given a round is active with a drawer and guessers (all scores start at 0), When the drawer draws/clears the canvas and guessers submit their guesses, Then the drawing is visible on all players' screens; guesses are trimmed, case-insensitively compared, and empty ones rejected; the guess history is synced to all players via polling; correct guesses score 100 (incorrect add 0)."

## Clarifications

### Session 2026-06-17

- Q: How is drawing stroke data uploaded to the server? → A: The drawer POSTs the full canvas state (array of all strokes) to the server on each draw or clear action. The server replaces the stored state entirely — individual stroke appending is not used.
- Q: Can the drawer customize stroke color and width? → A: No — fixed defaults (single color, single width) for MVP. The `color` and `width` fields in the data model are preserved for future extensibility but the initial UI uses one preset.
- Q: Stroke color and width defaults → A: Color = black (#000000), width = 3px.
- Q: What happens when the canvas state POST fails? → A: The drawer sees a brief error indicator ("Canvas save failed — draw again to retry"). No auto-retry. The next draw/clear action re-POSTs the full state.

## User Scenarios & Testing

### User Story 1 - Canvas Drawing and Sync

When a round is active, the drawer can draw on the canvas. Drawing strokes are captured and synced to all players via polling. The drawer can also clear the canvas, resetting all strokes.

**Why this priority**: Without a visible drawing, guessers cannot make informed guesses, making gameplay impossible.

**Independent Test**: Open two browser tabs in the same room. Tab A is the drawer. Draw a few lines on the canvas. Verify that Tab B (guesser) sees the same lines appear within 2 seconds. Clear the canvas on Tab A and verify Tab B sees the cleared canvas within 2 seconds.

**Acceptance Scenarios**:

1. **Given** a round is active with a drawer and guessers, **When** the drawer draws a stroke on the canvas, **Then** the stroke appears on all players' screens within 2 seconds.
2. **Given** a round is active, **When** the drawer clears the canvas, **Then** all strokes are removed from all players' screens within 2 seconds.
3. **Given** a round is active, **When** the drawer has not drawn anything, **Then** all players see a blank canvas.

---

### User Story 2 - Guess Submission and Validation

Guessers can submit guesses for the secret word. Guesses are trimmed of leading/trailing whitespace, compared case-insensitively against the secret word, and empty or whitespace-only guesses are rejected with a clear message.

**Why this priority**: Guess submission is the core interaction for non-drawer players. Without validation, gameplay quality degrades.

**Independent Test**: Open Tab B as a guesser. Type " PIZZA " (with spaces, wrong case) and submit. Verify it is accepted as correct. Type "   " and verify an error message is shown. Type "pasta" and verify it is recorded as incorrect.

**Acceptance Scenarios**:

1. **Given** a guesser submits a guess, **When** the guess text matches the secret word after trimming and case-insensitive comparison, **Then** the guess is recorded as correct.
2. **Given** a guesser submits a guess, **When** the guess text does not match the secret word after trimming and case-insensitive comparison, **Then** the guess is recorded as incorrect.
3. **Given** a guesser submits a guess, **When** the guess text is empty or whitespace-only after trimming, **Then** the guess is rejected with a clear error message and is not recorded.

---

### User Story 3 - Guess History and Scoring

All guesses are recorded in a shared guess history visible to all players via polling. Each correct guess awards the guesser 100 points. Incorrect guesses award 0 points. All players start at 0 points.

**Why this priority**: Scoring and history provide the competitive and social feedback that makes the game engaging.

**Independent Test**: Tab B guesses "pizza" correctly. Verify Tab B's score shows 100 and the guess history shows the correct guess. Tab C guesses "pasta" (incorrect). Verify Tab C's score remains 0 and the history shows the incorrect guess. Verify Tab A (drawer) and Tab B both see the same history and scores.

**Acceptance Scenarios**:

1. **Given** all players start at 0 points, **When** a guesser submits a correct guess, **Then** their score becomes 100.
2. **Given** a guesser has 0 points, **When** they submit an incorrect guess, **Then** their score remains 0.
3. **Given** a guesser has 100 points, **When** they submit another correct guess in the same round, **Then** their score remains 100 (one correct guess per round).
4. **Given** any player views the game screen, **Then** they can see the full guess history including who guessed what and whether it was correct.
5. **Given** the guess history is updated, **When** any player polls for state, **Then** they see the updated history within 2 seconds.

---

### User Story 4 - Drawing Synchronization (all players see canvas)

The drawing canvas content is stored server-side and synchronized to all players via the existing polling mechanism. The drawer's strokes and clear actions are captured and sent to the server as the full canvas state (complete array of strokes), and all players retrieve the current canvas state through polling. On each draw or clear action, the server replaces the stored canvas state entirely.

**Why this priority**: Canvas sync is the mechanism that makes the drawing visible to guessers, enabling them to guess.

**Independent Test**: Tab A (drawer) draws a line. Fetch the room snapshot from Tab B and verify the canvas data is included in the response.

**Acceptance Scenarios**:

1. **Given** the drawer draws on the canvas, **When** the data is sent to the server, **Then** the server stores the current drawing state.
2. **Given** the server stores drawing state, **When** any player polls the room snapshot, **Then** the canvas data is included in the response.
3. **Given** the drawer clears the canvas, **When** the clear action is sent to the server, **Then** the stored drawing state is reset to empty.

### Edge Cases

- EC-01: Guesser submits a guess with mixed casing ("PizZa") → accepted as correct match
- EC-02: Guesser submits a guess with leading/trailing spaces ("  pizza  ") → trimmed and accepted as correct
- EC-03: Guesser submits an empty guess → rejected with "Guess cannot be empty"
- EC-04: Guesser submits a whitespace-only guess → rejected with "Guess cannot be empty"
- EC-05: Drawer submits a guess → submission rejected (drawer cannot guess their own word)
- EC-06: Multiple guessers guess correctly in the same round → all score 100 independently
- EC-07: Guesser who already scored 100 submits another guess → guess is accepted but score remains 100
- EC-08: Canvas has many strokes → all strokes are synced correctly (no data loss)
- EC-09: Drawer refreshes the page → existing drawing state is preserved and re-synced
- EC-10: Polling returns empty or partial canvas data → canvas is cleared or shows partial drawing (no crash)

## Requirements

### Functional Requirements

- **FR-001**: The system MUST capture drawing strokes from the drawer as the full canvas state and sync them to all players via polling.
- **FR-002**: The system MUST allow the drawer to clear the canvas, resetting all strokes for all players.
- **FR-003**: The drawing canvas state (full array of strokes) MUST be included in the room snapshot response for all players.
- **FR-004**: Guesses MUST be trimmed of leading and trailing whitespace before comparison.
- **FR-005**: Guess comparison MUST be case-insensitive against the secret word.
- **FR-006**: Empty or whitespace-only guesses MUST be rejected with a clear error message and not recorded.
- **FR-007**: The drawer MUST NOT be able to submit guesses.
- **FR-008**: All guesses (correct and incorrect) MUST be recorded in a shared guess history visible to all players.
- **FR-009**: The guess history MUST be included in the room snapshot response for all players.
- **FR-010**: A correct guess MUST award the guesser 100 points.
- **FR-011**: An incorrect guess MUST award 0 points.
- **FR-012**: A guesser who already scored 100 in the current round MAY continue to submit guesses, but their score remains 100.
- **FR-013**: All players MUST start the round with a score of 0.
- **FR-014**: Player scores MUST be included in the room snapshot response for all players.

### Data Requirements

- **Room** (extended from Scenario 2): { ..., canvasStrokes: CanvasStroke[], guesses: Guess[], scores: Record<participantId, number> }
- **CanvasStroke**: { id: string, points: { x: number, y: number }[], color: string, width: number }
- **Guess**: { participantId: string, text: string, isCorrect: boolean, timestamp: string }
- **GameSnapshot** (extended): { ..., canvasStrokes: CanvasStroke[], guesses: Guess[], scores: Record<participantId, number> }

### Non-goals

- Drawing canvas UI implementation (assumed to be a drawing canvas component using mouse/touch input)
- Round progression, timer, or countdown
- Speed bonuses or streak bonuses
- Partial word reveals or hints
- Multiple rounds or drawer rotation
- Chat or social features beyond guess history
- Animation or fancy transition effects for canvas sync
- Undo/redo for drawing strokes (only clear all)
- Drawing tools beyond basic freehand strokes (no shapes, text, fill, etc.)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Drawing strokes appear on all players' screens within 2 seconds of the drawer drawing them (1 polling cycle).
- **SC-002**: Canvas clear is reflected on all players' screens within 2 seconds.
- **SC-003**: Correct guess matching (case-insensitive, trimmed) completes in under 1 second from submission.
- **SC-004**: Empty/whitespace-only guesses are rejected within 1 second with an error message.
- **SC-005**: Guess history is visible to all players within 2 seconds of a guess being submitted.
- **SC-006**: Player scores are calculated correctly (100 for correct, 0 for incorrect) and visible to all players within 2 seconds.
- **SC-007**: All submitted guesses are recorded and visible in the history — no guesses are silently dropped.
- **SC-008**: The drawer cannot submit guesses — any guess submission by the drawer is rejected.

## Assumptions

- A drawing canvas component exists on the frontend and handles mouse/touch input for drawing.
- Canvas strokes are represented as an array of point arrays (simple polyline strokes) with color and width.
- The existing polling mechanism (2s interval) is used for all state synchronization.
- The round stays active indefinitely — round end/transition is handled in a future feature.
- The secret word is already set and the first round is already active (Scenario 2 is complete).
- Scores reset to 0 at the start of each round.
- A guesser who guesses correctly has "won" that round but can continue to see the game.
