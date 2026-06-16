# Research: Room Setup & Lobby

## Decision Log

### 1. Host Transfer on Host Leave

- **Decision**: When the host leaves, promote the next player in join order (oldest remaining player) to host.
- **Rationale**: Matches real-world drawing game behavior (skribbl.io). Prevents room deadlock where no one can start the game. Simple, predictable, no voting needed.
- **Alternatives considered**:
  - Disband room on host leave (rejected: too harsh, leaves stranded players)
  - Random promotion (rejected: unpredictable, less fair)
  - Voting (rejected: over-engineered for lobby, adds UI complexity)

### 2. Polling Mechanism

- **Decision**: Auto-poll on LobbyPage mount using `setInterval` at ~2s. Cleanup on unmount.
- **Rationale**: The spec requires ~2s polling. Auto-start matches user expectation that the lobby stays fresh. Cleanup via `clearInterval` in `useEffect` return prevents stale requests.
- **Alternatives considered**:
  - Manual refresh only (rejected: violates spec "lobby refreshes via polling (~2s)")
  - Start after first manual refresh (rejected: unnecessary friction)

### 3. Room Capacity

- **Decision**: Maximum 8 players per room.
- **Rationale**: Common limit in drawing games. Keeps polling responses small, prevents memory issues with in-memory store.
- **Alternatives considered**:
  - No limit (rejected: unbounded memory growth)
  - 6 players (rejected: too restrictive for classroom/party use)
  - 12 players (rejected: poll response grows large, diminishes UX)

### 4. Room Cleanup

- **Decision**: Delete room from store when last player leaves.
- **Rationale**: Prevents stale room accumulation. Code becomes available for reuse immediately.
- **Alternatives considered**:
  - Keep room for N minutes (rejected: complexity not justified for v1)

### 5. Player Name

- **Decision**: `playerName` field is required (not optional) in create/join requests.
- **Rationale**: Every player needs an identity in the lobby. The existing starter code marks it optional with fallback to "Player", but the spec's Assumptions say "self-chosen display name". Making it required prevents anonymous "Player-1" "Player-2" UX confusion.
- **Alternatives considered**:
  - Keep optional with "Player" fallback (rejected: bad UX, indistinguishable players)
  - Auto-generate names (rejected: less personal, harder to identify friends)

### 6. Code Validation

- **Decision**: Room codes are case-insensitive. All codes are stored and returned uppercase.
- **Rationale**: Reduces join friction (players don't need to match case). The existing starter already uppercases on join.
- **Alternatives considered**:
  - Case-sensitive (rejected: user error prone)
  - Always lowercase (rejected: uppercase is more readable as a room code)
