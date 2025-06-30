#!/usr/bin/env bash
# Sentry Release Automation Script
# Usage: source your .env or export the required variables before running
#   SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT must be set

set -euo pipefail

if ! command -v sentry-cli &> /dev/null; then
  echo "sentry-cli not found, installing..."
  curl -sL https://sentry.io/get-cli/ | bash
fi

if [[ -z "${SENTRY_AUTH_TOKEN:-}" || -z "${SENTRY_ORG:-}" || -z "${SENTRY_PROJECT:-}" ]]; then
  echo "SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT must be set as environment variables."
  exit 1
fi

export VERSION=$(sentry-cli releases propose-version)

echo "Creating Sentry release: $VERSION"
sentry-cli releases new "$VERSION"
sentry-cli releases set-commits "$VERSION" --auto
sentry-cli releases finalize "$VERSION"
echo "Sentry release $VERSION created and finalized."
