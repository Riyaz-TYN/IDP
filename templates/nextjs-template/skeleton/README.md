# ${{ values.name }}

${{ values.description }}

**Owner:** ${{ values.owner }} · **Stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The NiFo design system (Tailwind config, CSS variables, components) is baked in — no extra setup needed.

---

## Project structure

```
src/
├── app/                  # Next.js App Router — routing only (layouts, pages)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── features/             # Domain modules — add one folder per domain
│   └── home/
│       └── components/
│           └── HeroSection.tsx
├── components/
│   ├── ui/               # shadcn/ui components (Button, Badge, Card, Input, Label)
│   └── layout/
│       └── Navbar.tsx    # TYN navbar (navy bg, cyan icon)
└── lib/
    ├── axios.ts          # Pre-configured Axios instance (reads NEXT_PUBLIC_API_URL)
    └── utils.ts          # cn() helper for Tailwind class merging
```

**Rule:** pages in `app/` only import from `features/` and `components/`. Business logic lives in `features/<domain>/`.

---

## Adding a new feature

1. Create `src/features/<domain>/` with these files:
   ```
   features/<domain>/
   ├── components/     # React components for this domain
   ├── hooks/          # useQuery / useMutation hooks
   ├── types.ts        # TypeScript interfaces
   └── api.ts          # Axios calls to the backend
   ```
2. Add a page in `src/app/<domain>/page.tsx` that imports from the feature folder.

---

## Available commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server at [http://localhost:3000](http://localhost:3000) with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript check (no emit) |

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL of your FastAPI backend |

---

## Design system

All components use the NiFo design tokens. Key Tailwind classes:

| Class | Hex | Purpose |
|---|---|---|
| `bg-brand-navy` / `text-brand-navy` | `#10233F` | Navbar, headings |
| `bg-brand-blue` / `text-brand-blue` | `#0070C0` | Primary buttons, links |
| `text-brand-cyan` | `#22D3EE` | Accent on dark backgrounds |
| `bg-surface-page` | `#f7f9fc` | Page background |
| `text-ink-heading` | `#0f172a` | Primary text |
| `text-ink-muted` | `#64748b` | Secondary text |

Typography scale: `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`, `text-tiny`.

Pre-built components in `src/components/ui/`: `Button`, `Badge`, `Card`, `Input`, `Label`.

---

## Data fetching

[TanStack Query](https://tanstack.com/query) is set up globally in `src/app/layout.tsx`. Use it in any feature:

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: () => axios.get('/api/v1/items').then(r => r.data),
  });
}
```

The Axios instance in `lib/axios.ts` automatically prefixes all requests with `NEXT_PUBLIC_API_URL`.

---

## State management

[Zustand](https://zustand.dev/) is available for global client state. Create a store in `src/features/<domain>/store.ts`:

```typescript
import { create } from 'zustand';

interface ExampleStore {
  count: number;
  increment: () => void;
}

export const useExampleStore = create<ExampleStore>(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));
```

---

## Backstage catalog

This service is registered in the NiFo IDP catalog at `catalog-info.yaml`. View it in the [Backstage portal](http://localhost:3000) under **Catalog**.
