# React Commons - Development Guide

When working with this repository, use the `react-standard` skills.

## Project Structure

Yarn 4 monorepo with Turbo orchestration. Package names in parentheses are used for `turbo --filter`:

- `packages/commons` (`@internal/commons`) - Shared utilities and types (ESM, TypeScript)
- `packages/tsconfig` (`@internal/tsconfig`) - Shared TypeScript configurations
- `packages/ui` (`@internal/ui`) - React UI library (React 19, urql, tailwind-merge, lucide-react, CVA, graphql-sse)

## Common Commands

```bash
yarn build              # Build all packages
yarn fix                # Fix linting and formatting
yarn check              # Check linting and formatting
yarn test-unit          # Run all unit tests
yarn clean              # Clean build artifacts
```

## Working with Specific Packages

```bash
yarn turbo build --filter=@internal/ui
yarn turbo build --filter=@internal/commons
yarn turbo build --filter=@internal/tsconfig
yarn turbo test-unit --filter=@internal/ui
yarn turbo test-unit --filter=@internal/commons
```

## Testing

Unit tests are the only test type in this library. Each package uses vitest:

| Type | File pattern | Location                    | Environment |
| ---- | ------------ | --------------------------- | ----------- |
| Unit | `*.spec.ts`  | `src/**` (alongside source) | `happy-dom` |

```bash
yarn test-unit                    # Run all unit tests (root)
yarn turbo test-unit              # Run unit tests via turbo
```

Unit tests live alongside the source files they test. Each package has its own `vitest.config.ts` using `defineProject` with a naming convention: `@internal/ui#unit`, `@internal/commons#unit`.

The root `vitest.config.ts` discovers all project configs via glob. The Turbo task `test-unit` is pre-configured in `turbo.json`.

## TypeScript Module Resolution Strategy

All packages use a consistent module resolution strategy. The base tsconfig (`packages/tsconfig/tsconfig.base.json`) defaults to `nodenext`:

| Category        | `module`   | `moduleResolution` | `type` in package.json | Why                                                                 |
| --------------- | ---------- | ------------------ | ---------------------- | ------------------------------------------------------------------- |
| Shared packages | `nodenext` | `nodenext`         | `module`               | Strict ESM enforcement — catches missing extensions and export maps |

**Why this matters:** each package must be type-checked with its own tsconfig to enforce strict ESM resolution. This is why `turbo run typecheck` must run each package independently.

**Internal package resolution:** shared packages use conditional `exports` in `package.json`. Vite activates the `"development"` condition automatically in dev mode, resolving directly to source for HMR. TypeScript resolves via the `"types"` condition to built output (`dist/`), which is kept up-to-date by `turbo watch` during development.

## Git Hooks

Pre-commit hooks run automatically via husky:

- **lint-staged**: ESLint + Prettier on staged files
- **yarn dedupe --check**: ensures no duplicate dependencies

Commits must follow conventional commit format (enforced by commitlint via commit-msg hook).

## CI/CD

- Polyglot monorepo stack v1 (`abinnovision/actions`)
- Prerelease channel: `beta`
- Package publishing enabled
