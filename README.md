# Olga Admin

Internal admin panel for the **Olga** professional networking platform. Operators use it to manage members, events, moderation reports, and GDPR privacy requests.

![Stack](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Vite](https://img.shields.io/badge/Vite-8-646cff)

---

## Features

| Screen | What you can do |
|---|---|
| **Dashboard** | Platform totals (members, active members, upcoming events, connections, open reports, pending privacy requests) and the next upcoming events |
| **Members** | Search by name, ID, or headline; filter by status; suspend or reinstate members |
| **Events** | All events with start/end times, registrations, live-mode flag, and status |
| **Moderation** | Triage member reports: review, action, or dismiss |
| **Privacy requests** | Track export and delete requests against their due dates; overdue dates show in red |
| **Settings** | Shows the API target, the data source (mock or live), and a live Olga.Core readiness check |

## Tech stack

- **React 19** + **TypeScript** (strict mode)
- **Vite** for the dev server and builds
- **React Router** for routing
- **TanStack Query** for data fetching, caching, and mutations
- Plain CSS with design tokens (no UI framework)

---

## Run locally

### 1. Prerequisites

- **Node.js 20+** (tested on Node 22), which includes npm
- **Git**
- *Optional:* **.NET SDK**, only if you want to run the Olga.Core API for live data

Check your versions:

```bash
node -v
npm -v
```

### 2. Clone and install

```bash
git clone https://github.com/jigarce007/olga-admin.git
cd olga-admin
git checkout develop
npm install
```

### 3. Configure the environment

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env`.

| Variable | Purpose | Default |
|---|---|---|
| `VITE_USE_MOCKS` | `true` serves every screen from built-in sample data; `false` calls the real API | `true` |
| `VITE_CORE_API_URL` | Olga.Core base URL. **Leave empty for local dev** so requests go through the Vite proxy | *(empty)* |
| `CORE_API_PROXY_TARGET` | Where the dev server forwards `/v1`, `/ready`, and `/health` | `http://localhost:5000` |

### 4. Start the admin panel

```bash
npm run dev
```

Open **http://localhost:5173**. With the defaults, every screen works on sample data and needs no backend.

### 5. Optional: use live data from Olga.Core

1. Start the API from the `Olga.Core` repo. It uses an in-memory database by default, so you don't need a database:
   ```bash
   dotnet run --project src/Olga.Core.Api
   ```
   Note the URL it prints, for example `Now listening on: http://localhost:5000`.
2. In `.env`, set `VITE_USE_MOCKS=false` and set `CORE_API_PROXY_TARGET` to that URL.
3. Restart `npm run dev`.
4. On the **Settings** page, *Core API readiness* should show **Ready**.

> With mocks off, only **Events** has data today. The other screens need the `/v1/admin/*` endpoints listed below.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check, then build a production bundle into `dist/` |
| `npm run typecheck` | Type-check only |
| `npm run preview` | Serve the production build locally |

## Project structure

```
src/
├── api/
│   ├── client.ts      # fetch wrapper: base URL, Idempotency-Key, error mapping
│   ├── admin.ts       # admin data functions (live API or mock)
│   ├── mock.ts        # sample data used when VITE_USE_MOCKS=true
│   └── types.ts       # shared types (mirror Olga.Core.Contracts where they exist)
├── components/
│   ├── Layout.tsx     # sidebar and page shell
│   └── ui.tsx         # PageHeader, Badge, StatCard, QueryState, date formatting
├── pages/             # Dashboard, Members, Events, Moderation, Privacy, Settings
├── main.tsx           # app entry and routes
└── styles.css         # design tokens and styles
```

## Backend integration status

Olga.Core currently exposes only `GET /v1/events` and `/ready`. The other admin calls target **proposed** endpoints, and the panel uses mock data for them until they're built:

| Screen | Endpoint | Status |
|---|---|---|
| Events | `GET /v1/events` | Exists |
| Dashboard | `GET /v1/admin/stats` | Proposed |
| Members | `GET /v1/admin/members`, `PATCH /v1/admin/members/{id}` | Proposed |
| Moderation | `GET /v1/admin/reports`, `PATCH /v1/admin/reports/{id}` | Proposed |
| Privacy | `GET /v1/admin/privacy-requests`, `PATCH /v1/admin/privacy-requests/{id}` | Proposed |

Every write sends a fresh `Idempotency-Key` header, which Olga.Core requires on all `/v1` writes.

> ⚠️ **Security:** there's no admin authentication yet. Don't deploy this panel publicly until admin login and role checks exist in Olga.Core.

## Troubleshooting

| Problem | Fix |
|---|---|
| Settings shows **Unreachable** | Olga.Core isn't running, or `CORE_API_PROXY_TARGET` points to the wrong port. Restart `npm run dev` after editing `.env` |
| Screens show `404 REQUEST_FAILED` with mocks off | That `/v1/admin/*` endpoint doesn't exist yet. Set `VITE_USE_MOCKS=true` |
| Port 5173 is already in use | Run `npm run dev -- --port 5174` |
| Changes to `.env` have no effect | Vite reads `.env` only at startup, so restart the dev server |

## Branching and contributing

- **`main`** is production. Never push to it directly; it's updated only through PRs from `develop`.
- **`develop`** is the integration branch.
- For new work, branch off `develop` (`feature/<name>`) and open a PR back into `develop`.
