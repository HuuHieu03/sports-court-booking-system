---
id: DOC-ROOT-INDEX
title: Official Shared Documentation Knowledge Base
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
  - documentation
  - knowledge-base
  - architecture
  - governance
summary: Root entrypoint and navigation index for the official shared documentation of the Sports Court Booking System.
related_docs:
  - documentation/00_governance/metadata-schema.md
  - documentation/00_governance/documentation-conventions.md
  - documentation/00_governance/documentation-lifecycle.md
  - documentation/00_governance/ai-collaboration-guide.md
is_template: false
---

# Sports Court Booking System Documentation

Welcome to the official, version-controlled knowledge base for the **Sports Court Booking System** university project.

## Project Vision & Scope

The Sports Court Booking System provides a robust, multi-tenant capable platform for sports venue managers (badminton, tennis, futsal, basketball) and sports players. The platform enables venue discovery, real-time court availability checking, slot booking with conflict prevention, and operational reporting.

## Architectural Foundation

- **Paradigm**: Modular Monolith with Layered Architecture (`Presentation` → `Application` → `Domain` → `Infrastructure`).
- **Core Strict Rule**: Domain layer contains pure business logic and has **zero** dependencies on web frameworks (NestJS/Express) or persistence drivers/ORMs.
- **Data Access**: Repository Pattern via domain interfaces.

## Documentation Navigation Structure

| Directory | Purpose | Key Initial Documents |
| :--- | :--- | :--- |
| [`00_governance/`](00_governance/README.md) | Metadata schema, conventions, lifecycle & AI collaboration rules | `v1.0.0-2026-10-15-metadata-schema.md`, `v1.0.0-2026-10-15-documentation-conventions.md` |
| [`01_product/`](01_product/README.md) | Problem statement, target personas, scope, and use cases | `v0.1.0-2026-10-15-problem-statement.md`, `v0.1.0-2026-10-15-scope-and-actors.md` |
| [`02_requirements/`](02_requirements/README.md) | Functional & non-functional requirements, business constraints | `v0.1.0-2026-10-15-functional-requirements.md`, `v0.1.0-2026-10-15-non-functional-requirements.md` |
| [`03_architecture/`](03_architecture/README.md) | Architectural views, module boundaries, C4/Mermaid diagrams, ADRs | `v1.0.0-2026-10-15-architecture-overview.md`, `v1.0.0-2026-10-15-adr-0001-...` |
| [`04_api/`](04_api/README.md) | REST API specifications, contracts, and OpenAPI documentation | `v1.0.0-2026-10-15-api-design-guidelines.md`, `v0.1.0-2026-10-15-api-overview.md` |
| [`05_development/`](05_development/README.md) | Implementation roadmaps, technical integration guides, sprint plans | `v0.1.0-2026-10-15-phase-1-implementation-plan.md` |
| [`06_testing/`](06_testing/README.md) | Testing pyramid, unit/integration/e2e test strategies | `v1.0.0-2026-10-15-testing-strategy.md` |
| [`07_meetings/`](07_meetings/README.md) | Team meeting minutes, discussions, decision records, action items | *Use directory template for new minutes* |
| [`08_benchmarks/`](08_benchmarks/README.md) | Kaggle CPU load-testing environment, baseline and Phase 2 benchmarks | `v1.0.0-2026-10-15-kaggle-benchmark-environment.md` |
| [`09_reports/`](09_reports/README.md) | Formal course deliverables, Phase 1 & Phase 2 submission reports | *Course report drafts & templates* |
| [`99_archive/`](99_archive/README.md) | Superseded or obsolete design documents | *Archived historical artifacts* |

## How to Author New Documents

1. Navigate to the relevant subfolder.
2. Review that subfolder's `README.md` for conventions and boundaries.
3. Copy `TEMPLATE.md` to a new kebab-case file (e.g., `adr-0002-jwt-authentication.md`).
4. Keep the YAML Front Matter intact, update required fields, and set `is_template: false`.
5. Run automated validation:
   ```bash
   npm run docs:validate
   ```
