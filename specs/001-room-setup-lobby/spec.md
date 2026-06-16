# Feature Specification: Room Setup & Lobby

**Feature Branch**: `001-room-setup-lobby`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Scenario 1 — Room Setup & Lobby. Given a player wants to host or join a drawing game, When they create or join a room via a unique code, Then the creator is automatically the host; invalid/empty codes are rejected with clear feedback; rooms are fully isolated; the lobby refreshes via polling (~2s); and only the host can start the game once at least 2 players are present."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Room and Become Host (Priority: P1)

A player wants to host a drawing game. They create a new room and are automatically designated as the host. A unique room code is generated so others can join.

**Why this priority**: Room creation is the entry point for the entire game. Without it, no game can start.

**Independent Test**: Can be fully tested by opening the application and creating a room. The player should see the generated room code and be identified as the host in the lobby.

**Acceptance Scenarios**:

1. **Given** a player is on the landing page, **When** they choose to create a new room, **Then** a room is created with a unique code and the player is assigned as host.
2. **Given** a player has just created a room, **When** the lobby screen loads, **Then** the room code is displayed prominently and the player sees "Host" status.

---

### User Story 2 - Join a Room via Code (Priority: P1)

A player wants to join a friend's drawing game. They enter the room code shared by the host and are added to the lobby.

**Why this priority**: Joining is the second fundamental operation. Both creation and joining must work for multiplayer to function.

**Independent Test**: Can be fully tested by creating a room in one browser tab, then joining with the generated code in another tab. The lobby in both tabs should reflect both players.

**Acceptance Scenarios**:

1. **Given** a room exists with an active code, **When** a player enters a valid code and submits, **Then** they join the room and appear in the lobby player list.
2. **Given** a player enters a valid code for a full room, **Then** they are notified the room is full and cannot join.
3. **Given** a player enters an invalid room code, **Then** they see a clear error message ("Room not found") and remain on the join screen.
4. **Given** a player submits an empty code, **Then** they see a clear error message ("Please enter a room code") and remain on the join screen.

---

### User Story 3 - View Lobby and Player List (Priority: P1)

Players in a room see the lobby with the current player list and room code, refreshed automatically so everyone stays in sync.

**Why this priority**: Players need to see who else is in the room and know the room code to share it.

**Independent Test**: Can be tested by having 2+ players in a room and confirming all players appear in every player's lobby view within ~3 seconds.

**Acceptance Scenarios**:

1. **Given** a player is in the lobby, **When** another player joins, **Then** the player list updates within 3 seconds to show the new player.
2. **Given** a player is in the lobby, **When** a player leaves, **Then** the player list updates within 3 seconds to remove that player.
3. **Given** a player is in the lobby, **When** they view the screen, **Then** they can see the room code to share with others.

---

### User Story 4 - Host Starts Game (Priority: P1)

The host starts the drawing game once enough players are present. Non-host players cannot start the game.

**Why this priority**: Starting the game is the final step before gameplay. It must be controlled to ensure a proper game setup.

**Independent Test**: Can be tested by having 2+ players in a room and the host clicking start. Verify the non-host player does not have a start button and the game transitions for all players.

**Acceptance Scenarios**:

1. **Given** the host is in the lobby with 2 or more players, **When** the host clicks "Start Game", **Then** the game begins for all players.
2. **Given** a non-host player is in the lobby, **When** they view the lobby, **Then** no "Start Game" button is visible.
3. **Given** the host is in the lobby with only 1 player, **When** they view the lobby, **Then** the "Start Game" button is disabled or hidden with a message ("Waiting for more players...").
4. **Given** the host clicks "Start Game" with fewer than 2 players, **Then** the game does not start and an appropriate message is shown.

---

### User Story 5 - Leave a Room (Priority: P2)

A player wants to leave a room they joined, or the host wants to cancel the game.

**Why this priority**: Players should be able to exit a room freely. This is important but secondary to the core create/join/start flow.

**Independent Test**: Can be tested by having a player in a room click "Leave" and confirming they return to the landing page and disappear from other players' lobbies.

**Acceptance Scenarios**:

1. **Given** a non-host player is in the lobby, **When** they click "Leave Room", **Then** they exit the room and return to the landing page.
2. **Given** a non-host player leaves, **When** the lobby refreshes for remaining players, **Then** the leaving player is removed from the player list.
3. **Given** the host leaves the room, **Then** the room is disbanded and all players return to the landing page.

---

### User Story 6 - Room Cleanup on Player Departure (Priority: P3)

When all players have left a room, the room is cleaned up and its code becomes available for reuse.

**Why this priority**: Prevents resource leaks and stale rooms from accumulating. Lower priority because stale rooms are invisible to users.

**Independent Test**: Can be tested by creating a room, having all players leave, then verifying the room code is no longer joinable and the room no longer appears in active polling responses.

**Acceptance Scenarios**:

1. **Given** a room exists with players, **When** all players leave, **Then** the room is destroyed and its code becomes invalid.
2. **Given** a destroyed room, **When** a player tries to join with its former code, **Then** they receive a "Room not found" error.

---

### Edge Cases

- EC-01: Player enters a code of the wrong format (too short/long) → clear error message about format
- EC-02: Two players join simultaneously with the same code → both join the same room
- EC-03: Host's browser tab is closed unexpectedly → other players see the host disconnect and are returned to landing page
- EC-04: Network error during polling → lobby shows connection warning, retries silently
- EC-05: Player attempts to join their own room via code → treated as already in room, no duplicate entry
- EC-06: Maximum room capacity (8 players) is reached → subsequent join attempts get "Room is full" error

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow any player to create a new room without authentication
- **FR-002**: System MUST generate a unique room code (4-character alphanumeric) for each new room
- **FR-003**: System MUST designate the room creator as the host
- **FR-004**: System MUST allow players to join a room using a valid, existing room code
- **FR-005**: System MUST reject empty room code submissions with a clear, user-friendly error message
- **FR-006**: System MUST reject invalid (non-existent) room codes with a clear, user-friendly error message
- **FR-007**: System MUST enforce a maximum room capacity of 8 players
- **FR-008**: System MUST isolate rooms so that players in one room cannot see or affect players in another room
- **FR-009**: System MUST provide a way for players to retrieve current lobby state (player list, host status, room code) that refreshes automatically
- **FR-010**: The polling refresh interval MUST target approximately 2 seconds
- **FR-011**: Only the host MUST be able to start the game
- **FR-012**: The game MUST NOT start with fewer than 2 players in the room
- **FR-013**: Host MUST receive feedback if they attempt to start with fewer than 2 players
- **FR-014**: Players MUST be able to leave the room at any time before the game starts
- **FR-015**: When the host leaves the room, the room MUST be disbanded and all players returned to the landing page
- **FR-016**: When a non-host player leaves, they MUST be removed from the player list and the lobby MUST update for remaining players
- **FR-017**: When all players have left a room, the room MUST be destroyed and its code recycled
- **FR-018**: System MUST handle polling failures gracefully (show connection warning, retry automatically)

### Data Requirements *(include if feature involves data)*

- **Room**: { code: string, hostId: string, players: Player[], state: "waiting" | "in-progress" }
- **Player**: { id: string, name: string }

### Non-goals

- Drawing gameplay mechanics (turns, rounds, scoring)
- Chat or messaging in lobby
- Player avatars or profile customization
- Room passwords or invite links
- Persistent storage of rooms or player history
- Spectator mode
- Authentication or user accounts

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can create a room and another player can join it using the generated code within 5 seconds from landing page
- **SC-002**: Lobby state updates (player joins/leaves) are reflected on all connected clients within 3 seconds
- **SC-003**: Invalid or empty room codes produce a clear error message within 1 second of submission
- **SC-004**: Two rooms with the same player names operate completely independently without any cross-room interference
- **SC-005**: 100% of defined acceptance scenarios pass when tested with two concurrent browser sessions
- **SC-006**: Rooms are destroyed and codes invalidated within 2 seconds after the last player leaves
- **SC-007**: Non-host players cannot start the game under any condition (verified by testing direct API calls)

## Assumptions

- Players access the game via a web browser on a desktop or laptop device
- Players have stable internet connectivity typical of home broadband
- Players share room codes through external means (voice chat, messaging app)
- A room code of 4 alphanumeric characters provides sufficient uniqueness for concurrent rooms
- The maximum of 8 players per room accommodates typical drawing game sessions
- No authentication is required — players are identified by a self-chosen display name
- The system stores all room/player data in-memory only
- Polling is used for all lobby updates; no push-based real-time communication
