---
id: DOC-BENCH-ROOT
title: Benchmarks Directory Specification
doc_type: index
status: draft
phase: cross-phase
author: University Software Architecture Team
owner: Performance Engineering Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - benchmarks
  - load-testing
  - kaggle-cpu
  - performance
summary: Central directory for benchmark scripts, workload generators, and performance test harnesses.
related_docs:
  - documentation/08_benchmarks/v1.0.0-2026-10-15-kaggle-benchmark-environment.md
  - documentation/08_benchmarks/README.md
is_template: false
---

# Benchmarks Specification

This directory holds load-testing configurations, workload definitions, and benchmark harness scripts.

## Purpose

As required by the university Software Architecture course syllabus:
1. **Phase 1 Baseline**: Capture reproducible latency (p50, p90, p95, p99), throughput (RPS), and error rate metrics under a fixed CPU hardware environment.
2. **Phase 2 Architectural Improvement**: Re-evaluate the system following architectural evolution (e.g., read/write segregation, indexing, Redis caching, asynchronous queueing) using the exact same hardware configuration and workload to demonstrate empirical gains.

## Execution Environment

All official benchmarks must be executed on a fixed **Kaggle CPU instance** (or equivalent single fixed configuration documented in `documentation/08_benchmarks/kaggle-benchmark-environment.md`).

## Directory Layout

- `scripts/`: Benchmark runners (e.g., autocannon, k6, or wrk test configurations).
- `workloads/`: Sample request sequences and data payloads representing realistic booking loads.
- `results/`: Ignored by Git. Raw execution logs and profiling summaries.

## Recommended Tooling

- HTTP Load testing: `autocannon` / `k6`.
- Hardware profiling: Node.js `--prof`, clinic.js, or Linux `perf`.
