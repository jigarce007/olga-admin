# Olga Admin

Internal admin panel for Olga: members, events, moderation reports, and privacy (GDPR) requests.

**Stack:** React 19, TypeScript, Vite, React Router, TanStack Query.

## Getting started

```bash
npm install
cp .env.example .env   # adjust values as needed
npm run dev            # http://localhost:5173
```

| Variable | Purpose | Default |
|---|---|---|
| `VITE_CORE_API_URL` | Olga.Core API base URL | same origin |
| `VITE_USE_MOCKS` | `true` serves screens from in-browser mock data | `true` |

## Backend status

Only `GET /v1/events` and `/ready` exist in Olga.Core today. Every other call in `src/api/admin.ts` targets a **proposed** `/v1/admin/*` route and uses mock data until that route is built:

| Screen | Proposed endpoint |
|---|---|
| Dashboard | `GET /v1/admin/stats` |
| Members | `GET /v1/admin/members`, `PATCH /v1/admin/members/{id}` |
| Moderation | `GET /v1/admin/reports`, `PATCH /v1/admin/reports/{id}` |
| Privacy | `GET /v1/admin/privacy-requests`, `PATCH /v1/admin/privacy-requests/{id}` |

Writes send an `Idempotency-Key` header, which Olga.Core requires on `/v1` writes.

> There's no admin authentication yet. Don't deploy this publicly until admin auth and role checks are in place.

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: type-check and build to `dist/`
- `npm run typecheck`: run type-checking only
- `npm run preview`: serve the production build

## Branches

- `main`: production. Only updated through PRs from `develop`.
- `develop`: integration branch. Branch features off `develop` and open PRs back into it.
