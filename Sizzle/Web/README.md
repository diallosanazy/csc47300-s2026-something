# Sizzle web

- **App:** React + Vite single-page app
- **Routes:** `src/` renders every synced artboard as a React Router route
- **Legacy behavior:** `assets/ts/*.ts` holds the screen-specific DOM logic for the few routes that still need it

After cloning or changing the app, run:

```bash
npm install
npm run dev
npm run build
```

To connect Supabase, create `Main/sizzle-web/.env.local` (see `.env.example`) with:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then visit `/supabase` in the app to verify the wiring.

Useful commands:

```bash
npm run dev
npm run typecheck
npm run build
npm run preview
```
