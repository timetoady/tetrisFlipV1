[CmdletBinding()]
param(
  [string]$Bucket = "game.adamandreason.com",
  [string]$DistributionId = ""
)

$ErrorActionPreference = "Stop"

$distPath = Join-Path $PSScriptRoot "..\\dist"
$indexPath = Join-Path $distPath "index.html"

if (-not (Test-Path $indexPath)) {
  Write-Error "dist/index.html not found. Run npm run build first."
  exit 1
}

Write-Host "Uploading index.html with no-cache..."
aws s3 cp $indexPath "s3://$Bucket/index.html" --cache-control "no-cache"

Write-Host "Syncing assets with long cache..."
aws s3 sync $distPath "s3://$Bucket" --exclude "index.html" --cache-control "public, max-age=31536000, immutable" --delete

if ($DistributionId -ne "") {
  Write-Host "Creating CloudFront invalidation..."
  aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/" "/index.html"
}

Write-Host "Done."
