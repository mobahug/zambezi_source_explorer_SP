# Zambezi Source Explorer

A React + TypeScript single-page storytelling dashboard inspired by Dr. Steve Boyes and the Wild Bird Trust, showcasing a simulated expedition at the Zambezi River source. The app uses Material UI for layout, React Leaflet with free OpenStreetMap tiles for mapping, and D3 for lightweight telemetry charting.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Features
- Dark-mode MUI theme with expedition-inspired styling.
- React Leaflet map centered over the Angolan Highlands with a simulated Zambezi route, live-moving expedition marker, and mock conservation threat markers.
- Sidebar with key metrics, a D3-powered telemetry chart (heart rate & pH), and storytelling context for protecting the Zambezi source.

## Tech stack
- React 18 + TypeScript
- Vite build tooling
- Material UI v5
- React Leaflet + Leaflet + OpenStreetMap/CARTO tiles
- D3 for charts
