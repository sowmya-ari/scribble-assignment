# Implementation Plan: First Round Setup

**Branch**: `002-first-round-setup` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-first-round-setup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

When the host starts a game, the first round begins: the host becomes the drawer, a secret word is deterministically selected from the starter list, and the word is exposed only to the drawer via the polling snapshot API. Player names are also trimmed and whitespace-only names rejected. All business logic extends the existing room store; the frontend adds a "Drawer" badge and conditionally renders the secret word.

## Technical Context

**Language/Version**: TypeScript 5.6 (backend + frontend)

**Primary Dependencies**: Express 4, React 18, React Router 6, Zod 3, Vitest

**Storage**: In-memory Map (no database)

**Testing**: Vitest — Node environment for backend, jsdom environment for frontend

**Target Platform**: Web (Node.js server + React SPA)

**Project Type**: Web application (monorepo: `backend/` Express API + `frontend/` Vite React app)

**Performance Goals**: Game state sync within one polling cycle (≤2s). Word retrieval is part of existing snapshot response — no additional latency.

**Constraints**:
- No WebSockets — polling only (2s interval)
- No database — all state in-memory
- No authentication — participant identified by ID only
- Deterministic word selection — same room always yields same word

**Scale/Scope**: Single game rooms, ≤8 players per room. No round progression or timer.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| No WebSockets | ✅ Pass | Polling snapshot already used; word retrieval uses same mechanism |
| No databases | ✅ Pass | All data stays in-memory Map |
| No authentication | ✅ Pass | ParticipantId-based identity from Scenario 1 reused |
| Extend, don't rewrite | ✅ Pass | Extends existing Room/RoomSnapshot models and startGame flow |
| Follow project structure | ✅ Pass | Store logic in `services/`, routes in `api/`, types in `models/` |
| No unnecessary deps | ✅ Pass | No new dependencies needed (uses existing Zod, crypto) |
| TypeScript first | ✅ Pass | All new code fully typed |
| No multiple rounds/rotation | ✅ Pass | First round only; no rotation logic |
| No custom word packs | ✅ Pass | Uses existing `STARTER_WORDS` list |

All gates pass. No justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-first-round-setup/
├── plan.md              # This file
├── research.md          # Phase 0 — resolved unknowns
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — validation scenarios
├── contracts/           # Phase 1 — API contracts
│   └── game-api.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Created by /speckit.tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts              # Add drawerId, secretWord, currentRound to Room
│   ├── services/
│   │   └── roomStore.ts         # Name trimming, word selection, conditional snapshot
│   └── api/
│       └── rooms.ts             # Extend existing endpoints (no new routes needed)
│   └── seed/
│       └── starterData.ts       # Unchanged
├── tests/ (co-located *.test.ts)

frontend/
├── src/
│   ├── pages/
│   │   ├── LobbyPage.tsx        # Name input trimming
│   │   ├── GamePage.tsx         # Receives drawerId + word from store
│   │   └── CreateRoomPage.tsx   # Name trimming
│   │   └── JoinRoomPage.tsx     # Name trimming
│   ├── components/              # "Drawer" badge component (or inline)
│   ├── state/
│   │   └── roomStore.ts         # Expose drawerId, secretWord from snapshot
│   ├── services/
│   │   └── api.ts               # RoomSnapshot type gets drawerId, secretWord?
│   └── styles/
│       └── app.css              # .drawer-badge style
```

**Structure Decision**: Single-project web application with `backend/` and `frontend/` directories, matching the existing repo layout. No new top-level directories.

## Complexity Tracking

No constitution violations to justify.
