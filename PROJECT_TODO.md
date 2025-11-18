# Areas for Improvement

## 1. IaC & CI/CD

**Why it matters:** There is no Infrastructure-as-Code template or pipeline describing how Lambda/API Gateway/DynamoDB resources are provisioned. Manual deployments are error-prone and not reproducible.

**Action items**

1. Create a SAM, Serverless Framework, or AWS CDK template that defines the API Gateway routes, Lambda handlers, IAM roles, and DynamoDB table.

## 2. Logging & Observability

**Why it matters:** Although structured logs and basic CloudWatch metrics exist now, deeper visibility (additional metrics, tracing, log policies) is still missing.

**Action items**

1. Expand the structured logger to include correlation IDs and potentially adopt a standardized library (pino/winston) if log shipping tools require specific formats.

## 3. Security & Secrets Management

**Why it matters:** Credentials are stored in `.env`, and the API lacks authentication/rate limiting guidance; production environments require stronger controls.

**Action items**

1. Use IAM execution roles for Lambda instead of long-lived AWS keys; remove secrets from `.env` for prod.
2. Fetch sensitive configuration from AWS Secrets Manager or Parameter Store and expose a helper in `src/config/env.ts`.
3. Define an authentication and throttling strategy (JWT, Cognito, API keys, etc.) and document it.

## 4. Testing & Quality Tooling

**Why it matters:** Unit/handler tests exist, but contract/e2e coverage is still missing.

**Action items**

1. Introduce contract or end-to-end tests (Postman/Newman, Pact, etc.) to ensure the API contract stays stable.

## 5. Documentation & Environment Matrix

**Why it matters:** README still needs clearer onboarding guidance on how to run/deploy locally and in the cloud.

**Action items**

1. Document local testing workflows (SAM CLI, `npm run dev -- --env=local`, `sam local invoke`, etc.).
