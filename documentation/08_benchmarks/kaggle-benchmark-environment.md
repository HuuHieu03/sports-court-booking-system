---
id: DOC-BENCH-KAGGLE-ENV
title: Kaggle CPU Benchmark Environment Specification
doc_type: benchmark-plan
status: approved
phase: cross-phase
author: University Software Architecture Team
owner: Performance Engineering Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 1.0.0
visibility: team
tags:
  - benchmarks
  - kaggle-cpu
  - hardware-setup
  - reproducibility
summary: Hardware baseline, configuration rules, and execution steps for benchmarking on Kaggle CPU.
related_docs:
  - documentation/08_benchmarks/README.md
  - documentation/08_benchmarks/TEMPLATE.md
is_template: false
---

# Kaggle CPU Benchmark Environment Specification

## 1. Context & University Constraints
To ensure fairness, objectivity, and reproducibility across student groups, the course requires performance evaluation to take place on a single, fixed hardware environment: **Kaggle CPU notebook instances**.

## 2. Fixed Hardware Specifications
- **Virtual CPU Cores:** 2 vCPUs (or Kaggle default allocated CPU cores)
- **Memory Allocation:** 16 GB virtual RAM
- **Disk Space:** 20 GB ephemeral scratch space
- **Operating Environment:** Kaggle Linux container (Debian/Ubuntu based)
- **Node.js Runtime:** Node.js v20 LTS

## 3. Benchmark Execution Protocol
1. **Isolated Execution**: No other background user processes running during load test runs.
2. **Warm-up Period**: Minimum 10 seconds of unmeasured steady traffic to trigger JIT compilation and database buffer cache warm-up.
3. **Multi-Run Averaging**: Every test point must be executed at least 3 times; results report the median and standard deviation.
4. **Data Verification**: After load test completion, run SQL assertion scripts to confirm that zero duplicate bookings occurred in conflicting slots.

## 4. Workload Definitions (Targeting Phase 2)
- **Read Workload (Search & View)**: 80% `GET /api/v1/courts`, 20% `GET /api/v1/venues`.
- **Write-Intensive Workload (Rush-Hour Booking)**: High concurrent `POST /api/v1/bookings` targeting the same venue across multiple courts.
