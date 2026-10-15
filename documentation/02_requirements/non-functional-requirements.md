---
id: DOC-REQ-NON-FUNCTIONAL
title: Non-Functional Requirements Specification
doc_type: requirement
status: draft
phase: cross-phase
author: University Software Architecture Team
owner: Requirements Engineering Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - requirements
  - non-functional
  - quality-attributes
  - performance
  - security
summary: Quality attribute scenarios, performance constraints, architectural boundaries, and security standards.
related_docs:
  - documentation/02_requirements/functional-requirements.md
  - documentation/03_architecture/architecture-overview.md
  - documentation/08_benchmarks/kaggle-benchmark-environment.md
is_template: false
---

# Non-Functional Requirements Specification

## 1. Architectural Modularity & Dependency Independence
- **NFR-MOD-1**: The Domain layer MUST NOT import web framework libraries (`@nestjs/*`, `express`) or persistence libraries (`prisma`, `typeorm`, `pg`).
- **NFR-MOD-2**: Data access MUST be abstracted behind domain repository interfaces using the Repository Pattern.
- **NFR-MOD-3**: Controllers MUST NOT query database clients directly. All interactions flow through Application Services.

## 2. Performance & Scalability (Kaggle CPU Benchmark)
- **NFR-PERF-1**: Under a fixed Kaggle CPU environment (2 vCPU cores, 16GB RAM), read-heavy endpoints (`GET /venues`, `GET /courts`) SHALL maintain p95 latency under 150ms at 50 concurrent virtual users.
- **NFR-PERF-2**: Peak booking creation (`POST /bookings`) SHALL complete without deadlock or double-booking errors under concurrent simulated requests.
- **NFR-PERF-3**: Baseline performance MUST be measured and documented before Phase 2 architectural optimizations.

## 3. Security & Integrity
- **NFR-SEC-1**: Authentication MUST use industry-standard JSON Web Tokens (JWT) signed with HMAC-SHA256 or asymmetric keys.
- **NFR-SEC-2**: Authentication verification MUST be implemented via framework middleware/guards, never duplicated per endpoint.
- **NFR-SEC-3**: Passwords MUST be hashed with bcrypt (minimum cost factor 10) or argon2 before persistence.

## 4. Containerization & Portability
- **NFR-ENV-1**: The entire backend application and database MUST be runnable with a single command (`docker compose up`).
- **NFR-ENV-2**: Application image build MUST use multi-stage Docker builds to keep production images minimal and secure.

## 5. Explicit TODOs
- TODO [Phase-1]: Establish precise benchmark SLA targets after initial baseline run.
- TODO [Phase-2]: Formulate cache invalidation strategy for court availability when bookings are added or cancelled.
