---
id: TMPL-REQ-SPEC
title: Requirements Specification Template
doc_type: requirement
status: draft
phase: phase-1
author: Requirements Engineer
owner: Requirements Engineering Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - requirement
  - acceptance-criteria
summary: Template for functional requirements, acceptance criteria, and domain rules.
related_docs:
  - documentation/02_requirements/functional-requirements.md
is_template: true
---

# Requirement: [Requirement Title]

## 1. Statement & Description
<!-- Formal requirement statement: The system SHALL... -->

## 2. Business Invariants & Rules
- **Rule 1:** <!-- Invariant that must never be violated -->
- **Rule 2:** <!-- Invariant that must never be violated -->

## 3. Acceptance Criteria (Gherkin format)
```gherkin
Scenario: Successful execution
  Given [initial context]
  When [action occurs]
  Then [expected outcome]
```

## 4. Dependencies & Constraints
- Upstream dependencies:
- Downstream modules affected:

## 5. Verification Method
- [ ] Automated Unit Test
- [ ] Integration Test
- [ ] End-to-End API Test
