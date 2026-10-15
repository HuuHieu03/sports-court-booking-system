---
id: DOC-REQ-README
title: Requirements Engineering Directory Guide
doc_type: index
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
  - functional-requirements
  - non-functional-requirements
summary: Authoritative directory for functional and non-functional requirements, business rules, and acceptance criteria.
related_docs:
  - documentation/README.md
  - documentation/02_requirements/v0.1.0-2026-10-15-functional-requirements.md
  - documentation/02_requirements/v0.1.0-2026-10-15-non-functional-requirements.md
is_template: false
---

# Requirements Engineering (`02_requirements/`)

## 1. Purpose
Specify detailed functional requirements (FRs), non-functional requirements (NFRs), business invariant rules, and verifiable acceptance criteria.

## 2. Directory Contents
- [`v0.1.0-2026-10-15-functional-requirements.md`](v0.1.0-2026-10-15-functional-requirements.md): System capabilities per module (Auth, Users, Venues, Courts, Bookings).
- [`v0.1.0-2026-10-15-non-functional-requirements.md`](v0.1.0-2026-10-15-non-functional-requirements.md): Performance, concurrency, security, and maintainability quality attributes.

## 3. Template Usage
Copy [`TEMPLATE.md`](TEMPLATE.md) when defining new requirement modules or formal acceptance test suites.
