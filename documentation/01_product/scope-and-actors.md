---
id: DOC-PROD-SCOPE-ACTORS
title: Project Scope and Actor Definitions
doc_type: product-spec
status: draft
phase: phase-1
author: University Software Architecture Team
owner: Product Owner
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - product
  - actors
  - scope
summary: Definition of primary user roles, system scope boundaries, and core responsibilities for the project.
related_docs:
  - documentation/01_product/problem-statement.md
  - documentation/02_requirements/functional-requirements.md
is_template: false
---

# Project Scope and Actor Definitions

## 1. System Actors

| Actor | Description | Primary Capabilities |
| :--- | :--- | :--- |
| **Customer (Player)** | Registered end-user seeking to play sports | Search venues, check slot availability, book court slots, view/cancel reservations |
| **Venue Manager** | Facility owner/operator administering sports courts | Register venues, configure court details/pricing, view booking rosters, update maintenance status |
| **System Administrator** | Platform administrator | Oversee all registered users, venues, system health, and global audit logs |

## 2. In-Scope for Phase 1
- REST API communicating over JSON.
- Core endpoints supporting POST, GET, DELETE methods.
- OpenAPI / Swagger interactive documentation.
- JWT-based authentication with framework guard integration (at least 1 authenticated GET, 1 authenticated POST).
- Modular Monolith Layered Architecture with strict separation between API, Business Logic, and Data Access.
- Docker packaging and compose setup.

## 3. Out-of-Scope for Phase 1
- Integrated third-party payment gateway processing (e.g. Stripe, VNPay, Momo) — reservations transition directly to confirmed or pending status.
- Mobile client or frontend single-page web app — tested via OpenAPI / Swagger and automated integration tests.
- Complex microservices orchestration or distributed event brokers.

## 4. Phase 2 Scope Direction
- High-concurrency performance evaluation on Kaggle CPU.
- Architectural improvements (e.g. read-replicas, in-memory caching for slot lookups, atomic lock mechanisms for slot reservation).
- Quantitative before/after benchmark comparison.

## 5. Explicit TODOs
- TODO [Phase-1]: Finalize user registration validation schema (email formatting, password complexity).
- TODO [Phase-1]: Decide whether a Venue Manager can operate multiple distinct physical venues.
