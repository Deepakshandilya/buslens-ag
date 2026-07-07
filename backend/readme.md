# BusLens Backend

A FastAPI service powering real-time bus route discovery for the Chandigarh Tricity region.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://python.org)
[![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=flat&logo=amazonaws)](https://aws.amazon.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Overview

BusLens lets commuters find valid bus routes between any two stops in Chandigarh, Mohali, and Panchkula. The core correctness guarantee:

> A route is returned **only if** the departure stop appears before the destination stop in that route's direction — not just if both stops exist on the route.

This prevents the common bug where a bus route is suggested even though the passenger would need to travel in reverse.

---

## Architecture

```
api/          →   HTTP layer only (thin controllers, no logic)
schemas/      →   Typed request/response contracts (Pydantic)
services/     →   Business logic (route ordering, normalization)
repositories/ →   SQL queries only (isolated from business logic)
db/           →   Connection pool, ORM models
core/         →   Config, CORS, structured logging
tests/        →   Integration and unit tests
```

```
backend/
├── app/
│   ├── main.py
│   ├── api/v1/
│   │   ├── health.py
│   │   ├── stops.py
│   │   └── routes.py
│   ├── schemas/
│   │   ├── stops.py
│   │   └── routes.py
│   ├── services/
│   │   └── route_service.py
│   ├── repositories/
│   │   ├── stops_repo.py
│   │   └── routes_repo.py
│   ├── db/
│   │   ├── session.py
│   │   └── models.py
│   └── core/
│       ├── config.py
│       ├── cors.py
│       └── logging.py
└── tests/
    ├── test_health.py
    ├── test_stops.py
    └── test_routes.py
```

---

## API Reference

Full interactive docs available at `/docs` (Swagger) and `/redoc` when running locally.

### Health

```
GET /v1/health
```
```json
{ "status": "ok" }
```

---

### Stop Autocomplete

```
GET /v1/stops?query=isb&limit=10
```
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

### Route Search

```
POST /v1/routes/search
```

Request:
```json
{
  "from_stop": "Kharar",
  "to_stop": "ISBT Sector 43"
}
```

Response:
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

---

### Route Details

```
GET /v1/routes/{route_number}/{direction}
```

Example: `GET /v1/routes/20/DOWN`

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

## Database Schema

### `stops`
| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| name | varchar, unique | Indexed for autocomplete |

### `routes`
| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| route_number | varchar | Supports alphanumeric (20A, 35B) |
| direction | enum(UP, DOWN) | |

Constraint: unique(`route_number`, `direction`)

### `route_stops`
| Column | Type | Notes |
|--------|------|-------|
| route_id | FK → routes | |
| stop_id | FK → stops | |
| sequence_no | int | Enforces stop ordering |

Indexes: (`route_id`, `sequence_no`), (`stop_id`)

---

## Local Setup

```bash
# 1. Clone and create virtual environment
git clone https://github.com/Deepakshandilya/buslens-ag
cd buslens-ag/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Set DB_PATH=buslens.db in .env

# 3. Create database
sqlite3 buslens.db < migrations/schema.sqlite.sql

# 4. Run
uvicorn app.main:app --reload --port 8000
```

Swagger UI: `http://localhost:8000/docs`

---

## Data Import

Routes are ingested from structured JSON files:

```json
{
  "route_number": "20",
  "direction": "DOWN",
  "stops": ["Kharar", "Sante Majra", "Chappar Chiri", "ISBT Sector 43"]
}
```

The import script handles upserts idempotently — safe to re-run without creating duplicates. Stop names are normalised (whitespace trimmed, consistent casing) before insert.

```bash
python scripts/import_routes.py path/to/routes.json
```

---

## Tests

```bash
pytest -q
```

Covers: health endpoint, stop autocomplete, route ordering correctness, invalid input handling.

---

## Deployment

Deployed on **AWS EC2** (Ubuntu 22.04) with Gunicorn managed by **systemd**, behind **Nginx** with SSL.

### Infrastructure

| Component | Service | Role |
|-----------|---------|------|
| Compute | AWS EC2 (t3.micro) | Hosts backend process |
| Database | SQLite (on EC2 disk) | Persistent route, stop, and user data |
| Process Manager | systemd + Gunicorn | Auto-start, crash recovery |
| Reverse Proxy | Nginx | Routes `/api/` → `localhost:8000`, SSL termination |
| SSL | Let's Encrypt (Certbot) | HTTPS certificates, auto-renewal |
| CI/CD | GitHub Actions | Auto-deploy on push to `main` |

### systemd Service

Gunicorn runs as a systemd unit at `/etc/systemd/system/fastapi.service`:

```ini
[Unit]
Description=BusLens FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/buslens-ag/backend
ExecStart=/home/ubuntu/buslens-ag/backend/venv/bin/gunicorn \
    -w 2 \
    -k uvicorn.workers.UvicornWorker \
    app.main:app \
    --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

> **Note:** Use the full venv path to Gunicorn — not the system-level binary.

### Nginx Routing

Nginx routes `/api/` traffic to the backend:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

CORS is locked to the production frontend domain. The SQLite database file lives on the EC2 instance disk.

### CI/CD

Every push to `main` triggers a GitHub Actions workflow that SSHes into EC2:

```bash
cd ~/buslens-ag/backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart fastapi
```

### Useful Commands

```bash
# Status & logs
sudo systemctl status fastapi
sudo journalctl -u fastapi -n 100

# Restart
sudo systemctl restart fastapi

# Test Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### Known Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Backend not starting | 502 Bad Gateway | Use full venv path in systemd `ExecStart` |
| CI/CD SSH failure | `no key found` | Ensure private key (not public) is in GitHub Secrets |

For the complete deployment guide (EC2 setup, swap file, DNS, SSL, and more), see [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).

---

