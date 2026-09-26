# Cardinals & Dragonflies — garden prototype

A **first tiny walkable slice** of Stefanie’s digital garden at [cardinalsanddragonflies.com](https://cardinalsanddragonflies.com).

Vision: wander a Studio Ghibli–soft garden of memories (people + pets) — not a flat scrapbook. This repo is a playable demo, not the full product.

## What this prototype is

- Soft landing splash with logo + **Enter garden**
- One short meadow path, low-poly trees/bushes, fog, warm light
- **One landmark**: Maple’s Bench (lily stone + wooden bench)
- **One sample memory** that opens as a soft card when you get close
- Desktop: **WASD / arrows** + click-to-lock mouse look
- Mobile: on-screen stick to walk, drag elsewhere to look

## What it is not

- Not the full multi-memory garden, marketplace (`.space`), or nonprofit (`.org`)
- Not production art / audio / accounts / publishing
- Not wired to Hostinger DNS yet — use the preview URL

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production bundle → dist/
npm run preview  # serve dist locally
```

## Stack

- Vite + React + TypeScript
- React Three Fiber + drei + three.js
- Lean geometry (no heavy asset packs)

## Sample memory

Warm placeholder about a beloved dog, **Maple**, and the bench where evenings were shared. Replace later with real stories.

## License / ownership

Personal prototype for Stefanie. Art refs in `public/` are project assets.
