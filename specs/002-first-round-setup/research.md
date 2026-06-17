# Research: First Round Setup

## Overview

Resolve design decisions for deterministically selecting a secret word, conditionally exposing it to the drawer, trimming player names, and handling page refreshes.

---

## Decision 1: Deterministic Word Selection

**Decision**: Use the room code as a seed for a simple polynomial hash function (djb2 variant), then modulo against the starter word list length.

**Rationale**:
- No external dependencies needed — pure arithmetic
- Room code is already available and unique
- Same room code always produces the same index → deterministic
- Starter list has 5 words, so collisions are infrequent for the first round, and the small list is handled gracefully

**Alternatives considered**:
- `crypto.createHash()` — overkill for 5 words, and the hash output still needs modulo
- Random selection with stored round — non-deterministic, violates spec
- Room code character sum — simpler but higher collision probability across codes

**Impact**: Add a pure function `selectWord(roomCode: string, words: readonly string[]): string` to `roomStore.ts` or a new `wordUtils.ts`. Called once in `startGame()` when transitioning room to `"playing"`.

---

## Decision 2: Conditional Secret Word in Snapshot

**Decision**: Extend `toRoomSnapshot()` to include `secretWord` only when `viewerParticipantId === room.drawerId`.

**Rationale**:
- The existing `toRoomSnapshot()` already accepts a `viewerParticipantId` parameter (currently unused)
- The conditional check is a single guard: `viewerParticipantId === room.drawerId ? room.secretWord : undefined`
- No new endpoints needed — the existing `GET /rooms/:code` already handles this
- The frontend already calls `fetchRoom()` via polling, so the drawer automatically gets the word

**Alternatives considered**:
- Separate word endpoint — adds unnecessary complexity, violates "Keep It Simple"
- Client-side filtering — insecure, violates FR-006

**Impact**: Modify `toRoomSnapshot()` return type to conditionally include `secretWord`. Add `secretWord` field to `Room` model (stored server-side). Update `RoomSnapshot` to make `secretWord` optional.

---

## Decision 3: Player Name Trimming

**Decision**: Trim whitespace server-side in `createParticipant()`, and add client-side trimming before form submission.

**Rationale**:
- Server-side trimming is the authoritative enforcement point
- The existing `displayName()` helper already handles the fallback for `undefined`; trimming is added before it
- Client-side trimming provides instant feedback (no round-trip for whitespace-only names)

**Alternatives considered**:
- Backend-only — user sees untrimmed name momentarily before response
- Frontend-only — insecure, can be bypassed

**Impact**: Add `.trim()` to the player name in `createParticipant()` (backend) and in `CreateRoomPage`/`JoinRoomPage` form handlers (frontend). Backend Zod schemas already require min(1) so reject empty/whitespace-only strings after trimming.

---

## Decision 4: Page Refresh Persistence

**Decision**: Reuse existing polling mechanism. When the drawer refreshes their browser, the room store re-fetches the snapshot on lobby/game page mount. The `drawerId` and `secretWord` are in the snapshot response.

**Rationale**:
- No new persistence layer needed
- The snapshot is already fetched on page load via the polling effect in `GamePage`
- Server state is authoritative and survives client refresh

**Alternatives considered**:
- LocalStorage — insecure, violates FR-006
- SessionStorage — same security concern

**Impact**: No additional work beyond the conditional snapshot change. The existing `GamePage` component will receive `secretWord` from the room store when the viewer is the drawer.

---

## Open Questions

None. All design decisions resolved through research and the clarify session.
