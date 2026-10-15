---
id: DOC-API-GUIDELINES
title: REST API Design & Response Guidelines
doc_type: api-spec
status: approved
phase: cross-phase
author: University Software Architecture Team
owner: API Design Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 1.0.0
visibility: team
tags:
  - api
  - rest
  - standards
  - json
summary: Canonical guidelines for URL naming, HTTP verbs, status codes, and standard JSON wrappers.
related_docs:
  - documentation/04_api/api-overview.md
  - documentation/04_api/README.md
is_template: false
---

# REST API Design & Response Guidelines

## 1. URL Path & Resource Naming
- Global prefix: `/api/v1/`
- Use lowercase, plural nouns for resources: `/api/v1/venues`, `/api/v1/courts`, `/api/v1/bookings`.
- Nested resources should express hierarchy: `/api/v1/venues/:venueId/courts`.

## 2. HTTP Methods & Idempotency
- `GET`: Safe & idempotent. Retrieve single resource or collection.
- `POST`: Non-idempotent. Create new entity or execute domain action (e.g., login). Returns `201 Created` or `200 OK`.
- `PUT`: Idempotent. Replace entity in full.
- `PATCH`: Update partial fields.
- `DELETE`: Idempotent. Remove or cancel entity. Returns `200 OK` or `204 No Content`.

## 3. Standard Response Wrapper
All successful JSON responses are wrapped by `TransformInterceptor`:
```json
{
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-10-15T10:30:00.000Z"
}
```

## 4. Standard Error Response
All errors are trapped by `HttpExceptionFilter`:
```json
{
  "statusCode": 400,
  "timestamp": "2026-10-15T10:30:00.000Z",
  "path": "/api/v1/bookings",
  "method": "POST",
  "message": "Court is already booked for the requested time range"
}
```
