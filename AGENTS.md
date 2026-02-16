# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server at localhost:4321
npm run build    # production build → dist/
npm run preview  # preview the built output
```

There are no tests and no linter configured.

To check for TypeScript errors:
```bash
npx astro check
```

## Architecture

**Astro 5 site** deployed on Vercel. All pages are statically prerendered except `src/pages/api/submit.ts` (`export const prerender = false`), which runs as a serverless function.

**Stack:**
- Astro 5 + `@astrojs/vercel` adapter
- React 19 (used only for interactive components — `client:load`)
- Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js` — config lives in `src/styles/global.css`)
- shadcn/ui (new-york style, Tailwind v4 mode)
- Path alias: `@/*` → `src/*`

**Pages:**
- `/` — hub: hero with animated install cycler, package list, agent discovery strip
- `/electron` — full docs for `@harnessgg/electron` (npm)
- `/kdenlive` — full docs for `harnessgg-kdenlive` (pip)
- `/llms.txt` — plain-text agent discovery index (SSR endpoint)
- `/packages.json` — structured package registry (SSR endpoint)
- `POST /api/submit` — creates GitHub Issues via the GitHub API; requires `GITHUB_TOKEN` env var

**Packages (index.astro):**
- `@harnessgg/electron` v0.1.0 — published, npm, page at `/electron`
- `harnessgg-kdenlive` v0.3.0 — published, pip, page at `/kdenlive`
- `@harnessgg/web` — coming soon, npm
- `harnessgg-blender` — coming soon
- `harnessgg-gimp` — coming soon

**Design system — Ocean Slate:**
All colour tokens are oklch values defined in `src/styles/global.css` under `:root`. Key values: `--primary: #5a7a8a`, `--background: #f2f4f6`, `--term-bg: #1e2830`. Do not use hardcoded hex for these; use the CSS variables.

Terminal/code blocks use hardcoded dark colours (`#1e2830` bg, `#283440` bar, `#7a9aaa` prompt) with a `2px solid #5a7a8a` border. Replicate this pattern when adding new code blocks.

**React components** (`src/components/`):
- `CopyButton.tsx` — copies text to clipboard; used with `client:load`
- `InstallCycler.tsx` — fades between install commands in the hero; used with `client:load`
- `src/components/ui/` — shadcn primitives (badge, button, card, separator, table)

When using shadcn components inside `.astro` templates, use `className` not `class`. Avoid deeply nesting shadcn Card/Table components in `.astro` JSX — esbuild will fail to parse complex nested expressions. Use plain HTML tables with scoped CSS classes instead and import only Badge, Separator, and interactive React components.

**Package → repo mapping** in `src/pages/api/submit.ts`:
```ts
electron: 'harnessgg/Harness-electron'
kdenlive: 'harnessgg/Harness-kdenlive'
```
Returns 400 for unknown packages. Add new entries here when new packages launch.

**`GITHUB_TOKEN`** — fine-grained PAT, Issues: Read + Write on the two harness repos. Set in `.env` locally; set as an environment variable in Vercel for production.

**Adding a new package page:** copy the structure of `electron.astro` or `kdenlive.astro`, add the package to the `packages` array in `index.astro`, add the repo mapping in `api/submit.ts`, and update `llms.txt.ts` and `packages.json.ts`.

**Doc page consistency:** all package pages (`electron.astro`, `kdenlive.astro`, and any future pages) must follow the same section order: header (install row + badges + external links), Prerequisite, Quick flow, command reference, Response shape, Error codes, Submit feedback. Scoped `<style>` blocks should use the same class names and values across pages — copy from an existing page rather than inventing new ones.

**Never use em dashes** (`—`) or box-drawing separators (`──`) anywhere in the codebase — in copy, comments, or code. Use a comma, period, colon, or parentheses instead.

**Curly braces in `.astro` templates:** `{` and `}` in static text (e.g. inside `<pre>`) are parsed as JSX expression delimiters. Use `set:html` with a template literal for any block that contains raw JSON or shell commands with braces.
