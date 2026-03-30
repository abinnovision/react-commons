# React Commons - Development Guide

When working with this repository, use the `react-standard` skills.

## Project Structure

Yarn 4 monorepo with Turbo orchestration. Package names in parentheses are used for `turbo --filter`:

- `packages/react-overlay-stack` (`react-overlay-stack`) - Type-safe, unstyled overlay manager for React 19 (Zustand, tsdown)
- `examples` (`@internal/examples`) - Storybook 10 examples app for testing packages (private, not published)

## Common Commands

```bash
yarn build              # Build all packages
yarn start:dev          # Start dev mode (turbo watch: tsdown --watch + storybook)
yarn fix                # Fix linting and formatting
yarn check              # Check linting and formatting
yarn test-unit          # Run all unit tests
yarn clean              # Clean build artifacts
```

## Working with Specific Packages

```bash
yarn turbo build --filter=react-overlay-stack
yarn turbo test-unit --filter=react-overlay-stack
yarn workspace @internal/examples dev      # Start storybook on port 6006
```

## Code Style

- Arrow functions everywhere: `const x = () => { ... }`
- Components: `const X: FC<Props> = ({ ... }) => { ... }`
- No function declarations
- Named exports only (no default exports)

## Testing

Unit tests are the only test type in this library. Each package uses vitest:

| Type | File pattern   | Location                    | Environment |
| ---- | -------------- | --------------------------- | ----------- |
| Unit | `*.spec.ts(x)` | `src/**` (alongside source) | `happy-dom` |

```bash
yarn test-unit                    # Run all unit tests (root)
yarn turbo test-unit              # Run unit tests via turbo
```

Unit tests live alongside the source files they test. Each package has its own `vitest.config.ts` using `defineProject` with a naming convention: `react-overlay-stack#unit`.

The root `vitest.config.ts` discovers all project configs via glob. The Turbo task `test-unit` is pre-configured in `turbo.json`.

## Build System

Packages use `tsdown` (powered by rolldown) for building. Output is dual CJS/ESM with `unbundle: true`. Each package has a `tsdown.config.ts`. TypeScript (`tsc --noEmit`) is used only for typechecking, not for building.

## TypeScript

Strict mode with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `nodenext` module resolution.

## Git Hooks

Pre-commit hooks run automatically via husky:

- **lint-staged**: ESLint + Prettier on staged files

Commits must follow conventional commit format (enforced by commitlint via commit-msg hook).

## CI/CD

- Polyglot monorepo stack v1 (`abinnovision/actions`)
- Prerelease channel: `beta`
- Package publishing enabled
