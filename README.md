# BusLens 🚌🔍

A full-stack bus route finder for **Chandigarh Tricity** (Chandigarh, Mohali, Panchkula, Zirakpur, Kharar). Search bus routes from Stop A to Stop B, look up routes by bus number, save favorites, and track your search history.

## Key Features

- 🔍 **Stop-to-Stop Search** — Find all bus routes connecting two stops
- 🚌 **Bus Number Lookup** — View complete route timeline by bus/route number
- 📍 **Stop Autocomplete** — Debounced, fuzzy search across all stops
- ♡ **Favorites** — Save routes for quick access (auth-gated)
- 📜 **Search History** — Re-run past searches with one click
- 🔐 **Authentication** — Sign up, log in (JWT), Google OAuth (planned)
- 🌑 **Dark Mode** — Default dark theme with glassmorphic UI
- ✨ **Infinite Grid Hero** — Animated SVG grid background with mouse tracking

---

## Tech Stack

### Backend
- **Language**: Python 3.10+
- **Framework**: FastAPI
- **Database**: MySQL (via SQLAlchemy + raw SQL)
- **Auth**: JWT (PyJWT) with OAuth2PasswordBearer
- **ORM**: SQLAlchemy (connection layer) with raw SQL queries
- **Validation**: Pydantic v2

### Frontend
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query + Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

---

## Prerequisites

- **Python** 3.10+ with pip
- **Node.js** 20+ with npm
- **MySQL** 8.0+ (or MySQL Workbench for local development)
- **Git**

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Deepakshandilya/buslens-ag.git
cd buslens-ag
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/buslens
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql+pymysql://root:pass@localhost:3306/buslens` |
| `SECRET_KEY` | JWT signing secret | Any long random string |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL | `30` |

### 4. Database Setup

Create the `buslens` database in MySQL Workbench or CLI:

```sql
CREATE DATABASE buslens;
```

Then run the table creation scripts:

```bash
cd backend
python create_user_tables.py
```

### 5. Start the Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 6. Frontend Setup

```bash
cd frontend
npm install
```

### 7. Start the Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

### Directory Structure

```
buslens-ag/
├── backend/
│   ├── app/
│   │   ├── api/v1/             # FastAPI route handlers
│   │   │   ├── auth.py         # POST /login, /register
│   │   │   ├── stops.py        # GET /stops?query=
│   │   │   ├── routes.py       # POST /routes/search, GET /routes/{n}/{d}
│   │   │   ├── stop_routes.py  # GET /stops/{id}/routes
│   │   │   ├── users.py        # GET /users/me, favorites, history
│   │   │   └── health.py       # GET /health
│   │   ├── core/               # Config, CORS, logging
│   │   ├── db/                 # Database session
│   │   ├── repositories/       # Raw SQL query functions
│   │   ├── schemas/            # Pydantic models
│   │   ├── services/           # Business logic
│   │   └── main.py             # FastAPI app factory
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── app/                # Next.js App Router pages
│       │   ├── page.tsx        # Landing (Infinite Grid + Search)
│       │   ├── login/          # Login page
│       │   ├── register/       # Register page
│       │   ├── search/         # Search results
│       │   ├── route/[n]/[d]/  # Route detail timeline
│       │   └── dashboard/      # User history & favorites
│       ├── components/
│       │   ├── layout/         # Navbar
│       │   ├── search/         # SearchCard, StopAutocomplete
│       │   └── ui/             # Shadcn + InfiniteGrid
│       ├── hooks/              # React Query hooks
│       ├── stores/             # Zustand auth store
│       ├── lib/                # Axios client, utils
│       └── types/              # TypeScript interfaces
│
└── README.md
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/health` | Health check |
| `POST` | `/v1/auth/register` | Create account |
| `POST` | `/v1/auth/login` | Login (returns JWT) |
| `GET` | `/v1/stops?query=` | Search stops by name |
| `POST` | `/v1/routes/search` | Find routes from Stop A → B |
| `GET` | `/v1/routes/{num}/{dir}` | Get route stops timeline |
| `GET` | `/v1/stops/{id}/routes` | Get all routes through a stop |
| `GET` | `/v1/users/me` | Get current user profile |
| `GET` | `/v1/users/me/favorites` | List user's favorites |
| `POST` | `/v1/users/me/favorites` | Add a favorite |
| `DELETE` | `/v1/users/me/favorites/{id}` | Remove a favorite |
| `GET` | `/v1/users/me/history` | List search history |
| `POST` | `/v1/users/me/history` | Record a search |

### Request Lifecycle

```
User Action → React Component → React Query Hook → Axios (JWT attached)
    → FastAPI Router → Repository (raw SQL) → MySQL
    → Pydantic Response → React Query Cache → UI Update
```

### Database Schema

```
users
├── id (INT, PK, AUTO_INCREMENT)
├── email (VARCHAR, UNIQUE, NOT NULL)
├── hashed_password (VARCHAR, NOT NULL)
└── created_at (DATETIME)

favorites
├── id (INT, PK)
├── user_id (INT, FK → users)
├── route_id (INT, nullable)
├── stop_id (INT, nullable)
└── created_at (DATETIME)

search_history
├── id (INT, PK)
├── user_id (INT, FK → users)
├── from_stop_id (INT)
├── to_stop_id (INT)
└── searched_at (DATETIME)

routes
├── id (INT, PK)
├── route_number (VARCHAR)
└── direction (VARCHAR)  — UP or DOWN

stops
├── id (INT, PK)
└── name (VARCHAR)

route_stops
├── route_id (INT, FK → routes)
├── stop_id (INT, FK → stops)
└── sequence_no (INT)
```

---

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Start dev server with hot reload |
| `python create_user_tables.py` | Create user/favorites/history tables |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npx tsc --noEmit` | TypeScript type check |
| `npx shadcn@latest add <component>` | Add Shadcn UI component |

---

## Troubleshooting

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:** Ensure the backend CORS config in `app/core/cors.py` includes `http://localhost:3000`.

### MySQL Connection Failed

**Error:** `Can't connect to MySQL server`

**Solution:**
1. Verify MySQL is running: `mysql -u root -p`
2. Check `DATABASE_URL` in `.env` matches your credentials
3. Ensure the `buslens` database exists

### JWT Token Expired

**Error:** `401 Unauthorized`

**Solution:** Log out and log back in. Tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES`.

### Frontend Build Errors

```bash
# Clear Next.js cache
rm -rf frontend/.next
npm run dev
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit using conventional commits: `feat(scope): Add feature description`
4. Push to your branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## License

This project is for educational and personal use.
