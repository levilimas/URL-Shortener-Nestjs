# AGENTS.md

## Cursor Cloud specific instructions

### Overview
This is a NestJS-based URL shortener service with JWT auth, TypeORM (PostgreSQL or SQLite fallback), Swagger docs, and Prometheus metrics.

### Running the dev server
```bash
JWT_SECRET=test-secret NODE_ENV=development npm run start:dev
```
- When `DB_HOST` is not set, the app automatically uses SQLite (`database.sqlite` in project root).
- Swagger UI is available at `http://localhost:3000/api/docs`.

### Key caveats
- **Entity loading**: `autoLoadEntities: true` was added to `database.module.ts` to fix a pre-existing bug where the entity glob path in `database.config.ts` did not resolve correctly. Without this, all API calls that touch the database will return 500 errors.
- **Pre-existing test failures**: Unit tests (`npm run test`) and e2e tests (`npm run test:e2e`) have pre-existing issues (TypeScript type errors in mocks, missing QrCodeService in test module). These are not caused by environment setup.
- **Lint**: `npm run lint` reports many pre-existing `prettier/prettier` formatting issues in the source code.
- **Route shadowing**: The `GET /api/:shortCode` catch-all route shadows `GET /api/health`, causing the health endpoint to return 404. This is a pre-existing routing issue.
- **nanoid v5 is ESM-only**: Jest config includes `transformIgnorePatterns` excluding `nanoid` to handle this.

### Available scripts
See `package.json` `scripts` section. Key commands:
- `npm run build` — compile TypeScript
- `npm run start:dev` — dev server with hot reload
- `npm run lint` — ESLint
- `npm run test` — unit tests (Jest)
- `npm run test:e2e` — e2e tests (requires `JWT_SECRET` env var)
- `npm run format` — Prettier
