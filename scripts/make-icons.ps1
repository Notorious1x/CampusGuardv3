Add-Type -AssemblyName System.Drawing
$out192 = "C:\Users\pokaa\CascadeProjects\CampusGuardv3\public\logo192.png"
$out512 = "C:\Users\pokaa\CascadeProjects\CampusGuardv3\public\logo512.png"

function Draw-Icon([int]$size) {
  $s = $size / 64.0
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $red = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 38, 38))
  $g.FillRectangle($red, 0, 0, $size, $size)

  $shield = New-Object System.Drawing.Drawing2D.GraphicsPath
  $shield.AddLine([float](32*$s), [float](10*$s), [float](16*$s), [float](18*$s))
  $shield.AddLine([float](16*$s), [float](18*$s), [float](16*$s), [float](30*$s))
  $shield.AddBezier([float](16*$s), [float](30*$s), [float](16*$s), [float](42*$s), [float](32*$s), [float](52*$s), [float](32*$s), [float](52*$s))
  $shield.AddBezier([float](32*$s), [float](52*$s), [float](32*$s), [float](52*$s), [float](48*$s), [float](42*$s), [float](48*$s), [float](30*$s))
  $shield.AddLine([float](48*$s), [float](30*$s), [float](48*$s), [float](18*$s))
  $shield.CloseFigure()
  $g.FillPath([System.Drawing.Brushes]::White, $shield)

  $pts = @(28.5, 38, 22, 31.5, 25, 28.5, 28.5, 32, 39, 21.5, 42, 24.5)
  $pf = @()
  for ($i = 0; $i -lt 12; $i += 2) {
    $pf += New-Object System.Drawing.PointF([float]($pts[$i] * $s), [float]($pts[$i + 1] * $s))
  }
  $check = New-Object System.Drawing.Drawing2D.GraphicsPath
  $check.AddPolygon($pf)
  $g.FillPath($red, $check)

  $g.Dispose()
  return $bmp
}

$bmp192 = Draw-Icon 192
$bmp192.Save($out192, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Dispose()

$bmp512 = Draw-Icon 512
$bmp512.Save($out512, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()

Write-Host "Icons created:"
Get-ChildItem "C:\Users\pokaa\CascadeProjects\CampusGuardv3\public\*.png" | Select-Object Name, Length
