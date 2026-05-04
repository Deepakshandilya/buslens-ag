# BusLens Frontend

The Next.js 16 client powering real-time bus route discovery for the Chandigarh Tricity region.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)

---

## Overview

BusLens Frontend is a server-rendered, dark-themed transit search interface built with the Next.js App Router. Users can search bus routes between any two stops, view full route timelines, browse routes by bus number, and manage authenticated favorites and search history — all backed by a FastAPI service.

**Live:** [buslens.live](https://buslens.live)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | SSR, file-based routing, dynamic metadata |
| Language | TypeScript 5 | Type-safe development across all modules |
| Styling | Tailwind CSS v4 + Shadcn UI (New York) | Design tokens, component primitives |
| State | Zustand | Auth state with localStorage hydration |
| Data Fetching | TanStack React Query + Axios | Cached queries, mutations, request interceptors |
| Animations | Framer Motion | Page transitions, staggered card reveals |
| Validation | Zod + React Hook Form | Client-side schema validation on all forms |
| Icons | Lucide React | Consistent iconography |
| Notifications | Sonner | Toast messages for user feedback |
| Fonts | Inter (body) + Space Grotesk (headings) | Premium typography via `next/font` |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (fonts, providers, navbar)
│   │   ├── page.tsx                # Home — infinite grid hero + search card
│   │   ├── globals.css             # Design tokens, OKLCH color system
│   │   ├── search/                 # Search results (/search?from=X&to=Y)
│   │   ├── route/[routeNumber]/    # Route detail with stop timeline
│   │   ├── bus/[number]/           # Bus number lookup
│   │   ├── stop/[id]/              # Stop detail — all routes through a stop
│   │   ├── dashboard/              # Auth-gated favorites & history tabs
│   │   ├── login/                  # Login form
│   │   ├── register/               # Registration form
│   │   └── about/                  # About page with bento analytics grid
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Floating glassmorphic navigation bar
│   │   │   ├── NavbarWrapper.tsx   # Client wrapper for server layout
│   │   │   ├── PageBackground.tsx  # Shared ambient gradient background
│   │   │   ├── AuthFloatingNav.tsx # Auth page navigation
│   │   │   └── AuthImageCarousel.tsx # Login/register side panel carousel
│   │   ├── search/
│   │   │   ├── SearchCard.tsx      # Main search form with stop autocomplete
│   │   │   └── StopAutocomplete.tsx # Debounced stop search input
│   │   ├── ui/                     # Shadcn primitives (button, card, dialog, etc.)
│   │   ├── providers.tsx           # QueryClient + AuthHydration + Toaster
│   │   └── ErrorBoundary.tsx       # Global error boundary with retry UI
│   │
│   ├── hooks/
│   │   ├── useRouteSearch.ts       # POST /routes/search query hook
│   │   ├── useRouteDetail.ts       # GET /routes/:number/:direction
│   │   ├── useStopSearch.ts        # GET /stops?query= autocomplete
│   │   ├── useStopRoutes.ts        # GET /stops/:id/routes
│   │   ├── useFavorites.ts         # CRUD favorites (query + mutations)
│   │   └── useHistory.ts           # Search history (query + mutation)
│   │
│   ├── stores/
│   │   └── authStore.ts            # Zustand auth store (login, logout, hydrate)
│   │
│   ├── lib/
│   │   ├── api.ts                  # Axios instance with JWT interceptors
│   │   ├── utils.ts                # Tailwind merge utility (cn)
│   │   └── validations.ts          # Zod schemas (login, register)
│   │
│   └── types/
│       └── api.ts                  # TypeScript interfaces mirroring Pydantic schemas
│
├── public/
│   ├── logo.png                    # BusLens logo / favicon source
│   ├── city_grid.png               # Hero background asset
│   └── transit_node.png            # Transit visualization asset
│
├── components.json                 # Shadcn UI configuration (New York style)
├── next.config.ts                  # Next.js config (remote image patterns)
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS with Tailwind plugin
└── package.json                    # Dependencies and scripts
```

---

## Architecture

### Data Flow

```
User Interaction (click / type)
  ↓
React Hook Form + Zod (validates client-side schema)
  ↓
TanStack React Query hook (checks cache → fires request)
  ↓
Axios instance (attaches JWT Bearer token, handles 401 auto-logout)
  ↓
FastAPI Backend (/v1/...)
```

### Auth Flow

1. **Login / Register** → Backend returns JWT access token
2. **Zustand store** persists token + user to `localStorage`
3. **Axios request interceptor** reads token from `localStorage` and attaches `Authorization: Bearer` header
4. **Axios response interceptor** catches `401` → clears auth state → redirects to `/login`
5. **AuthHydration component** rehydrates Zustand from `localStorage` on mount, preventing flash of unauthenticated UI

### Design System

The frontend uses an **OKLCH-based color system** defined in `globals.css` with CSS custom properties. Key design decisions:

- **Dark-first**: The `<html>` element ships with `class="dark"`
- **Glassmorphic navbar**: Floating navigation with `backdrop-blur-xl` and translucent OKLCH backgrounds
- **Ambient gradients**: `PageBackground` component renders decorative blur orbs for depth
- **Route highlights**: Dedicated CSS variables (`--route-start`, `--route-end`) for journey visualization
- **Responsive typography**: Heading scale adjusts at `640px` breakpoint

---

## Pages

| Route | Page | Auth | Description |
|-------|------|:----:|-------------|
| `/` | Home | — | Infinite grid hero with search card (from/to autocomplete) |
| `/search?from=X&to=Y` | Search Results | — | Lists matching routes with journey visualization |
| `/route/[number]/[direction]` | Route Detail | — | Full stop timeline with from/to highlighting |
| `/bus/[number]` | Bus Lookup | — | All directions for a given bus number |
| `/stop/[id]` | Stop Detail | — | All routes passing through a specific stop |
| `/dashboard` | Dashboard | 🔒 | Tabbed view of search history and saved favorites |
| `/login` | Login | — | Email + password form with Zod validation |
| `/register` | Register | — | Registration with password confirmation |
| `/about` | About | — | Story, network analytics bento grid, embedded map |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 9
- Backend running at `http://localhost:8000` (see [backend README](../backend/readme.md))

### Install & Run

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — set NEXT_PUBLIC_API_URL if backend is not on localhost:8000

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/v1` | Backend API base URL |

### Scripts

```bash
npm run dev     # Start development server (hot reload)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## Key Patterns

### Cached Data Fetching

All API calls go through custom hooks built on TanStack React Query:

```typescript
// hooks/useRouteSearch.ts
export function useRouteSearch(fromStop: string, toStop: string) {
    return useQuery<RouteSearchResult[]>({
        queryKey: ["routeSearch", fromStop, toStop],
        queryFn: () => api.post("/routes/search", { from_stop: fromStop, to_stop: toStop }),
        enabled: fromStop.length > 0 && toStop.length > 0,
        staleTime: 60_000,
    });
}
```

- **`enabled`** guards prevent requests until input is valid
- **`staleTime`** reduces redundant network calls
- **Mutations** (favorites, history) auto-invalidate related queries on success

### Type Safety

TypeScript interfaces in `types/api.ts` mirror the backend's Pydantic schemas exactly, ensuring compile-time guarantees on every API boundary.

### Error Handling

- **Global ErrorBoundary** — class component wrapping `<main>`, renders themed fallback UI with retry
- **Axios 401 interceptor** — auto-logout + redirect on expired tokens
- **React Query error states** — per-page error cards with contextual messaging

---

## Deployment

The frontend is deployed on an **AWS EC2** instance (Ubuntu 22.04), managed by **PM2** behind **Nginx** with SSL.

| Component | Role |
|-----------|------|
| PM2 | Process manager — keeps Next.js running, survives reboots |
| Nginx | Reverse proxy — routes `/` → `localhost:3000`, terminates SSL |
| Let's Encrypt | HTTPS certificates with auto-renewal |
| GitHub Actions | CI/CD — auto-deploys on push to `main` |

### Build & Deploy

```bash
# On the EC2 instance
cd ~/buslens-ag/frontend
npm ci
npm run build
pm2 reload nextjs
```

### CI/CD

Every push to `main` triggers a GitHub Actions workflow that SSHes into EC2 and runs:

```bash
cd frontend
npm ci
npm run build
pm2 reload nextjs
```

For full deployment documentation including EC2 setup, Nginx config, SSL, and troubleshooting, see [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).

---

## License

This project is for educational and personal use.
