# BusLens 🚌🔍

**BusLens** is a robust, full-stack transit discovery application for the **Chandigarh Tricity** area (Chandigarh, Mohali, Panchkula, Zirakpur, Kharar). It's designed to simulate high-scale consumer transit platforms by allowing users to efficiently search bus routes between stops, lookup complex routes by designated bus numbers, execute stop-to-stop traversals, and manage authenticated favorite routes and history.

## Key Technical Features 🚀

- 🔍 **Real-time Stop-to-Stop Search Algorithm** — Fuzzy search with intelligent debouncing querying SQL constraints.
- 🔐 **Secure JWT Authentication** — Encrypted password hashing (bcrypt), OAuth2PasswordBearer flow, and strict 401 unauthenticated request interceptors to auto-logout users securely.
- 🏗️ **Repository Pattern Architecture** — Clean scalable FastAPI layer decoupling routing from raw SQL transactions. 
- 🌐 **Modern Next.js 16 App Router** — Implementing intelligent SEO via nested `layout.tsx` dynamic metadata generation (`generateMetadata`).
- 🔄 **Performant Data Caching** — Leveraging `TanStack React Query` with explicitly enabled authenticated queries to optimize fetching load.
- 🎨 **Reusable Glassmorphic Design System** — A completely DRY `PageBackground` layout component wrapping pages while reducing DOM duplication.
- 🛡️ **Strict Form Validation** — Implemented comprehensive input validation natively catching bad forms using `Zod` and `react-hook-form` across the site.
- 🧪 **Pytest Integration Suites** — Exhaustive backend backend lifecycle tests checking Auth schemas, Foreign-Key dependencies, and DB seeding isolation.

---

## Tech Stack

### Backend
- **Language**: Python 3.10+
- **Framework**: FastAPI (Pydantic v2 validation)
- **Database**: MySQL (via SQLAlchemy connection layer + raw SQL queries)
- **Auth**: JWT (PyJWT) with bcrypt Hashing
- **Testing**: PyTest with Dependency Injected SQL Sessions

### Frontend
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **State Management**: Zustand (Local Storage Hydration)
- **Data Fetching**: TanStack React Query + Axios Interceptors
- **Animations**: Framer Motion
- **Validation**: React Hook Form + Zod Schema Parsing

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

Create `backend/.env` adjusting values depending on your SQL connection:

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

### 4. Database Setup

Create the database assigned in `.env` within MySQL Workbench or CLI:

```sql
CREATE DATABASE buslens;
```

Run the table creation scripts from the `backend` root:

```bash
python create_user_tables.py
```

### 5. Running Tests

To verify environment sanity, execute the test suite:
```bash
.venv\Scripts\pytest -v
```

### 6. Start the Backend

```bash
uvicorn app.main:app --reload --port 8000
```

API docs will be available instantly at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 7. Frontend Setup & Run

```bash
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture Lifecycle Flow

User traffic seamlessly runs through the following hierarchy:
```text
User Action (Click/Type)
  ↓
React Hook Form + Zod (Validates Client-Side Schema)
  ↓
TanStack React Query Hook (Checks cache or fires Mutation)
  ↓
Axios Client (Attaches JWT Bearer Token Headers if present)
  ↓
FastAPI Router (app/api/v1/...) (Validates request with Pydantic)
  ↓
Dependency Injection (Yields SQLAlchemy Session + decodes CurrentUser JWT)
  ↓
Repository Layer (Executes raw SQL text() via SQLAlchemy ORM proxy)
  ↓
MySQL 8.0 Engine
```

---

## Contributing & Development

Built with best practices spanning code separation and UI reusability. To contribute:
1. **Branch Format:** `git checkout -b feature/auth-roles`
2. **Commit Pattern:** `feat(auth): Update password requirements`
3. Always run the `pytest` suite ensuring MySQL foreign key relationships trigger efficiently.

## License

This project is for educational and personal use.
