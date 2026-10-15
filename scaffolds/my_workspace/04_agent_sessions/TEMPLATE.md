---
id: TMPL-WS-AGENT-SESSION
title: AI Agent Session Record Template
doc_type: agent-session
status: draft
phase: cross-phase
author: Developer Name
owner: Developer Name
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: private
tags:
  - agent-session
  - ai-collaboration
summary: Formal record of an AI coding agent pair-programming session.
related_docs: []
is_template: true
---

# Agent Session: Session Name

## 1. Session Metadata
- **Agent / Tool Used:** <!-- e.g., Antigravity, Claude Code, Cursor -->
- **Task Objective:** <!-- Clear statement of the goal -->
- **Date & Duration:** <!-- e.g., 2026-10-15, 45 minutes -->

## 2. Starting Context & Instructions
- **Starting State:** <!-- Branch, commit hash, open problem -->
- **Core Prompt / Instructions Provided:**
```text
<!-- Paste prompt or key instructions here -->
```

## 3. Changed Files & Scope
- `src/modules/...`: <!-- Added or edited file -->
- `test/...`: <!-- Added tests -->

## 4. Implementation Summary
<!-- Concise explanation of what the agent designed or changed -->

## 5. Verification Commands Executed
| Command | Output / Status | Exit Code | Verified By |
| :--- | :--- | :--- | :--- |
| `npm run build` | Success | 0 | Human Developer |
| `npm test` | All tests pass | 0 | Human Developer |
| `npm run docs:validate` | Valid | 0 | Human Developer |

## 6. Verification Status & Risks
- **Verification Status:** [ ] Fully Verified / [ ] Partially Verified / [ ] Untested
- **Potential Risks / Unverified Claims:** <!-- Any hallucination risk, edge cases missed, or assumptions made -->

## 7. Human Review & Critique
<!-- Human assessment of the code quality, architectural compliance, and style -->

## 8. Follow-up Tasks
- [ ] Action item 1
- [ ] Action item 2
