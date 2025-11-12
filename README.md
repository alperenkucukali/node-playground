# Node Playground

This Express + TypeScript playground exposes CRUD APIs for media genres and artists backed by DynamoDB. You can run it directly with Node.js or spin up the full stack via Docker Compose.

## Requirements

- Node.js 20+ and npm
- Optional: Docker & Docker Compose (to run DynamoDB Local)

## Installation

```bash
npm install
```

Add a `.env` file at the project root if you need to override defaults. These environment variables already have sane fallbacks (change `CATALOG_TABLE_NAME` to the DynamoDB table you prefer):

```dotenv
PORT=3000
APP_NAME=node-playground
API_ROOT=/api/v1
CORS_ORIGINS=*
LOG_LEVEL=info
AWS_REGION=us-east-1
AWS_DYNAMODB_ENDPOINT=http://localhost:8000
CATALOG_TABLE_NAME=media-catalog
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
DEFAULT_TENANT_ID=demo-tenant
TENANT_HEADER_NAME=x-tenant-id
```

## Running

- `npm run dev`: Development mode with `ts-node-dev` (auto reload + fast TS transpile).
- `npm start`: Builds the TypeScript sources and starts the compiled server.
- `npm run start:prod`: Runs the already-built output in `dist/` (used by Docker but handy locally).

The HTTP server listens on `http://localhost:3000` by default.

### With Docker

To boot the API and DynamoDB Local together:

```bash
docker compose up --build
```

This runs the API container on port 3000 and DynamoDB Local on port 8000. Data persists inside the `dynamodb-data` volume.

- `npm run build`: Type-checks & emits compiled JavaScript into `dist/`.

## DynamoDB setup & seed data

Use the helper scripts to create the single DynamoDB table (default name `media-catalog`) and seed sample data:

```bash
npm run setup:catalog   # creates the media-catalog table
npm run seed:genres     # inserts sample genres
npm run seed:artists    # inserts sample artists
# or everything at once
npm run seed:all
```

When you build for production (or run inside Docker), use the `:prod` variants which execute the compiled JavaScript:

```bash
npm run setup:catalog:prod
npm run seed:genres:prod
npm run seed:artists:prod
npm run seed:all:prod
```

## Tests

Run Jest with:

```bash
npm test
```

## Useful notes

- TypeScript sources live under `src/`; the main server bootstrap is `src/server.ts`, the Express app resides in `src/app.ts`.
- Centralized configuration is in `src/config/env.ts`, which exposes every environment toggle (including `CATALOG_TABLE_NAME`).
- Input validation uses Joi schemas (`src/modules/**/ *.validator.ts`) so errors bubble up as `ApiError` instances.
