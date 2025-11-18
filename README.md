# Node Playground (Lambda Edition)

This project now exposes AWS Lambda handlers (one per CRUD operation) for managing media genres and artists backed by DynamoDB. There is no Express server or long-running HTTP process—zip the compiled handlers or plug them into API Gateway / Lambda integrations directly.

## Requirements

- Node.js 20+ and npm
- Optional: Docker (for DynamoDB Local via `docker compose`)

## Installation

```bash
npm install
```

Environment variables live in `.env` (all have sensible fallbacks). You can control the configuration profile via `APP_ENV` or `NODE_ENV` (`development`, `local`, `test`, `production`) to switch defaults like `LOG_LEVEL`:

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
ENABLE_METRICS=false
METRICS_NAMESPACE=node-playground
```

## Development workflow

- `npm run dev`: Start the TypeScript watcher (emits into `dist/`). Append `-- --env=<profile>` to choose a configuration profile such as `development`, `local`, `test`, or `production`.
- `npm run build`: Perform a one-time TypeScript compile, producing `dist/`.
- `npm test`: Execute the Jest suite (`-- --env=<profile>` is also accepted if you want to mimic a specific environment during tests).
- `npm run test:integration`: Run DynamoDB-backed integration tests (requires DynamoDB Local reachable at `AWS_DYNAMODB_ENDPOINT`; the catalog table is recreated for each test).

Each API operation maps to a dedicated handler file beneath `src/modules/<domain>/handlers/`. For example, `src/modules/genres/handlers/list-genres.handler.ts` exports `listGenres`, while `src/modules/artists/handlers/create-artist.handler.ts` exports `createArtist`. The root export `src/handlers/index.ts` simply re-exports every handler to make bundling convenient.

`src/config/env.ts` loads environment-specific defaults (set `APP_ENV`/`NODE_ENV` to `development`, `local`, `test`, or `production`) so values like `LOG_LEVEL` adjust automatically. `src/handlers/http.ts` centralizes tenant/locale resolution plus JSON + CORS plumbing, while the core layer (`src/core/messages.ts`, `src/core/success.ts`, `src/core/api-error.ts`, `src/core/with-error-handling.ts`, `src/core/translator.ts`) standardizes localized success/error envelopes. Shared utilities under `src/modules/common/**` (e.g., id schema builder, Dynamo update-expression helper, reusable message definitions) keep cross-cutting logic easy to reuse across handlers.

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
- Localized strings live under `src/i18n/*.json` and are loaded via `src/core/translator.ts`. Extend those JSON resources (e.g., add `en`/`tr` entries) when you add new message definitions so responses remain user-friendly.
- For CloudWatch metrics, set `ENABLE_METRICS=true` and `METRICS_NAMESPACE=<name>` to publish `ApiRequests`, `ApiLatency`, and `ApiErrors` metrics (see `src/observability/metrics.ts`).
- Log levels default per profile (see the environment matrix). Production guidance: keep `LOG_LEVEL=info`, enable metrics, and configure log retention/filters via CloudWatch Logs (e.g., shorter retention for debug environments, longer for prod). Consider enabling log subscription filters or AWS Backup for compliance.
- Contract tests live under `tests/contract`, ensuring the Lambda response envelope (`ApiSuccessResponse`/`ApiErrorResponse`) stays consistent.
- Each request may include `x-correlation-id`; if omitted a UUID is generated. Responses echo the header, and all logs/metrics include the correlation ID to simplify tracing across services.

## Environment matrix

| Profile      | `APP_ENV` / `NODE_ENV` | Default log level | Metrics enabled | DynamoDB endpoint            | Notes                                   |
|--------------|------------------------|-------------------|-----------------|------------------------------|-----------------------------------------|
| Local        | `local`                | `debug`           | false           | `http://localhost:8000`       | Use with DynamoDB Local; no auth        |
| Development  | `development`          | `debug`           | optional        | Usually staging DynamoDB URL | Same as local but remote AWS services   |
| Test         | `test`                 | `error`           | false           | `http://localhost:8000` (CI)  | Used by automated Jest/integration tests |
| Production   | `production`           | `info`            | true by default | Managed DynamoDB endpoint     | Requires IAM roles, metrics/log policies |

Set `APP_ENV`/`NODE_ENV` (and override individual vars in `.env` or CI secrets) to switch between these profiles.
