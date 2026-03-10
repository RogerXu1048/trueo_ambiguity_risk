# Ambiguity Risk Frontend (Next.js + shadcn/ui)

This folder contains the product frontend for the ambiguity risk system.

## Stack

- Next.js App Router
- React 19
- Tailwind v4
- shadcn/ui components

## Run locally

```bash
cd web
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Backend API

The frontend expects the Python API server to be available at:

- default: `http://127.0.0.1:8000`
- configurable via `NEXT_PUBLIC_API_BASE_URL`

Create `web/.env.local` if you need a custom API URL:

```bash
cp .env.local.example .env.local

NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## shadcn/ui

`shadcn/ui` is initialized in this project. To add more components:

```bash
npx shadcn@latest add <component>
```

To apply a preset/theme registry in future iterations:

```bash
npx shadcn@latest init --preset <PRESET_CODE>
```
