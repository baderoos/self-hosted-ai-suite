#!/usr/bin/env bash
# Script to automate applying all Supabase migrations
# Usage: bash scripts/apply-supabase-migrations.sh

set -euo pipefail

if ! command -v supabase &> /dev/null; then
  echo "supabase CLI not found. Please install it from https://supabase.com/docs/guides/cli"
  exit 1
fi

supabase db push

echo "All Supabase migrations have been applied successfully."
