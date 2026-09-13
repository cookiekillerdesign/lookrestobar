# LOOK Restobar & Terrace — Meniu digital

Meniu public (React + Vite) cu categorii, poze la fiecare preparat și o listă
„pentru chelner" (favorite, fără comandă/plată) — plus o admin panel proprie
pentru editarea meniului, fără cod. Backend: Supabase (bază de date, poze,
autentificare).

## Start rapid (dezvoltare locală)

```bash
npm install
cp .env.example .env        # completați cu datele din Supabase (vezi mai jos)
npm run dev
```

Fără `.env` completat, site-ul afișează automat meniul "Sala" din cod
(vezi `src/data/seedMenu.js`) — niciodată o pagină goală.

## Build de producție

```bash
npm run build      # → dist/
npm run preview    # verificare locală a build-ului
```

## Configurare completă (Supabase + Vercel + admin)

Toți pașii, cu capturi de ecran textuale și tabele de depanare, sunt în
**[`docs/ADMIN.md`](docs/ADMIN.md)** — de acolo se pornește prima dată:
proiect Supabase, rulare `supabase/schema.sql` și `supabase/seed.sql`,
creare cont admin, variabile de mediu pe Vercel, folosirea zilnică a
panoului `/admin`.

## Structură

```
src/
  pages/        meniul public (Menu.jsx, Menu.css, icons.jsx, LogoMark.jsx)
  admin/        panoul de administrare (rută /admin, încărcată lazy)
  data/         meniul „Sala" inclus în cod, ca rezervă fără bază de date
  content/      citirea publică a meniului (fetch direct, fără supabase-js)
  lib/          client Supabase (folosit doar de admin) + config
supabase/
  schema.sql   tabele, RLS, storage — se rulează o singură dată
  seed.sql     conținutul „Sala" din PDF-ul primit — idempotent
docs/
  ADMIN.md     ghid complet, în română, pentru administrarea meniului
```

## Stack

React 18 · Vite 5 · react-router-dom 6 (rută `/admin` lazy) · Supabase
(Postgres + RLS + Auth + Storage) · @phosphor-icons/react · @fontsource
(Playfair Display + Inter, auto-găzduite) · Vercel (deploy static + rewrites SPA)
