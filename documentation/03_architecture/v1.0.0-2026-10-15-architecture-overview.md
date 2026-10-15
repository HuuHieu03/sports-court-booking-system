---
id: DOC-ARCH-OVERVIEW
title: Software Architecture Overview & Layered Design
doc_type: architecture-design
status: approved
phase: cross-phase
author: University Software Architecture Team
owner: Software Architecture Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 1.0.0
visibility: team
tags:
  - architecture
  - modular-monolith
  - layered-architecture
  - domain-driven-design
summary: Structural blueprint and layer dependency rules for the Sports Court Booking System.
related_docs:
  - documentation/03_architecture/adr-0001-modular-monolith-layered-architecture.md
  - documentation/02_requirements/non-functional-requirements.md
is_template: false
---

# Software Architecture Overview & Layered Design

## 1. Architectural Style: Modular Monolith

The Sports Court Booking System is designed as a **Modular Monolith** organized into distinct, domain-centric modules (`auth`, `users`, `venues`, `courts`, `bookings`) and cross-cutting capabilities (`common`).

### Rationale
- **Development Simplicity**: Single deployable runtime eliminates distributed system failure modes (network partitions, distributed transactions) while supporting clear boundaries for a university team.
- **Strict Boundaries**: Prevents spaghetti dependencies and prepares individual modules for potential extraction if required in future phases.

```mermaid
graph TD
  Client["HTTP / OpenAPI Client"] --> API["Global API Prefix (/api/v1)"]
  API --> AuthMod["Auth Module"]
  API --> UserMod["Users Module"]
  API --> VenueMod["Venues Module"]
  API --> CourtMod["Courts Module"]
  API --> BookingMod["Bookings Module"]
  
  BookingMod -.-> CourtMod
  BookingMod -.-> UserMod
  CourtMod -.-> VenueMod
  AuthMod -.-> UserMod

  subgraph SharedCrossCutting["Cross-Cutting (common)"]
    Health["Health Module"]
    Filters["HttpExceptionFilter"]
    Interceptors["TransformInterceptor"]
  end
```

## 2. Layered Organization Inside Feature Modules

Every feature module conforms to four strict architectural layers:

```mermaid
flowchart TD
  subgraph PresentationLayer["Presentation Layer (HTTP / DTOs)"]
    Controller["Controller (NestJS)"]
    DTO["Request / Response DTOs"]
  end

  subgraph ApplicationLayer["Application Layer (Use Cases)"]
    Service["Application Service"]
  end

  subgraph DomainLayer["Domain Layer (Pure Business Logic)"]
    Entity["Domain Entity"]
    RepoInterface["Repository Interface (I...Repository)"]
  end

  subgraph InfrastructureLayer["Infrastructure Layer (Persistence & Adapters)"]
    RepoImpl["Repository Implementation (Postgres / ORM)"]
  end

  Controller --> Service
  Service --> Entity
  Service --> RepoInterface
  RepoImpl -.->|implements| RepoInterface
```

### Layer Dependency Rules
1. **Presentation Layer**: Handles incoming HTTP requests, validates DTOs, formats responses, and handles authentication context. Delegates immediately to the Application Layer.
2. **Application Layer**: Orchestrates use cases, coordinates transactions, and enforces application workflows. It knows nothing about HTTP protocols (no `req`/`res` objects).
3. **Domain Layer (Pure TypeScript)**: Contains core domain entities and invariants (e.g. `Booking`, `Court`). **STRICT INVARIANT: MUST NOT import `@nestjs/*`, `express`, `@prisma/client`, `typeorm`, or database drivers.**
4. **Infrastructure Layer**: Implements the repository interfaces defined by the Domain Layer using database ORMs or query builders (PostgreSQL).

## 3. Data Access & Repository Pattern
To adhere to course requirements:
- Repositories are injected using NestJS dependency injection tokens (`Symbol('..._REPOSITORY')`).
- In Phase 1 development and unit testing, in-memory repository implementations can substitute for database repositories without modifying a single line of domain or application logic.

## 4. Phase 1 & Phase 2 Architecture Roadmaps
- **Phase 1 Baseline**: Direct relational storage (PostgreSQL), single-node NestJS process, basic JWT guards, Docker compose containerization.
- **Phase 2 Evolution**:
  - TODO [Phase-2]: Evaluate read-cache layer (Redis) for high-frequency queries (`GET /courts`, `GET /venues`).
  - TODO [Phase-2]: Evaluate optimistic concurrency vs database row-level locking (`SELECT ... FOR UPDATE`) to handle high-concurrency booking collisions.
  - TODO [Phase-2]: Conduct before/after load test comparison on Kaggle CPU.
