# react-commons

> Shared React components and utilities for the [@abinnovision](https://github.com/abinnovision) organization.

## Prerequisites

- Node.js 24+
- Yarn 4

## Quick Start

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run all checks (format, lint, sort)
yarn check

# Run unit tests
yarn test-unit
```

## Development

```bash
yarn build         # Build all packages
yarn check         # Run all checks (format, lint, sort)
yarn fix           # Auto-fix issues
yarn test-unit     # Run unit tests
```

## Project Structure

```
packages/
  commons/    # Shared utilities and types
  tsconfig/   # Shared TypeScript configurations
  ui/         # React UI library (React 19, urql, Tailwind, CVA, lucide-react)
tools/
  shared.sh        # Shared script utilities
  check-deps.sh    # Dependency checker
```
