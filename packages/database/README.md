# @slh/database

This package contains the centralized database logic, Prisma schema, and client.

## Setup

1.  Keep this package built (or just install dependencies).
2.  The `PrismaClient` is exported as `db` from `./src/client.ts`.

## Migrations

**ALL** migrations must be run from this directory. Do **NOT** run migrations from apps.

```bash
cd packages/database
npx prisma migrate dev
```

## Usage in Apps

Import the `db` instance:

```typescript
import { db } from "@slh/database";

// Use db...
```

## Adding New Models

1.  Edit `prisma/schema.prisma` in this directory.
2.  Run `npx prisma migrate dev` to create a migration and generate the client.
3.  The new client will be available to all apps via `@slh/database`.
