# Repository Guidelines

## Project Structure & Module Organization

This repository contains a mobile-first Kansai trip viewer built with React 19, Vite, Material UI, and Tailwind CSS.

- `src/main.jsx` contains the application shell, views, reusable UI helpers, and Material UI theme.
- `src/data/tripData.js` is the render source of truth for itinerary days, reservations, and checklist data.
- `src/index.css` contains global and Tailwind-based styling.
- `index.html` and `vite.config.js` provide the Vite entry point and build configuration.
- `temp/` stores research, original itinerary documents, and prototype specifications. It is reference/archive material and must not be imported by runtime code.

## Build, Test, and Development Commands

- `npm install` installs locked dependencies from `package-lock.json`.
- `npm run dev` starts the Vite development server with hot reload.
- `npm run build` creates the production bundle in `dist/` and catches build-time errors.
- `npm run preview` serves the production bundle locally for final verification.

Before submitting changes, run `npm run build`. Do not commit generated `dist/` output or dependency directories.

## Coding Style & Naming Conventions

Use modern ES modules and functional React components. Match the existing style: two-space indentation, double quotes, semicolons, trailing commas in multiline expressions, and PascalCase component names. Use camelCase for functions, variables, and data fields; use descriptive names such as `TripStatusView` or `mapHref`.

Prefer Material UI primitives and the existing theme before adding custom CSS. Keep render-ready itinerary content in `src/data/tripData.js`, not embedded in presentation components. When a source document in `temp/` changes, explicitly synchronize and review the canonical data file. Prettier is available; run `npx prettier --check .` before a broad formatting change.

## Testing Guidelines

No project-level automated test suite is configured yet. Verify changes by building, then inspect the relevant desktop and mobile layouts with `npm run dev` or `npm run preview`. Check navigation, external map links, date-sensitive states, and persistence-related interactions. If tests are introduced, place them beside the source as `*.test.jsx` and add the command to `package.json`.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Update Kansai itinerary` and `Rebuild trip viewer with live runtime UI`. Follow that pattern and keep each commit focused.

Pull requests should explain the user-visible outcome, identify changed itinerary data, and list verification performed. Include screenshots for layout or styling changes, link relevant issues, and call out assumptions involving dates, reservations, or transit details.
