# Sports Court Booking System - Frontend Client

This directory contains the frontend client application skeleton for the **Sports Court Booking System**.

## 1. Architecture & Design Direction

The frontend is structured to cleanly mirror the backend Modular Monolith:
- **Framework:** React + TypeScript (Vite tooling)
- **API Communication:** REST JSON communication targeting the backend at `http://localhost:3000/api/v1`
- **State & Routing:** Modular feature organization (`auth`, `venues`, `courts`, `bookings`)

## 2. Directory Organization

```text
frontend/
├── src/
│   ├── api/              # HTTP client and backend API integration
│   ├── components/       # Shared UI components (layout, buttons, modals)
│   ├── modules/          # Feature-specific modules
│   │   ├── auth/         # Login & registration views
│   │   ├── venues/       # Venue discovery and facility details
│   │   ├── courts/       # Court inventory & slot availability grids
│   │   └── bookings/     # Reservation booking form and user booking history
│   ├── types/            # TypeScript data contracts matching backend DTOs
│   ├── App.tsx           # Main application router / layout shell
│   ├── main.tsx          # Application entrypoint
│   └── index.css         # Baseline styling
├── package.json          # Frontend dependencies and dev scripts
├── tsconfig.json         # TypeScript compiler configuration
└── vite.config.ts        # Vite build configuration with API reverse proxy
```

## 3. Development Setup

```bash
cd frontend
npm install
npm run dev
```

During local development, API requests to `/api/v1` are proxied to `http://localhost:3000`.
