# NiFo IDP — The Yellow Network Internal Developer Portal

A Backstage-based Internal Developer Portal for The Yellow Network (TYN). Teams log in with shared credentials, scaffold new Next.js and FastAPI projects, manage team members, and track all projects in a software catalog.

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Project Structure](#2-project-structure)
3. [Running Locally](#3-running-locally)
4. [Team Login & Management](#4-team-login--management)
5. [Creating a Project (Scaffolder)](#5-creating-a-project-scaffolder)
6. [Umbrella Repo & Labs Structure](#6-umbrella-repo--labs-structure)
7. [Design System (nifo-shared-ui)](#7-design-system-nifo-shared-ui)
8. [Migrating to AWS CodeCommit](#8-migrating-to-aws-codecommit)
9. [Migrating to AWS IAM Authentication](#9-migrating-to-aws-iam-authentication)
10. [Migrating to a Cloud Database (PostgreSQL)](#10-migrating-to-a-cloud-database-postgresql)
11. [Environment Variables Reference](#11-environment-variables-reference)

---

## 1. What This Is

| Feature | Status | Notes |
|---|---|---|
| Team credential login | ✅ Done | Custom login gate — each team has a shared username + password |
| Sign Out | ✅ Done | Sign Out button in sidebar bottom — clears session |
| Team & member management UI | ✅ Done | `/teams` — all teams view-only; `platform-admin` has full edit access |
| Platform admin role | ✅ Done | `platform-admin` group controls team CRUD; set via `credentialsAuth.adminGroupId` |
| Next.js scaffolder template | ✅ Done | Next.js 15, Tailwind, shadcn/ui, TanStack Query, Zustand — runs with `npm install && npm run dev` |
| FastAPI scaffolder template | ✅ Done | FastAPI, SQLAlchemy async, Alembic, PostgreSQL — runs with `.venv` + uvicorn |
| Umbrella repo (git submodules) | ✅ Done | Every new project auto-added to `Riyaz-TYN/Umberella-Repo` under `labs/` |
| Backstage catalog | ✅ Done | All projects registered; teams/members in `catalog/org.yaml` |
| NiFo design theme | ✅ Done | `#0070C0` blue, `#10233F` navy sidebar — consistent across portal + generated apps |
| GitHub integration | ✅ Done | Repos created privately under `Riyaz-TYN` |
| AWS CodeCommit integration | 🔲 Pending | Section 8 — 7 files to change |
| AWS IAM authentication | 🔲 Pending | Section 9 — replaces LoginGate with Cognito/SSO |

---

## 2. Project Structure

```
nifo-refractor/                  ← Backstage monorepo root
├── app-config.yaml              ← Main config (committed — no secrets)
├── app-config.local.yaml        ← Local secrets — gitignored (never commit)
├── app-config.production.yaml   ← Production overrides (PostgreSQL, env vars)
├── catalog/
│   └── org.yaml                 ← TYN team & user entities for the Backstage catalog
├── scripts/
│   └── migrate-to-postgres.js   ← Migrates tyn_teams + tyn_members from SQLite to PostgreSQL
├── templates/
│   ├── nextjs-template/
│   │   ├── template.yaml        ← Scaffolder template definition
│   │   └── skeleton/            ← Files copied into every generated Next.js app
│   └── fastapi-template/
│       ├── template.yaml
│       └── skeleton/            ← Files copied into every generated FastAPI service
├── packages/
│   ├── app/                     ← Backstage frontend (React, port 3000)
│   │   └── src/
│   │       ├── App.tsx          ← Registers feature modules (catalog, nav, theme, teams)
│   │       ├── index.tsx        ← Entry point — wraps app with LoginGate
│   │       └── modules/
│   │           ├── auth/        ← LoginGate (login form + session), getSession()
│   │           ├── nav/         ← Sidebar with Sign Out button
│   │           ├── teams/       ← Teams page (/teams) — admin edit, others read-only
│   │           └── theme/       ← NiFo light theme
│   └── backend/                 ← Backstage backend (Node.js, port 7007)
│       └── src/
│           ├── index.ts         ← Registers all backend plugins
│           ├── auth/
│           │   └── credentialsModule.ts  ← Login API, team CRUD, SQLite storage, isAdmin flag
│           └── actions/
│               └── gitSubmodule.ts       ← Custom scaffolder action: monorepo:submodule:add
└── packages/backend/db/         ← SQLite files (gitignored, auto-created on first run)
```

**Separate repos (on the same machine):**

```
E:/nifo-ref/umbrella/            ← Riyaz-TYN/Umberella-Repo (cloned separately)
└── labs/
    ├── frontend/                ← Every Next.js app added here as a git submodule
    └── backend/                 ← Every FastAPI service added here as a git submodule

E:/nifo-ref/nifo-shared-ui/      ← VarshiniRameshTYN/nifo-shared-ui (reference only)
├── src/global.css               ← CSS variables baked into Next.js skeleton
└── tailwind.config.ts           ← Tailwind tokens baked into Next.js skeleton
```

---

## 3. Running Locally

### Prerequisites

- **Node.js 20+**
- **Yarn** — install via Corepack: `corepack enable && corepack prepare yarn@stable --activate`
- **Git**

### Step 1 — Clone and install

```bash
git clone git@github.com:Riyaz-TYN/IDP.git nifo-refractor
cd nifo-refractor
yarn install
```

### Step 2 — Create your local config file

Create `app-config.local.yaml` in the project root. **This file is gitignored — never commit it.** Share passwords through a secure channel (direct message or password manager), not by sending this file.

```yaml
credentialsAuth:
  teams:
    - username: team-alpha
      password: "tyn@alpha2026"
      groupId: team-alpha
      displayName: Team Alpha
      members: ["Member 1", "Member 2", "Member 3", "Member 4"]
    - username: team-beta
      password: "tyn@beta2026"
      groupId: team-beta
      displayName: Team Beta
      members: ["Member 1", "Member 2", "Member 3", "Member 4"]
    - username: team-gamma
      password: "tyn@gamma2026"
      groupId: team-gamma
      displayName: Team Gamma
      members: ["Member 1", "Member 2", "Member 3", "Member 4"]
    - username: team-delta
      password: "tyn@delta2026"
      groupId: team-delta
      displayName: Team Delta
      members: ["Member 1", "Member 2", "Member 3", "Member 4"]
    - username: team-epsilon
      password: "tyn@epsilon2026"
      groupId: team-epsilon
      displayName: Team Epsilon
      members: ["Member 1", "Member 2", "Member 3", "Member 4"]

integrations:
  github:
    - host: github.com
      token: YOUR_GITHUB_PAT_HERE   # see "Rotating GitHub credentials" below

catalog:
  locations:
    - type: file
      target: C:/absolute/path/to/nifo-refractor/examples/entities.yaml
    - type: file
      target: C:/absolute/path/to/nifo-refractor/examples/template/template.yaml
      rules:
        - allow: [Template]
    - type: file
      target: C:/absolute/path/to/nifo-refractor/templates/react-template/template.yaml
      rules:
        - allow: [Template]
    - type: file
      target: C:/absolute/path/to/nifo-refractor/templates/nextjs-template/template.yaml
      rules:
        - allow: [Template]
    - type: file
      target: C:/absolute/path/to/nifo-refractor/templates/fastapi-template/template.yaml
      rules:
        - allow: [Template]
    - type: file
      target: C:/absolute/path/to/nifo-refractor/examples/org.yaml
      rules:
        - allow: [User, Group]
    - type: file
      target: C:/absolute/path/to/nifo-refractor/catalog/org.yaml
      rules:
        - allow: [User, Group]
```

> **Important:** Replace `C:/absolute/path/to/nifo-refractor` with the actual full path on your machine (e.g. `E:/nifo-ref/nifo-refractor` on Windows, `/home/user/nifo-refractor` on Linux). Relative paths do not work in `catalog.locations`.

### Step 3 — Start the portal

```bash
yarn start
```

This starts both the frontend (port 3000) and the backend (port 7007). Open [http://localhost:3000](http://localhost:3000) — you will see the NiFo login screen.

> The SQLite databases are created automatically in `packages/backend/db/` on first run. Teams listed in `app-config.local.yaml` are seeded into the database **on first boot only**. After that, all team management is done through the `/teams` UI — no restarts needed.

### Step 4 — Create the platform-admin account (first time only)

The `platform-admin` account is the admin account that can create, edit, and delete teams. It is not seeded from config — create it via the API once after the first boot:

```bash
curl -s -X POST http://localhost:7007/api/credentials-auth/teams \
  -H "Content-Type: application/json" \
  -d '{"groupId":"platform-admin","username":"platform-admin","password":"YOUR_ADMIN_PASSWORD","displayName":"Platform Admin","members":["Your Name"]}'
```

Or log in as any team, go to `/teams`, and click **+ New Team** — set the Group ID to `platform-admin` exactly (it must match `credentialsAuth.adminGroupId` in `app-config.yaml`).

### What to share with a new developer

| What | How |
|---|---|
| **Codebase** | `git clone git@github.com:Riyaz-TYN/IDP.git` |
| **Team passwords** | Share verbally or via a password manager — never the file |
| **GitHub PAT** | Each developer generates their own (see below) |
| **`app-config.local.yaml`** | Never share this file — share the template above, let them fill in their own paths and token |

### Rotating GitHub credentials

The scaffolder uses a GitHub PAT to create repos and push to the umbrella repo. When you see `HttpError: Bad credentials` in scaffolder logs:

1. Go to **github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Set an expiry. Required scopes: ✅ `repo` (all sub-items) and ✅ `workflow`
4. Copy the token immediately (shown only once)
5. Open `app-config.local.yaml`, replace the value under `integrations.github[0].token`
6. Restart `yarn start` — the new token takes effect immediately
7. Revoke the old token from the GitHub settings page

### Rotating AWS CodeCommit credentials (after migration)

See section 8 — [Migrating to AWS CodeCommit](#8-migrating-to-aws-codecommit) for the three credential options (IAM access keys, IAM role, HTTPS Git credentials).

---

## 4. Team Login & Management

### How login works

The portal uses a custom login gate. There is no Backstage guest session — every user must log in with a team username and password. Session is stored in `sessionStorage` and cleared when the browser tab closes or when the user clicks **Sign Out** in the sidebar.

### Default team credentials

These are seeded on first boot from `app-config.local.yaml`. Update passwords in that file before first run, or change them via the API after.

| Team | Username | Default Password |
|---|---|---|
| Team Alpha | `team-alpha` | `tyn@alpha2026` |
| Team Beta | `team-beta` | `tyn@beta2026` |
| Team Gamma | `team-gamma` | `tyn@gamma2026` |
| Team Delta | `team-delta` | `tyn@delta2026` |
| Team Epsilon | `team-epsilon` | `tyn@epsilon2026` |
| Platform Admin | `platform-admin` | *(set when creating the account — see Step 4 above)* |

### Admin vs. regular team access

| Role | Teams page | Create team | Delete team | Add/remove members |
|---|---|---|---|---|
| `platform-admin` | ✅ View all | ✅ Yes | ✅ Yes | ✅ Yes |
| Any other team | ✅ View all | ❌ No | ❌ No | ❌ No |

The admin group is configured in `app-config.yaml`:

```yaml
credentialsAuth:
  adminGroupId: platform-admin   # change this to promote a different group to admin
```

To change which group is admin: update `adminGroupId` in `app-config.yaml` and restart `yarn start`. No code changes needed.

### Managing teams (platform-admin only)

Log in as `platform-admin`, then go to **Teams** in the sidebar.

**Create a new team** — click **+ New Team**, fill in Team Name, Group ID (e.g. `team-zeta`), Login Username, and Password. Add members and click **Create Team**.

**Add a member** — type the member's name in the input on the team card and press Enter or click Add.

**Remove a member** — click the **×** on a member chip.

**Delete a team** — click **Delete** on the card, confirm with **Yes**.

All changes are saved to SQLite immediately and survive restarts.

### Updating the Backstage catalog

The Backstage catalog (what appears under **Catalog → Groups**) reads from `catalog/org.yaml`. The Teams page reads from the SQLite database. These are separate — edit `catalog/org.yaml` manually for real team names and restart once.

---

## 5. Creating a Project (Scaffolder)

Click **Create** in the sidebar and pick a template.

### Next.js Frontend (Modular Monolith)

What is created automatically when you fill in the form:

1. A private GitHub repo under `Riyaz-TYN/<app-name>`
2. NiFo design system baked in (Tailwind tokens, CSS variables, shadcn/ui components)
3. Modular project structure ready to extend:
   ```
   src/
   ├── app/             ← Next.js App Router (routing only — layouts + pages)
   ├── features/        ← One folder per domain (e.g. features/billing/)
   ├── components/
   │   ├── ui/          ← Button, Badge, Card, Input, Label (shadcn/ui)
   │   └── layout/      ← TYN Navbar
   └── lib/             ← Axios instance, cn() utility
   ```
4. Registered in the Backstage catalog under the chosen owner team
5. Added as a git submodule to `labs/frontend/<app-name>` in the umbrella repo

**To run the generated app:**

```bash
git clone https://github.com/Riyaz-TYN/<app-name>
cd <app-name>
npm install
npm run dev
# Open http://localhost:3000
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to your FastAPI backend URL.

### FastAPI Backend (Modular Monolith)

What is created automatically:

1. A private GitHub repo under `Riyaz-TYN/<service-name>`
2. Modular domain structure with strict layering (router → service → repository → database):
   ```
   app/
   ├── core/            ← config (pydantic-settings), database (SQLAlchemy async), deps
   ├── modules/
   │   └── <domain>/    ← models, schemas, repository, service, router
   └── shared/          ← common exceptions
   ```
3. Alembic migrations pre-configured, example users module included
4. Added as a git submodule to `labs/backend/<service-name>` in the umbrella repo

**To run the generated service:**

```bash
git clone https://github.com/Riyaz-TYN/<service-name>
cd <service-name>

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL instance

# Run migrations (creates tables)
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000

# Open http://localhost:8000/docs  (Swagger UI)
```

> **Docker is optional.** A `Dockerfile` and `docker-compose.yml` are included if you prefer containers — `docker compose up` starts the API and a PostgreSQL database together. But the default path is `.venv` + uvicorn above.

---

## 6. Umbrella Repo & Labs Structure

**Remote:** `https://github.com/Riyaz-TYN/Umberella-Repo`

Every project scaffolded through the IDP is automatically added as a git submodule:

```
Umberella-Repo/
└── labs/
    ├── frontend/
    │   ├── billing-portal/     ← submodule → github.com/Riyaz-TYN/billing-portal
    │   ├── dashboard-ui/       ← submodule → github.com/Riyaz-TYN/dashboard-ui
    │   └── ...
    └── backend/
        ├── user-service/       ← submodule → github.com/Riyaz-TYN/user-service
        └── ...
```

### Cloning all projects (for a new developer)

```bash
# Clone umbrella repo with all submodules at once
git clone --recurse-submodules https://github.com/Riyaz-TYN/Umberella-Repo

# If you already cloned without --recurse-submodules
git submodule update --init --recursive

# Pull latest commits from all submodules
git submodule update --remote
```

### How the auto-submodule works

The custom scaffolder action `monorepo:submodule:add` in `packages/backend/src/actions/gitSubmodule.ts`:

1. Clones the umbrella repo into a temporary directory
2. Runs `git submodule add <new-repo-url> labs/frontend/<name>` (or `labs/backend/<name>` for FastAPI)
3. Commits: `feat: auto-added submodule for labs/frontend/<name>`
4. Pushes back to the umbrella repo using the GitHub token from `integrations.github[].token`

The `.gitmodules` file in the umbrella repo always uses plain HTTPS URLs (no embedded tokens).

---

## 7. Design System (nifo-shared-ui)

**Source:** `https://github.com/VarshiniRameshTYN/nifo-shared-ui`

The design system is copied directly into each generated Next.js skeleton at scaffold time — no npm package dependency. Teams get the full design system on `npm install` with no additional setup.

**Files baked into every generated Next.js app:**

| File in skeleton | Purpose |
|---|---|
| `tailwind.config.ts` | Brand tokens, typography scale, custom utilities |
| `src/app/globals.css` | CSS custom properties (used by Tailwind + raw CSS) |
| `src/components/ui/button.tsx` | Button with `default`, `outline`, `ghost` variants |
| `src/components/ui/badge.tsx` | Badge with `default`, `outline`, `secondary` variants |
| `src/components/ui/card.tsx` | Card with header, content, footer sub-components |
| `src/components/layout/Navbar.tsx` | TYN navbar — navy background, cyan logo icon |

**Brand tokens:**

| Token | Value | Used for |
|---|---|---|
| Primary blue | `#0070C0` | Buttons, links, active states |
| Brand navy | `#10233F` | Navbar, sidebar, headings |
| Brand cyan | `#22D3EE` | Accent on dark backgrounds |
| Surface/page | `#f7f9fc` | Page background |
| Border radius | `1rem` | Cards, buttons, inputs |

The Backstage portal itself uses the same palette, applied via the NiFo Unified Theme in `packages/app/src/modules/theme/index.ts`.

**When nifo-shared-ui is updated:** copy the new `tailwind.config.ts` and `global.css` into `templates/nextjs-template/skeleton/` and update the hex values in `packages/app/src/modules/theme/index.ts`. Future plan: publish to AWS CodeArtifact as an npm package.

---

## 8. Migrating to AWS CodeCommit

Do these in order. All changes are reversible if something goes wrong before the final push.

### Step 1 — Swap the scaffolder backend module

```bash
yarn workspace backend add @backstage/plugin-scaffolder-backend-module-aws-codestar
yarn workspace backend remove @backstage/plugin-scaffolder-backend-module-github
```

### Step 2 — `packages/backend/src/index.ts`

```typescript
// Remove:
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));

// Add:
backend.add(import('@backstage/plugin-scaffolder-backend-module-aws-codestar'));
```

### Step 3 — `app-config.yaml`: swap integrations block

```yaml
# Remove:
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

# Add:
integrations:
  awsCodeCommit:
    - host: git-codecommit.ap-south-1.amazonaws.com
      region: ap-south-1
      # IAM role (recommended for EC2/ECS — no keys needed):
      # roleArn: arn:aws:iam::ACCOUNT_ID:role/BackstageCodeCommitRole
      # Access keys (local dev only):
      accessKeyId: ${AWS_ACCESS_KEY_ID}
      secretAccessKey: ${AWS_SECRET_ACCESS_KEY}
```

### Step 4 — `templates/nextjs-template/template.yaml`

```yaml
# Before:
- id: publish
  action: publish:github
  input:
    repoUrl: github.com?repo=${{ parameters.name }}&owner=Riyaz-TYN
    defaultBranch: main
    repoVisibility: private

- id: add-to-umbrella
  action: monorepo:submodule:add
  input:
    repoUrl: https://github.com/Riyaz-TYN/Umberella-Repo.git

# After:
- id: publish
  action: publish:awsCodeCommit
  input:
    repoUrl: aws.amazon.com?repo=${{ parameters.name }}&region=ap-south-1
    defaultBranch: main

- id: add-to-umbrella
  action: monorepo:submodule:add
  input:
    repoUrl: https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/Umberella-Repo
```

### Step 5 — `templates/fastapi-template/template.yaml`

Same changes as Step 4. The `submodulePath: labs/backend/${{ parameters.name }}` line stays unchanged.

### Step 6 — `packages/backend/src/actions/gitSubmodule.ts`: swap auth

```typescript
// Remove (GitHub token injection):
const integration = integrations.github.byUrl(repoUrl);
const githubToken = integration?.config?.token;
const authenticatedRepoUrl = repoUrl.replace('https://', `https://${githubToken}@`);
const gitConfig = [
  `url.https://${githubToken}@github.com.insteadOf=https://github.com`,
  ...
];

// Add (AWS credential helper — requires aws-cli on the server):
const authenticatedRepoUrl = repoUrl;
const gitConfig = [
  'credential.helper=!aws codecommit credential-helper $@',
  'credential.UseHttpPath=true',
  'user.name=Backstage Scaffolder',
  'user.email=scaffolder@backstage.io',
];
```

Also remove the `ScmIntegrations` import and the `integrations` parameter from `createGitSubmoduleAction`.

### Files changed summary

| File | Change |
|---|---|
| `packages/backend/package.json` | Remove github module, add aws-codestar module |
| `packages/backend/src/index.ts` | Swap one `backend.add(...)` line |
| `packages/backend/src/actions/gitSubmodule.ts` | Replace GitHub token auth with AWS credential helper |
| `app-config.yaml` | Replace `integrations.github` with `integrations.awsCodeCommit` |
| `app-config.local.yaml` | Replace `GITHUB_TOKEN` with `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| `templates/nextjs-template/template.yaml` | `publish:github` → `publish:awsCodeCommit`, update umbrella URL |
| `templates/fastapi-template/template.yaml` | Same as above |

`catalog/org.yaml` — no changes needed.

### CodeCommit credential options

| Option | When to use | What to set |
|---|---|---|
| **IAM access keys** | Local dev, no EC2 role | `accessKeyId` + `secretAccessKey` in config |
| **IAM role** | EC2/ECS in production | `roleArn` in config, AWS rotates creds automatically |
| **HTTPS Git credentials** | Per-user alternative to access keys | Same fields as access keys — get them from IAM console → Security credentials |

---

## 9. Migrating to AWS IAM Authentication

The LoginGate is a temporary measure. When switching to Cognito / AWS SSO:

### Step 1 — Add the auth module

```bash
# AWS ALB (load balancer handles auth):
yarn workspace backend add @backstage/plugin-auth-backend-module-aws-alb

# Or Cognito / generic OIDC:
yarn workspace backend add @backstage/plugin-auth-backend-module-oidc
```

In `packages/backend/src/index.ts`:

```typescript
backend.add(import('@backstage/plugin-auth-backend-module-aws-alb'));
// or:
backend.add(import('@backstage/plugin-auth-backend-module-oidc'));
```

### Step 2 — `app-config.yaml`: update auth providers

```yaml
# Remove:
auth:
  providers:
    guest: {}

# Add (Cognito OIDC example):
auth:
  environment: production
  providers:
    oidc:
      production:
        metadataUrl: https://cognito-idp.ap-south-1.amazonaws.com/YOUR_POOL_ID/.well-known/openid-configuration
        clientId: ${COGNITO_CLIENT_ID}
        clientSecret: ${COGNITO_CLIENT_SECRET}
        scope: openid profile email
        callbackUrl: https://your-idp-domain.com/api/auth/oidc/handler/frame
```

### Step 3 — `packages/app/src/index.tsx`: remove LoginGate

```typescript
// Current:
import { LoginGate } from './modules/auth/LoginGate';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <LoginGate>{App.createRoot()}</LoginGate>,
);

// Replace with:
ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
```

Backstage will redirect to the Cognito/SSO login automatically. Delete `packages/app/src/modules/auth/LoginGate.tsx` after.

### What stays the same after IAM migration

| Component | Status |
|---|---|
| Teams management page (`/teams`) | Unchanged — team CRUD still works |
| `catalog/org.yaml` | Unchanged |
| NiFo theme | Unchanged |
| Sidebar | Unchanged (remove SignOutButton if SSO handles logout) |
| All scaffolder templates | Unchanged |
| Umbrella repo structure | Unchanged |
| `credentialsModule.ts` | Keep the team CRUD endpoints; remove the `/login` endpoint |

---

## 10. Migrating to a Cloud Database (PostgreSQL)

The app currently runs on SQLite (`packages/backend/db/*.sqlite`). For production, switch to PostgreSQL (AWS RDS recommended).

### What migrates automatically

All Backstage built-in tables (catalog, scaffolder, auth, search, notifications, …) are created automatically by Knex migrations on the first backend boot against the new database.

### What needs the script

Only the custom team tables need manual migration:

| Table | Contents |
|---|---|
| `tyn_teams` | group_id, username, password, display_name |
| `tyn_members` | group_id, member_name |

These live in `packages/backend/db/credentials-auth.sqlite`.

### Step 1 — Run the migration script

Stop the backend first, then:

```bash
# Windows (PowerShell):
$env:POSTGRES_HOST="your-db.rds.amazonaws.com"
$env:POSTGRES_PORT="5432"
$env:POSTGRES_USER="backstage"
$env:POSTGRES_PASSWORD="your-password"
$env:POSTGRES_DB="backstage"
node scripts/migrate-to-postgres.js

# Linux/macOS:
POSTGRES_HOST=your-db.rds.amazonaws.com \
POSTGRES_PORT=5432 \
POSTGRES_USER=backstage \
POSTGRES_PASSWORD=your-password \
POSTGRES_DB=backstage \
node scripts/migrate-to-postgres.js
```

Expected output:

```
→ Reading SQLite: packages/backend/db/credentials-auth.sqlite
   Found 6 team(s) and 20 member row(s).
→ Connected to PostgreSQL: your-db.rds.amazonaws.com:5432/backstage
✓  Migration complete:
   Teams   — 6 inserted, 0 already existed (skipped)
   Members — 20 inserted (replaced per group)
```

The script is idempotent — safe to run more than once.

### Step 2 — Start with the production config

`app-config.production.yaml` at the repo root is already configured for PostgreSQL. Pass it at startup:

```bash
NODE_ENV=production \
POSTGRES_HOST=your-db.rds.amazonaws.com \
POSTGRES_PORT=5432 \
POSTGRES_USER=backstage \
POSTGRES_PASSWORD=your-password \
POSTGRES_DB=backstage \
node packages/backend/dist/index.cjs.js \
  --config app-config.yaml \
  --config app-config.production.yaml
```

### AWS RDS checklist

- [ ] RDS instance created (PostgreSQL 14+, `backstage` database, `backstage` user with full privileges)
- [ ] Security group allows inbound port 5432 from the Backstage server
- [ ] Migration script run and output confirmed
- [ ] All five `POSTGRES_*` env vars set in your deployment environment
- [ ] `app-config.production.yaml` passed at startup
- [ ] `packages/backend/db/` deleted or moved on the server (so SQLite is not loaded)

---

## 11. Environment Variables Reference

All secrets go in `app-config.local.yaml` for local dev. Use real environment variables in production.

### Current setup (GitHub)

| Variable | Where it's used | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | `integrations.github[].token` | PAT for repo creation and umbrella submodule pushes |
| `TEAM_*_PASSWORD` | `credentialsAuth.teams[].password` | Fallback if not set in local config (rarely used) |

### After CodeCommit migration

| Variable | Purpose |
|---|---|
| `AWS_ACCESS_KEY_ID` | CodeCommit access (skip if using IAM role) |
| `AWS_SECRET_ACCESS_KEY` | CodeCommit access (skip if using IAM role) |
| `AWS_REGION` | e.g. `ap-south-1` |

### After IAM auth migration

| Variable | Purpose |
|---|---|
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `COGNITO_CLIENT_SECRET` | Cognito app client secret |

### Production (PostgreSQL)

| Variable | Purpose |
|---|---|
| `POSTGRES_HOST` | RDS endpoint |
| `POSTGRES_PORT` | Usually `5432` |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name (e.g. `backstage`) |

---

## Quick Reference

| I want to... | How |
|---|---|
| Start the portal | `yarn start` in the repo root |
| Log in | [http://localhost:3000](http://localhost:3000) — use team username + password |
| Sign out | Click **Sign Out** at the bottom of the sidebar |
| Add/remove members | Sidebar → Teams (log in as `platform-admin`) |
| Create a new team | Sidebar → Teams → **+ New Team** (admin only) |
| Scaffold a Next.js app | Sidebar → **Create** → Next.js Frontend |
| Scaffold a FastAPI service | Sidebar → **Create** → FastAPI Backend |
| View all projects | Sidebar → **Catalog** |
| View all teams (read-only for everyone) | Sidebar → **Teams** |
| Change portal brand colors | `packages/app/src/modules/theme/index.ts` |
| Change generated app colors | `templates/nextjs-template/skeleton/tailwind.config.ts` + `globals.css` |
| Add a new scaffolder template | Add `templates/<name>/template.yaml` + `skeleton/`, register in `app-config.local.yaml` catalog locations |
| Rotate GitHub token | Replace `integrations.github[0].token` in `app-config.local.yaml`, restart |
| Switch to CodeCommit | Section 8 — 7 files to update |
| Switch to AWS IAM auth | Section 9 — remove LoginGate, add OIDC provider |
| Migrate teams DB to PostgreSQL | Section 10 — run `node scripts/migrate-to-postgres.js` |
