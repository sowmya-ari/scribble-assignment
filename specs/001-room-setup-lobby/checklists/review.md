# Review Checklist: Room Setup & Lobby

**Purpose**: Validate requirements quality across API contracts, UX states, error/edge case handling, and concurrency considerations for reviewer (PR) and QA audiences.
**Created**: 2026-06-16
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 Are error response body formats (field names, structure) specified for all 4xx/5xx responses across every endpoint? [Completeness, contracts/room-api.md]
- [ ] CHK002 Is the polling retry behavior specified (max retries, backoff strategy, eventual timeout)? [Completeness, Spec §FR-018]
- [ ] CHK003 Are requirements defined for the lobby page's initial loaded state before the first poll response arrives? [Completeness, Gap]
- [ ] CHK004 Are start-game response requirements defined (what the client receives when the game begins)? [Completeness, Gap — no contract for `POST /rooms/:code/start` response shape]
- [ ] CHK005 Are requirements specified for the landing page where players enter their name and choose create or join? [Completeness, Gap]
- [ ] CHK006 Are the room code character set and length validation rules documented? [Completeness, Spec §FR-002]

## Requirement Clarity

- [ ] CHK007 Is "approximately 2 seconds" (FR-010) bounded with a min/max acceptable range? [Clarity, Spec §FR-010]
- [ ] CHK008 Is "clear, user-friendly error message" (FR-005, FR-006) defined with specific message templates or acceptance criteria? [Clarity, Spec §FR-005/006]
- [ ] CHK009 Is the "Host" badge position, color, and sizing specified? [Clarity, Spec §US1]
- [ ] CHK010 Is "at any time before the game starts" (FR-014) explicit about whether leaving is allowed during a game state transition? [Clarity, Spec §FR-014]
- [ ] CHK011 Is the player name field's max length and allowed characters specified? [Clarity, Gap]
- [ ] CHK012 Is the distinction between "room not found" (FR-006) and "room full" (FR-007) error messaging specified as mutually exclusive? [Clarity, Spec §FR-006/007]

## Requirement Consistency

- [ ] CHK013 Do the data model field names in the Data Requirements section match the contracts response shapes? [Consistency, Spec §Data Requirements vs contracts/room-api.md]
- [ ] CHK014 Are polling response requirements consistent between FR-009 and the contracts documentation? [Consistency, Spec §FR-009 vs contracts/room-api.md]
- [ ] CHK015 Does "host transfers to next player" (FR-015) conflict with any test scenario expectations elsewhere? [Consistency, Spec §FR-015]

## Acceptance Criteria Quality

- [ ] CHK016 Is SC-002 ("within 3 seconds") realistically measurable given the ~2s polling interval plus network latency? [Measurability, Spec §SC-002]
- [ ] CHK017 Can SC-007 ("non-host cannot start under any condition") be verified through the documented acceptance scenarios? [Measurability, Spec §SC-007]
- [ ] CHK018 Is SC-004 ("room isolation") verifiable through a documented test procedure? [Measurability, Spec §SC-004]
- [ ] CHK019 Is SC-006 ("2 seconds to destroy room") achievable with polling-driven state detection? [Measurability, Spec §SC-006]

## Scenario Coverage

- [ ] CHK020 Are requirements defined for the scenario where a player re-joins a room they already have open in another browser tab? [Coverage, Edge Case — not in EC list]
- [ ] CHK021 Are requirements specified for the host trying to start when the only other player just left? [Coverage, Exception Flow]
- [ ] CHK022 Are requirements defined for all lobby visual states: loaded, loading (polling in progress), error (polling failed), and zero-state (no players)? [Coverage, Gap]
- [ ] CHK023 Are requirements specified for start-game when multiple players simultaneously request it? [Coverage, Concurrency]

## Edge Case Coverage

- [ ] CHK024 Is the host disconnect timeout value specified or intentionally left as an implementation detail? [Clarity, Spec §EC-03]
- [ ] CHK025 Are requirements defined for submitting a room code request while already a member of that room? [Coverage, Spec §EC-05]
- [ ] CHK026 Is the race condition between a start-game request and a simultaneous join request addressed? [Coverage, Concurrency]

## Non-Functional Requirements

- [ ] CHK027 Are requirements defined for the maximum number of concurrent rooms or player sessions the system must support? [Coverage, Spec §Assumptions — implied but not quantified]
- [ ] CHK028 Are polling cache or response optimization strategies (if any) documented? [Coverage, Gap]
- [ ] CHK029 Are concurrency requirements specified for simultaneous join operations targeting the same room? [Coverage, Gap]

## Ambiguities & Conflicts

- [ ] CHK030 Is "handles polling failures gracefully" (FR-018) defined with specific behavior after N consecutive failures? [Ambiguity, Spec §FR-018]

## Notes

- Checklist generated for reviewer (PR) and QA audiences at standard depth (~30 items)
- Covers API, UX, error/edge case, and concurrency domains
- Items marked [Gap] indicate requirements missing from spec that may need addition
- Items marked [Ambiguity] indicate requirements needing further quantification
