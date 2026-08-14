# ${{ values.name }}

${{ values.description }}

**Owner:** ${{ values.owner }} · **Stack:** FastAPI · SQLAlchemy async · PostgreSQL · Alembic

---

## Getting started

### Prerequisites

- Python 3.11+
- PostgreSQL running locally (or use any hosted instance)

### Setup

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to point to your PostgreSQL instance

# 4. Run migrations (creates tables)
alembic upgrade head

# 5. Start the server
uvicorn app.main:app --reload --port ${{ values.port }}
```

Open [http://localhost:${{ values.port }}/docs](http://localhost:${{ values.port }}/docs) for the interactive Swagger UI.

---

## Project structure

```
app/
├── core/
│   ├── config.py         # Settings (pydantic-settings, reads from .env)
│   ├── database.py       # Async SQLAlchemy engine + session factory
│   └── deps.py           # FastAPI dependency: DB session
├── modules/
│   └── ${{ values.moduleName }}/    # Example domain module — copy this pattern for new domains
│       ├── models.py     # SQLAlchemy ORM model
│       ├── schemas.py    # Pydantic request/response schemas
│       ├── repository.py # Database queries (raw SQLAlchemy)
│       ├── service.py    # Business logic (calls repository)
│       └── router.py     # FastAPI routes (calls service)
├── shared/
│   └── exceptions.py     # Common HTTP exceptions
└── main.py               # App factory — registers routers, CORS, lifespan
alembic/                  # Database migrations
tests/                    # Pytest test suite
```

**Layering rule:** `router → service → repository → database`. Never import from a layer above you.

---

## Adding a new domain module

1. Create `app/modules/<domain>/` with the same 5 files as the example module.
2. Register the router in `app/main.py`:
   ```python
   from app.modules.<domain>.router import router as <domain>_router
   app.include_router(<domain>_router, prefix="/api/v1")
   ```
3. Create and apply a migration:
   ```bash
   alembic revision --autogenerate -m "add <domain> table"
   alembic upgrade head
   ```

---

## Available endpoints

Base URL: `http://localhost:${{ values.port }}/api/v1`

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/users/` | List users (paginated) |
| `POST` | `/users/` | Create a user |
| `GET` | `/users/{id}` | Get a user by ID |
| `PATCH` | `/users/{id}` | Update a user |
| `DELETE` | `/users/{id}` | Delete a user |

Full interactive docs at [http://localhost:${{ values.port }}/docs](http://localhost:${{ values.port }}/docs).

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/${{ values.moduleName }}` | PostgreSQL connection string |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed frontend origins |
| `SECRET_KEY` | `change-me-in-production` | Used for signing tokens |
| `DEBUG` | `true` | Enables SQLAlchemy query logging |

---

## Database migrations

```bash
# Create a new migration after changing models
alembic revision --autogenerate -m "describe your change"

# Apply pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1

# Show migration history
alembic history
```

---

## Running tests

```bash
# Make sure .venv is active
pytest
```

---

## Running with Docker (optional)

A `Dockerfile` and `docker-compose.yml` are included if you prefer containers. Docker Compose starts both the API and a PostgreSQL database together:

```bash
docker compose up
```

The API will be available at `http://localhost:${{ values.port }}/docs`. Tables are created automatically on first boot.

---

## Backstage catalog

This service is registered in the NiFo IDP catalog at `catalog-info.yaml`. View it in the [Backstage portal](http://localhost:3000) under **Catalog**.
