---
id: DOC-GOV-METADATA-SCHEMA
title: Canonical YAML Front Matter Metadata Specification
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
  - metadata
  - schema
  - validation
summary: Canonical metadata specification defining mandatory and optional YAML Front Matter fields, enumerations, and validation criteria.
related_docs:
  - documentation/00_governance/documentation-conventions.md
  - documentation/00_governance/documentation-lifecycle.md
is_template: false
---

# Canonical YAML Front Matter Metadata Specification

Every Markdown document within both `documentation/` and `my_workspace/` MUST begin with a valid YAML Front Matter block bounded by `---` markers.

## 1. Mandatory Common Fields

| Field | Type | Description | Allowed Values / Format |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique, stable identifier across the repository | Uppercase/kebab-case string (e.g., `DOC-GOV-001`, `ADR-0001`, `TMPL-ARCH-001`) |
| `title` | String | Human-readable document title | Non-empty string |
| `doc_type` | Enum | Standardized classification of the document | See [Allowed Document Types](#allowed-document-types) |
| `status` | Enum | Current document lifecycle state | `draft`, `in-review`, `approved`, `implemented`, `superseded`, `archived` |
| `phase` | Enum | Applicable university project phase | `phase-1`, `phase-2`, `cross-phase` |
| `author` | String | Original creator or initiating engineer | Human name, team name, or agent attribution |
| `owner` | String | Person or team responsible for maintenance | Individual name or team role |
| `created_at` | String | Original creation timestamp with timezone | ISO 8601 string (e.g., `2026-10-15T10:30:00+07:00`) |
| `updated_at` | String | Last modification timestamp with timezone | ISO 8601 string (must be `>= created_at`) |
| `version` | String | Semantic version string | SemVer format (e.g., `0.1.0`, `1.0.0`) |
| `visibility` | Enum | Distribution boundary | `team` (for `documentation/`), `private` (for `my_workspace/`) |
| `tags` | Array | Searchable classification keywords | YAML list of strings (minimum 1 tag) |
| `summary` | String | Concise summary (1-3 sentences) | Non-empty string |
| `related_docs`| Array | Relative links or IDs of related documents | YAML list of strings (empty array `[]` allowed) |
| `is_template` | Boolean | Flags whether the file is a template | `true` or `false` |

## 2. Standardized Enumerations

### Allowed Document Types (`doc_type`)
- `governance`: Policies, standards, conventions.
- `product-spec`: Product vision, scope, user stories, personas.
- `requirement`: Functional and non-functional requirements.
- `architecture-design`: High-level designs, component models, C4 diagrams.
- `adr`: Architecture Decision Records.
- `api-spec`: API contracts, endpoint definitions, payload schemas.
- `implementation-plan`: Roadmaps, technical work breakdowns, sprint milestones.
- `worklog`: Daily or sprint development logs.
- `test-plan`: Quality assurance plans, test matrices, test suites.
- `meeting-minutes`: Records of team syncs, decisions, and action items.
- `benchmark-plan`: Performance testing methodology and workload setup.
- `benchmark-report`: Empirical results, before/after analysis.
- `project-report`: Formal university course milestone submissions.
- `research-note`: In-depth investigation of technologies or alternatives.
- `agent-session`: Record of AI agent collaboration session.
- `review`: Peer code or architecture critique.
- `inbox-note`: Quick capture scratchpad items.
- `template`: Ready-to-copy document templates.
- `archive`: Superseded historical records.
- `index`: Directory navigation README files.

### Allowed Document Statuses (`status`)
- `draft`: Work-in-progress, unreviewed.
- `in-review`: Under active peer or team review.
- `approved`: Formally accepted as authoritative team knowledge.
- `implemented`: Design or requirement has been built in source code.
- `superseded`: Replaced by a newer document.
- `archived`: Preserved for historical auditability only.

### Allowed Decision Statuses (`decision_status`) - Required for ADRs
- `proposed`: Under team evaluation.
- `accepted`: Formally selected and ratified.
- `rejected`: Evaluated and rejected with recorded rationale.
- `deprecated`: No longer recommended.
- `superseded`: Replaced by a subsequent ADR.

## 3. Optional & Specialized Fields

- `reviewers`: YAML list of reviewer names.
- `reviewed_at`: ISO 8601 timestamp of last review.
- `supersedes`: Document ID or path of the superseded document.
- `task_id`: Linked task or GitHub issue identifier (e.g., `#12`).
- `source_urls`: External references or research URLs.
- `experiment_id`: Benchmark experiment identifier.
- `last_verified_at`: ISO 8601 timestamp of last code/test verification.
- `next_review_at`: ISO 8601 date when the document must be reassessed.

## 4. Template Handling Rules
- Templates MUST specify `is_template: true`.
- Templates may use placeholder tokens in body content (e.g. `YYYY-MM-DD`, `[Title]`), but MUST provide valid YAML syntax in the front matter header so automated tools do not crash.
