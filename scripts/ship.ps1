[CmdletBinding()]
param(
  [string]$Remote = "origin",
  [string]$Branch = "",

  [string]$Bucket = "game.adamandreason.com",
  [string]$DistributionId = "",

  [switch]$AllowDirty,
  [switch]$AutoCommit,
  [string]$CommitMessage = "",

  [switch]$SkipGitPush,
  [switch]$SkipTag,
  [switch]$SkipWindowsBuild,
  [switch]$SkipLinuxBuild,
  [switch]$SkipAndroidBuild,
  [switch]$SkipWebBuild,
  [switch]$SkipGhRelease,
  [switch]$SkipGhUpload,
  [switch]$SkipWebDeploy,

  [switch]$Force,
  [switch]$DryRun
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

function Invoke-External {
  param(
    [Parameter(Mandatory=$true)][string]$FilePath,
    [string[]]$Arguments
  )

  $pretty = $Arguments -join ' '
  if ($DryRun) {
    Write-Host "[dry-run] $FilePath $pretty"
    return
  }

  $tail = New-Object System.Collections.Generic.Queue[string]
  $maxTailLines = 200

  # Native commands often write warnings to stderr; don't let $ErrorActionPreference=Stop turn those into hard failures.
  $prevErrPref = $ErrorActionPreference
  $prevGlobalErrPref = $global:ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $global:ErrorActionPreference = "Continue"

  $prevNativeErrPref = $null
  if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue) {
    $prevNativeErrPref = $global:PSNativeCommandUseErrorActionPreference
    $global:PSNativeCommandUseErrorActionPreference = $false
  }

  try {
    & $FilePath @Arguments 2>&1 | ForEach-Object {
      $line = $_.ToString()
      Write-Host $line
      $tail.Enqueue($line)
      while ($tail.Count -gt $maxTailLines) {
        [void]$tail.Dequeue()
      }
    }
  } finally {
    $ErrorActionPreference = $prevErrPref
    $global:ErrorActionPreference = $prevGlobalErrPref
    if ($null -ne $prevNativeErrPref) {
      $global:PSNativeCommandUseErrorActionPreference = $prevNativeErrPref
    }
  }

  if ($LASTEXITCODE -ne 0) {
    $tailText = ($tail.ToArray() -join "`n")
    throw "Command failed ($LASTEXITCODE): $FilePath $pretty`n--- command output (last $maxTailLines lines) ---`n$tailText"
  }
}

function Get-RepoRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot ".."))
}

function Get-PackageVersion {
  param([string]$RepoRoot)
  $pkgPath = Join-Path $RepoRoot "package.json"
  $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
  return [string]$pkg.version
}

function Get-TagName {
  param([string]$Version)
  return "v$Version"
}

function Get-DistributionId {
  param(
    [string]$RepoRoot,
    [string]$Explicit
  )

  if ($Explicit) { return $Explicit }
  if ($env:CLOUDFRONT_DISTRIBUTION_ID) { return $env:CLOUDFRONT_DISTRIBUTION_ID }

  $androidEnv = Join-Path $RepoRoot "android\.env"
  if (Test-Path $androidEnv) {
    $line = (Get-Content $androidEnv | Where-Object { $_ -match '^CLOUDFRONT_DISTRIBUTION_ID=' } | Select-Object -First 1)
    if ($line) {
      return ($line.Split('=',2)[1]).Trim()
    }
  }

  return ""
}

function Get-ExpectedAssets {
  param(
    [string]$RepoRoot,
    [string]$Version
  )

  $rel = Join-Path $RepoRoot "release"
  $assets = @(
    (Join-Path $rel "Tetris Flip Setup $Version.exe"),
    (Join-Path $rel "Tetris Flip Setup $Version.exe.blockmap"),
    (Join-Path $rel "latest.yml"),
    (Join-Path $rel "Tetris Flip-$Version.AppImage"),
    (Join-Path $rel "latest-linux.yml"),
    (Join-Path $RepoRoot "android\app\build\outputs\apk\current\debug\app-current-debug.apk"),
    (Join-Path $RepoRoot "android\app\build\outputs\apk\android10\debug\app-android10-debug.apk")
  )

  return $assets
}

function Assert-AssetsExist {
  param([string[]]$Paths)

  foreach ($p in $Paths) {
    if (-not (Test-Path $p)) {
      throw "Missing asset: $p"
    }
    $item = Get-Item $p
    if ($item.Length -le 0) {
      throw "Asset is empty: $p"
    }
  }
}

function Ensure-GitClean {
  param([switch]$Allow)
  $status = git status --porcelain
  if ($LASTEXITCODE -ne 0) {
    throw "git status failed"
  }
  if (-not $Allow -and $status) {
    throw "Working tree has uncommitted changes. Commit/stash, or pass -AllowDirty, or use -AutoCommit."
  }
}

function Maybe-AutoCommit {
  param(
    [string]$RepoRoot,
    [string]$Message
  )

  $status = git status --porcelain
  if ($LASTEXITCODE -ne 0) { throw "git status failed" }
  if (-not $status) {
    Write-Host "No changes to commit."
    return
  }

  Invoke-External git @("add","-A")
  $msg = $Message
  if (-not $msg) {
    $version = Get-PackageVersion -RepoRoot $RepoRoot
    $msg = "chore(release): v$version"
  }
  Invoke-External git @("commit","-m",$msg)
}

function Ensure-Branch {
  param([string]$Desired)

  if (-not $Desired) { return }
  $current = (git rev-parse --abbrev-ref HEAD | Out-String).Trim()
  if ($LASTEXITCODE -ne 0) { throw "git rev-parse failed" }
  if ($current -ne $Desired) {
    throw "On branch '$current' but expected '$Desired'. (Pass -Branch '' to skip enforcing.)"
  }
}

function Ensure-TagIsNewOrForce {
  param(
    [string]$Tag,
    [switch]$Force
  )

  $existing = (git tag -l $Tag | Out-String).Trim()
  if ($LASTEXITCODE -ne 0) { throw "git tag -l failed" }
  if ($existing -and -not $Force) {
    throw "Tag already exists ($Tag). Bump version or pass -Force."
  }
}

function Ensure-GhReleaseExists {
  param(
    [string]$Tag,
    [switch]$Force
  )

  if ($DryRun) {
    Write-Host "[dry-run] gh release view $Tag"
    Write-Host "[dry-run] gh release create $Tag --title \"Tetris Flip $Tag\" --generate-notes --verify-tag (if missing)"
    return
  }

  # gh can emit stderr as a PowerShell error record; don’t let that prevent probing for existence.
  $exists = $false
  $prevErrPref = $ErrorActionPreference
  $prevGlobalErrPref = $global:ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $global:ErrorActionPreference = "Continue"

  $prevNativeErrPref = $null
  if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue) {
    $prevNativeErrPref = $global:PSNativeCommandUseErrorActionPreference
    $global:PSNativeCommandUseErrorActionPreference = $false
  }

  try {
    try {
      & gh release view $Tag *> $null
    } catch {
      # ignore
    }
    if ($LASTEXITCODE -eq 0) {
      $exists = $true
    }
  } finally {
    $ErrorActionPreference = $prevErrPref
    $global:ErrorActionPreference = $prevGlobalErrPref
    if ($null -ne $prevNativeErrPref) {
      $global:PSNativeCommandUseErrorActionPreference = $prevNativeErrPref
    }
  }

  if ($exists -and -not $Force) {
    return
  }

  if (-not $exists) {
    try {
      Invoke-External gh @('release','create',$Tag,'--title',"Tetris Flip $Tag",'--generate-notes','--verify-tag')
    } catch {
      if ($_.Exception.Message -match 'already exists') {
        Write-Host "GitHub release already exists: $Tag"
        return
      }
      throw
    }
  }
}
function Build-Windows {
  param([string]$RepoRoot)

  # First try the standard pipeline.
  try {
    Invoke-External npm @("run","dist")
    return
  } catch {
    $msg = $_.Exception.Message
    if ($msg -match "winCodeSign" -and $msg -match "Cannot create symbolic link") {
      Write-Host "Windows build hit winCodeSign symlink error; retrying with signAndEditExecutable=false."
      Invoke-External npm @("run","build:renderer")
      $eb = Join-Path $RepoRoot "node_modules\.bin\electron-builder.cmd"
      Invoke-External $eb @("--win","--config.win.signAndEditExecutable=false")
      return
    }

    throw
  }
}

function Build-LinuxAppImageDocker {
  param([string]$RepoRoot)

  $dockerScript = "mkdir -p /tmp/build && cd /project && tar --exclude=node_modules --exclude=dist --exclude=release -cf - . | (cd /tmp/build && tar -xf -) && cd /tmp/build && npm ci && npm run build:renderer && npx electron-builder --linux && mkdir -p /project/release && cp -R /tmp/build/release/* /project/release/"

  $dockerArgs = @(
    "run", "--rm",
    "-v", "${RepoRoot}:/project",
    "-w", "/tmp/build",
    "electronuserland/builder:latest",
    "/bin/bash", "-lc", $dockerScript
  )

  Invoke-External docker $dockerArgs
}

function Build-Android {
  Invoke-External npm @("run","android:current:debug")
  Invoke-External npm @("run","android:android10:debug")
}

function Build-Web {
  Invoke-External npm @("run","build")
}

function Push-Git {
  param(
    [string]$Remote,
    [string]$Branch
  )

  if (-not $Branch) {
    $Branch = (git rev-parse --abbrev-ref HEAD | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { throw "git rev-parse failed" }
  }

  Invoke-External git @("push",$Remote,$Branch)
}

function Create-And-Push-Tag {
  param(
    [string]$Tag,
    [string]$Remote
  )

  $existing = (git tag -l $Tag | Out-String).Trim()
  if ($LASTEXITCODE -ne 0) { throw "git tag -l failed" }
  if (-not $existing) {
    Invoke-External git @("tag","-a",$Tag,"-m","Tetris Flip $Tag")
  }
  Invoke-External git @("push",$Remote,$Tag)
}

function Deploy-Web {
  param(
    [string]$RepoRoot,
    [string]$Bucket,
    [string]$DistributionId
  )

  $awsDir = Join-Path $env:LocalAppData "Programs\Amazon\AWSCLIV2"
  if (Test-Path (Join-Path $awsDir "aws.exe")) {
    $env:PATH = "$awsDir;$env:PATH"
  }

  $deployScript = Join-Path $RepoRoot "scripts\deploy-aws.ps1"
  $args = @("-Bucket", $Bucket)
  if ($DistributionId) {
    $args += @("-DistributionId", $DistributionId)
  }

  if ($DryRun) {
    Write-Host "[dry-run] powershell -ExecutionPolicy Bypass -File $deployScript $($args -join ' ')"
    return
  }

  powershell -NoProfile -ExecutionPolicy Bypass -File $deployScript @args
  if ($LASTEXITCODE -ne 0) {
    throw "deploy-aws.ps1 failed ($LASTEXITCODE)"
  }
}

$repoRoot = Get-RepoRoot

Assert-Command -Name "git" -InstallHint "Install Git."
Assert-Command -Name "npm" -InstallHint "Install Node.js (npm)."
Assert-Command -Name "gh" -InstallHint "Install GitHub CLI and run gh auth login."

if (-not $SkipLinuxBuild) {
  Assert-Command -Name "docker" -InstallHint "Install Docker Desktop and ensure docker is on PATH."
  Assert-Command -Name "tar" -InstallHint "Ensure tar is available on PATH (Windows includes bsdtar)."
}
if (-not $SkipWebDeploy) {
  Assert-Command -Name "aws" -InstallHint "Install AWS CLI and configure credentials."
}

Push-Location $repoRoot
try {
  Invoke-Step "Check git state" {
    Ensure-Branch -Desired $Branch
    if ($AutoCommit) {
      Maybe-AutoCommit -RepoRoot $repoRoot -Message $CommitMessage
    }
    Ensure-GitClean -Allow:($AllowDirty -or $AutoCommit)
  }

  $version = Get-PackageVersion -RepoRoot $repoRoot
  $tag = Get-TagName -Version $version

  Invoke-Step "Check version/tag" {
    Ensure-TagIsNewOrForce -Tag $tag -Force:$Force
  }

  if (-not $SkipWebBuild) {
    Invoke-Step "Build web" { Build-Web }
  }

  if (-not $SkipAndroidBuild) {
    Invoke-Step "Build Android APKs" { Build-Android }
  }

  if (-not $SkipWindowsBuild) {
    Invoke-Step "Build Windows installer" { Build-Windows -RepoRoot $repoRoot }
  }

  if (-not $SkipLinuxBuild) {
    Invoke-Step "Build Linux AppImage (Docker)" { Build-LinuxAppImageDocker -RepoRoot $repoRoot }
  }

  if (-not $SkipGitPush) {
    Invoke-Step "Push git branch" { Push-Git -Remote $Remote -Branch $Branch }
  }

  if (-not $SkipTag) {
    Invoke-Step "Create/push git tag" { Create-And-Push-Tag -Tag $tag -Remote $Remote }
  }

  if (-not $SkipGhRelease) {
    Invoke-Step "Ensure GitHub release" { Ensure-GhReleaseExists -Tag $tag -Force:$Force }
  }

  if (-not $SkipGhUpload) {
    Invoke-Step "Upload release assets" {
      $assets = Get-ExpectedAssets -RepoRoot $repoRoot -Version $version
      Assert-AssetsExist -Paths $assets
      $uploadArgs = @("release","upload",$tag) + $assets + @("--clobber")
      Invoke-External gh $uploadArgs
    }
  }

  if (-not $SkipWebDeploy) {
    Invoke-Step "Deploy web to AWS" {
      $distId = Get-DistributionId -RepoRoot $repoRoot -Explicit $DistributionId
      Deploy-Web -RepoRoot $repoRoot -Bucket $Bucket -DistributionId $distId
    }
  }

  Write-Host "Ship complete: $tag"
} finally {
  Pop-Location
}






