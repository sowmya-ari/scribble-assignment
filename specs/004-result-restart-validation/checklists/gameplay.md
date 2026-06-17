# Gameplay Requirements Quality Checklist: Result, Restart & Final Validation

**Purpose**: Validate the quality, clarity, and completeness of round lifecycle requirements (state transitions, authorization, result display, restart cleanup) before implementation.

**Created**: 2026-06-17

**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 Are requirements defined for all valid state transitions (lobby→playing, playing→finished, finished→lobby)? [Completeness, Spec §Data Requirements]
- [ ] CHK002 Are requirements defined for invalid state transitions (e.g., end round from lobby, restart from playing)? [Completeness, Spec §FR-004, EC-01]
- [ ] CHK003 Are error handling requirements defined for all end-round and restart failure scenarios (non-host, wrong status, network)? [Completeness, Spec §EC-01, EC-02]
- [ ] CHK004 Are requirements defined for what the result view displays when there are no guesses (empty guess history)? [Completeness, Gap]
- [ ] CHK005 Are requirements defined for the exact data fields cleared on restart (secretWord, canvasStrokes, guesses, scores, drawerId, currentRound)? [Completeness, Spec §FR-006, data-model.md]
- [ ] CHK006 Are requirements defined for what the drawer/guesser roles see during the result view (canvas visibility, button visibility)? [Completeness, Spec §FR-002]
- [ ] CHK007 Are requirements defined for the secret word visibility rules across all three room statuses (lobby, playing, finished)? [Completeness, Spec §Data Requirements]

## Requirement Clarity

- [ ] CHK008 Is "clear error message" in SC-006 quantified with specific error text for each rejection scenario (non-host end, non-host restart, draw during finished, guess during finished)? [Clarity, Spec §SC-006]
- [ ] CHK009 Is the phrase "result view" clearly distinguished from the existing game view and lobby view in the spec? [Clarity, Spec §FR-002]
- [ ] CHK010 Is the round end trigger unambiguously defined as host-initiated only (no automatic conditions)? [Clarity, Spec §FR-001, Non-goals]
- [ ] CHK011 Is the restart behavior specified for what the host sees vs. what guessers see during the transition? [Clarity, Spec §FR-009, AC-1]
- [ ] CHK012 Are "final scores" in the result view defined as the scores at the moment the round ended (not live-updating)? [Clarity, Spec §FR-002]

## Requirement Consistency

- [ ] CHK013 Is the "finished" status naming consistent across spec, plan, data-model, and contracts? [Consistency, Spec §Data Requirements vs contracts/api.md]
- [ ] CHK014 Does the secret word visibility rule in the spec (visible to all when finished) align with the snapshot contract definition? [Consistency, Spec §Data Requirements vs contracts/api.md]
- [ ] CHK015 Are authorization rules consistent between end-round and restart (both host-only, same rejection pattern)? [Consistency, Spec §FR-008]
- [ ] CHK016 Does the data cleanup specification on restart (FR-006) align with the data model's state transition table? [Consistency, Spec §FR-006 vs data-model.md]

## Acceptance Criteria Quality

- [ ] CHK017 Are all acceptance criteria (US1 AC1-4, US2 AC1-4) written in Given/When/Then format? [Acceptance Criteria, Spec §User Scenarios]
- [ ] CHK018 Can each acceptance criterion be objectively verified by an independent tester? [Acceptance Criteria, Spec §User Scenarios]
- [ ] CHK019 Are the independent test scenarios sufficient to validate each user story end-to-end? [Acceptance Criteria, Spec §Independent Tests]

## Scenario Coverage

- [ ] CHK020 Are requirements defined for the primary flow (host ends round → result displayed → host restarts → lobby)? [Coverage, Spec §User Scenarios]
- [ ] CHK021 Are requirements defined for the alternate flow (host leaves during result view → host transfers → new host can restart)? [Coverage, Spec §EC-08]
- [ ] CHK022 Are requirements defined for the error flow (non-host attempts end round → rejection)? [Coverage, Spec §EC-01, EC-02]
- [ ] CHK023 Are requirements defined for the concurrent scenario (host ends round while guess is being submitted → guess rejected)? [Coverage, Spec §EC-03]

## Edge Case Coverage

- [ ] CHK024 Is the scenario of all players leaving during the result view addressed for room cleanup? [Edge Case, Spec §EC-08]
- [ ] CHK025 Is the scenario of host page refresh during the result view addressed for state persistence? [Edge Case, Spec §EC-06]
- [ ] CHK026 Is the scenario of a new player joining during the result view addressed? [Edge Case, Spec §EC-04]
- [ ] CHK027 Is the scenario of a new player joining after restart addressed? [Edge Case, Spec §EC-05]
- [ ] CHK028 Is the scenario of immediately restarting again (finished → lobby → restart without starting new game) addressed? [Edge Case, Gap]
- [ ] CHK029 Is the scenario of the drawer leaving during the result view addressed for canvas preservation? [Edge Case, Gap]

## Non-Functional Requirements

- [ ] CHK030 Are timing requirements defined for the round-end and restart transitions (2 seconds via polling)? [NFR, Spec §SC-001, SC-003]
- [ ] CHK031 Are concurrency requirements defined for multiple players triggering actions simultaneously (e.g., two non-hosts trying to end round)? [NFR, Gap]
- [ ] CHK032 Are error message consistency requirements defined across all new endpoints (same format as existing RoomError patterns)? [NFR, Spec §Error Handling]

## Dependencies & Assumptions

- [ ] CHK033 Is the assumption that host and drawer may be different people (after host transfer) documented and its impact addressed? [Assumption, Spec §Assumptions]
- [ ] CHK034 Is the dependency on Scenario 3's guess recording and scoring explicitly stated? [Dependency, Spec §Assumptions, plan.md]
- [ ] CHK035 Is the assumption that the existing polling (2s interval) handles the result view and restart transitions documented? [Assumption, Spec §Assumptions]
- [ ] CHK036 Is the assumption that a new secret word is selected when the host starts a new game after restart documented? [Assumption, Spec §Assumptions]

## Ambiguities & Conflicts

- [ ] CHK037 Is there any conflict between FR-005 (host restarts from result view) and the non-goal of "multiple rounds within a single game session without returning to lobby"? [Conflict, Spec §FR-005 vs Non-goals]
- [ ] CHK038 Is there a conflict between the independent test's "drawer/host" assumption and the possibility of host transfer making them different people? [Conflict, Spec §Independent Test vs EC-08]
- [ ] CHK039 Is the term "result view" used consistently as the same concept across all sections (FR-002, ACs, Independent Tests)? [Consistency, Spec §FR-002 vs User Scenarios]

## Notes

- Author self-review checklist — lightweight sanity check before implementation
- Full round lifecycle scope: state transitions, host authorization, result display, restart cleanup
- Existing spec quality checklist at `requirements.md` covers spec creation quality
