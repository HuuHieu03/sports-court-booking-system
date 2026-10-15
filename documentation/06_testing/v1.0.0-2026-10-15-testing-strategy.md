---
id: DOC-TEST-STRATEGY
title: Software Testing Strategy & Pyramid
doc_type: test-plan
status: approved
phase: cross-phase
author: University Software Architecture Team
owner: Quality Assurance Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 1.0.0
visibility: team
tags:
  - testing
  - strategy
  - unit-tests
  - e2e-tests
summary: Automated testing pyramid, scope of unit, integration, and E2E tests, and testing conventions.
related_docs:
  - documentation/06_testing/README.md
  - documentation/03_architecture/architecture-overview.md
is_template: false
---

# Software Testing Strategy & Pyramid

## 1. The Testing Pyramid

```mermaid
pie title Test Distribution Target
    "Domain & Application Unit Tests" : 60
    "Module Integration Tests" : 25
    "End-to-End API Tests" : 15
```

1. **Domain & Application Unit Tests (60%)**:
   - Focus: Pure business invariant validation (e.g. date overlap calculation, rate calculations).
   - Speed: Sub-second execution using Jest.
   - Dependencies: Fully mocked repositories or in-memory arrays.
2. **Module Integration Tests (25%)**:
   - Focus: Verify interactions between Controllers, Application Services, and real Repository implementations.
   - Dependencies: Ephemeral SQLite or Dockerized PostgreSQL container.
3. **End-to-End (E2E) API Tests (15%)**:
   - Focus: Complete HTTP lifecycle via Supertest in `test/app.e2e-spec.ts`.
   - Verifies JWT guards, middleware, serialization, and status codes.

## 2. Directory Conventions
- Unit tests: Located adjacent to source files: `src/**/*.spec.ts`.
- E2E tests: Located in the root `test/` directory: `test/**/*.e2e-spec.ts`.
- Future benchmark load suites: Located in `benchmarks/`.

## 3. Mocking & Isolation Rules
- Domain tests MUST NEVER spin up a NestJS runtime or connect to an external database.
- Repository interfaces enable easy test doubles (`InMemoryBookingRepository`).
