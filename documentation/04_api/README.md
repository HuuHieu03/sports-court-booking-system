---
id: DOC-API-README
title: API Specifications Directory Guide
doc_type: index
status: draft
phase: cross-phase
author: University Software Architecture Team
owner: API Design Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - api
  - rest
  - openapi
  - contracts
summary: Index and guidelines for REST API specifications, DTO schemas, and OpenAPI standards.
related_docs:
  - documentation/README.md
  - documentation/04_api/api-design-guidelines.md
  - documentation/04_api/api-overview.md
is_template: false
---

# API Documentation (`04_api/`)

## 1. Purpose
Define API design standards, contract specifications for endpoints across all feature modules, error formats, and OpenAPI/Swagger synchronization.

## 2. Directory Contents
- [`api-design-guidelines.md`](api-design-guidelines.md): REST conventions, pagination, HTTP status codes, and uniform response payloads.
- [`api-overview.md`](api-overview.md): Complete catalog of endpoints planned for Phase 1.
- [`TEMPLATE.md`](TEMPLATE.md): Endpoint specification template.

## 3. Interactive Documentation
When running the NestJS application locally (`npm run start:dev`), interactive Swagger UI documentation is available at:
`http://localhost:3000/api/docs`
