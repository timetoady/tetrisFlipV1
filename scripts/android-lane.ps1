[CmdletBinding()]
param(
  [ValidateSet("current", "android10")]
  [string]$Lane = "current",
  [ValidateSet("build", "install", "run", "livereload")]
  [string]$Action = "build",
  [ValidateSet("21", "17")]
  [string]$JavaTarget = "17",
  [string]$Host = "",
  [int]$Port = 5173,
  [string]$JavaHome = ""
)

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if ($JavaHome) {
  $env:JAVA_HOME = $JavaHome
  $env:Path = "$env:JAVA_HOME\\bin;$env:Path"
} else {
  $jbr = "C:\\Program Files\\Android\\Android Studio\\jbr"
  if (Test-Path $jbr) {
    $env:JAVA_HOME = $jbr
    $env:Path = "$env:JAVA_HOME\\bin;$env:Path"
  }
}

$env:ORG_GRADLE_PROJECT_TETRISFLIP_JAVA = $JavaTarget

$laneTask = if ($Lane -eq "android10") { "Android10" } else { "Current" }
$gradleDir = Join-Path $repoRoot "android"

switch ($Action) {
  "build" {
    Push-Location $gradleDir
    try {
      & .\gradlew.bat "assemble${laneTask}Debug" "-PTETRISFLIP_JAVA=$JavaTarget"
    } finally {
      Pop-Location
    }
  }
  "install" {
    Push-Location $gradleDir
    try {
      & .\gradlew.bat "install${laneTask}Debug" "-PTETRISFLIP_JAVA=$JavaTarget"
    } finally {
      Pop-Location
    }
  }
  "run" {
    & npx cap run android --flavor $Lane
  }
  "livereload" {
    if (-not $Host) {
      throw "Host is required for live reload. Example: -Host 192.168.68.100"
    }
    & npx cap run android --flavor $Lane -l --host $Host --port $Port
  }
}

