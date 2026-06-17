# Implementation Plan: Gameplay Interaction

**Branch**: `003-gameplay-interaction` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-gameplay-interaction/spec.md`

## Summary

Implement canvas drawing (drawer draws freehand strokes, clear canvas), guess submission and validation (trimmed, case-insensitive comparison, empty rejection), guess history and scoring (100 for correct, 0 for incorrect), and canvas state sync — all via the existing 2s HTTP polling mechanism.

## Technical Context

**Language/Version**: TypeScript 5.6

**Primary Dependencies**: Express 4 (backend), React 18 (frontend), Zod 3 (validation), Vitest (testing)

**Storage**: In-memory — `Map<string, Room>` in `roomStore.ts`. No database.

**Testing**: Vitest for both backend and frontend. Backend tests in `backend/src/` next to source. Frontend tests in `frontend/src/` next to source.

**Target Platform**: Node.js (backend), modern browsers via Vite (frontend)

**Project Type**: Web application (monorepo: `backend/` + `frontend/`)

**Performance Goals**: Canvas state visible to all players within 2s (one polling cycle). Guess validation completes in under 1s (HTTP round-trip).

**Constraints**: No WebSockets (polling only). No databases. No authentication. Single round — no round progression, drawer rotation, or timers.

**Scale/Scope**: <8 players per room. Single canvas with basic freehand strokes. Canvas stroke data small (<50 KB per snapshot).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| I. Extend, Don't Rewrite | ✅ PASS | Extends existing Room model, roomStore, rooms router, GamePage, roomStore state, api service |
| II. Keep It Simple & Deterministic | ✅ PASS | All fields in-memory, deterministic comparison (trim + toLowerCase) |
| III. Follow Existing Project Structure | ✅ PASS | Backend: `src/api/` (routes), `src/services/` (roomStore), `src/models/` (game). Frontend: `src/pages/` (GamePage), `src/components/` (new Canvas, updated GuessForm), `src/state/` (roomStore), `src/services/` (api) |
| IV. Avoid Unnecessary Dependencies | ✅ PASS | No new dependencies needed — uses built-in canvas API, existing Zod/Express |
| V. TypeScript First | ✅ PASS | All interfaces typed, no `any` |
| Testing & Quality Gates | ✅ PASS | Unit tests for new backend logic (guess validation, scoring, canvas storage), existing test patterns followed |
| Scope Constraints | ✅ PASS | No WebSockets, no database, no auth, no round progression, no drawer rotation, no timers |

**Result**: GATE PASSED — no violations. Complexity tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-gameplay-interaction/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts              # Extended: CanvasStroke, Guess, canvasStrokes, guesses, scores
│   ├── services/
│   │   └── roomStore.ts          # Extended: saveCanvas, submitGuess, score calculation
│   ├── api/
│   │   ├── rooms.ts              # Extended: POST canvas, POST guess routes
│   │   └── schemas.ts            # Extended: canvasSchema, submitGuessSchema
│   └── seed/
│       └── starterData.ts        # Unchanged

frontend/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx            # NEW: drawing canvas component
│   │   └── GuessForm.tsx         # Extended: connect to API, handle drawer/guesser, error display
│   ├── pages/
│   │   └── GamePage.tsx          # Extended: integrate Canvas component, scores display, guess history
│   ├── state/
│   │   └── roomStore.ts          # Extended: canvas and guess store actions
│   └── services/
│       └── api.ts                # Extended: saveCanvas, submitGuess API calls
```

**Structure Decision**: Web application monorepo — follows the existing backend/frontend structure exactly. No new top-level directories.

## Complexity Tracking

> Not needed — Constitution Check passed with no violations.
