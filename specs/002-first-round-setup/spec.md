# Feature Specification: First Round Setup

**Feature Branch**: `002-first-round-setup`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Given a game is starting and player names are trimmed (empty/whitespace-only rejected with a message), When the first round begins, Then the host (or first player) becomes the clearly-identified drawer, and the secret word (deterministically selected from the starter list) is visible only to the drawer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Name Trimming and Validation (Priority: P1)

Players should have clean display names. Leading and trailing whitespace is stripped from submitted names, and names that are empty or whitespace-only after trimming are rejected with a clear message.

**Why this priority**: This prevents confusing display names that look empty or have odd spacing, ensuring the lobby player list is readable. It also closes a validation gap from the room setup flow.

**Independent Test**: Open the app, create a room with a name like "  Alice  " and verify the lobby shows "Alice". Then try to create a room with a name of just spaces and verify an error message is shown.

**Acceptance Scenarios**:

1. **Given** a player enters a name with leading or trailing spaces, **When** they submit the create or join form, **Then** the name is trimmed and the player appears in the lobby with the clean name.
2. **Given** a player enters a name that is empty or contains only whitespace, **When** they submit the create or join form, **Then** they see a clear error message and remain on the form.

---

### User Story 2 - First Round Begins with Drawer and Secret Word (Priority: P1)

When the host starts the game, a first round begins. The host is assigned as the drawer for this round. A secret word is deterministically selected from the starter word list and is revealed only to the drawer. Non-drawers see the game view but not the word.

**Why this priority**: This is the core transition from lobby to gameplay. Without it, no game can proceed past the lobby.

**Independent Test**: Create a room with two players (Tab A host, Tab B guest). Host clicks Start Game. Tab A shows the word and a drawer badge. Tab B shows the game view but no word. Both tabs show the host as the drawer.

**Acceptance Scenarios**:

1. **Given** the host starts a game with 2 or more players in the lobby, **When** the game transitions, **Then** the host is designated as the drawer for the first round.
2. **Given** the first round has started, **When** the drawer views the game screen, **Then** they see the secret word displayed prominently.
3. **Given** the first round has started, **When** a non-drawer views the game screen, **Then** they do not see the secret word.
4. **Given** the same room and round, **When** the word is requested, **Then** the same word is always returned (deterministic selection).
5. **Given** the first round has started, **When** any player views the game screen, **Then** they can see who the current drawer is.

---

### Edge Cases

- EC-01: Player name is only whitespace (spaces, tabs) → rejected with "Player name cannot be empty"
- EC-02: Player name has mixed leading/trailing whitespace → trimmed to the non-whitespace portion
- EC-03: Room has exactly 2 players at start → host is drawer, guest is guesser
- EC-04: Room has 8 players at start → host is drawer, all others are guessers
- EC-05: Drawer's tab is refreshed → drawer still sees the word on reconnection
- EC-06: Non-drawer tries to access the word via API → request returns without exposing the word

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST trim leading and trailing whitespace from player names submitted via create or join.
- **FR-002**: System MUST reject player names that are empty or whitespace-only after trimming with a clear error message.
- **FR-003**: When the host starts the game, the system MUST assign the host as the drawer for the first round.
- **FR-004**: The system MUST select a secret word deterministically from the starter word list when the first round begins.
- **FR-005**: The secret word MUST be visible only to the drawer.
- **FR-006**: Non-drawer players MUST NOT be able to see or infer the secret word through any API response.
- **FR-007**: All players MUST be able to see who the current drawer is.
- **FR-008**: The drawer MUST be able to see the secret word on the game screen.
- **FR-009**: The game state MUST persist across page refreshes — if the drawer refreshes their browser, they still see the word.

### Data Requirements *(include if feature involves data)*

- **Room**: { code, hostId, participants, status, currentRound, drawerId, secretWord }
- **Round**: { number, drawerId, word, status }
- **GameSnapshot**: { code, status, drawerId, participants, roundNumber }

### Non-goals

- Drawing canvas or guess input UI (separate feature)
- Round progression, timer, or scoring
- Word hints or categories
- Multiple simultaneous rounds
- Word selection customization by host

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Player names with leading/trailing whitespace are displayed trimmed in the lobby within 1 second of submission.
- **SC-002**: Whitespace-only names are rejected with an error message within 1 second of submission.
- **SC-003**: After the host starts the game, all players see the game screen with the correct drawer identified within 3 seconds (1 polling cycle).
- **SC-004**: The drawer sees the secret word on their screen within 1 second of the game transitioning.
- **SC-005**: Non-drawers never see the word under any condition, verified by testing direct API access.
- **SC-006**: The word selection is deterministic — querying the word for a given room always returns the same result, verified through repeatable testing.

## Assumptions

- The starter word list already exists and is accessible server-side
- The existing polling mechanism (2s interval) is used for game state updates
- Players have stable internet connectivity
- The host is always the first drawer; drawer rotation will be handled in a future feature
- Room code is used as the seed for deterministic word selection (same room code always produces the same word for the first round)
- The existing lobby-to-game transition (status change to "playing") is already implemented
