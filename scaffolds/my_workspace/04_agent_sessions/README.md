---
id: WS-SCAFFOLD-AGENT-SESSIONS-README
title: AI Agent Sessions Directory Guide
doc_type: index
status: draft
phase: cross-phase
author: University Software Architecture Team
owner: Local Developer
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: private
tags:
  - ai-agents
  - session-logs
summary: Records of meaningful AI coding agent sessions, including objectives, prompts, diffs, and verification steps.
related_docs:
  - my_workspace/README.md
  - documentation/00_governance/ai-collaboration-guide.md
  - AGENTS.md
is_template: false
---

# Agent Sessions (`04_agent_sessions/`)

## Purpose
Maintain transparent records of AI-assisted engineering sessions (e.g. Antigravity, Claude, Cursor, Copilot).

## Principles
1. **Auditability**: Track what was asked, what code was modified, and how it was verified.
2. **Human in the Loop**: AI suggestions are proposals until verified and approved by team members.
3. **No Phantom Claims**: Do not mark a session as verified unless tests and builds were actually executed.
