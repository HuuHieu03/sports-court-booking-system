---
id: DOC-GOV-AI-GUIDE
title: AI Coding Agent Collaboration Guide
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
  - ai-agents
  - collaboration
  - guidelines
summary: Practical guide for human developers and autonomous AI coding agents collaborating in this repository.
related_docs:
  - AGENTS.md
  - documentation/00_governance/metadata-schema.md
is_template: false
---

# AI Coding Agent Collaboration Guide

This document establishes engineering guardrails and collaboration workflows between human software engineering students and AI coding agents (such as Antigravity, Claude Code, Cursor, GitHub Copilot).

## 1. Principles of AI Collaboration

1. **Authoritative Context First**: Agents must inspect `documentation/03_architecture/` and accepted ADRs before modifying code.
2. **Never Violate Architectural Boundaries**: Agents must never bypass layered architecture rules (e.g. importing NestJS or database ORM models directly inside `domain/`).
3. **No Unexecuted Verification Claims**: Agents must not claim tests, builds, or benchmarks passed without executing actual commands.
4. **Privacy Strictness**: Materials inside `my_workspace/` are private to the local developer. Agents must never copy private notes into public files without explicit instruction and human review.
5. **Session Transparency**: Meaningful agent sessions should be documented using the template in `scaffolds/my_workspace/04_agent_sessions/TEMPLATE.md`.

## 2. When to Update Documentation
- **Trivial edits** (fixing typos, comment clarifications): Do NOT create an ADR or modify architecture specs.
- **Structural edits** (adding new endpoints, changing data contracts, introducing third-party packages, altering database schemas): MUST update the corresponding API or architecture document and run `npm run docs:validate`.
