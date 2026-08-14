# NiFo IDP — The Yellow Network Internal Developer Portal

A Backstage-based Internal Developer Portal for The Yellow Network (TYN). Teams use it to scaffold new Next.js and FastAPI projects, manage team members, and track all projects in a software catalog.

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
10. [Environment Variables Reference](#10-environment-variables-reference)

---

## 1. What This Is

| Feature | Status | Notes |
|---|---|---|
| Team credential login | Done | 5 pre-seeded teams; manage via UI |
| Team & member management UI | Done | `/teams` page — add/remove members, create teams |
| Next.js scaffolder template | Done | Runs out of the box with nifo design system |
| FastAPI scaffolder template | Done | `docker compose up` and it runs |
| Umbrella repo (git submodules) | Done | Every new project auto-added under `labs/` |
| Backstage catalog + teams | Done | `catalog/org.yaml` — teams and members |
| NiFo design theme in Backstage | Done | `#0070C0` blue, `#10233F` navy sidebar |
| GitHub integration | Done | Repos created under `Riyaz-TYN` |
| AWS CodeCommit integration | Pending | See section 8 |
| AWS IAM authentication | Pending | See section 9 |

---

## 2. Project Structure

```
nifo-refractor/                  <- Backstage monorepo root
├── app-config.yaml              <- Main config (committed)
├── app-config.local.yaml        <- Local secrets — gitignored (passwords, tokens)
├── catalog/
│   └── org.yaml                 <- TYN team & user entities (5 teams x 4 members)
├── templates/
│   ├── nextjs-template/         <- Next.js scaffolder template
│   │   ├── template.yaml        <- Backstage template definition
│   │   └── skeleton/            <- The actual generated project files
│   └── fastapi-template/        <- FastAPI scaffolder template
│       ├── template.yaml
│       └── skeleton/
├── packages/
│   ├── app/                     <- Backstage frontend (React)
│   │   └── src/
│   │       ├── App.tsx          <- Registers all feature modules
│   │       ├── index.tsx        <- Wraps app with LoginGate
│   │       └── modules/
│   │           ├── auth/        <- LoginGate + TeamBanner
│   │           ├── nav/         <- Sidebar layout
│   │           ├── teams/       <- Teams management page (/teams)
│   │           └── theme/       <- NiFo light theme (nifo-shared-ui colors)
│   └── backend/
│       └── src/
│           ├── index.ts         <- Registers all backend plugins
│           ├── auth/
│           │   └── credentialsModule.ts  <- Team login + CRUD API + SQLite storage
│           └── actions/
│               └── gitSubmodule.ts       <- monorepo:submodule:add scaffolder action
└── backstage-local.db           <- SQLite database (gitignored, auto-created)
```

**Separate repos:**

```
E:/nifo-ref/umbrella/            <- Riyaz-TYN/Umberella-Repo
├── labs/
│   ├── frontend/                <- Every Next.js app added here as git submodule
│   └── backend/                 <- Every FastAPI service added here as git submodule
└── README.md

E:/nifo-ref/nifo-shared-ui/      <- VarshiniRameshTYN/nifo-shared-ui
├── src/global.css               <- Reference CSS variables (baked into skeleton)
└── tailwind.config.ts           <- Reference Tailwind tokens (baked into skeleton)
```

---

## 3. Running Locally

### Prerequisites

- Node.js 20+
- Yarn (via Corepack: `corepack enable`)
- Git

### First-time setup

```bash
# 1. Install dependencies
yarn install

# 2. Create your local config file (never commit this)
```

Create `app-config.local.yaml` in the project root:

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
      token: YOUR_GITHUB_PAT_HERE

catalog:
  locations:
    - type: file
      target: e:/nifo-ref/nifo-refractor/examples/entities.yaml
    - type: file
      target: e:/nifo-ref/nifo-refractor/examples/template/template.yaml
      rules:
        - allow: [Template]
    - type: file
      target: e:/nifo-ref/nifo-refractor/examples/org.yaml
      rules:
        - allow: [User, Group]
```

### Start the portal

```bash
# Start frontend (port 3000) and backend (port 7007) together
yarn start
```

Open [http://localhost:3000](http://localhost:3000). You will see the NiFo login page.

> The SQLite database `backstage-local.db` is created automatically on first run. Teams from `app-config.local.yaml` are seeded into it on first boot only. After that, manage teams through the UI at `/teams` — no restarts needed.

---

## 4. Team Login & Management

### Login

Each team logs in with their shared team credentials at the login screen. After login, a navy banner appears at the top with the team name and all members listed.

| Team | Username | Default Password |
|---|---|---|
| Team Alpha | `team-alpha` | `tyn@alpha2026` |
| Team Beta | `team-beta` | `tyn@beta2026` |
| Team Gamma | `team-gamma` | `tyn@gamma2026` |
| Team Delta | `team-delta` | `tyn@delta2026` |
| Team Epsilon | `team-epsilon` | `tyn@epsilon2026` |

### Managing Teams (no code or restarts needed)

Navigate to **Teams** in the sidebar (or go to `/teams`).

**Create a new team:**
1. Click **+ New Team**
2. Fill in: Team Name, Group ID (e.g. `team-zeta`), Login Username, Password
3. Add members by typing a name and pressing Enter or clicking Add (any number of members)
4. Click **Create Team**

**Add a member to an existing team:**
- On the team's card, type the member's name in the input field and press Enter or Add

**Remove a member:**
- Click the **x** on any member chip

**Delete a team:**
- Click **Delete** on the card, then confirm with **Yes**

Teams and members are stored in `backstage-local.db` (SQLite) and survive restarts.

### Updating names in the Backstage Catalog

The Backstage catalog (what you see in the **Catalog** page under groups) reads from `catalog/org.yaml`. Edit that file with real names and restart once. The Teams login page reads from the DB (managed via `/teams` UI).

---

## 5. Creating a Project (Scaffolder)

Go to **Create** in the sidebar and pick a template.

### Next.js Frontend (Modular Monolith)

What gets created automatically:
- A private GitHub repo under `Riyaz-TYN/<app-name>`
- NiFo design system baked in (Tailwind config, CSS variables, shadcn components)
- Modular monolith structure:
  ```
  src/
  ├── app/             <- Next.js App Router (routing only)
  ├── features/        <- Domain modules (e.g. features/billing/)
  ├── components/
  │   ├── ui/          <- shadcn components (Button, Badge, Card)
  │   └── layout/      <- Navbar
  └── lib/             <- Utilities, types
  ```
- Registered in the Backstage catalog under the chosen team
- Added as a git submodule to `labs/frontend/<app-name>` in the umbrella repo

**To run the generated app:**
```bash
git clone https://github.com/Riyaz-TYN/<app-name>
cd <app-name>
npm install
npm run dev
# Open http://localhost:3000
```

### FastAPI Backend (Modular Monolith)

What gets created automatically:
- A private GitHub repo under `Riyaz-TYN/<service-name>`
- Modular structure with strict layering:
  ```
  app/
  ├── core/            <- config, database, dependencies
  ├── modules/
  │   └── <domain>/    <- router -> service -> repository -> models/schemas
  └── shared/          <- shared exceptions, utilities
  ```
- SQLAlchemy async + Alembic migrations, Postgres via Docker Compose
- Added as a git submodule to `labs/backend/<service-name>` in the umbrella repo

**To run the generated service:**
```bash
git clone https://github.com/Riyaz-TYN/<service-name>
cd <service-name>
docker compose up
# Open http://localhost:8000/docs  (Swagger UI)
```

---

## 6. Umbrella Repo & Labs Structure

**Remote:** `https://github.com/Riyaz-TYN/Umberella-Repo`

Every project created through the Backstage scaffolder is automatically added as a git submodule:

```
Umberella-Repo/
└── labs/
    ├── frontend/
    │   ├── billing-portal/     <- submodule -> github.com/Riyaz-TYN/billing-portal
    │   ├── dashboard-ui/       <- submodule -> github.com/Riyaz-TYN/dashboard-ui
    │   └── ...
    └── backend/
        ├── user-service/       <- submodule -> github.com/Riyaz-TYN/user-service
        └── ...
```

### Cloning everything (for a new developer joining a team)

```bash
# Clone the umbrella repo with all submodules at once
git clone --recurse-submodules https://github.com/Riyaz-TYN/Umberella-Repo

# If you already cloned without submodules:
git submodule update --init --recursive

# To update all submodules to their latest commits:
git submodule update --remote
```

### How the submodule addition works

The custom scaffolder action `monorepo:submodule:add` (in `packages/backend/src/actions/gitSubmodule.ts`):
1. Clones the umbrella repo into a temporary directory
2. Runs `git submodule add <new-repo-url> labs/frontend/<name>`
3. Commits with message `feat: auto-added submodule for labs/frontend/<name>`
4. Pushes back to the umbrella repo

Auth is handled by injecting the GitHub token from `integrations.github[].token` into the git URL. The `.gitmodules` file stays token-free (uses the plain HTTPS URL).

---

## 7. Design System (nifo-shared-ui)

Source: `https://github.com/VarshiniRameshTYN/nifo-shared-ui`

The design system is baked directly into each generated Next.js skeleton — no npm package dependency. This means teams can start immediately with no package registry setup.

Files mirrored into every generated Next.js app:

| File in skeleton | Source |
|---|---|
| `tailwind.config.ts` | `nifo-shared-ui/tailwind.config.ts` |
| `src/app/globals.css` | `nifo-shared-ui/src/global.css` |
| `src/components/ui/button.tsx` | shadcn Button styled with nifo tokens |
| `src/components/ui/badge.tsx` | shadcn Badge with semantic variants |
| `src/components/ui/card.tsx` | Card with `shadow-card`, `ink-heading` |
| `src/components/layout/Navbar.tsx` | TYN navbar (navy bg, cyan icon) |

**Key brand tokens:**

| Token | Value | Used for |
|---|---|---|
| Primary blue | `#0070C0` | Buttons, links, active states |
| Brand navy | `#10233F` | Navbar, sidebar, headings |
| Brand cyan | `#22D3EE` | Accent, icon on dark backgrounds |
| Surface/page | `#f7f9fc` | Page background |
| Radius | `1rem` | Default border radius |

The Backstage portal itself uses the same colors via the NiFo Unified Theme registered in `packages/app/src/modules/theme/index.ts`.

**When nifo-shared-ui updates:** manually copy the updated `tailwind.config.ts` and `global.css` into both the skeleton folder and `packages/app/src/modules/theme/index.ts` (update the palette hex values). Future improvement: publish as an npm package to CodeArtifact and install via `package.json`.

---

## 8. Migrating to AWS CodeCommit

These are the exact files and lines to change. Do them in order.

### Step 1 — Install the CodeCommit scaffolder module

```bash
yarn workspace backend add @backstage/plugin-scaffolder-backend-module-aws-codestar
yarn workspace backend remove @backstage/plugin-scaffolder-backend-module-github
```

### Step 2 — `packages/backend/src/index.ts`

```typescript
// REMOVE this line:
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));

// ADD this line:
backend.add(import('@backstage/plugin-scaffolder-backend-module-aws-codestar'));
```

### Step 3 — `app-config.yaml`: swap integrations block

```yaml
# REMOVE:
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

# ADD:
integrations:
  awsCodeCommit:
    - host: git-codecommit.ap-south-1.amazonaws.com
      region: ap-south-1
      # Use roleArn if running on EC2/ECS with an IAM role (recommended):
      # roleArn: arn:aws:iam::ACCOUNT_ID:role/BackstageCodeCommitRole
      # Use access keys only for local dev:
      accessKeyId: ${AWS_ACCESS_KEY_ID}
      secretAccessKey: ${AWS_SECRET_ACCESS_KEY}
```

### Step 4 — `templates/nextjs-template/template.yaml`: swap publish step

Find the `publish` step and the `add-to-umbrella` step, replace both:

```yaml
# BEFORE — publish:github
- id: publish
  name: Publish to GitHub
  action: publish:github
  input:
    repoUrl: github.com?repo=${{ parameters.name }}&owner=Riyaz-TYN
    defaultBranch: main
    repoVisibility: private

# AFTER — publish:awsCodeCommit
- id: publish
  name: Publish to CodeCommit
  action: publish:awsCodeCommit
  input:
    repoUrl: aws.amazon.com?repo=${{ parameters.name }}&region=ap-south-1
    defaultBranch: main

# BEFORE — umbrella repoUrl
- id: add-to-umbrella
  action: monorepo:submodule:add
  input:
    repoUrl: https://github.com/Riyaz-TYN/Umberella-Repo.git
    submoduleUrl: ${{ steps['publish'].output.remoteUrl }}
    submodulePath: labs/frontend/${{ parameters.name }}

# AFTER — umbrella repoUrl
- id: add-to-umbrella
  action: monorepo:submodule:add
  input:
    repoUrl: https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/Umberella-Repo
    submoduleUrl: ${{ steps['publish'].output.remoteUrl }}
    submodulePath: labs/frontend/${{ parameters.name }}
```

### Step 5 — `templates/fastapi-template/template.yaml`: same changes

Exact same find-and-replace as Step 4, but `submodulePath: labs/backend/${{ parameters.name }}` stays as-is (backend path).

### Step 6 — `packages/backend/src/actions/gitSubmodule.ts`: swap auth method

The current file uses a GitHub token injected into the git URL. Replace with AWS credential helper:

```typescript
// REMOVE these lines (roughly lines 29-57 in the current file):
const integration = integrations.github.byUrl(repoUrl);
const githubToken = integration?.config?.token;
if (!githubToken) { throw new Error(...); }
const authenticatedRepoUrl = repoUrl.replace('https://', `https://${githubToken}@`);
const gitConfig = [
  `url.https://${githubToken}@github.com.insteadOf=https://github.com`,
  'user.name=Backstage Scaffolder',
  'user.email=scaffolder@backstage.io',
];

// ADD these lines instead:
// AWS CLI credential helper handles auth automatically via IAM role or env vars.
// Prerequisite: aws-cli must be installed on the server running Backstage.
const authenticatedRepoUrl = repoUrl; // no token injection needed
const gitConfig = [
  'credential.helper=!aws codecommit credential-helper $@',
  'credential.UseHttpPath=true',
  'user.name=Backstage Scaffolder',
  'user.email=scaffolder@backstage.io',
];
```

Also remove the `integrations` import and parameter since it is no longer used:

```typescript
// REMOVE:
import { ScmIntegrations } from '@backstage/integration';
export const createGitSubmoduleAction = (integrations: ScmIntegrations) => {

// REPLACE WITH:
export const createGitSubmoduleAction = () => {
```

And in `customScaffolderModule`, update the init:

```typescript
// REMOVE:
async init({ scaffolder, config }) {
  const integrations = ScmIntegrations.fromConfig(config);
  scaffolder.addActions(createGitSubmoduleAction(integrations));
},

// REPLACE WITH:
async init({ scaffolder }) {
  scaffolder.addActions(createGitSubmoduleAction());
},
```

### Summary of all files changed for CodeCommit migration

| File | What changes |
|---|---|
| `packages/backend/package.json` | Remove github module, add aws-codestar module |
| `packages/backend/src/index.ts` | Swap one `backend.add(...)` line |
| `packages/backend/src/actions/gitSubmodule.ts` | Replace GitHub token auth with AWS credential helper (3 edits) |
| `app-config.yaml` | Replace `integrations.github` with `integrations.awsCodeCommit` |
| `app-config.local.yaml` | Replace `GITHUB_TOKEN` with `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| `templates/nextjs-template/template.yaml` | `publish:github` -> `publish:awsCodeCommit`, update 2 URLs |
| `templates/fastapi-template/template.yaml` | Same as above |

**`catalog/org.yaml` — no changes needed.** The catalog is independent of the git provider.

---

## 9. Migrating to AWS IAM Authentication

The current credential login gate is a temporary measure. When switching to proper AWS IAM / Cognito / SSO:

### Step 1 — Add the AWS ALB / OIDC auth module

```bash
# For AWS ALB (load balancer auth):
yarn workspace backend add @backstage/plugin-auth-backend-module-aws-alb

# Or for Cognito / generic OIDC:
yarn workspace backend add @backstage/plugin-auth-backend-module-oidc
```

**`packages/backend/src/index.ts`** — add one line:

```typescript
// ADD (choose one based on your setup):
backend.add(import('@backstage/plugin-auth-backend-module-aws-alb'));
// or:
backend.add(import('@backstage/plugin-auth-backend-module-oidc'));
```

### Step 2 — `app-config.yaml`: update auth providers

```yaml
# REPLACE:
auth:
  providers:
    guest: {}

# WITH (example for Cognito OIDC):
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
// CURRENT:
import { LoginGate } from './modules/auth/LoginGate';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <LoginGate>{App.createRoot()}</LoginGate>,
);

// REPLACE WITH:
ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
```

### Step 4 — `packages/app/src/App.tsx`: add sign-in page (if needed)

```typescript
// Backstage will automatically redirect to the provider's login.
// If you need a custom sign-in page, add SignInPageBlueprint here.
// Most AWS SSO setups redirect transparently — no custom page needed.
```

### What is NOT affected by IAM migration

Everything else stays unchanged:

| Component | Status |
|---|---|
| Teams management page (`/teams`) | Unchanged — still manages team members |
| `catalog/org.yaml` | Unchanged — team entities still there |
| NiFo theme (`modules/theme/`) | Unchanged |
| Sidebar (`modules/nav/`) | Unchanged |
| All scaffolder templates | Unchanged |
| Umbrella repo structure | Unchanged |
| `credentialsModule.ts` | Can be kept for team member management, remove login endpoint |

The team banner (navy bar showing team name + members) will need to be updated to read from Backstage's `identityApi` + catalog API instead of `sessionStorage`. That change is inside `packages/app/src/modules/auth/LoginGate.tsx`.

---

## 10. Environment Variables Reference

Set in `app-config.local.yaml` for local dev. Use actual env vars in production.

### Current (GitHub)

| Variable | Used in | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | `integrations.github[].token` | PAT for creating repos and submodule pushes |
| `TEAM_ALPHA_PASSWORD` | `credentialsAuth.teams[].password` | Fallback password if not in local config |
| `TEAM_BETA_PASSWORD` | same | |
| `TEAM_GAMMA_PASSWORD` | same | |
| `TEAM_DELTA_PASSWORD` | same | |
| `TEAM_EPSILON_PASSWORD` | same | |

### After CodeCommit migration, add

| Variable | Purpose |
|---|---|
| `AWS_ACCESS_KEY_ID` | CodeCommit access (skip if using IAM role on EC2) |
| `AWS_SECRET_ACCESS_KEY` | CodeCommit access (skip if using IAM role on EC2) |
| `AWS_REGION` | e.g. `ap-south-1` |

### After IAM auth migration, add

| Variable | Purpose |
|---|---|
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `COGNITO_CLIENT_SECRET` | Cognito app client secret |

---

## Quick Reference

| I want to... | Go to... |
|---|---|
| Add/remove team members | Sidebar -> Teams |
| Create a new team | Sidebar -> Teams -> + New Team |
| Create a new frontend app | Sidebar -> Create -> Next.js Frontend |
| Create a new backend service | Sidebar -> Create -> FastAPI Backend |
| See all projects and owners | Sidebar -> Catalog |
| Change brand colors in the portal | `packages/app/src/modules/theme/index.ts` |
| Change brand colors in generated apps | `templates/nextjs-template/skeleton/tailwind.config.ts` and `globals.css` |
| Add a new scaffolder template | Create `templates/<name>/template.yaml` + `skeleton/`, add to `app-config.yaml` catalog locations |
| Switch repo hosting to CodeCommit | Section 8 — 7 files to update |
| Switch auth to AWS IAM | Section 9 — 4 files to update, LoginGate removed |
