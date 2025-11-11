#!/bin/sh
set -euo pipefail

wait_for_dynamo() {
  endpoint="${AWS_DYNAMODB_ENDPOINT:-http://dynamodb-local:8000}"
  retries="${DYNAMO_MAX_RETRIES:-30}"
  delay="${DYNAMO_RETRY_DELAY:-2}"

  host=$(printf "%s" "$endpoint" | sed -E 's#^[a-zA-Z]+://([^:/]+).*#\1#')
  port=$(printf "%s" "$endpoint" | sed -E 's#^[a-zA-Z]+://[^:/]+:([0-9]+).*#\1#')
  if [ -z "$port" ]; then
    port=80
  fi

  echo "Waiting for DynamoDB Local at ${host}:${port}..."
  i=1
  while [ "$i" -le "$retries" ]; do
    if nc -z "$host" "$port" >/dev/null 2>&1; then
      echo "DynamoDB Local is reachable."
      return 0
    fi
    echo "Attempt $i/${retries} failed; retrying in ${delay}s..."
    i=$((i + 1))
    sleep "$delay"
  done

  echo "DynamoDB Local did not become ready after ${retries} attempts." >&2
  return 1
}

wait_for_dynamo

echo "Ensuring catalog table exists..."
npm run setup:catalog

echo "Starting application..."
exec "$@"
