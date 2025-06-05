# ESG Management Application

This project is a React and TypeScript application powered by Vite. Supabase provides authentication and backend edge functions, while Stripe is used for payments.

## Prerequisites

- Node.js 18 or higher
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for running local functions)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and provide the required values:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY` (optional fallback key)
   - `VITE_TEMPO` and `VITE_USE_MOCK_AUTH` (optional for development)

## Development

Start the development server:

```bash
npm run dev
```

To run Supabase edge functions locally, use:

```bash
supabase functions serve
```

## Scripts

- `npm run lint` – run ESLint
- `npm run test` – execute unit tests with Vitest
- `npm run build` – generate a production build

## Testing

Run `npm install` (or `npm ci`) before executing `npm run test` to ensure
Vitest is available.

```bash
npm install
# or
npm ci
npm run test
```

## Deployment

Build the project and serve the compiled assets:

```bash
npm run build
npm start
```

Docker and `docker-compose.yml` are provided for containerized deployments.

Additional documentation is available in `docs/architecture.md`.
