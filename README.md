# King Detailing Studio — Website

Official web application for **King Detailing Studio** (Chandawa, Arrah, Bihar 802301), built with React, Vite, Tailwind CSS v4, Motion, Three.js, and Google Maps Platform.

## Features

- **Interactive 3D Polyester Curtain Reveal**: Real-time Three.js Verlet cloth physics with bouncy, jiggle-wiggle touch/cursor interaction unveiling a glossy black Toyota Fortuner.
- **Dark & Light Mode**: Defaults to obsidian dark showroom mode with a persistent Light/Dark toggle in the navbar.
- **The Finish Lab**: Interactive 3D isometric surface protection layer inspector (Ceramic Coating, PPF, Paint Swatches, Gloss vs Satin finishes).
- **Before & After Comparison**: Touch-friendly swipeable transformation slider.
- **Live Google Maps Reviews & Interactive Studio Map**: Fetches real Google Maps feedback and renders the studio location pin.
- **Instagram & WhatsApp Integration**: Direct links to `@king_detailing0707`, click-to-copy handle, and prefilled WhatsApp booking inquiries.

## Local Development

```bash
npm install
cp .env.example .env
# Add your Google Maps API key to .env as VITE_GOOGLE_MAPS_API_KEY
npm run dev
```

## Build for Production

```bash
npm run build
```

The production static site is generated in `dist/`.

## Deploying Live from GitHub

1. Upload all files in this folder to a new GitHub repository.
2. Add your Google Maps API key as a repository secret / environment variable named `VITE_GOOGLE_MAPS_API_KEY`.
3. Deploy via **Cloudflare Pages**, **Vercel**, **Netlify**, or **GitHub Pages** (a workflow is included in `.github/workflows/deploy.yml`):
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
