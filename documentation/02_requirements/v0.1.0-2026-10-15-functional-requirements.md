---
id: DOC-REQ-FUNCTIONAL
title: Functional Requirements Specification
doc_type: requirement
status: draft
phase: phase-1
author: University Software Architecture Team
owner: Requirements Engineering Lead
created_at: 2026-10-15T10:30:00+07:00
updated_at: 2026-10-15T10:30:00+07:00
version: 0.1.0
visibility: team
tags:
  - requirements
  - functional
  - api-endpoints
summary: Functional requirements breakdown across Auth, Users, Venues, Courts, and Bookings modules.
related_docs:
  - documentation/01_product/scope-and-actors.md
  - documentation/02_requirements/non-functional-requirements.md
  - documentation/04_api/api-overview.md
is_template: false
---

# Functional Requirements Specification

## 1. Authentication & Authorization Module (`auth`)
- **FR-AUTH-1**: The system SHALL provide user registration (`POST /api/v1/auth/register`) with email, hashed password, and role.
- **FR-AUTH-2**: The system SHALL provide user login (`POST /api/v1/auth/login`) returning a signed JWT access token.
- **FR-AUTH-3**: The system SHALL protect private endpoints using NestJS Guards and extract user identity without manual controller decoding.

## 2. User Management Module (`users`)
- **FR-USER-1**: The system SHALL allow authenticated users to retrieve their own profile (`GET /api/v1/users/profile`).
- **FR-USER-2**: The system SHALL allow admins to query user details (`GET /api/v1/users/:id`).

## 3. Venue Management Module (`venues`)
- **FR-VEN-1**: The system SHALL allow anyone to list active venues (`GET /api/v1/venues`).
- **FR-VEN-2**: The system SHALL allow authenticated Venue Managers to register new venues (`POST /api/v1/venues`).
- **FR-VEN-3**: The system SHALL allow authenticated Venue Managers to delete their venue (`DELETE /api/v1/venues/:id`).

## 4. Court Management Module (`courts`)
- **FR-CRT-1**: The system SHALL allow users to list courts by venue (`GET /api/v1/courts?venueId=...`).
- **FR-CRT-2**: The system SHALL allow Venue Managers to add courts (`POST /api/v1/courts`).
- **FR-CRT-3**: The system SHALL allow Venue Managers to remove courts (`DELETE /api/v1/courts/:id`).

## 5. Booking Lifecycle Module (`bookings`)
- **FR-BKG-1**: The system SHALL allow authenticated customers to create a booking (`POST /api/v1/bookings`).
- **FR-BKG-2**: The system SHALL prevent double-booking: A court CANNOT be booked for overlapping time windows.
- **FR-BKG-3**: The system SHALL allow customers to view their bookings (`GET /api/v1/bookings/:id`).
- **FR-BKG-4**: The system SHALL allow customers to cancel a booking (`DELETE /api/v1/bookings/:id`).

## 6. Open Items & Phase 1 TODOs
- TODO [Phase-1]: Implement validation pipes for ISO date format in booking requests.
- TODO [Phase-1]: Finalize error response codes for double-booking conflict (`409 Conflict` vs `422 Unprocessable Entity`).
- TODO [Phase-1]: Define automated seed data for venues and courts for testing.
