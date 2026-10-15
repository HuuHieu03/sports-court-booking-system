---
id: TMPL-API-ENDPOINT
title: API Endpoint Specification Template
doc_type: api-spec
status: draft
phase: phase-1
author: API Designer
owner: API Design Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - api-spec
  - endpoint
summary: Specification template for REST API endpoints including schemas, authentication, and error codes.
related_docs:
  - documentation/04_api/api-design-guidelines.md
is_template: true
---

# Endpoint: [METHOD] /api/v1/[route]

## 1. Overview
- **HTTP Method:** `GET` | `POST` | `PUT` | `PATCH` | `DELETE`
- **Route Path:** `/api/v1/...`
- **Summary:** <!-- Short purpose -->
- **Authentication:** `None (Public)` | `Bearer JWT (Required)`
- **Required Roles:** `CUSTOMER` | `VENUE_MANAGER` | `ADMIN`

## 2. Request Specification

### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | String | Yes/No | `Bearer <JWT_TOKEN>` |
| `Content-Type` | String | Yes | `application/json` |

### Path / Query Parameters
- `param1` (string, required): <!-- Description -->

### Request Body Schema (JSON)
```json
{
  "field1": "value",
  "field2": 123
}
```

## 3. Response Specification

### Success Response (`200 OK` / `201 Created`)
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "status": "CONFIRMED"
  },
  "timestamp": "2026-10-15T10:30:00.000Z"
}
```

### Error Responses
| HTTP Code | Error Code / Message | Scenario |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_FAILED` | Malformed input or missing mandatory fields |
| `401 Unauthorized` | `UNAUTHORIZED` | Missing or invalid JWT token |
| `403 Forbidden` | `FORBIDDEN_RESOURCE` | Authenticated user lacks required role |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | Target entity does not exist |
| `409 Conflict` | `DOUBLE_BOOKING_CONFLICT` | Overlapping booking detected |

## 4. Business Constraints & Validation Rules
1. Constraint 1: <!-- Invariant enforced during execution -->
2. Constraint 2: <!-- Invariant enforced during execution -->
