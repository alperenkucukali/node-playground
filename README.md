# Node Playground

This Express-based playground exposes CRUD APIs for media genres and artists backed by DynamoDB. You can run it directly with Node.js or spin up the full stack via Docker Compose.

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

- `npm run dev`: Development mode with `node --watch`.
- `npm start`: Plain Node process for production-like testing.

The HTTP server listens on `http://localhost:3000` by default.

### With Docker

To boot the API and DynamoDB Local together:

```bash
docker compose up --build
```

This runs the API container on port 3000 and DynamoDB Local on port 8000. Data persists inside the `dynamodb-data` volume.

## DynamoDB setup & seed data

Use the helper scripts to create the single DynamoDB table (default name `media-catalog`) and seed sample data:

```bash
npm run setup:catalog   # creates the media-catalog table
npm run seed:genres     # inserts sample genres
npm run seed:artists    # inserts sample artists
# or everything at once
npm run seed:all
```

## Tests

Run Jest with:

```bash
npm test
```

## Useful notes

- Entry point lives in `src/server.js`; the Express app resides in `src/app.js`.
- Centralized configuration is in `src/config/env.js`, which exposes every environment toggle (including `CATALOG_TABLE_NAME`).
