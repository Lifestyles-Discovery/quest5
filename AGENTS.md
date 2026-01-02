# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React + TypeScript app. Entry points are `src/main.tsx` and
`src/App.tsx`. Feature code lives in `src/`: `src/pages` for route-level
screens, `src/layout` for shell wrappers, `src/components` for shared UI, and
`src/features` for domain modules. Supporting code lives in `src/context`,
`src/hooks`, `src/services`, `src/api`, `src/utils`, `src/types`, and
`src/icons`. Static assets go in `public/`. Tailwind base styles are in
`src/index.css`. Production builds are emitted to `dist/`.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server.
- `npm run build` runs `tsc -b` and bundles to `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the repo.

## Coding Style & Naming Conventions
Use TypeScript + React and match existing formatting: 2-space indentation,
double quotes, semicolons, and trailing commas. ESLint rules live in
`eslint.config.js` (typescript-eslint, react-hooks, react-refresh). Components
and types use PascalCase (`UserCard.tsx`, `DealTerms.ts`), hooks use a `use`
prefix (`useDeals.ts`). Prefer path aliases from `tsconfig.app.json`, e.g.
`@/utils/format` or `@components/Button`.

## Design Principles (37signals-Inspired)
Favor simple, focused UI over exhaustive configuration. Ship opinionated
defaults and hide advanced options unless they unlock clear user value. Prefer
small, cohesive components with clear copy and predictable flows. Optimize for
clarity and speed over novelty.

## Testing Guidelines
No test runner is configured yet. If you add tests, keep them close to the code
(e.g. `src/components/__tests__/Button.test.tsx`) and update `package.json`
with the chosen tool and script. Run `npm run lint` before opening a PR.

## Commit & Pull Request Guidelines
Commit messages are short, imperative, and sentence case (e.g. "Refactor
preferences page to auto-save on blur"). Keep them to one line and avoid
prefixes unless the team adopts them. PRs should include a clear summary,
testing performed (commands or manual steps), and screenshots or GIFs for UI
changes. Link related issues when available.

## Configuration & Environment
Local overrides live in `.env` and `.env.development`. Vite reads
`VITE_API_URL` and `VITE_AUTHENTICATOR_URL` (see `src/api/client.ts` and
`src/api/authenticator.ts`). Keep secrets out of the repo and document new env
vars in this file.
