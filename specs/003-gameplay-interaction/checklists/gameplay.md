# Gameplay Requirements Quality Checklist

**Purpose**: Validate the quality, clarity, and completeness of gameplay interaction requirements (canvas drawing/sync, guess validation, scoring/history) before implementation.

**Created**: 2026-06-17

**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 Are requirements defined for canvas state initialization when a round starts? [Completeness, Spec §Data Requirements]
- [ ] CHK002 Are requirements defined for which player role can write to the canvas (drawer only)? [Completeness, Spec §FR-001]
- [ ] CHK003 Are error handling requirements defined for canvas POST failure scenarios? [Completeness, Gap]
- [ ] CHK004 Are requirements defined for guess response format (what the submitter receives back)? [Completeness, Spec §FR-008]
- [ ] CHK005 Are requirements defined for guess history ordering (chronological, newest-first)? [Completeness, Spec §Data Requirements]
- [ ] CHK006 Are requirements defined for the initial score state of all participants at round start? [Completeness, Spec §FR-013]
- [ ] CHK007 Are requirements defined for the empty guess error message text? [Completeness, Spec §EC-03]
- [ ] CHK008 Are requirements defined for what happens when a guesser who already scored 100 submits a guess? [Completeness, Spec §FR-012]
- [ ] CHK009 Are requirements defined for canvas state after clear action? [Completeness, Spec §FR-002]
- [ ] CHK010 Are requirements defined for score calculation authority (server-side vs client-side)? [Completeness, Gap]

## Requirement Clarity

- [ ] CHK011 Is the "2 seconds" sync requirement explicitly linked to the polling interval (one cycle)? [Clarity, Spec §SC-001]
- [ ] CHK012 Is "full canvas state" clearly defined as a complete array replacement on each POST? [Clarity, Spec §Clarifications]
- [ ] CHK013 Is "rejected with a clear error message" specified with exact error text for all rejection scenarios? [Clarity, Spec §EC-03, EC-04, EC-05]
- [ ] CHK014 Are CanvasStroke field types and constraints (points min 2, color/width defaults) clearly documented? [Clarity, Spec §Data Requirements]
- [ ] CHK015 Is "guesses are recorded" defined as server-side append-only storage? [Clarity, Spec §Data Requirements]
- [ ] CHK016 Is the drawer identification mechanism for guess rejection clearly specified (by participantId vs drawerId)? [Clarity, Spec §FR-007]

## Requirement Consistency

- [ ] CHK017 Are all timing requirements using consistent units (2 seconds for sync, 1 second for validation)? [Consistency, Spec §SC-001 through SC-006]
- [ ] CHK018 Is the secret word exposure rule consistent between canvas and guess features (drawer sees it, guessers don't)? [Consistency, Spec §secretWord handling]
- [ ] CHK019 Are all error responses using a consistent format across all endpoints? [Consistency, Spec §Error Handling]
- [ ] CHK020 Are field naming conventions consistent between the data model, API contracts, and snapshot? [Consistency, Spec §Data Requirements vs contracts/api.md]

## Acceptance Criteria Quality

- [ ] CHK021 Are all acceptance criteria written in Given/When/Then format? [Acceptance Criteria, Spec §User Scenarios]
- [ ] CHK022 Can each acceptance criterion be objectively verified by an independent tester? [Acceptance Criteria, Spec §User Scenarios]
- [ ] CHK023 Are the independent test scenarios sufficient to validate each user story end-to-end? [Acceptance Criteria, Spec §Independent Tests]

## Scenario Coverage

- [ ] CHK024 Are requirements defined for the primary flow (drawer draws → guessers see → guesser submits → scored)? [Coverage, Spec §User Stories]
- [ ] CHK025 Are requirements defined for the alternate flow (guesser who already scored 100 submits again)? [Coverage, Spec §FR-012, EC-07]
- [ ] CHK026 Are requirements defined for the error flow (canvas POST fails → error indicator shown)? [Coverage, Spec §Clarifications]
- [ ] CHK027 Are requirements defined for concurrent play scenarios (multiple guessers submitting simultaneously)? [Coverage, Spec §EC-06]

## Edge Case Coverage

- [ ] CHK028 Is zero-stroke (blank) canvas state explicitly addressed? [Edge Case, Spec §US1 AC3]
- [ ] CHK029 Is drawer page refresh behavior specified for canvas state persistence? [Edge Case, Spec §EC-09]
- [ ] CHK030 Is polling returning empty/partial canvas data addressed? [Edge Case, Spec §EC-10]
- [ ] CHK031 Are whitespace-only and empty guesses distinguished in error handling requirements? [Edge Case, Spec §EC-03, EC-04]
- [ ] CHK032 Is mixed-case guess matching explicitly covered in requirements? [Edge Case, Spec §EC-01]
- [ ] CHK033 Are leading/trailing space trimming requirements explicitly stated? [Edge Case, Spec §EC-02]

## Non-Functional Requirements

- [ ] CHK034 Are canvas stroke data size limits or constraints defined? [NFR, Gap]
- [ ] CHK035 Is the polling interval configurable or fixed at 2 seconds? [NFR, Spec §Assumptions]
- [ ] CHK036 Are requirements defined for concurrent canvas operations (only one drawer)? [NFR, Spec §FR-001]

## Dependencies & Assumptions

- [ ] CHK037 Are assumptions about the canvas component's existence and capabilities documented? [Assumption, Spec §Assumptions]
- [ ] CHK038 Are dependencies on Scenario 2 (room setup, round active) explicitly stated? [Dependency, Spec §Assumptions]
- [ ] CHK039 Is the assumption that scores reset to 0 each round documented? [Assumption, Spec §Assumptions]

## Ambiguities & Conflicts

- [ ] CHK040 Are the "2 seconds" timing requirements in SC-001, SC-002, SC-005, SC-006 mutually consistent with the polling interval? [Consistency, Spec §SC]
- [ ] CHK041 Is there any conflict between FR-012 (guesser may continue submitting after scoring) and implicit round-end expectations? [Conflict, Spec §FR-012 vs Non-goals]

## Notes

- Author self-review checklist — lightweight sanity check before implementation
- Full gameplay interaction scope: canvas drawing/sync, guess validation, scoring/history
- Existing spec quality checklist at `requirements.md` covers spec creation quality
