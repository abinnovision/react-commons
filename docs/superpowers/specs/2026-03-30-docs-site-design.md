# Documentation Site Design — Starlight (Astro)

**Date:** 2026-03-30
**Status:** Approved

## Context

The `react-commons` monorepo currently has one published package (`react-overlay-stack`) and a Storybook 10 examples app. The monorepo will grow with more packages over time. There is no dedicated documentation site.

**Goal:** Create a documentation site that serves both external package consumers (API docs, guides, examples) and internal contributors (development setup, code style, architecture). Deploy to GitHub Pages (deployment workflow deferred).

## Decision: Starlight (Astro)

Chosen over Rspress and VitePress because:

- **React-native rendering** — Astro's React integration lets us embed live overlay components directly in MDX pages, unlike VitePress (Vue-based).
- **Docs-first** — Starlight is purpose-built for documentation (built-in search, sidebar generation, accessibility), unlike general SSGs.
- **Multi-package ready** — sidebar groups and file-based routing scale naturally as packages are added.
- **Ecosystem** — larger and more mature than Rspress, actively maintained.

## Package & Monorepo Integration

New private workspace package:

```
docs/
├── astro.config.ts
├── package.json          # @internal/docs (private)
├── src/
│   ├── content/
│   │   └── docs/         # MDX content files
│   └── components/       # Custom React components for inline demos
├── public/               # Static assets
└── tsconfig.json
```

**Workspace:** Added to root `workspaces` in `package.json`.

**Turbo tasks:**

- `docs#dev` — local Astro dev server (persistent, no cache)
- `docs#build` — static site build, cached
- Root `start:dev` updated to include docs dev server alongside tsdown watch and Storybook

**Dependencies:** `docs` depends on `react-overlay-stack` (and future packages) via workspace protocol (`workspace:*`). Turbo's dependency graph ensures packages build before docs.

## Content Structure

```
src/content/docs/
├── index.mdx                            # Landing — what is react-commons
├── getting-started.mdx                  # Installation, quick setup
│
├── packages/
│   └── react-overlay-stack/
│       ├── index.mdx                    # Overview, quick example
│       ├── getting-started.mdx          # Installation, basic usage
│       ├── api-reference.mdx            # createOverlaySystem, defineOverlay, useOverlayContext, types
│       ├── guides/
│       │   ├── radix-dialog.mdx         # Radix UI integration
│       │   ├── vaul-drawer.mdx          # Vaul integration
│       │   └── stacking.mdx             # Overlay stacking behavior
│       └── examples.mdx                 # Live embedded examples
│
├── contributing/
│   ├── index.mdx                        # How to contribute
│   ├── development-setup.mdx            # Clone, install, build, test
│   ├── code-style.mdx                   # Arrow functions, named exports, conventions
│   └── architecture.mdx                 # Monorepo structure, build system, CI
```

**Scaling:** New packages get their own directory under `packages/<name>/` with the same structure.

## Embedded React Examples

Starlight's Astro React integration (`@astrojs/react`) enables live component rendering in MDX:

```mdx
import { BasicOverlayDemo } from "../../../components/BasicOverlayDemo";

<BasicOverlayDemo client:load />
```

Demo components live in `docs/src/components/`. They import from workspace packages directly.

## Examples Strategy

All examples are embedded directly in the docs site as live React components. No external Storybook references or links. The docs site is the single source for both documentation and interactive examples.

## GitHub Pages Deployment

**Deferred.** The docs site will be buildable locally (`turbo build --filter=@internal/docs`), but no CI deployment workflow is included in this iteration.

When added later:

- Astro `base` config set to `/react-commons/` for correct asset paths under GitHub Pages.
- `actions/deploy-pages` for deployment from GitHub Actions.

## Out of Scope

- Versioned documentation
- Internationalization (i18n)
- Custom search configuration
- Custom theme beyond Starlight defaults
