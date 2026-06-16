# Implementation Plan: Room Setup & Lobby

**Branch**: `001-room-setup-lobby` | **Date**: 2026-06-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-room-setup-lobby/spec.md`

## Summary

Extend the existing backend (`roomStore`, `rooms API`, `schemas`) and frontend (`roomStore`, `LobbyPage`, `api service`) to support host designation, host transfer on leave, auto-polling lobby (~2s), room capacity enforcement (8 max), room cleanup on last departure, and player name validation.

The existing starter already implements basic room CRUD — this work adds the remaining spec requirements on top.

## Technical Context

**Language/Version**: TypeScript 5.6, ES2022

**Primary Dependencies**: Express 4, React 18, React Router 6, Zod 3

**Storage**: In-memory (none, per constitution)

**Testing**: Vitest (backend Node env, frontend jsdom env)

**Target Platform**: Web browser (desktop), Node.js server

**Project Type**: Web application (Express backend + React frontend)

**Performance Goals**: Lobby polling every 2s, room operations under 200ms

**Constraints**: No WebSockets, no database, no authentication (per constitution)

**Scale/Scope**: Single server, 8 players/room, ~50 concurrent rooms

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: No WebSockets — PASS
- Spec requires polling (~2s), not WebSockets. The plan uses HTTP polling via `setInterval` on the frontend.

### Gate 2: No Databases — PASS
- All data stored in-memory via `Map<string, Room>`. Existing pattern reused.

### Gate 3: No Authentication — PASS
- No auth mechanisms. Players identified by self-chosen display name + UUID.

### Gate 4: No Room Passwords or Invite Links — PASS
- Room codes are simple 4-char identifiers, not passwords or invite links.

### Gate 5: Extend, Don't Rewrite — PASS
- Plan modifies existing files, does not rewrite starters.

**Result: All gates passed. Proceed to implementation.**

## Project Structure

### Documentation (this feature)

```
specs/001-room-setup-lobby/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: entities and relationships
├── quickstart.md        # Phase 1: validation guide
├── contracts/
│   └── room-api.md      # Phase 1: API contracts
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2: task breakdown (/speckit.tasks)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── models/
│   │   └── game.ts          # +hostId to Room
│   ├── services/
│   │   └── roomStore.ts     # +host logic, leave/capacity/cleanup
│   └── api/
│       ├── rooms.ts         # +POST /leave endpoint
│       └── schemas.ts       # +leaveSchema, playerName required, +fullRoom error
└── tests/ ...via inline *.test.ts

frontend/
├── src/
│   ├── services/
│   │   └── api.ts           # +leaveRoom(), +hostId in types
│   ├── state/
│   │   └── roomStore.ts     # +leaveRoom(), auto-poll state
│   ├── pages/
│   │   └── LobbyPage.tsx    # +auto-poll, host-only start, leave button
│   └── styles/
│       └── app.css          # +lobby poll status class (if needed)
└── tests/ ...via inline *.test.ts
```

**Structure Decision**: Option 2 (Web application — frontend + backend). Matches existing project layout.

## Complexity Tracking

No constitution violations to track. The existing project structure and patterns are sufficient.
