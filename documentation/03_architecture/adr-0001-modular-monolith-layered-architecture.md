---
id: ADR-0001
title: Adoption of Modular Monolith and Layered Architecture
doc_type: adr
status: approved
decision_status: accepted
phase: phase-1
author: University Software Architecture Team
owner: Software Architecture Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 1.0.0
visibility: team
tags:
  - adr
  - architecture
  - modular-monolith
  - layered-architecture
summary: Foundational decision to structure the backend as a Modular Monolith using Layered Architecture and the Repository Pattern.
related_docs:
  - documentation/03_architecture/architecture-overview.md
  - documentation/02_requirements/non-functional-requirements.md
is_template: false
---

# ADR-0001: Adoption of Modular Monolith and Layered Architecture

## 1. Decision Identification
- **Decision ID:** ADR-0001
- **Decision Status:** `accepted`
- **Deciders / Stakeholders:** Entire Software Architecture Team
- **Decision Date:** 2026-10-15

## 2. Context & Architectural Problem
The university Software Architecture project requires developing a backend service for sports court reservations. The requirements stipulate:
1. Clear separation between API, Business Logic, and Data Access.
2. Business logic must not directly depend on the web framework or database/ORM library.
3. Use the Repository Pattern for data access.
4. Support Phase 1 basic functionalities and Phase 2 quality attribute improvements evaluated on fixed Kaggle CPU hardware.
5. Maintainable by a university team without excessive operational overhead.

## 3. Constraints & Quality Attributes
- **Framework & Runtime:** NestJS, TypeScript, Node.js LTS (v20).
- **Core Quality Attributes:** Modularity, Testability, Maintainability, Performance Benchmarking simplicity.

## 4. Alternatives Considered
1. **Alternative 1: Flat MVC Architecture** (Typical default NestJS app with controllers calling services that call TypeORM repositories directly).
   - *Pros:* Rapid initial scaffolding.
   - *Cons:* Directly violates course constraint prohibiting business logic from importing ORMs or web frameworks. Creates tightly coupled spaghetti code.
2. **Alternative 2: Microservices Architecture** (Separate services for Auth, Venues, Bookings).
   - *Pros:* Independent deployment and scaling.
   - *Cons:* Excessive operational complexity for a university team; introduces network latency, distributed transaction complexity, and complicates single-machine Kaggle CPU benchmarking.
3. **Alternative 3: Modular Monolith with Layered Architecture (Selected)**.
   - *Pros:* Combines the operational simplicity of a single process with strict internal domain and layer isolation. Cleanly fulfills the requirement to decouple business logic from frameworks and databases.
   - *Cons:* Requires discipline from team members to avoid violating layer boundaries.

## 5. Decision & Rationale
We unanimously adopt **Alternative 3: Modular Monolith with Layered Architecture**.
- Each feature resides in `src/modules/<feature>/` (`auth`, `users`, `venues`, `courts`, `bookings`).
- Inside each module, four layers are defined:
  - `presentation`: NestJS controllers, DTOs, Swagger documentation.
  - `application`: Use-case orchestration services.
  - `domain`: Pure TypeScript entities, business invariants, and repository interfaces (`I<Name>Repository`).
  - `infrastructure`: Persistence adapters implementing repository interfaces.

## 6. Expected Consequences
- **Positive:**
  - Complete compliance with assignment architectural rules.
  - Domain entities and rules can be tested in sub-second unit test suites without starting NestJS or Docker databases.
  - Swapping persistence layers (e.g., In-Memory to PostgreSQL or TypeORM to Kysely/Prisma) does not affect domain logic.
- **Negative / Overhead:**
  - Additional boilerplate (interface declarations, DTO-to-entity mappers, dependency injection symbols).

## 7. Risks & Mitigations
- *Risk:* A developer accidentally imports `@nestjs/common` or an ORM into `domain/`.
- *Mitigation:* Automated lint rules and CI boundary validation in PR checklists.

## 8. Validation Plan
- Unit tests verify pure domain entities without importing NestJS.
- `npm run docs:validate` enforces governance compliance.
- E2E tests verify full request pipeline through `test/app.e2e-spec.ts`.
