# PowerShell script to set all required GitHub secrets for Vercel and Supabase
define-secrets.ps1

param(
  [string]$VercelToken,
  [string]$VercelOrgId,
  [string]$VercelProjectId,
  [string]$SupabaseUrl,
  [string]$SupabaseAnonKey
)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI (gh) is not installed. Please run install-gh-cli.ps1 first."
    exit 1
}

if (-not $VercelToken) { $VercelToken = Read-Host "Enter your VERCEL_TOKEN" }
if (-not $VercelOrgId) { $VercelOrgId = Read-Host "Enter your VERCEL_ORG_ID" }
if (-not $VercelProjectId) { $VercelProjectId = Read-Host "Enter your VERCEL_PROJECT_ID" }
if (-not $SupabaseUrl) { $SupabaseUrl = Read-Host "Enter your VITE_SUPABASE_URL" }
if (-not $SupabaseAnonKey) { $SupabaseAnonKey = Read-Host "Enter your VITE_SUPABASE_ANON_KEY" }

Write-Host "Setting GitHub secrets..."
gh secret set VERCEL_TOKEN --body $VercelToken
if ($LASTEXITCODE -ne 0) { Write-Host "Failed to set VERCEL_TOKEN"; exit 1 }
gh secret set VERCEL_ORG_ID --body $VercelOrgId
gh secret set VERCEL_PROJECT_ID --body $VercelProjectId
gh secret set VITE_SUPABASE_URL --body $SupabaseUrl
gh secret set VITE_SUPABASE_ANON_KEY --body $SupabaseAnonKey
Write-Host "All secrets set successfully."
