[CmdletBinding()]
param(
  [string]$Bucket = "game.adamandreason.com",
  [string]$DistributionId = "",
  [switch]$SkipWindowsBuild,
  [switch]$SkipLinuxBuild,
  [switch]$SkipWebDeploy,
  [switch]$AllowDirty
)

$ErrorActionPreference = "Stop"

function Assert-Command {
  param(
    [string]$Name,
    [string]$InstallHint
  )
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is required. $InstallHint"
  }
}

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Action
  )
  Write-Host "==> $Name"
  try {
    & $Action
  } catch {
    Write-Error "$Name failed: $($_.Exception.Message)"
    throw
  }
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Assert-Command -Name "npm" -InstallHint "Install Node.js LTS."
if (-not $SkipLinuxBuild) {
  Assert-Command -Name "docker" -InstallHint "Install Docker Desktop."
  Assert-Command -Name "tar" -InstallHint "Ensure tar is available on PATH (Windows 10+ includes bsdtar)."
}
if (-not $SkipWebDeploy) {
  Assert-Command -Name "aws" -InstallHint "Install AWS CLI and run aws configure."
}

$gitStatus = git status --porcelain 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "git status failed. Run this script inside the repository."
}
if (-not $AllowDirty -and $gitStatus) {
  throw "Working tree has uncommitted changes. Commit or stash first, or pass -AllowDirty."
}

if (-not $DistributionId) {
  $DistributionId = $env:CLOUDFRONT_DISTRIBUTION_ID
}

Push-Location $repoRoot
try {
  if (-not $SkipWindowsBuild) {
    Invoke-Step "Build Windows release" { npm run dist }
  }

  if (-not $SkipLinuxBuild) {
    $dockerScript = "mkdir -p /tmp/build && cd /project && tar --exclude=node_modules --exclude=dist --exclude=release -cf - . | (cd /tmp/build && tar -xf -) && cd /tmp/build && npm ci && npm run build:renderer && npx electron-builder --linux && mkdir -p /project/release && cp -R /tmp/build/release/* /project/release/"
    $dockerArgs = @(
      "run", "--rm",
      "-v", "${repoRoot}:/project",
      "-w", "/tmp/build",
      "electronuserland/builder:latest",
      "/bin/bash", "-lc", $dockerScript
    )
    Invoke-Step "Build Linux AppImage (Docker clean build)" { & docker @dockerArgs }
  }

  if (-not $SkipWebDeploy) {
    $distIndex = Join-Path $repoRoot "dist\\index.html"
    if (-not (Test-Path $distIndex)) {
      Invoke-Step "Build web assets" { npm run build }
    }
    $deployScript = Join-Path $PSScriptRoot "deploy-aws.ps1"
    Invoke-Step "Deploy web build to S3" {
      & $deployScript -Bucket $Bucket -DistributionId $DistributionId
    }
  }
} finally {
  Pop-Location
}

Write-Host "Release pipeline complete."
