---
id: DOC-ARCH-README
title: Software Architecture Directory Guide
doc_type: index
status: draft
phase: cross-phase
author: University Software Architecture Team
owner: Software Architecture Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - architecture
  - modular-monolith
  - layered-architecture
  - adr
summary: Central directory for architectural blueprints, layer boundaries, C4/Mermaid diagrams, and Architecture Decision Records (ADRs).
related_docs:
  - documentation/README.md
  - documentation/03_architecture/architecture-overview.md
  - documentation/03_architecture/adr-0001-modular-monolith-layered-architecture.md
is_template: false
---

# Software Architecture (`03_architecture/`)

## 1. Purpose
Define the high-level structural decisions, module boundaries, layer dependency rules, and formal Architecture Decision Records (ADRs) guiding the codebase.

## 2. Directory Contents
- [`architecture-overview.md`](architecture-overview.md): Comprehensive system design, module map, and layered architecture breakdown with Mermaid diagrams.
- [`adr-0001-modular-monolith-layered-architecture.md`](adr-0001-modular-monolith-layered-architecture.md): Ratified ADR adopting the Modular Monolith and Layered Architecture pattern.
- [`TEMPLATE.md`](TEMPLATE.md): Tailored ADR template for new architecture decisions.

## 3. Mandatory Architectural Invariants
1. **Dependency Inversion**: High-level modules and domain logic must NOT depend on low-level details (frameworks, databases, web drivers).
2. **Repository Pattern**: All database interactions are accessed through interfaces declared in the `domain/` layer.
3. **No Circular Feature Dependencies**: Modules must maintain clear directional dependencies or communicate via domain events/contracts.
