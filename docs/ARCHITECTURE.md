# BusLens — System Architecture

A full-stack transit discovery platform for the Chandigarh Tricity region.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Infrastructure Topology](#infrastructure-topology)
3. [Request Lifecycle](#request-lifecycle)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Design](#database-design)
7. [Authentication System](#authentication-system)
8. [Deployment Pipeline](#deployment-pipeline)
9. [Design Decisions](#design-decisions)

---

## System Overview

BusLens is a monorepo containing two independently deployable services:

```
buslens-ag/
├── frontend/     →  Next.js 16 (TypeScript, React 19)
├── backend/      →  FastAPI (Python 3.10+)
└── docs/         →  Deployment & architecture documentation
```

Both services are co-located on a single EC2 instance behind Nginx, with a managed MySQL database on RDS.

---

## Infrastructure Topology

```
                    ┌─────────────────────────────────┐
                    │          Internet / DNS          │
                    │    buslens.live → EC2 Public IP  │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │       AWS EC2 (t3.micro)         │
                    │        Ubuntu 22.04 LTS          │
                    │                                  │
                    │  ┌────────────────────────────┐  │
                    │  │     Nginx (port 80/443)     │  │
                    │  │  • SSL termination          │  │
                    │  │  • HTTP → HTTPS redirect    │  │
                    │  │  • Path-based routing       │  │
                    │  └────┬──────────────┬────────┘  │
                    │       │              │           │
                    │  ┌────▼─────┐  ┌─────▼───────┐  │
                    │  │ Next.js  │  │  FastAPI     │  │
                    │  │ :3000    │  │  :8000       │  │
                    │  │ (PM2)    │  │  (systemd +  │  │
                    │  │          │  │   Gunicorn)  │  │
                    │  └──────────┘  └──────┬──────┘  │
                    │                       │         │
                    └───────────────────────┼─────────┘
                                            │
                    ┌───────────────────────▼──────────┐
                    │     AWS RDS (MySQL 8.0)          │
                    │     Private subnet — not         │
                    │     publicly accessible           │
                    └──────────────────────────────────┘
```

### Nginx Routing Rules

| Path | Destination | Description |
|------|-------------|-------------|
| `/` | `localhost:3000` | Next.js SSR frontend |
| `/api/*` | `localhost:8000` | FastAPI backend (prefix stripped) |

---

## Request Lifecycle

### Search: Stop A → Stop B

```
 ┌──────────────────────────────────────────────────────────────────┐
 │                        CLIENT (Browser)                          │
 │                                                                  │
 │  1. User types stop name in <StopAutocomplete>                  │
 │  2. useStopSearch hook fires after ≥ 2 chars (debounced)        │
 │  3. User selects from + to stops, clicks "Search"               │
 │  4. Router navigates to /search?from=X&to=Y                    │
 │  5. useRouteSearch hook fires POST /routes/search               │
 └──────────────────────────┬───────────────────────────────────────┘
                            │ Axios (JWT Bearer if logged in)
                            ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │                      BACKEND (FastAPI)                           │
 │                                                                  │
 │  6. Router: POST /v1/routes/search                              │
 │  7. Pydantic validates { from_stop, to_stop }                   │
 │  8. RouteService.search_routes() — business logic               │
 │  9. RoutesRepo.find_routes() — raw SQL via SQLAlchemy           │
 │                                                                  │
 │  Correctness guarantee:                                          │
 │  A route is returned ONLY IF from_stop.sequence_no              │
 │  < to_stop.sequence_no in that route's direction.               │
 └──────────────────────────┬───────────────────────────────────────┘
                            │ SQL query
                            ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │                      DATABASE (MySQL 8.0)                        │
 │                                                                  │
 │  10. JOIN routes ↔ route_stops ↔ stops                          │
 │      WHERE from_sequence < to_sequence                           │
 │  11. Returns matching routes with stop arrays                    │
 └──────────────────────────────────────────────────────────────────┘
```

### Authenticated Request Flow

```
 Browser                   Axios Interceptor              FastAPI
    │                            │                           │
    │  Click "Add Favorite"      │                           │
    ├──────────────────────────► │                           │
    │                            │ Reads localStorage        │
    │                            │ Attaches Authorization:   │
    │                            │ Bearer <token>            │
    │                            ├──────────────────────────►│
    │                            │                           │ Decodes JWT
    │                            │                           │ Validates user
    │                            │                           │ Executes query
    │                            │ ◄─────────────────────────┤ 200 OK
    │  ◄─────────────────────────┤                           │
    │  React Query invalidates   │                           │
    │  ["favorites"] cache       │                           │
    │                            │                           │
    │       --- On 401 ---       │                           │
    │                            │ ◄─────────────────────────┤ 401 Unauthorized
    │                            │ Clears localStorage       │
    │                            │ Resets Zustand store       │
    │  ◄─────────────────────────┤ Redirects to /login       │
```

---

## Backend Architecture

### Layered Design

```
┌─────────────────────────────────────────────────────┐
│                    API Layer                          │
│              app/api/v1/*.py                          │
│  Thin controllers — routing, HTTP concerns only      │
├─────────────────────────────────────────────────────┤
│                  Schema Layer                        │
│              app/schemas/*.py                        │
│  Pydantic models — request/response contracts        │
├─────────────────────────────────────────────────────┤
│                 Service Layer                        │
│              app/services/*.py                       │
│  Business logic — route ordering, normalization      │
├─────────────────────────────────────────────────────┤
│               Repository Layer                       │
│              app/repositories/*.py                   │
│  SQL queries only — isolated from business logic     │
├─────────────────────────────────────────────────────┤
│                Database Layer                        │
│              app/db/*.py                             │
│  Connection pool, ORM models, session management     │
├─────────────────────────────────────────────────────┤
│                  Core Layer                          │
│              app/core/*.py                           │
│  Config, CORS, structured logging                    │
└─────────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/health` | Health check |
| `GET` | `/v1/stops?query=&limit=` | Stop autocomplete |
| `POST` | `/v1/routes/search` | Search routes between two stops |
| `GET` | `/v1/routes/{number}/{direction}` | Full route detail with stops |
| `GET` | `/v1/stops/{id}/routes` | All routes through a stop |
| `POST` | `/v1/auth/register` | User registration |
| `POST` | `/v1/auth/login` | Login (returns JWT) |
| `GET` | `/v1/users/me` | Current user profile |
| `GET` | `/v1/users/me/favorites` | List user favorites |
| `POST` | `/v1/users/me/favorites` | Add a favorite |
| `DELETE` | `/v1/users/me/favorites/{id}` | Remove a favorite |
| `GET` | `/v1/users/me/history` | List search history |
| `POST` | `/v1/users/me/history` | Record a search |

---

## Frontend Architecture

### Component Hierarchy

```
<RootLayout>                            # Server component — fonts, metadata
  <Providers>                           # Client — QueryClient, AuthHydration, Toaster
    <NavbarWrapper>                     # Client — floating glassmorphic navbar
    <ErrorBoundary>                     # Client — global error boundary
      <main>
        <Page>                          # File-based route pages
          <PageBackground>              # Shared ambient gradient wrapper
            <SearchCard>                # Home page search interface
            <StopAutocomplete>          # Debounced autocomplete input
            <RouteResultCard>           # Search result cards
            <StopTimeline>              # Route detail timeline
          </PageBackground>
        </Page>
      </main>
    </ErrorBoundary>
  </Providers>
</RootLayout>
```

### State Management

```
┌──────────────────────────────────────────────────────┐
│                   Zustand (authStore)                  │
│                                                       │
│  • user: UserResponse | null                         │
│  • token: string | null                              │
│  • isAuthenticated: boolean                          │
│  • isHydrated: boolean (prevents flash)              │
│                                                       │
│  Persisted to: localStorage                          │
│  Hydrated by: <AuthHydration> on mount               │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│              TanStack React Query (cache)             │
│                                                       │
│  • ["stops", query]       — autocomplete results     │
│  • ["routeSearch", from, to] — search results        │
│  • ["routeDetail", num, dir] — route stops           │
│  • ["favorites"]          — user favorites           │
│  • ["history"]            — search history           │
│                                                       │
│  Default staleTime: 60s                              │
│  Retry: 1                                            │
└──────────────────────────────────────────────────────┘
```

### Custom Hooks

| Hook | API Call | Notes |
|------|----------|-------|
| `useStopSearch(query)` | `GET /stops` | Enabled when `query.length >= 2` |
| `useRouteSearch(from, to)` | `POST /routes/search` | Enabled when both stops are set |
| `useRouteDetail(num, dir)` | `GET /routes/:num/:dir` | Route timeline data |
| `useStopRoutes(id)` | `GET /stops/:id/routes` | All routes through a stop |
| `useFavorites()` | `GET /users/me/favorites` | Enabled only when authenticated |
| `useAddFavorite()` | `POST /users/me/favorites` | Mutation, invalidates `["favorites"]` |
| `useDeleteFavorite()` | `DELETE /users/me/favorites/:id` | Mutation, invalidates `["favorites"]` |
| `useHistory()` | `GET /users/me/history` | Enabled only when authenticated |
| `useAddHistory()` | `POST /users/me/history` | Mutation, invalidates `["history"]` |

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    stops     │       │   route_stops    │       │   routes    │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id      PK  │◄──────│ stop_id     FK   │       │ id      PK  │
│ name        │       │ route_id    FK   │──────►│ route_number│
│             │       │ sequence_no      │       │ direction   │
└─────────────┘       └──────────────────┘       │  (UP/DOWN)  │
                                                  └─────────────┘
                      Unique: (route_number, direction)

┌─────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users     │       │   favorites      │       │    history        │
├─────────────┤       ├──────────────────┤       ├──────────────────┤
│ id      PK  │◄──────│ user_id     FK   │       │ user_id     FK   │
│ email       │       │ route_id    FK?  │       │ from_stop_id FK  │
│ password    │       │ stop_id     FK?  │       │ to_stop_id   FK  │
│ created_at  │       │ created_at       │       │ searched_at      │
└─────────────┘       └──────────────────┘       └──────────────────┘
```

### Key Tables

#### `stops`

| Column | Type | Notes |
|--------|------|-------|
| id | PK | Auto-increment |
| name | VARCHAR, UNIQUE | Indexed for autocomplete (LIKE query) |

#### `routes`

| Column | Type | Notes |
|--------|------|-------|
| id | PK | Auto-increment |
| route_number | VARCHAR | Supports alphanumeric (20A, 35B) |
| direction | ENUM(UP, DOWN) | Travel direction |

Constraint: `UNIQUE(route_number, direction)`

#### `route_stops`

| Column | Type | Notes |
|--------|------|-------|
| route_id | FK → routes | |
| stop_id | FK → stops | |
| sequence_no | INT | Enforces stop ordering for correctness |

Indexes: `(route_id, sequence_no)`, `(stop_id)`

### Route Correctness Invariant

> A route is returned **only if** `from_stop.sequence_no < to_stop.sequence_no` within that route's direction.

This prevents the common bug where a bus route is suggested even though the passenger would need to travel in reverse.

---

## Authentication System

```
┌────────────┐    POST /auth/register     ┌──────────────┐
│   Client   │ ──────────────────────────► │   FastAPI    │
│            │                             │              │
│            │    { email, password }       │  bcrypt hash │
│            │                             │  Store in DB │
└────────────┘                             └──────────────┘

┌────────────┐    POST /auth/login        ┌──────────────┐
│   Client   │ ──────────────────────────► │   FastAPI    │
│            │                             │              │
│            │    { email, password }       │  Verify hash │
│            │ ◄────────────────────────── │  Issue JWT   │
│            │    { access_token }          │  (HS256)     │
└────────────┘                             └──────────────┘
         │
         │ Store in localStorage
         │ Zustand authStore.login()
         ▼
┌────────────────────────────────────────────────────────┐
│  Subsequent requests:                                   │
│  Axios interceptor → Authorization: Bearer <token>     │
│                                                         │
│  FastAPI dependency → decode JWT → inject CurrentUser   │
│  into route handler                                     │
└────────────────────────────────────────────────────────┘
```

### Security Measures

- **Password hashing**: bcrypt (salted, work factor default)
- **Token format**: JWT (HS256) with configurable expiry (`ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Token storage**: `localStorage` (client-side)
- **Auto-logout**: Axios response interceptor clears state on any `401` (except login endpoint)
- **CORS**: Restricted to production frontend domain in production
- **DB credentials**: Not exposed in code — sourced from environment variables / AWS Secrets Manager

---

## Deployment Pipeline

### CI/CD Flow

```
Developer pushes to main
         │
         ▼
┌─────────────────────────────────────┐
│        GitHub Actions Workflow       │
│        .github/workflows/deploy.yml  │
│                                      │
│  1. SSH into EC2 via appleboy/ssh   │
│  2. git pull origin main            │
│                                      │
│  ── Frontend ──                      │
│  3. cd frontend && npm ci           │
│  4. npm run build                    │
│  5. pm2 reload nextjs               │
│                                      │
│  ── Backend ──                       │
│  6. cd backend && source venv/bin/  │
│  7. pip install -r requirements.txt │
│  8. sudo systemctl restart fastapi  │
└─────────────────────────────────────┘
```

### Process Supervision

| Process | Manager | Restart Policy | Logs |
|---------|---------|---------------|------|
| Next.js | PM2 | `pm2 save` + `pm2 startup` (survives reboot) | `pm2 logs nextjs` |
| FastAPI | systemd | `Restart=always` | `journalctl -u fastapi` |
| Nginx | systemd | OS-managed | `/var/log/nginx/error.log` |

### Security Groups (EC2)

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Admin IP | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP → HTTPS redirect |
| 443 | TCP | 0.0.0.0/0 | HTTPS (Nginx) |

Ports 3000 and 8000 are **not** publicly exposed — all traffic routes through Nginx.

---

## Design Decisions

### Why co-located on a single EC2?

For a personal/portfolio project, a single t3.micro running both services minimizes cost while still demonstrating proper separation of concerns. The services communicate via `localhost` — no network latency between frontend and backend.

### Why systemd + PM2 instead of Docker?

Simpler operational model for a single-server deployment. systemd handles crash recovery natively. PM2 provides zero-downtime `reload`. Docker adds value at scale but introduces unnecessary complexity here.

### Why raw SQL via SQLAlchemy instead of full ORM?

The repository layer uses `text()` queries through SQLAlchemy's connection abstraction. This gives full control over query performance (especially for the route ordering correctness guarantee) while still benefiting from connection pooling and session management.

### Why Zustand over React Context for auth?

Zustand provides a minimal API surface with built-in `localStorage` persistence patterns. Unlike Context, it doesn't trigger re-renders for unrelated state changes, and the store is accessible outside React components (e.g., in Axios interceptors via `getState()`).

### Why OKLCH color system?

OKLCH provides perceptually uniform color manipulation — changing lightness or chroma doesn't produce unexpected hue shifts. This is critical for a dark-themed design system where subtle variations in transparency and luminance define the visual hierarchy.

### Why the `sequence_no` correctness guarantee?

Most transit apps match routes by checking if both stops exist anywhere on the route. This produces false positives — suggesting a bus even if the passenger would need to ride backwards. The `from_sequence < to_sequence` constraint eliminates this class of bugs entirely.

---

*Last updated: May 2026*
