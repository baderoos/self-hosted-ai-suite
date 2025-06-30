# PowerShell script to install Supabase CLI (if needed) and apply all migrations
# Usage: powershell -ExecutionPolicy Bypass -File scripts/install-and-apply-supabase.ps1

# Install Supabase CLI if not present
$cliInstaller = Join-Path $PSScriptRoot 'install-supabase-cli.ps1'
& $cliInstaller
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install Supabase CLI"
    exit 1
}

# Verify CLI is available
if (!(Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Error "Supabase CLI is not available after installation"
    exit 1
}
Write-Host "Applying Supabase migrations..."
supabase db push
if ($LASTEXITCODE -ne 0) {
    Write-Error "Supabase migration failed. Please check the error output above."
    exit 1
}

Write-Host "All Supabase migrations have been applied successfully."
