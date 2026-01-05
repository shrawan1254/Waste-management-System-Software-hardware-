# Waste Management System (Software + Hardware)

A Vite + React TypeScript web application for managing smart dustbins and waste collection. The app includes an admin dashboard, map view for dustbins, user authentication, and Supabase integration for backend services.

## Key Features
- Admin panel for managing dustbins and viewing statistics
- Map-based visualization of dustbin locations and fill status
- Dustbin details and history views
- Authentication and role-based access (via Supabase)
- Serverless functions / KV store (Supabase functions) used for data handling

## Tech Stack
- Frontend: React + TypeScript, Vite
- UI: Custom components (see `src/components/ui`)
- Backend: Supabase (Auth, Database, Edge Functions)
- Map: (map component in `src/components/MapView.tsx`)

## Repo structure (important files)
- `src/` — React source code
  - `components/` — UI components and pages (AdminPanel, MapView, DustbinCard, etc.)
  - `supabase/` — server functions and helpers
  - `utils/` — helpers and Supabase client
- `public/` or static assets — (if present)

## Prerequisites
- Node.js 18+ (or compatible LTS)
- npm or yarn
- A Supabase project (for Auth and Database)

## Environment variables
Create a `.env` file in the project root. 
Common variables used in this project:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — public anon key for Supabase
- Any other `.env` keys referenced in `src/utils/supabase/client.tsx` or server functions

Example `.env` (do NOT commit):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## Install

```bash
npm install
```

## Development

Start the Vite dev server:

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Supabase functions
- Serverless code lives in `src/supabase/functions` (or `supabase/functions/server`). Deploy these with the Supabase CLI if you use them.

## Notes and tips
- Keep `.env` values secret. The `.gitignore` includes common entries for Vite, caches, and deploy folders.
- If you add CI/CD or deployment (Vercel/Netlify), add their output folders to `.gitignore` (already included).

## Contributing
Myself shrawan,Pranshu,Kalash,Aryan
With there help and contribution i would have never finished this project!

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
