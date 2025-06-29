# PowerShell script to check for GitHub CLI and install if missing
$cli = Get-Command gh -ErrorAction SilentlyContinue
if (-not $cli) {
    Write-Host "GitHub CLI not found. Installing via winget..."
    winget install --id GitHub.cli -e
    Write-Host "GitHub CLI installed."
    Write-Host "If you still get 'gh' not recognized, restart your PowerShell session or run: `$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine')`"
} else {
    Write-Host "GitHub CLI is already installed."
}
