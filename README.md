# WISO AI

WISO AI is a React 19 + TanStack Start application using TypeScript, Vite, Supabase, and Nitro for deployment.

## Requirements

- Node.js 20 or newer
- npm
- Supabase project credentials configured in the local environment and deployment platform

## Local development

```bash
npm ci
npm run dev
```

## Validation

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Environment variables

Configure these values in `.env.local` for local development and in Vercel Project Settings for the corresponding deployment environments:

- `VITE_SUPABASE_URL`: Supabase project URL exposed to the browser.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key exposed to the browser.
- `SUPABASE_URL`: Supabase project URL for server-side operations.
- `SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key for server-side user-scoped operations.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for trusted administrative operations. Never prefix it with `VITE_` or expose it to browser code.

Do not commit `.env`, `.env.local`, or other files containing credentials.

## Deployment

The app uses TanStack Start with the Nitro Vite plugin and is configured for Vercel's TanStack Start framework preset. Set the environment variables in Vercel before deploying, then verify the deployment URL and custom domain separately.

Python services remain hosted independently on Railway; this project does not redeploy them.
