---
id: TMPL-WS-REVIEW
title: Personal Code & Architecture Review Template
doc_type: review
status: draft
phase: cross-phase
author: Developer Name
owner: Developer Name
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: private
tags:
  - review
  - audit
summary: Structured review of a pull request, module implementation, or agent output.
related_docs: []
is_template: true
---

# Review: PR / Feature Name

## 1. Context
- **Target PR / Commit / Branch:**
- **Author / Agent:**
- **Primary Goal:**

## 2. Architectural Adherence Checklist
- [ ] Layering: Domain does NOT import NestJS or ORM
- [ ] Controllers delegate cleanly to Application Services
- [ ] Data access abstracted behind repository interface
- [ ] Error handling and HTTP codes follow project guidelines

## 3. Findings & Critique
- **Strengths:**
- **Architectural Issues / Concerns:**
- **Code Quality / Maintainability:**
- **Potential Bugs or Concurrency Vulnerabilities:**

## 4. Verdict & Recommendations
- [ ] Approve as is
- [ ] Request changes before merge
- [ ] Recommend team discussion
