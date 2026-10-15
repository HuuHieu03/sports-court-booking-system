---
id: WS-SCAFFOLD-ROOT
title: Personal Developer Workspace Guide
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
  - workspace
  - developer-notes
  - private
summary: Root entrypoint and guidelines for the private developer workspace.
related_docs:
  - documentation/00_governance/ai-collaboration-guide.md
  - documentation/00_governance/documentation-lifecycle.md
is_template: false
---

# Personal Developer Workspace

Welcome to your private developer workspace (`my_workspace/`).

## Purpose & Scope

This directory is an unshared space for personal research, daily worklogs, experimental designs, AI agent session transcripts, rough drafts, and code reviews.

### Privacy Guarantee
- The entire `my_workspace/` directory is excluded from Git via `.gitignore` (`/my_workspace/`).
- Files created or edited here are strictly local and will never be tracked, committed, or pushed to the shared repository.
- To re-initialize or repair missing subdirectories without overwriting your notes, run:
  ```bash
  npm run workspace:init
  ```

## Boundary Between Personal Notes and Team Knowledge

| Category | Personal Workspace (`my_workspace/`) | Shared Team Documentation (`documentation/`) |
| :--- | :--- | :--- |
| **Visibility** | `visibility: private` | `visibility: team` |
| **Tracking** | Ignored by Git | Version-controlled in Git |
| **Authority** | Informal thinking, scratchpads, unreviewed experiments | Official source of truth, approved ADRs, specifications |
| **Agent Sessions**| Raw prompts, iterations, tool logs (`04_agent_sessions/`) | Synthesized architectural decisions and verified PRs |
| **Worklogs** | Individual daily logs (`01_worklogs/`) | Team sprint milestones and phase deliverables (`05_development/`) |

## Promotion Workflow: From Personal Draft to Official Documentation

When an idea, research note, or draft is mature and ready for team adoption:
1. **Discuss**: Present the concept in a team meeting or architecture discussion.
2. **Promote**: Copy the file from `my_workspace/05_drafts/` to the appropriate `documentation/` subfolder (e.g., `documentation/03_architecture/`).
3. **Update Metadata**:
   - Change `visibility: private` to `visibility: team`.
   - Update `id` to the team document naming convention (e.g., `ADR-0002-...`).
   - Assign `owner` and list `reviewers`.
   - Set `status: in-review` (or `approved` once accepted).
4. **Validate**: Run `npm run docs:validate` to ensure strict schema compliance.
5. **Commit & PR**: Submit via a Pull Request for team review.

## Workspace Directory Navigation

- `00_inbox/`: Raw thoughts, quick bookmarks, unsorted questions.
- `01_worklogs/`: Personal daily development logs.
- `02_notes/`: Conceptual explanations, technology summaries.
- `03_research/`: In-depth analysis of architectural options and benchmarks.
- `04_agent_sessions/`: Records of coding agent interactions and prompts.
- `05_drafts/`: Working documents, pre-ADR proposals.
- `06_reviews/`: Private peer reviews and critique of generated code.
- `07_reports/`: Personal progress summaries and draft submissions.
- `99_archive/`: Completed or outdated private notes.
