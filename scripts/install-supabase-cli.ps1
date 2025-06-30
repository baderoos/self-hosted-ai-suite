# PowerShell script to download and install the Supabase CLI binary for Windows and add it to PATH
# Usage: powershell -ExecutionPolicy Bypass -File scripts/install-supabase-cli.ps1

$cliUrl = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"
$installDir = "$env:USERPROFILE\.supabase-cli-bin"
$cliPath = "$installDir\supabase.exe"

if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir | Out-Null
}

Write-Host "Downloading Supabase CLI binary..."
Invoke-WebRequest -Uri $cliUrl -OutFile $cliPath

# Add installDir to user PATH if not already present
$envPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
if (-not $envPath.Split(';') -contains $installDir) {
    [System.Environment]::SetEnvironmentVariable("PATH", "$envPath;$installDir", "User")
    Write-Host "Added $installDir to user PATH. You may need to restart your terminal."
}

Write-Host "Supabase CLI installed at $cliPath."
Write-Host "You can now run 'supabase --version' to verify installation."
