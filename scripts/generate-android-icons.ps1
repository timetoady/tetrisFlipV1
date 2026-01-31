param(
  [string]$Source = "public/assets/tetrisflip2.png",
  [string]$ResDir = "android/app/src/main/res",
  [string]$BackgroundHex = "#0B1020",
  [double]$ForegroundScale = 0.82
)

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

function Parse-Color([string]$hex) {
  $h = $hex.Trim()
  if ($h.StartsWith('#')) { $h = $h.Substring(1) }
  if ($h.Length -ne 6) { throw "Expected #RRGGBB, got: $hex" }
  $r = [Convert]::ToInt32($h.Substring(0,2), 16)
  $g = [Convert]::ToInt32($h.Substring(2,2), 16)
  $b = [Convert]::ToInt32($h.Substring(4,2), 16)
  return [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
}

function New-Graphics([System.Drawing.Bitmap]$bmp) {
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return $g
}

function Save-Png([System.Drawing.Bitmap]$bmp, [string]$outPath) {
  $dir = Split-Path -Parent $outPath
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

$bgColor = Parse-Color $BackgroundHex

if (!(Test-Path $Source)) { throw "Source not found: $Source" }
if (!(Test-Path $ResDir)) { throw "Res dir not found: $ResDir" }

$srcPath = (Resolve-Path $Source).Path
$img = [System.Drawing.Image]::FromFile($srcPath)
try {
  $side = [Math]::Min($img.Width, $img.Height)
  $cropX = [int][Math]::Floor(($img.Width - $side) / 2)
  $cropY = [int][Math]::Floor(($img.Height - $side) / 2)
  $cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $side, $side)

  $square = New-Object System.Drawing.Bitmap($side, $side)
  try {
    $g = New-Graphics $square
    try {
      $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$side,$side)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
    } finally {
      $g.Dispose()
    }

    $legacySizes = @{
      "mipmap-mdpi"    = 48
      "mipmap-hdpi"    = 72
      "mipmap-xhdpi"   = 96
      "mipmap-xxhdpi"  = 144
      "mipmap-xxxhdpi" = 192
    }
    $fgSizes = @{
      "mipmap-mdpi"    = 108
      "mipmap-hdpi"    = 162
      "mipmap-xhdpi"   = 216
      "mipmap-xxhdpi"  = 324
      "mipmap-xxxhdpi" = 432
    }

    foreach ($entry in $legacySizes.GetEnumerator()) {
      $dir = $entry.Key
      $size = [int]$entry.Value

      foreach ($name in @("ic_launcher.png", "ic_launcher_round.png")) {
        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        try {
          $g2 = New-Graphics $bmp
          try {
            $g2.Clear($bgColor)
            $g2.DrawImage($square, 0, 0, $size, $size)
          } finally {
            $g2.Dispose()
          }
          Save-Png $bmp (Join-Path $ResDir "$dir/$name")
        } finally {
          $bmp.Dispose()
        }
      }
    }

    foreach ($entry in $fgSizes.GetEnumerator()) {
      $dir = $entry.Key
      $size = [int]$entry.Value
      $bmp = New-Object System.Drawing.Bitmap($size, $size)
      try {
        $g2 = New-Graphics $bmp
        try {
          $g2.Clear([System.Drawing.Color]::Transparent)
          $scaled = [int][Math]::Round($size * $ForegroundScale)
          if ($scaled -lt 1) { $scaled = 1 }
          $offset = [int][Math]::Floor(($size - $scaled) / 2)
          $g2.DrawImage($square, $offset, $offset, $scaled, $scaled)
        } finally {
          $g2.Dispose()
        }
        Save-Png $bmp (Join-Path $ResDir "$dir/ic_launcher_foreground.png")
      } finally {
        $bmp.Dispose()
      }
    }

  } finally {
    $square.Dispose()
  }
} finally {
  $img.Dispose()
}

Write-Host "Generated Android launcher icons from $Source" -ForegroundColor Green
