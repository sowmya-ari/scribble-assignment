# Feature Specification: Result, Restart & Final Validation

**Feature Branch**: `004-result-restart-validation`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Given a round has ended, When the result state is displayed and the host restarts, Then all players see the correct word, final scores, and full guess history; on restart, everyone returns to the lobby with players preserved and all round state cleared."

## Clarifications

This section will be populated during the clarification phase.

## User Scenarios & Testing

### User Story 1 - Round End and Result Display

When a round ends (host triggers end-of-round), all players see the result screen showing the secret word, final scores for all participants, and the complete guess history. The round is marked as finished and no further drawing or guessing is accepted.

**Why this priority**: Without an explicit round-end mechanism, guessers never see the correct answer or final standings, which is essential for the game's competitive feedback loop.

**Independent Test**: Open three browser tabs in the same room (Tab A = drawer/host, Tabs B and C = guessers). Have Tab B guess correctly. The host (Tab A) clicks "End Round". Verify all three tabs transition to a result view within 2 seconds showing: the secret word, Tab B's score of 100, Tab C's score of 0, and all guesses recorded during the round.

**Acceptance Scenarios**:

1. **Given** a round is active, **When** the host triggers "End Round", **Then** the round status changes to "finished" and all players see the result view within 2 seconds.
2. **Given** the result view is displayed, **When** a player views the screen, **Then** they see the secret word, each participant's final score, and the full list of all guesses submitted during the round.
3. **Given** the round status is "finished", **When** a guesser submits a guess, **Then** the guess is rejected (round is no longer accepting guesses).
4. **Given** the round status is "finished", **When** the drawer draws or clears the canvas, **Then** the action is rejected (round is no longer accepting drawing actions).

---

### User Story 2 - Restart to Lobby

The host can restart the game from the result view. On restart, all players are returned to the lobby with the participant list preserved. All round-specific state (secret word, canvas strokes, guesses, scores) is cleared. The room status returns to "lobby", allowing the host to start a new round.

**Why this priority**: Restart is the mechanism that enables continuous play sessions without recreating rooms or re-inviting players.

**Independent Test**: After the result view is shown (US1), verify the host sees a "Restart Game" button. Click it. Verify all three tabs transition to the lobby view within 2 seconds with the same participants present, all scores reset, and no canvas or guess data visible. Verify the host can click "Start Game" to begin a new round.

**Acceptance Scenarios**:

1. **Given** the result view is displayed, **When** the host clicks "Restart Game", **Then** the room status changes to "lobby" and all players see the lobby view within 2 seconds.
2. **Given** the lobby view is displayed after restart, **When** a player views the participant list, **Then** all previous participants are still present.
3. **Given** the lobby view is displayed after restart, **When** the host starts a new game, **Then** a new round begins with a new secret word.
4. **Given** the lobby view is displayed after restart, **When** a player views the room, **Then** the secret word field is null, the canvas is blank, no guesses exist, and all scores are reset.

### Edge Cases

- EC-01: Non-host player attempts to end the round → action rejected (only the host can end the round)
- EC-02: Non-host player attempts to restart → action rejected (only the host can restart)
- EC-03: Host ends the round but a guesser was typing a guess → guess submission fails with "Round has ended" error
- EC-04: Player joins the room while result view is displayed → new player sees the result view with correct word, scores, and history
- EC-05: Player joins the room after restart → new player sees the lobby normally
- EC-06: Host refreshes the page during the result view → existing result state is preserved and re-synced via polling
- EC-07: Host refreshes the page after restart → lobby state is preserved and re-synced
- EC-08: All players leave during the result view → room is deleted per existing lobby cleanup rules

## Requirements

### Functional Requirements

- **FR-001**: The host MUST be able to end the active round, transitioning the room to a "finished" state.
- **FR-002**: When a round is in "finished" state, the system MUST display a result view to all players showing the secret word, final scores (all participants with their current scores), and the complete guess history.
- **FR-003**: The result view data (secret word, final scores, guess history) MUST be included in the room snapshot for all players when the room status is "finished".
- **FR-004**: When a round is in "finished" state, the system MUST reject any guess submissions and any drawing actions.
- **FR-005**: The host MUST be able to restart the game from the result view, transitioning the room status back to "lobby".
- **FR-006**: On restart, all round-specific state MUST be cleared: secret word set to null, canvas strokes reset to empty array, guesses reset to empty array, scores reset to empty object.
- **FR-007**: On restart, the participant list MUST be preserved — no participants are removed.
- **FR-008**: Only the host MAY end the round or restart the game — non-host attempts MUST be rejected.
- **FR-009**: The restart action MUST return all players to the lobby view automatically within 2 seconds via polling.

### Data Requirements

- **Room** (extended): add status value `"finished"` to the room status type ({ lobby, playing, finished })
- **RoomSnapshot** (extended): when status is `"finished"`, secretWord is always visible to all players (including guessers)
- No new data entities required — existing `Room`, `CanvasStroke`, `Guess`, and scores fields are reused

### Non-goals

- Automatic round end detection (e.g., ending when all guessers guess correctly) — round end is host-initiated only
- Timer or countdown for round duration
- Multiple rounds within a single game session without returning to lobby
- Drawer rotation or role changes on restart
- Partial round results (e.g., showing results while a round is still active)
- Animation or transition effects for the result view

## Success Criteria

### Measurable Outcomes

- **SC-001**: Round transitions from active to finished within 2 seconds of the host triggering "End Round" (1 polling cycle).
- **SC-002**: The result view displays the correct secret word, all participant scores, and complete guess history to all players within 2 seconds of the round ending.
- **SC-003**: All players transition from result view to lobby view within 2 seconds of the host triggering "Restart Game" (1 polling cycle).
- **SC-004**: After restart, the participant list in the lobby is identical to the participant list at the end of the round — no participants are lost.
- **SC-005**: After restart, no residual round data (secret word, guesses, scores, canvas strokes) is visible to any player.
- **SC-006**: Non-host attempts to end the round or restart are rejected within 2 seconds with a clear error message.
- **SC-007**: Players who join during the result view see the correct result data — players who join after restart see the lobby.

## Assumptions

- The host-initiated round end is the only mechanism for ending a round (no automatic end conditions).
- All round-specific state (scores, guesses, canvas, secret word) clears on restart, but scores are not persisted across rounds.
- The existing polling mechanism (2s interval) is used for all state synchronization.
- The result view is a new frontend component analogous to the lobby view and game view.
- Players remain in the same room across restarts — they do not need to re-join.
- A new secret word is selected when the host starts a new game after restart.
