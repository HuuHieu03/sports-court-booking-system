# AGENTS.md: AI Coding Agent Collaboration Guide

Welcome, AI Coding Agent. This document defines the engineering standards, architectural constraints, governance rules, and verification requirements for working in the **Sports Court Booking System** repository.

---

## 1. Project Purpose & Current Phase
- **Project Name:** Sports Court Booking System
- **Context:** University Software Architecture Project
- **Current Status:** Foundation Scaffolding & Architecture Setup (Transitioning to Phase 1 Implementation)
- **Primary Technology Stack:** TypeScript, NestJS, PostgreSQL (target), Docker.
- **Assignment Goals:**
  - **Phase 1:** Deliver core functionality (Auth, Users, Venues, Courts, Bookings) following strict layered architecture and repository pattern.
  - **Phase 2:** Deliver quality-attribute architectural improvements backed by reproducible before/after load benchmarks on a fixed Kaggle CPU environment.

---

## 2. Authoritative Documentation
Before writing or altering any code, you MUST consult the shared documentation under `documentation/`:
- **Architecture Blueprints & Rules:** `documentation/03_architecture/v1.0.0-2026-10-15-architecture-overview.md`
- **Ratified ADRs:** `documentation/03_architecture/v1.0.0-2026-10-15-adr-*.md`
- **Functional Requirements:** `documentation/02_requirements/v0.1.0-2026-10-15-functional-requirements.md`
- **API Contracts:** `documentation/04_api/v0.1.0-2026-10-15-api-overview.md` & `v1.0.0-2026-10-15-api-design-guidelines.md`
- **Metadata Schema:** `documentation/00_governance/v1.0.0-2026-10-15-metadata-schema.md`
- **Benchmarking Standards:** `documentation/08_benchmarks/v1.0.0-2026-10-15-kaggle-benchmark-environment.md`

`documentation/` is the official team source of truth. Never assume undocumented business rules or fabricate confirmed decisions.

---

## 3. NestJS Architecture & Strict Layer Boundaries
The codebase follows a **Modular Monolith** pattern organized into feature modules (`auth`, `users`, `venues`, `courts`, `bookings`) located in `src/modules/<feature>/`.

Inside each module, you must strictly respect four layers:

1. **Presentation Layer (`presentation/`)**:
   - Contains NestJS Controllers, request/response DTOs, and Swagger decorators.
   - Responsible for HTTP routing, request validation, and status codes.
   - **RULE:** Controllers MUST NOT query repositories or databases directly. They delegate to the Application Layer.
2. **Application Layer (`application/`)**:
   - Contains use-case orchestration services (e.g. `BookingsService`).
   - Responsible for workflow coordination and transaction boundaries.
   - **RULE:** Application services must not interact with HTTP transport objects (`Request`, `Response`).
3. **Domain Layer (`domain/`)**:
   - Contains pure TypeScript domain entities and repository interfaces (`I<Name>Repository`).
   - Responsible for core business rules (e.g. slot collision checks, status state machines).
   - **CRITICAL INVARIANT:** The domain layer MUST NOT import `@nestjs/*`, `express`, `@prisma/client`, `typeorm`, `pg`, or any infrastructure libraries. It must remain pure, framework-agnostic TypeScript.
4. **Infrastructure Layer (`infrastructure/`)**:
   - Contains database repository implementations, ORM mappers, and external services.
   - Implements domain repository interfaces and is wired into NestJS via dependency injection tokens (`Symbol('..._REPOSITORY')`).

---

## 4. Privacy Boundaries: `documentation/` vs `my_workspace/`
- `my_workspace/` is the personal workspace of the developer. It is strictly excluded by Git (`.gitignore`).
- `documentation/` is the version-controlled, shared knowledge base.
- **Agent Privacy Invariant:** You MUST NEVER automatically copy private notes, scratchpads, or personal drafts from `my_workspace/` into `documentation/` or tracked code files without explicit user instruction.
- You may read personal notes when asked by the developer to provide context, but publication requires explicit human review and conversion to team metadata (`visibility: team`).

---

## 5. Finding ADRs Before Editing Code
Before introducing new libraries, altering cross-module dependencies, or changing persistence paradigms:
1. Search `documentation/03_architecture/` for existing ADRs.
2. If an accepted ADR exists, you must adhere to its decision.
3. If your proposed solution contradicts an accepted ADR, discuss the trade-off with the human developer first.

---

## 6. When Documentation Updates Are Required
- **Do NOT update documentation for:**
  - Minor bug fixes, typo corrections, internal code comments, or cosmetic refactorings.
- **You MUST update or create documentation when:**
  - Adding or modifying REST endpoints or DTO payloads (`documentation/04_api/`).
  - Introducing new functional requirements or changing business invariant rules (`documentation/02_requirements/`).
  - Altering module boundaries, persistence mechanisms, or security flows (create a new ADR in `documentation/03_architecture/`).
- **All documentation updates must pass metadata validation:**
  ```bash
  npm run docs:validate
  ```

---

## 7. Distinguishing Proposed vs Implemented Work
- Never describe a planned feature or scaffold as "already implemented" if only empty classes or stubs exist.
- Use explicit `TODO [Phase-X]` annotations for unimplemented functionality.
- Set document status accurately in front matter: `status: draft` or `status: in-review` until approved and merged.
- For ADRs, use `decision_status: proposed` until accepted by the team.

---

## 8. Recording Meaningful Agent Sessions
When completing a significant design, refactoring, or multi-step feature implementation, generate a session record for the developer using the template in:
`scaffolds/my_workspace/04_agent_sessions/TEMPLATE.md`
Store the completed log in `my_workspace/04_agent_sessions/YYYY-MM-DD-<session-topic>.md`.

---

## 9. Required Verification Checks Before Declaring Completion
You must never claim a task is complete, buildable, or tested without running actual verification commands.

Before concluding a coding session, execute:
1. `npm run docs:validate`: Validates YAML front matter across documentation.
2. `npm run build`: Validates TypeScript compilation and NestJS module wiring.
3. `npm test`: Executes all Jest unit tests.
4. `npm run test:e2e`: Executes end-to-end integration tests.
5. `git status`: Verifies repository cleanliness and confirms no private files or unexpected build artifacts are tracked.
