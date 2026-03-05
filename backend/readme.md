Below is a **backend-only README** you can paste into `backend/README.md`. It explains *exactly* what we’re building, why, structure, endpoints, DB model, ingestion, local run, tests, and AWS deployment—**detailed but not overcomplicated**.

---

# BusLens Backend (FastAPI) — Interview-Ready Design

## What this backend does

BusLens backend is a **FastAPI** service that powers a bus-route finder.

Users can:

* Search bus routes from **Stop A → Stop B**
* Get **valid routes only** where Stop A appears **before** Stop B in the route
* Autocomplete stops (for frontend search UI)
* View full route details (all stops in order)

This backend is designed to be:

* **Correct** (route ordering logic is enforced)
* **Cleanly structured** (API vs service vs DB layers)
* **Production-aware** (AWS-ready: API Gateway, Lambda, RDS, Secrets, CORS)
* **Interview-friendly** (typed schemas + docs + tests)

---

## Core correctness rule (most important)

A route match is valid **only if**:

> `sequence_no(from_stop) < sequence_no(to_stop)`
> for the same `route_number + direction`

This avoids the classic bug where a route is returned just because it contains both stops, even if the bus would reach the “to” stop before the “from” stop in that direction.

---

## Project structure

```
backend/
  app/
    main.py
    api/
      v1/
        health.py
        stops.py
        routes.py
    schemas/
      stops.py
      routes.py
    services/
      route_service.py
    repositories/
      stops_repo.py
      routes_repo.py
    db/
      session.py
      models.py
    core/
      config.py
      cors.py
      logging.py
  tests/
    test_health.py
    test_stops.py
    test_routes.py
  requirements.txt
  .env.example
  README.md
```

### Why this structure (what experienced devs do)

* `api/` = HTTP endpoints only (thin controllers)
* `schemas/` = request/response models (typed contracts)
* `services/` = business logic (route ordering, normalization)
* `repositories/` = DB queries only (SQL isolated)
* `db/` = connection + models
* `core/` = config, CORS, logging
* `tests/` = basic correctness & regression tests

This separation makes the code maintainable and easy to explain in interviews.

---

## API endpoints (v1)

### 1) Health check

**GET** `/v1/health`

Purpose:

* Confirms service is up
* Used by monitoring / deployments

Returns:

```json
{ "status": "ok" }
```

---

### 2) Stop autocomplete

**GET** `/v1/stops?query=isb&limit=10`

Purpose:

* Frontend autocomplete for stop input
* Prevents hardcoding stop list in frontend

Returns:

```json
{
  "query": "isb",
  "results": [
    { "id": 101, "name": "ISBT Sector 43" },
    { "id": 102, "name": "ISBT-17" }
  ]
}
```

---

### 3) Route search (Stop A → Stop B)

**POST** `/v1/routes/search`

Request:

```json
{
  "from_stop": "Kharar",
  "to_stop": "ISBT Sector 43"
}
```

Response (example):

```json
[
  {
    "route_number": "20",
    "direction": "DOWN",
    "from_sequence": 1,
    "to_sequence": 10,
    "stops_between": [
      "Kharar",
      "Sante Majra",
      "Chappar Chiri",
      "ISBT Sector 43"
    ]
  }
]
```

Notes:

* `stops_between` is optional (nice UI feature).
* The main correctness contract is `from_sequence < to_sequence`.

---

### 4) Route details (full stop list)

**GET** `/v1/routes/{route_number}/{direction}`

Example:
`GET /v1/routes/20/DOWN`

Returns:

```json
{
  "route_number": "20",
  "direction": "DOWN",
  "stops": [
    { "sequence_no": 1, "name": "Kharar" },
    { "sequence_no": 2, "name": "Sante Majra" }
  ]
}
```

---

## Database design (minimal + correct)

You can use MySQL or PostgreSQL. PostgreSQL is preferred for better text search, but not required.

### Tables

#### `stops`

* `id` (PK)
* `name` (unique)

Index:

* index on `name` (for autocomplete)

#### `routes`

* `id` (PK)
* `route_number` (string, supports “20A”, “35B”)
* `direction` (UP/DOWN)

Constraint:

* unique (`route_number`, `direction`)

#### `route_stops`

* `route_id` (FK → routes)
* `stop_id` (FK → stops)
* `sequence_no` (int)

Constraints:

* unique (`route_id`, `sequence_no`)
* unique (`route_id`, `stop_id`)

Indexes:

* (`route_id`, `sequence_no`) for route rendering
* (`stop_id`) for finding routes containing a stop

---

## Data ingestion (how data enters DB)

You will extract route data (legally/with permission) and normalize it into a clean import format.

### Recommended import format (per route-direction)

Example JSON:

```json
{
  "route_number": "20",
  "direction": "DOWN",
  "stops": [
    "Kharar",
    "Sante Majra",
    "Chappar Chiri",
    "ISBT Sector 43"
  ]
}
```

Import script responsibilities:

1. Upsert route (`route_number + direction`)
2. Upsert stops (unique by name)
3. Insert route_stops with `sequence_no` starting at 1
4. Be idempotent: re-run without duplicates

Normalization rules (important):

* trim whitespace
* collapse multiple spaces
* keep consistent naming (“ISBT Sector 43” vs “ISBT-43” mapping if needed)

---

## Local development setup

### 1) Create venv and install deps

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) Configure environment

Copy:

```bash
cp .env.example .env
```

Example `.env` values:

```
APP_ENV=local
DB_HOST=localhost
DB_PORT=3306
DB_NAME=buslens
DB_USER=buslens_user
DB_PASSWORD=buslens_password
CORS_ORIGINS=http://localhost:5173
```

### 3) Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

Open:

* Swagger docs: `http://localhost:8000/docs`
* Health: `http://localhost:8000/v1/health`

---

## Testing

Run:

```bash
pytest -q
```

Minimum tests (we will keep it simple but meaningful):

* health endpoint returns ok
* stops endpoint returns suggestions
* route search enforces stop order correctness
* invalid inputs return correct HTTP errors

---

## Deployment (AWS overview)

### Recommended AWS layout (simple + professional)

* **API Gateway** → **Lambda** (FastAPI via Mangum adapter)
* **RDS (MySQL/Postgres)** for persistent data
* **RDS Proxy** (important): prevents DB connection storms from Lambda scaling
* **Secrets Manager**: stores DB credentials
* **CloudWatch Logs**: logging and monitoring
* **CORS** locked to your frontend domain (CloudFront)

Security notes:

* DB should not be public
* Secrets should not be stored in code or frontend
* API Gateway throttling / usage plans can limit abuse
* CORS must not be `*` in production

---

## What we are building next (planned milestones)

### Phase 1 — Make backend run cleanly

* Base FastAPI app + routers
* Health endpoint
* Stop autocomplete endpoint
* Route search endpoint (initial)

### Phase 2 — Correctness & data model

* Add/confirm `route_stops.sequence_no`
* Enforce `from_sequence < to_sequence` in search query
* Add route details endpoint

### Phase 3 — Import pipeline

* Implement import script for route-direction JSON files
* Ensure idempotent upserts

### Phase 4 — Interview polish

* Add minimal tests
* Add structured logging
* Add clear README + architecture notes

---

## Interview talking points (use these lines)

* “I separated API, service, and repository layers for maintainability.”
* “I fixed route search correctness using ordered stop sequences.”
* “I built stop autocomplete as an API to avoid hardcoded lists in frontend.”
* “I designed AWS deployment with API Gateway + Lambda, and used RDS Proxy + Secrets Manager for production-safe DB access.”
* “The API is fully typed with OpenAPI docs and basic tests.”

---

