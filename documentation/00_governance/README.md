---
id: DOC-GOV-README
title: Governance Directory Specification
doc_type: index
status: approved
phase: cross-phase
author: University Software Architecture Team
owner: Architecture Governance Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 1.0.0
visibility: team
tags:
  - governance
  - standards
  - schemas
summary: Documentation governance standards, metadata schemas, naming rules, and AI collaboration policies.
related_docs:
  - documentation/README.md
is_template: false
---

# Documentation Governance (`00_governance/`)

## 1. Purpose & Scope
This directory governs how documentation is created, structured, updated, verified, and archived within the project repository. It provides the single source of truth for repository conventions and team standards.

## 2. Directory Contents
- [`metadata-schema.md`](metadata-schema.md): The canonical specification for YAML Front Matter fields and enum values.
- [`documentation-conventions.md`](documentation-conventions.md): Formatting rules, Markdown style, and link guidelines.
- [`documentation-lifecycle.md`](documentation-lifecycle.md): State transitions from draft to approval, promotion from personal workspace, and deprecation.
- [`ai-collaboration-guide.md`](ai-collaboration-guide.md): Operational rules for human-agent pair programming and automated coding agents.

## 3. What Belongs Here
- Global governance policies.
- Repository metadata schemas and schemas validation rules.
- Team coding and architectural compliance rules.

## 4. What Does NOT Belong Here
- Specific feature requirements (see `02_requirements/`).
- Specific architectural designs (see `03_architecture/`).
- Meeting notes or transient scratchpads (see `07_meetings/` or `my_workspace/`).
