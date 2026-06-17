# Implementation Plan: Result, Restart & Final Validation

**Branch**: `004-result-restart-validation` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-result-restart-validation/spec.md`

## Summary

Implement round-end mechanism (host transitions room from "playing" to "finished"), a result view displaying the secret word, final scores, and complete guess history to all players, and a host-triggered restart that returns everyone to the lobby with participants preserved and all round state cleared.

## Technical Context

**Language/Version**: TypeScript 5.6

**Primary Dependencies**: Express 4 (backend), React 18 (frontend), Zod 3 (validation), Vitest (testing)

**Storage**: In-memory — `Map<string, Room>` in `roomStore.ts`. No database.

**Testing**: Vitest for backend. Backend tests in `backend/src/` next to source.

**Target Platform**: Node.js (backend), modern browsers via Vite (frontend)

**Project Type**: Web application (monorepo: `backend/` + `frontend/`)

**Performance Goals**: Round-end and restart visible to all players within 2s (one polling cycle). Result view data (secret word, scores, guess history) returned in the room snapshot — no separate endpoint needed.

**Constraints**: No WebSockets (polling only). No databases. No authentication. Round-end is host-initiated only (no automatic detection).

**Scale/Scope**: <8 players per room. Single round — restart clears all state and returns to lobby.

**Dependencies**: Assumes Scenario 3's guess history and scores are already stored on the Room model. The result view will display them — any GuessHistory or Scoreboard component work is shared with Scenario 3 Phase 5.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| I. Extend, Don't Rewrite | ✅ PASS | Extends existing Room model (adds "finished" status), roomStore (endRound, restartGame), rooms router, GamePage/result view |
| II. Keep It Simple & Deterministic | ✅ PASS | State transitions are straightforward (playing → finished → lobby), no complex logic |
| III. Follow Existing Project Structure | ✅ PASS | Backend: `src/api/` (routes), `src/services/` (roomStore), `src/models/` (game). Frontend: `src/pages/` (GamePage/ResultView), `src/components/` (GuessHistory, Scoreboard updates) |
| IV. Avoid Unnecessary Dependencies | ✅ PASS | No new dependencies needed |
| V. TypeScript First | ✅ PASS | All interfaces typed, extend existing types |
| Testing & Quality Gates | ✅ PASS | Unit tests for endRound and restartGame backend logic |
| Scope Constraints | ✅ PASS | No WebSockets, no database, no auth, no automatic round-end detection |

**Result**: GATE PASSED — no violations. Complexity tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-result-restart-validation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts              # Extended: RoomStatus includes "finished"
│   ├── services/
│   │   └── roomStore.ts          # Extended: endRound, restartGame
│   ├── api/
│   │   ├── rooms.ts              # Extended: POST end-round, POST restart routes
│   │   └── schemas.ts            # Extended: endRoundSchema, restartSchema (minimal)

frontend/
├── src/
│   ├── components/
│   │   ├── GuessHistory.tsx       # NEW: renders list of guesses with correct/incorrect indicators
│   │   ├── ResultView.tsx         # NEW: result screen showing secret word, scores, guesses
│   │   └── Scoreboard.tsx         # Extended: display real scores from room.scores, sorted descending
│   ├── pages/
│   │   ├── GamePage.tsx           # Extended: end-round button for host, conditionally render per status
│   │   └── LobbyPage.tsx          # Unchanged (restart redirects here via polling)
│   ├── state/
│   │   └── roomStore.ts           # Extended: endRound, restartGame actions (if needed)
│   └── services/
│       └── api.ts                 # Extended: endRound, restartGame API methods
```

**Structure Decision**: Web application monorepo — follows the existing backend/frontend structure exactly. No new top-level directories.

## Complexity Tracking

> Not needed — Constitution Check passed with no violations.
