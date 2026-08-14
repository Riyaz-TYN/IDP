# ${{ values.name }}

${{ values.description }}

**Owner:** ${{ values.owner }} · **Stack:** FastAPI · SQLAlchemy async · PostgreSQL · Docker

---

## Getting started

```bash
docker compose up
```

Open [http://localhost:${{ values.port }}/docs](http://localhost:${{ values.port }}/docs) for the interactive Swagger UI.

Docker Compose starts both the API and a PostgreSQL database. Tables are created automatically on first boot.

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
3. Create a migration:
   ```bash
   docker compose exec api alembic revision --autogenerate -m "add <domain> table"
   docker compose exec api alembic upgrade head
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

Copy `.env.example` to `.env` and fill in your values (only needed for running outside Docker):

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/${{ values.moduleName }}` | PostgreSQL connection string |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed frontend origins |
| `SECRET_KEY` | `change-me-in-production` | Used for signing tokens |
| `DEBUG` | `true` | Enables debug mode |

When running via `docker compose up`, these are set automatically in `docker-compose.yml`.

---

## Running without Docker (local Python)

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up the database (you need a running PostgreSQL instance)
cp .env.example .env             # edit DATABASE_URL to point to your local DB

# 4. Run migrations
alembic upgrade head

# 5. Start the server
uvicorn app.main:app --reload --port ${{ values.port }}
```

---

## Database migrations

All migration commands run inside the Docker container:

```bash
# Create a new migration after changing models
docker compose exec api alembic revision --autogenerate -m "describe your change"

# Apply pending migrations
docker compose exec api alembic upgrade head

# Roll back one migration
docker compose exec api alembic downgrade -1

# Show migration history
docker compose exec api alembic history
```

---

## Running tests

```bash
# Inside Docker
docker compose exec api pytest

# Locally (after activating venv)
pytest
```

---

## Backstage catalog

This service is registered in the NiFo IDP catalog at `catalog-info.yaml`. View it in the [Backstage portal](http://localhost:3000) under **Catalog**.
