# Agent Instructions

## Project Overview

This is a mobile-first React + Vite + TypeScript frontend for generating OneClickStream stream configuration data.

## Working Rules

- Prefer small, focused edits in [src/App.tsx](src/App.tsx) and [src/styles.css](src/styles.css) when changing UI behavior or layout.
- Keep the app mobile-first and preserve the existing glassy dark visual style unless a request explicitly asks for a redesign.
- Use [README.md](README.md) for setup and run details instead of repeating them here.
- The frontend reads `VITE_API_BASE_URL`; do not hardcode environment-specific API URLs in source.
- No automated test script is defined in `package.json`; if a change needs validation, use `npm run build`.

## Terminal Workflow

- Install dependencies with `npm install`.
- Run the app with `npm run dev -- --host 0.0.0.0` when local-network or iPhone Safari access is needed.
- Use `npm run build` before finishing work that touches the TypeScript or Vite entry path.
- `npm run preview` is only for checking the production build locally.

## Codebase Anchors

- [src/main.tsx](src/main.tsx) is the React entry point.
- [src/App.tsx](src/App.tsx) owns the form submission, API call, and rendered output.
- [src/styles.css](src/styles.css) controls the full visual system.
- [index.html](index.html) is the Vite entry shell.
