## Preferred Solutions Transport (PST) V2

A modern React application built with Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, and TanStack Query.

### Tech stack
- **Build tool**: Vite 5 (React + SWC)
- **Language**: TypeScript
- **UI**: Tailwind CSS, shadcn/ui (Radix primitives)
- **Routing**: React Router v6
- **Data**: TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **Integration**: Make.com webhooks for orchestration

### Requirements
- Node.js 18+ (Vite 5 requires Node 18 or newer)
- npm (recommended). pnpm or bun may work, but npm is the default for this repo.
- Supabase account (for database, auth, and Edge Functions)
- Environment variables (see Configuration section)

### Quick start

```bash
# 1) Install dependencies
npm install

# 2) Create .env file with required variables (see Configuration section)
# Copy the template below and add your Supabase credentials

# 3) Start the dev server (binds on all interfaces, port 8080)
npm run dev
# Open http://localhost:8080
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Required - Get these from your Supabase project settings
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# Optional - For Make.com webhook integrations
VITE_MAKE_QUOTE_ACCEPTED_URL=your-make-webhook-url
VITE_MAKE_PROCESS_PAYMENT_URL=your-make-webhook-url
VITE_MAKE_ASSIGN_DRIVER_URL=your-make-webhook-url
# ... other Make.com webhook URLs
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
  contexts/            # React context providers (Auth, App state)
  hooks/               # Custom React hooks
  integrations/        # Supabase client configuration
  lib/                 # Utilities, API helpers (webhooks & Edge Functions)
  pages/               # Route components grouped by area/role
  main.tsx             # App entry, mounts to #root
  App.tsx              # Router, providers, toasters

supabase/
  functions/           # Edge Functions for server-side logic
  migrations/          # Database schema migrations
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
- API calls in `src/lib/api.ts` route to:
  - **Supabase Edge Functions**: For quick calculations and database operations
  - **Make.com webhooks**: For complex orchestration (payment processing, driver assignment)
- Real-time updates via Supabase subscriptions in `AppContext`
- Authentication handled by Supabase Auth with role-based access control

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

### Backend & Integrations

The app integrates with several backend services:

#### Supabase
- **Database**: PostgreSQL with tables for orders, drivers, notifications, user_roles, webhook_config
- **Auth**: User authentication with email/password
- **Realtime**: Live updates for orders, drivers, and notifications
- **Edge Functions**: Server-side logic for:
  - `calculate-quote`: Quote generation
  - `calculate-distance`: Distance calculations
  - `calculate-eta`: Delivery time estimates
  - `sync-driver-assignment`: HubSpot synchronization
  - `create-checkout-session`: Payment initiation
  - And more...

#### Make.com Webhooks
Complex business logic orchestration:
- Quote acceptance → HubSpot contact/deal creation
- Payment processing
- Driver assignment and reassignment
- Status updates and notifications
- Order cancellation and refunds

### Testing

The app has been tested with:
```bash
# Build verification (requires .env with Supabase credentials)
npm run build

# Development server
npm run dev
```

**Note**: Full functionality requires:
1. Valid Supabase project with migrations applied
2. Deployed Edge Functions
3. Configured Make.com webhook URLs (optional, falls back to Edge Functions)

### Notes
- The dev server binds to all interfaces (`host: "::"`) at port `8080`, so the app is accessible on your LAN at `http://<your-ip>:8080`.
- Without proper Supabase configuration, the app will fail at runtime when attempting authentication or data operations.
- See `HUBSPOT_SYNC_SETUP.md` and `HUBSPOT_WORKFLOW.md` for integration documentation.
