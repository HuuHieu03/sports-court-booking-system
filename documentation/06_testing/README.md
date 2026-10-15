---
id: DOC-TEST-README
title: Quality Assurance & Testing Directory Guide
doc_type: index
status: draft
phase: cross-phase
author: University Software Architecture Team
owner: Quality Assurance Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - testing
  - quality-assurance
  - test-pyramid
summary: Strategy, test plans, scenario matrices, and test automation standards.
related_docs:
  - documentation/README.md
  - documentation/06_testing/v1.0.0-2026-10-15-testing-strategy.md
is_template: false
---

# Quality Assurance & Testing (`06_testing/`)

## 1. Purpose
Define testing methodologies, the automated test pyramid, coverage requirements, and integration test scenarios across all modules.

## 2. Directory Contents
- [`v1.0.0-2026-10-15-testing-strategy.md`](v1.0.0-2026-10-15-testing-strategy.md): The overall testing philosophy, layers, and tooling guidelines.
- [`TEMPLATE.md`](TEMPLATE.md): Test plan / test scenario specification template.

## 3. Test Execution Commands
- Unit tests: `npm test`
- Unit tests with coverage: `npm run test:cov`
- E2E tests: `npm run test:e2e`
