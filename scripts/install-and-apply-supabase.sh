#!/usr/bin/env bash
# Install Supabase CLI if not present and apply all migrations
set -euo pipefail

if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Installing globally via npm..."
  npm install -g @supabase/cli@latest
fi

# Accept project ref as env var or first argument
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-${1:-}}"
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "Error: SUPABASE_PROJECT_REF must be set as an environment variable or passed as the first argument."
  exit 1
fi

# Link the project (idempotent)
supabase link --project-ref "$SUPABASE_PROJECT_REF"

# Apply migrations non-interactively
supabase db push --non-interactive

echo "All Supabase migrations have been applied successfully."
