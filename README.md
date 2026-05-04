# BusLens 🚌🔍

**Real-time bus route discovery for the Chandigarh Tricity region.**

Search bus routes between any two stops, browse routes by bus number, view full stop timelines, and manage authenticated favorites and search history — across Chandigarh, Mohali, Panchkula, Zirakpur, and Kharar.

[![Live](https://img.shields.io/badge/Live-buslens.live-72a5f2?style=flat&logo=googlechrome)](https://buslens.live)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://python.org)

---

## Highlights

| | Feature | Detail |
|---|---------|--------|
| 🔍 | **Directional Route Search** | Returns a route **only if** the departure stop comes before the destination in that direction — no false positives |
| 🔐 | **JWT Authentication** | bcrypt password hashing, Axios 401 interceptor auto-logout, Zustand auth hydration |
| 🏗️ | **Layered Backend** | Repository pattern isolating SQL from business logic, Pydantic v2 contracts |
| ⚡ | **Cached Data Layer** | TanStack React Query with `staleTime`, `enabled` guards, and mutation-based invalidation |
| 🎨 | **OKLCH Design System** | Dark-first glassmorphic UI with ambient gradient backgrounds and responsive typography |
| 🛡️ | **Schema Validation** | Zod + React Hook Form on the client, Pydantic on the server — validated at both ends |
| 🚀 | **CI/CD Pipeline** | GitHub Actions → SSH → EC2 auto-deploy on every push to `main` |

---

## Tech Stack

### Backend

| Technology | Role |
|-----------|------|
| Python 3.10+ / FastAPI | API framework with async support |
| SQLAlchemy + raw SQL | Database access layer with connection pooling |
| MySQL 8.0 (AWS RDS) | Persistent route, stop, and user data |
| JWT (PyJWT) + bcrypt | Authentication and password hashing |
| Pytest | Integration and unit test suite |

### Frontend

| Technology | Role |
|-----------|------|
| Next.js 16 (App Router) | SSR, file-based routing, dynamic metadata |
| TypeScript 5 | Type-safe development |
| Tailwind CSS v4 + Shadcn UI | Design system and component primitives |
| TanStack React Query + Axios | Cached data fetching with JWT interceptors |
| Zustand | Auth state with localStorage hydration |
| Framer Motion | Animations and page transitions |
| Zod + React Hook Form | Client-side schema validation |

### Infrastructure

| Service | Role |
|---------|------|
| AWS EC2 (Ubuntu 22.04) | Hosts both frontend and backend |
| AWS RDS (MySQL) | Managed database (private subnet) |
| Nginx | Reverse proxy, SSL termination, path-based routing |
| PM2 / systemd | Process management for Next.js / FastAPI |
| Let's Encrypt | HTTPS certificates with auto-renewal |
| GitHub Actions | CI/CD — auto-deploy on push to `main` |

---

## Project Structure

```
buslens-ag/
├── frontend/               # Next.js 16 (TypeScript, React 19)
│   ├── src/
│   │   ├── app/            # App Router pages (home, search, route, dashboard, auth, about)
│   │   ├── components/     # Layout, search, UI primitives, error boundary
│   │   ├── hooks/          # React Query hooks (route search, favorites, history)
│   │   ├── stores/         # Zustand auth store
│   │   ├── lib/            # Axios client, validations, utilities
│   │   └── types/          # TypeScript interfaces mirroring Pydantic schemas
│   └── public/             # Static assets (logo, images)
│
├── backend/                # FastAPI (Python 3.10+)
│   ├── app/
│   │   ├── api/v1/         # Route handlers (health, stops, routes, auth, users)
│   │   ├── schemas/        # Pydantic request/response models
│   │   ├── services/       # Business logic (route ordering, normalization)
│   │   ├── repositories/   # SQL queries (isolated from business logic)
│   │   ├── db/             # Connection pool, ORM models
│   │   └── core/           # Config, CORS, logging
│   └── tests/              # Pytest suite
│
├── docs/
│   ├── DEPLOYMENT.md       # Full production deployment guide
│   └── ARCHITECTURE.md     # System design and architecture documentation
│
└── .github/workflows/      # CI/CD pipeline
```

---

## Architecture

```
User (Browser)
    ↓
DNS  (buslens.live → EC2 Public IP)
    ↓
Nginx (Port 443 → SSL termination)
    ├── /      → Next.js   (localhost:3000, PM2)
    └── /api/  → FastAPI   (localhost:8000, systemd + Gunicorn)
    ↓
AWS RDS MySQL  (private subnet)
```

### Request Lifecycle

```
User Action (click / type)
  ↓
React Hook Form + Zod (validates client-side schema)
  ↓
TanStack React Query (checks cache → fires request)
  ↓
Axios client (attaches JWT Bearer token)
  ↓
FastAPI router → Pydantic validation → Service layer → Repository (raw SQL)
  ↓
MySQL 8.0
```

For the full system design including database ERD, auth flow diagrams, state management, and design decisions, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

## Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** ≥ 20
- **MySQL** 8.0 (local or remote)

### 1. Clone

```bash
git clone https://github.com/Deepakshandilya/buslens-ag.git
cd buslens-ag
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:

```env
APP_ENV=local
DB_HOST=localhost
DB_PORT=3306
DB_NAME=buslens
DB_USER=buslens_user
DB_PASSWORD=buslens_password
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=generate_a_secure_long_random_string_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Set up the database:

```sql
CREATE DATABASE buslens;
```

```bash
python create_user_tables.py
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend

```bash
cd ../frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env — set NEXT_PUBLIC_API_URL if backend is not on localhost:8000

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Tests

```bash
cd backend
pytest -v
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — infinite grid hero with stop-to-stop search |
| `/search?from=X&to=Y` | Search results with journey visualization |
| `/route/[number]/[direction]` | Full stop timeline with from/to highlighting |
| `/bus/[number]` | All directions for a bus number |
| `/stop/[id]` | All routes through a specific stop |
| `/dashboard` | 🔒 Search history and saved favorites |
| `/login` | Login form |
| `/register` | Registration form |
| `/about` | Story, network analytics, embedded map |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/health` | Health check |
| `GET` | `/v1/stops?query=&limit=` | Stop autocomplete |
| `POST` | `/v1/routes/search` | Search routes between two stops |
| `GET` | `/v1/routes/{number}/{direction}` | Route detail with all stops |
| `GET` | `/v1/stops/{id}/routes` | All routes through a stop |
| `POST` | `/v1/auth/register` | User registration |
| `POST` | `/v1/auth/login` | Login (returns JWT) |
| `GET` | `/v1/users/me/favorites` | 🔒 List favorites |
| `POST` | `/v1/users/me/favorites` | 🔒 Add favorite |
| `DELETE` | `/v1/users/me/favorites/{id}` | 🔒 Remove favorite |
| `GET` | `/v1/users/me/history` | 🔒 Search history |
| `POST` | `/v1/users/me/history` | 🔒 Record search |

Full interactive docs at `/docs` (Swagger) when running locally.

---

## Documentation

| Document | Description |
|----------|-------------|
| [frontend/README.md](frontend/README.md) | Frontend architecture, project structure, design system, key patterns |
| [backend/readme.md](backend/readme.md) | Backend architecture, API reference, database schema, data import |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design — infrastructure topology, request lifecycle, ERD, auth flow, design decisions |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment — EC2, Nginx, SSL, systemd, PM2, CI/CD, troubleshooting |

---

## Contributing

1. **Branch:** `git checkout -b feature/your-feature`
2. **Commit:** `feat(scope): description` (conventional commits)
3. **Test:** Run `pytest -v` before opening a PR
4. **PR:** Open against `main`

---

## License

This project is for educational and personal use.
