# Sizzle Web

The web client for **Street Vendor Finder** — a responsive single-page app that
lets people discover nearby street vendors and browse their menus, and lets
vendors manage their own listing.

Built with **React + Vite** and wired to a **Supabase (PostgreSQL)** backend for
authentication, data, and real-time updates. It was developed as a team project
for CCNY's Software Engineering course (CSc 47300).

## Features

- **Vendor discovery** — search and browse vendors by location or food type and
  view their details on a map.
- **Vendor profiles** — each vendor has a name, food type, hours, location, and
  a menu.
- **Vendor dashboard** — vendors sign in to create and update their business
  information and menu.
- **Responsive UI** — works on phones, tablets, and desktops so it's usable on
  the go.

## Tech stack

- React + Vite single-page app, routed with React Router
- TypeScript for application logic
- Supabase (PostgreSQL) for auth, database, and real-time data
- Plain CSS for styling

## Project structure

- `src/` — React components and routes for each screen
- `assets/ts/*.ts` — screen-specific DOM logic for the few routes that still use it
- `supabase/migrations/` — database schema and migrations
- `index.html` — Vite entry point

## Getting started

```bash
npm install
npm run dev      # start the local dev server
npm run build    # production build
npm run preview  # preview the production build
```

### Connecting Supabase

Create a `.env.local` file (see `.env.example`) with your project credentials:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then visit `/supabase` in the running app to confirm the connection is working.

## Useful commands

```bash
npm run dev        # development server
npm run typecheck  # TypeScript type checking
npm run build      # production build
npm run preview    # serve the production build locally
```
