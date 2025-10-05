# Agent Guidelines for VETO

## Build/Test/Lint Commands

- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Type check**: `npm run check`
- **Lint**: `npm run lint` (runs prettier check + eslint)
- **Format**: `npm run format` (runs prettier write)
<!-- - **Test all**: `npm test` (runs unit + e2e) -->
- **Test unit**: `npm run test:unit` (vitest)
- **Test single unit**: `npm run test:unit -- path/to/test.spec.ts`
<!-- - **Test e2e**: `npm run test:e2e` (playwright) -->
- **Codegen**: `npm run codegen` (regenerate kysely types from DB schema)

## Code Style

- **Formatting**: Tabs for indentation, single quotes, no trailing commas, 100 char width
- **TypeScript**: Strict mode enabled, use type imports (`import type`)
- **Imports**: SvelteKit path aliases (`$lib`, `$env`), types from generated `./$types`
- **Naming**: camelCase for variables/functions, PascalCase for types, snake_case for DB columns
- **Framework**: SvelteKit 2 + Svelte 5, Kysely for DB queries, Tailwind + DaisyUI for styling
- **Database**: Export `db` from `src/lib/database.ts`, use Kysely typed queries
- **Error handling**: Use SvelteKit `redirect()` and `error()` helpers
- Code should be as declarative as possible, and functional as is practical
