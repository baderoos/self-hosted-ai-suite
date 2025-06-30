# PowerShell script to download and install the Supabase CLI binary for Windows and add it to PATH
# Usage: powershell -ExecutionPolicy Bypass -File scripts/install-supabase-cli.ps1

# List of versions and checksums (primary first, then fallbacks)
$versions = @(
    @{ version = "v2.26.9"; checksum = "0019DFC4B32D63C1392AA264AED2253C1E0C2FB09216F8E2CC269BBFB8BB49B5" },
    @{ version = "v2.26.8"; checksum = "<INSERT_SHA256_HERE>" },
    @{ version = "v2.26.7"; checksum = "<INSERT_SHA256_HERE>" },
    @{ version = "v2.26.6"; checksum = "<INSERT_SHA256_HERE>" }
)
$installDir = "$env:USERPROFILE\.supabase-cli-bin"
$cliPath = "$installDir\supabase.exe"
$maxRetries = 3
$retryDelaySeconds = 10

# Minimum expected file size for a valid Supabase CLI binary (100KB)
$MinFileSize = 102400

if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir | Out-Null
}

function Invoke-DownloadFileChecked($url, $outPath) {
    $curlPath = (Get-Command curl.exe -ErrorAction SilentlyContinue).Source
    if (-not $curlPath) {
        Write-Error "curl.exe not found. Please install curl or ensure it is in your PATH."
        exit 1
    }
    if (Test-Path $outPath) { Remove-Item $outPath -Force }
    $curlCmd = "curl.exe -L -o `"$outPath`" `"$url`""
    Invoke-Expression $curlCmd
    if ((Test-Path $outPath) -and ((Get-Item $outPath).Length -ge $MinFileSize)) {
        return $true
    } else {
        Write-Warning "Download failed or file too small (corrupt/incomplete)."
        if (Test-Path $outPath) { Remove-Item $outPath -Force }
        return $false
    }
}

function Invoke-DownloadAndVerify($url, $checksum) {
    Write-Host "Downloading Supabase CLI binary from $url ..."
    $cliPathTmp = "$cliPath.tmp"
    $success = $false
    for ($i = 1; $i -le $maxRetries; $i++) {
        if (Invoke-DownloadFileChecked $url $cliPathTmp) {
            $actualChecksum = (Get-FileHash -Path $cliPathTmp -Algorithm SHA256).Hash.ToLower()
            if ($actualChecksum -eq $checksum.ToLower()) {
                Move-Item -Force $cliPathTmp $cliPath
                $success = $true
                break
            } else {
                Write-Warning "Checksum verification failed! Expected $checksum, got $actualChecksum."
                Remove-Item $cliPathTmp -Force
            }
        }
        if ($i -lt $maxRetries) {
            Write-Host "Retrying in $retryDelaySeconds seconds... ($i/$maxRetries)"
            Start-Sleep -Seconds $retryDelaySeconds
        }
    }
    if (-not $success -and (Test-Path $cliPathTmp)) { Remove-Item $cliPathTmp -Force }
    return $success
}

function Get-Remote-Checksum($url) {
    $tmpPath = "$env:TEMP\supabase_cli_tmp.exe"
    if (Invoke-DownloadFileChecked $url $tmpPath) {
        $actualChecksum = (Get-FileHash -Path $tmpPath -Algorithm SHA256).Hash.ToLower()
        Write-Host "SHA256 for $url: $actualChecksum"
        Remove-Item $tmpPath -Force
        return $actualChecksum
    } else {
        return $null
    }
}

function Update-Script-Checksum($ver, $newChecksum) {
    $scriptPath = $MyInvocation.MyCommand.Path
    $content = Get-Content $scriptPath
    $pattern = "@\{ version = \"$ver\"; checksum = \"<INSERT_SHA256_HERE>\" }"
    $replacement = "@{ version = \"$ver\"; checksum = \"$newChecksum\" }"
    $newContent = $content -replace [regex]::Escape($pattern), $replacement
    Set-Content -Path $scriptPath -Value $newContent -Force
    Write-Host "Script updated with checksum for $ver. Please re-run the script."
}

function Get-Latest-Version {
    $releasesUrl = "https://api.github.com/repos/supabase/cli/releases/latest"
    $curlPath = (Get-Command curl.exe -ErrorAction SilentlyContinue).Source
    if (-not $curlPath) {
        Write-Error "curl.exe not found. Please install curl or ensure it is in your PATH."
        exit 1
    }
    $json = Invoke-RestMethod -Uri $releasesUrl -Headers @{ 'User-Agent' = 'PowerShell' }
    return $json.tag_name
}

function Add-Version-To-Script($ver) {
    $scriptPath = $MyInvocation.MyCommand.Path
    $content = Get-Content $scriptPath
    $insertIndex = ($content | Select-String -Pattern '\$versions = @\(').LineNumber
    if ($insertIndex) {
        $newLine = "    @{ version = \"$ver\"; checksum = \"<INSERT_SHA256_HERE>\" },"
        $content = $content[0..$insertIndex] + $newLine + $content[($insertIndex+1)..($content.Length-1)]
        Set-Content -Path $scriptPath -Value $content -Force
        Write-Host "Script updated to add new version $ver. Please re-run the script."
        exit 0
    }
}

# Fetch latest version and add to versions if missing
'try {
    $latestVer = Get-Latest-Version
    if (-not ($versions | Where-Object { $_.version -eq $latestVer })) {
        Write-Host "Latest Supabase CLI version $latestVer not in script. Adding..."
        Add-Version-To-Script $latestVer
    }
} catch {
    Write-Warning "Could not fetch latest Supabase CLI version from GitHub. Continuing with known versions."
}

$installed = $false
foreach ($entry in $versions) {
    $ver = $entry.version
    $checksum = $entry.checksum
    $cliUrl = "https://github.com/supabase/cli/releases/download/$ver/supabase_windows_amd64.exe"
    if ($checksum -eq "<INSERT_SHA256_HERE>") {
        Write-Host "No checksum for $ver, attempting to fetch and update it..."
        $autoChecksum = Get-Remote-Checksum $cliUrl
        if ($autoChecksum) {
            Update-Script-Checksum $ver $autoChecksum
            $checksum = $autoChecksum
            # Attempt install immediately with fetched checksum
            if (Invoke-DownloadAndVerify $cliUrl $checksum) {
                Write-Host "Supabase CLI $ver installed successfully."
                $installed = $true
                break
            } else {
                Write-Warning "Failed to install Supabase CLI $ver. Trying next fallback version..."
                continue
            }
        } else {
            continue
        }
    }
    if (Invoke-DownloadAndVerify $cliUrl $checksum) {
        Write-Host "Supabase CLI $ver installed successfully."
        $installed = $true
        break
    } else {
        Write-Warning "Failed to install Supabase CLI $ver. Trying next fallback version..."
    }
}

if (-not $installed) {
    Write-Error "All Supabase CLI download attempts failed. Aborting install."
    exit 1
}

# Add installDir to user PATH if not already present
$envPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
if (-not $envPath.Split(';') -contains $installDir) {
    [System.Environment]::SetEnvironmentVariable("PATH", "$envPath;$installDir", "User")
    Write-Host "Added $installDir to user PATH. You may need to restart your terminal."
}

Write-Host "Supabase CLI installed at $cliPath."
Write-Host "You can now run 'supabase --version' to verify installation."
