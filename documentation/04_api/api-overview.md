---
id: DOC-API-OVERVIEW
title: API Endpoint Catalog & Roadmap
doc_type: api-spec
status: draft
phase: phase-1
author: University Software Architecture Team
owner: API Design Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - api
  - endpoints
  - catalog
summary: Comprehensive catalog of Phase 1 REST endpoints fulfilling university requirements.
related_docs:
  - documentation/04_api/api-design-guidelines.md
  - documentation/02_requirements/functional-requirements.md
is_template: false
---

# API Endpoint Catalog & Roadmap

This catalog specifies all planned Phase 1 REST endpoints, highlighting mandatory authenticated methods (GET, POST) and DELETE methods.

## 1. System & Health Endpoints
| Method | Route | Auth | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Public | **Implemented** | Service uptime, timestamp, and health verification |

## 2. Authentication Endpoints (`auth`)
| Method | Route | Auth | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Planned | Register a new user account |
| `POST` | `/api/v1/auth/login` | Public | Planned | Authenticate credentials and return JWT |

## 3. User Endpoints (`users`)
| Method | Route | Auth | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/profile` | **Bearer JWT** | Planned | *Satisfies requirement: Authenticated GET* |
| `GET` | `/api/v1/users/:id` | **Bearer JWT (Admin)** | Planned | Query user account by ID |

## 4. Venue & Court Endpoints (`venues`, `courts`)
| Method | Route | Auth | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/venues` | Public | Planned | List active sports venues |
| `POST` | `/api/v1/venues` | **Bearer JWT (Manager)** | Planned | Create sports facility |
| `DELETE`| `/api/v1/venues/:id` | **Bearer JWT (Manager)** | Planned | *Satisfies requirement: DELETE endpoint* |
| `GET` | `/api/v1/courts` | Public | Planned | List courts by venue and sport type |
| `POST` | `/api/v1/courts` | **Bearer JWT (Manager)** | Planned | Add court to venue |
| `DELETE`| `/api/v1/courts/:id` | **Bearer JWT (Manager)** | Planned | Remove court |

## 5. Booking Endpoints (`bookings`)
| Method | Route | Auth | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/bookings` | **Bearer JWT (Customer)** | Planned | *Satisfies requirement: Authenticated POST* |
| `GET` | `/api/v1/bookings/:id` | **Bearer JWT (Customer/Manager)** | Planned | Retrieve booking confirmation details |
| `DELETE`| `/api/v1/bookings/:id` | **Bearer JWT (Customer/Manager)** | Planned | Cancel a booking reservation |

## 6. Open Items & Phase 1 TODOs
- TODO [Phase-1]: Implement DTO validation classes using `class-validator` / `class-transformer` or Zod.
- TODO [Phase-1]: Set up Swagger decorators on all controllers so `/api/docs` reflects complete schemas.
