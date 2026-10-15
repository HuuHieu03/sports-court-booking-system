---
id: TMPL-BENCH-REPORT
title: Benchmark Experiment Report Template
doc_type: benchmark-report
status: draft
phase: phase-2
author: Performance Engineer
owner: Performance Engineering Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - benchmark-report
  - kaggle-cpu
  - performance-evaluation
summary: Standard template for before/after architectural benchmark experiments executed on fixed Kaggle CPU environment.
related_docs:
  - documentation/08_benchmarks/kaggle-benchmark-environment.md
is_template: true
---

# Benchmark Report: [Experiment Name]

## 1. Experiment Overview
- **Experiment ID:** EXP-[XXXX]
- **Target Phase:** Phase 1 Baseline / Phase 2 Improvement
- **Objective:** <!-- What quality attribute or hypothesis is being tested? -->
- **Hypothesis:** <!-- e.g., Introducing Redis caching on GET /courts will reduce p95 latency by >50% at 100 RPS -->

## 2. Architectures Compared
- **Baseline Implementation:** <!-- Description of architecture prior to optimization -->
- **Candidate Architecture:** <!-- Description of proposed architectural improvements -->

## 3. Environment & Hardware (Fixed Kaggle CPU)
- **Platform:** Kaggle Notebook (CPU only)
- **vCPU Cores:** 2 cores (Intel Xeon / AMD EPYC virtualized)
- **Memory (RAM):** 16 GB (capped)
- **Operating System:** Ubuntu 22.04 LTS (Kaggle container)
- **Node.js Version:** v20.x LTS
- **Database:** PostgreSQL 16 (local container / process on Kaggle)

## 4. Workload & Test Configuration
- **Load Generation Tool:** `autocannon` / `k6`
- **Workload Profile:** <!-- e.g., 80% GET /courts, 20% POST /bookings -->
- **Concurrent Connections:** <!-- e.g., 10, 50, 100 virtual users -->
- **Test Duration:** <!-- e.g., 60 seconds -->
- **Warm-up Duration:** <!-- e.g., 10 seconds (unmeasured warm-up) -->
- **Number of Runs:** <!-- e.g., 3 runs, reported as arithmetic mean -->

## 5. Measured Results

| Metric | Baseline Architecture | Candidate Architecture | Delta (%) |
| :--- | :--- | :--- | :--- |
| **Throughput (Requests/sec)** | <!-- [Value] --> | <!-- [Value] --> | <!-- [%] --> |
| **Latency p50 (ms)** | <!-- [Value] --> | <!-- [Value] --> | <!-- [%] --> |
| **Latency p90 (ms)** | <!-- [Value] --> | <!-- [Value] --> | <!-- [%] --> |
| **Latency p95 (ms)** | <!-- [Value] --> | <!-- [Value] --> | <!-- [%] --> |
| **Latency p99 (ms)** | <!-- [Value] --> | <!-- [Value] --> | <!-- [%] --> |
| **Error Rate (%)** | <!-- [Value] --> | <!-- [Value] --> | <!-- [%] --> |

## 6. Correctness Checks
- [ ] Zero double-bookings recorded in database after concurrent load.
- [ ] Data integrity checks passed.

## 7. Comparative Analysis & Interpretation
<!-- Why did the candidate architecture perform differently? Bottleneck analysis -->

## 8. Limitations & Threats to Validity
<!-- Shared CPU noisy neighbors, virtualized timer precision, etc. -->

## 9. Reproduction Steps
```bash
# Exact commands to run benchmark on Kaggle CPU
```
