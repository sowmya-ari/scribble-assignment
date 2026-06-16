# Scribble Constitution

## Core Principles

### I. Extend, Don't Rewrite
Always extend the starter application. Preserve existing code, structure, and conventions. Refactor only when necessary for new functionality.

### II. Keep It Simple & Deterministic
Prefer straightforward solutions over clever ones. Behavior must be predictable — same inputs always produce same outputs. Avoid stateful complexity.

### III. Follow Existing Project Structure
New code must match established patterns: backend routes in `src/api/`, services in `src/services/`, models in `src/models/`. Frontend pages in `src/pages/`, components in `src/components/`, state in `src/state/`.

### IV. Avoid Unnecessary Dependencies
Only add a dependency when it solves a concrete problem. Prefer built-in Node.js and React APIs. No utility libraries (lodash, etc.) unless already present.

### V. TypeScript First
All new code must be fully typed. Avoid `any`; use `unknown` for truly dynamic types. Prefer immutable data structures and pure functions.

## AI Usage Rules
- Specifications must be created before any implementation begins.
- AI-generated code must be reviewed before committing.
- Requirements take precedence over AI suggestions. When in doubt, follow the spec.

## Testing & Quality Gates
- Unit test coverage must be at least 80% (backend and frontend).
- Validate every scenario using two browser tabs (host + guest perspective).
- Backend and frontend builds must pass (`tsc` type-check / `vite build`) before any submission.
- Acceptance criteria must be verified before moving to the next feature phase.
- All business logic in the backend store must have unit tests.

## Scope Constraints (Non-negotiable)
The following items are intentionally out of scope. Do not build them, and do not include them in specs, plans, or tasks:
- WebSockets or real-time sync
- Databases or persistent storage
- Authentication, accounts, or sessions
- Deployment, hosting, CI, or Docker work
- New state-management or routing libraries beyond what the starter ships
- Multiple rounds, drawer rotation, timers, countdowns, speed bonuses, or drawer bonuses
- Custom or random word packs
- Spectator mode
- Moderation features (kick, mute)
- Room passwords or invite links
- Rewriting the starter from scratch
- Unjustified top-level dependencies
- Unrelated refactors

## Governance
This constitution supersedes all other practices. Amendments require documentation and approval. All reviews must verify compliance with these rules.

**Version**: 1.0.0 | **Ratified**: 2026-06-16 | **Last Amended**: 2026-06-16
