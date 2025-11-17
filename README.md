# Node Playground (Lambda Edition)

This project now exposes AWS Lambda handlers (one per CRUD operation) for managing media genres and artists backed by DynamoDB. There is no Express server or long-running HTTP process—zip the compiled handlers or plug them into API Gateway / Lambda integrations directly.

## Requirements

- Node.js 20+ and npm
- Optional: Docker (for DynamoDB Local via `docker compose`)

## Installation

```bash
npm install
```

Environment variables live in `.env` (all have sensible fallbacks):

```dotenv
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

## Development workflow

- `npm run dev`: TypeScript watch build (emits into `dist/` as you edit).
- `npm run build`: One-time TypeScript compile (outputs `dist/`).
- `npm test`: Run the existing Jest unit tests for the service / repository layers.

Each API operation maps to a dedicated handler file beneath `src/modules/<domain>/handlers/`. For example, `src/modules/genres/handlers/list-genres.handler.ts` exports `listGenres`, while `src/modules/artists/handlers/create-artist.handler.ts` exports `createArtist`. The root export `src/handlers/index.ts` simply re-exports every handler to make bundling convenient.

`src/handlers/http.ts` centralizes tenant resolution plus JSON/CORS handling, while `src/handlers/response.ts` provides reusable helpers (`ok`, `created`, `listOk`, `noContent`) for consistent payload shapes across handlers. Shared utilities under `src/modules/common/**` (e.g., id schema builder and Dynamo update-expression helper) keep cross-cutting logic easy to reuse.

## Local DynamoDB

If you need DynamoDB Local, spin it up with:

```bash
docker compose up dynamodb-local
```

This only launches the database container (no API container is required now that everything runs on Lambda). Update `AWS_DYNAMODB_ENDPOINT` to `http://localhost:8000` when using it.

## DynamoDB setup & seed data

Use the helper scripts to create the table and seed demo records:

```bash
npm run setup:catalog      # create the catalog table
npm run seed:genres        # seed sample genres
npm run seed:artists       # seed sample artists
npm run seed:all           # run both seeders
```

For production builds (when you only have the compiled `dist/` folder), use the `:prod` variants:

```bash
npm run setup:catalog:prod
npm run seed:genres:prod
npm run seed:artists:prod
npm run seed:all:prod
```

## Packaging for Lambda

1. Run `npm run build`.
2. Copy the `dist/` folder plus `package.json`, `package-lock.json`, and `node_modules` into an artifact directory.
3. Point your Lambda to the compiled handler you need, e.g., `dist/src/modules/genres/handlers/list-genres.handler.listGenres`.

(You can also re-export shortest names via `dist/src/handlers/index.js` if your deployment tooling prefers a single entry module.)

## Useful notes

- Configuration still comes from `src/config/env.ts`.
- Validation stays in `src/modules/**/ *.validator.ts` and now returns plain objects rather than mutating Express requests.
- Handlers rely on `ApiError` for consistent HTTP responses; anything else is logged and returned as a 500.
