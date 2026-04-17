# Neutral System Builder

Workbench for generating **systematic neutral palettes** with [Color.js](https://colorjs.io/) (OKLCH-first). Build a **global lightness ladder**, map **fills / strokes / text / alt** for **light** and **dark elevated** themes, preview in mock UI, and **export** JSON, CSS variables, CSV, or a Tailwind `@theme` snippet.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run start
```

## Presets

Use **Export → Download preset** to save `globalConfig` and `systemConfig`. **Load preset** restores them via a custom window event (in-app).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- `colorjs.io` for color math in `lib/neutral-engine/`

## Deployment

Production: [neutral-system.vercel.app](https://neutral-system.vercel.app) (Vercel, Next.js).
