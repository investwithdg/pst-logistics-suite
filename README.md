## Preferred Solutions Transport (PST) V2

A modern React application built with Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, and TanStack Query.

### Tech stack
- **Build tool**: Vite 5 (React + SWC)
- **Language**: TypeScript
- **UI**: Tailwind CSS, shadcn/ui (Radix primitives)
- **Routing**: React Router v6
- **Data**: TanStack Query

### Requirements
- Node.js 18+ (Vite 5 requires Node 18 or newer)
- npm (recommended). pnpm or bun may work, but npm is the default for this repo.

### Quick start

```bash
# 1) Install dependencies
npm install

# 2) Start the dev server (binds on all interfaces, port 8080)
npm run dev
# Open http://localhost:8080
```

### Available scripts
- **dev**: Start Vite dev server on port 8080
- **build**: Production build to `dist/`
- **build:dev**: Build using development mode
- **preview**: Preview the production build locally (default port 4173)
- **lint**: Run ESLint on the project

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Project structure

```
src/
  components/          # Reusable components and UI primitives (shadcn/ui)
  contexts/            # React context providers
  hooks/               # Custom React hooks
  lib/                 # Utilities, API helpers (mocked)
  pages/               # Route components grouped by area/role
  main.tsx             # App entry, mounts to #root
  App.tsx              # Router, providers, toasters
```

- Tailwind config: `tailwind.config.ts`
- Global styles: `src/index.css`
- Vite config (port, aliases): `vite.config.ts`
  - Dev server: `http://localhost:8080`
  - Path alias: `@` → `./src`
  - Additional shadcn aliases in `components.json`:
    - `components` → `@/components`
    - `ui` → `@/components/ui`
    - `utils` → `@/lib/utils`
    - `lib` → `@/lib`
    - `hooks` → `@/hooks`

### Routing
Defined in `src/App.tsx` using React Router:

- Public: `/`, `/quote`, `/thank-you`, `/track`, `/sign-in`
- Customer: `/customer/dashboard`, `/customer/orders`, `/customer/invoices`, `/customer/settings`
- Dispatcher: `/dispatcher/dashboard`, `/dispatcher/orders`, `/dispatcher/map`, `/dispatcher/drivers`, `/dispatcher/analytics`, `/dispatcher/notifications`, `/dispatcher/settings`
- Driver: `/driver/dashboard`, `/driver/jobs`, `/driver/available`, `/driver/completed`, `/driver/earnings`, `/driver/profile`, `/driver/settings`
- Admin: `/admin/dashboard`, `/admin/users`, `/admin/pricing`, `/admin/reports`, `/admin/company`, `/admin/system`, `/admin/audit`, `/admin/settings`
- Fallback: `*` → NotFound

### Data and API
- Query client is provided app-wide via TanStack Query.
- API calls are currently mocked in `src/lib/api.ts` (no external services or env variables required).

### Styling and UI
- Tailwind CSS with a custom theme and CSS variables (see `tailwind.config.ts`).
- shadcn/ui components live in `src/components/ui/*` and are built on Radix primitives.

### Build and deploy

```bash
# Create an optimized production build in /dist
npm run build

# (optional) Preview the production build locally
npm run preview
```

The output in `dist/` is a static site and can be hosted on any static host (e.g., Vercel, Netlify, GitHub Pages, S3/CloudFront, Nginx).

### Linting

```bash
npm run lint
```

Configured via `eslint.config.js` with React and TypeScript rules.

### Notes
- The dev server binds to all interfaces (`host: "::"`) at port `8080`, so the app is accessible on your LAN at `http://<your-ip>:8080`.
- No environment variables are required for local development; APIs are mocked.
