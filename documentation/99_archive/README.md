---
id: DOC-ARCHIVE-README
title: Documentation Archive Directory Guide
doc_type: index
status: draft
phase: cross-phase
author: University Software Architecture Team
owner: Architecture Governance Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - archive
  - superseded
  - historical
summary: Archive repository for obsolete, superseded, or deprecated documents.
related_docs:
  - documentation/README.md
is_template: false
---

# Documentation Archive (`99_archive/`)

## 1. Purpose
Preserve historical documents, superseded ADRs, deprecated API contracts, and retired sprint plans for auditability and retrospective reporting.

## 2. Policy
Do not delete obsolete architectural documents from the repository. Instead:
1. Update document status to `status: archived` (and `decision_status: superseded` if an ADR).
2. Reference the superseding document ID.
3. Move the document into this directory.
