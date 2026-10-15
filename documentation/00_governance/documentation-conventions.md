---
id: DOC-GOV-CONVENTIONS
title: Documentation Writing & Formatting Conventions
doc_type: governance
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
  - conventions
  - markdown
  - style-guide
summary: Formatting conventions, naming rules, heading guidelines, and diagram standards for all markdown files.
related_docs:
  - documentation/00_governance/metadata-schema.md
  - documentation/00_governance/documentation-lifecycle.md
is_template: false
---

# Documentation Writing & Formatting Conventions

## 1. File & Directory Naming Rules
- Use lowercase kebab-case for all filenames: `adr-0001-modular-monolith.md`, `problem-statement.md`.
- Where chronological ordering matters (worklogs, meetings, agent sessions), prefix with ISO dates: `2026-10-15-meeting.md`.
- Avoid spaces, uppercase letters, underscores, or special characters in filenames (except standard numbered directory prefixes like `00_governance/`).

## 2. Heading Structure
- Exactly **one H1 (`#`)** per document, representing the document title.
- Use logical hierarchical subheadings (`##`, `###`, `####`). Never skip heading levels.
- Section titles should be predictable: Overview / Context, Objective, Scope, Content, Decisions, Open Questions, Next Actions.

## 3. Linkage & Identifiers
- Use **relative markdown links** for intra-repository document references: `[ADR-0001](../03_architecture/adr-0001-modular-monolith-layered-architecture.md)`.
- Use stable document IDs (`id` in YAML header) when quoting authoritative decisions.
- Do not use absolute filesystem paths (`C:\...` or `/home/...`) in version-controlled documentation.

## 4. Visual Diagrams
- Use **Mermaid** for all architecture and sequence diagrams so they remain version-controlled and diff-friendly in Git:
  - Flowcharts / Component diagrams: `graph TD`, `flowchart LR`
  - Sequence diagrams: `sequenceDiagram`
  - State diagrams: `stateDiagram-v2`
- Quote node labels that contain parentheses or special symbols: `app["Application Layer (NestJS)"]`.

## 5. Factual Integrity & Speculative Content
- Mark unverified claims explicitly as `TODO [Phase-X]` or `[Unverified Assumption]`.
- Do not fabricate benchmark results, load numbers, or security credentials.
- Distinguish between a proposed design and an accepted, verified implementation.
