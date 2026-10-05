# Backend integration tests

The tests import the existing Express app (never `server.ts`) and exercise real routing,
validation, JWT authentication, role checks, services, and Prisma queries through Supertest.
No production source changes are required. The role called OWNER in the requirements is
`RESTAURANT_OWNER` in this backend.

## Local setup

Use Node 22 and a dedicated disposable PostgreSQL database. For example:

```sh
npm ci
npx prisma generate

docker run --detach --name restaurant-backend-test-db \
  --publish 127.0.0.1:55432:5432 \
  --env POSTGRES_USER=backend_test \
  --env POSTGRES_PASSWORD=local_test_only \
  --env POSTGRES_DB=restaurant_review_portal_test postgres:16-alpine
```

Create a gitignored `.env.test` in the repository root:

```dotenv
TEST_DATABASE_URL=postgresql://backend_test:local_test_only@127.0.0.1:55432/restaurant_review_portal_test
```

Alternatively export `TEST_DATABASE_URL`; the exported value takes precedence. No JWT or
R2 credentials are needed: each test environment generates a random JWT secret and mocks
all R2 service exports before loading the app. No real R2 client is constructed or called.

```sh
npm test
npm run test:watch
npm run test:coverage
npm run test:typecheck
```

The first three commands automatically apply committed Prisma migrations before Jest runs.
The test database must already exist. Its name must end in `_test` (or be exactly `test`).
There is no fallback to `DATABASE_URL`. The harness rejects the same host/port/database
as an inherited `DATABASE_URL` or the development `.env` URL, regardless of credentials
or query parameters. Use the public schema. Never point this variable at valuable data.

## Isolation and teardown

Tests run serially, with one worker. Before and after every test, an explicit list of
application tables is truncated together with identity sequences reset. This handles
foreign keys and self-referencing comments without `CASCADE`; migration history is retained.
Fixtures create only the roles, users, restaurants, menu items, rating types, reviews, or
comments needed by a suite. Both existing Prisma clients disconnect after each suite.
Do not run multiple Jest processes concurrently against the same test database.

Coverage includes source controllers, services, middleware, and validators; excludes the
generated Prisma client and server listener. Babel's existing TypeScript preset emits ESM;
Jest runs with Node's VM modules flag. Tests are typechecked separately with the existing
TypeScript compiler, avoiding a transformer dependency with incompatible TypeScript peers.

Image tests cover restaurant and menu item presigning, metadata persistence, invalid object
prefixes/content types, missing objects, and another owner's attempts to sign/save/delete.
The currently mounted image DELETE handlers use the metadata services; the tests preserve
that existing behavior instead of switching to the separate R2 deletion implementation.

CI uses its own PostgreSQL service and runs install, Prisma generation, build, lint,
test typechecking, and the integration suite. Test credentials shown here and in CI are
only for disposable local/CI containers.
