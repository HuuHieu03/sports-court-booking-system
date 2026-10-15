# Contributing to Sports Court Booking System

We welcome contributions from all team members. This guide outlines our development workflow, branch strategies, commit standards, and pull request review expectations.

---

## 1. Branch Strategy & Naming Conventions
We follow a trunk-based / feature-branch workflow. All feature development begins from `main`.

### Branch Naming Patterns
- Features: `feat/<module-name>-<short-description>` (e.g., `feat/auth-jwt-guard`, `feat/bookings-conflict-check`)
- Fixes: `fix/<issue-description>` (e.g., `fix/court-availability-timezone`)
- Refactoring / Architecture: `refactor/<short-description>` (e.g., `refactor/in-memory-repositories`)
- Documentation: `docs/<topic>` (e.g., `docs/adr-0002-caching`)
- Benchmarking: `bench/<workload>` (e.g., `bench/kaggle-baseline-run`)

---

## 2. Commit Message Conventions (Conventional Commits)
We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new user-facing or API feature.
- `fix`: A bug fix.
- `docs`: Documentation updates only.
- `style`: Changes that do not affect the meaning of the code (whitespace, formatting).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to build process, dependency updates, or auxiliary tools.

### Example
```text
feat(bookings): implement overlapping time range validation in domain entity

- Add timeRangeOverlaps pure method to Booking entity
- Add unit tests verifying conflict edge cases
- Ref: #14
```

---

## 3. Pull Request (PR) Expectations & Review Checklist
Every pull request must be linked to a clear objective and use `.github/pull_request_template.md`.

### Pull Request Checklist
1. **Architectural Separation**:
   - `src/modules/*/domain/` does NOT import NestJS or ORMs.
   - Controllers delegate to Application Services; no direct DB queries.
2. **Quality Verification**:
   - `npm run docs:validate` passes with 0 errors.
   - `npm run build` succeeds cleanly.
   - `npm test` and `npm run test:e2e` pass.
3. **Hygiene & Privacy**:
   - No files inside `my_workspace/` are staged or committed.
   - No secrets, tokens, or private credentials committed.
4. **Peer Review**:
   - At least one other team member must review and approve the PR before merging into `main`.

---

## 4. Proposing Architectural Decisions (ADRs)
If a proposed change introduces a new library, alters database schema design, changes cross-module communication, or proposes a Phase 2 performance optimization:
1. Copy `documentation/03_architecture/TEMPLATE.md` to `documentation/03_architecture/adr-XXXX-<name>.md`.
2. Fill in context, alternatives, trade-offs, and proposed rationale.
3. Set `decision_status: proposed`.
4. Open a PR for team review and debate in the next weekly sync.
5. Once consensus is reached, update `decision_status: accepted` and merge.
