$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$port = 5173
$url = "http://127.0.0.1:$port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
try {
  $listener.Start()
} catch {
  Write-Host "No se pudo abrir el puerto $port. Cierra otra ventana de Periodica y prueba otra vez."
  Read-Host "Pulsa Enter"
  exit 1
}

Start-Process $url
Write-Host ""
Write-Host "  Periodica esta abierto en $url"
Write-Host "  No cierres esta ventana mientras juegas."
Write-Host ""

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".ico"  = "image/x-icon"
  ".woff2"= "font/woff2"
  ".map"  = "application/json"
}

$fullRoot = (Resolve-Path $root).Path
if (-not $fullRoot.EndsWith([IO.Path]::DirectorySeparatorChar)) {
  $fullRoot += [IO.Path]::DirectorySeparatorChar
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.LocalPath)
  if ($path -eq "/") { $path = "/index.html" }
  $rel = $path.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
  $file = Join-Path $root $rel
  try {
    $fullFile = [IO.Path]::GetFullPath($file)
  } catch {
    $ctx.Response.StatusCode = 400
    $ctx.Response.Close()
    continue
  }
  if (-not $fullFile.StartsWith($fullRoot, [StringComparison]::OrdinalIgnoreCase)) {
    $ctx.Response.StatusCode = 403
    $ctx.Response.Close()
    continue
  }
  if (-not (Test-Path -LiteralPath $fullFile -PathType Leaf)) {
    $ctx.Response.StatusCode = 404
    $ctx.Response.Close()
    continue
  }
  $ext = [IO.Path]::GetExtension($fullFile).ToLowerInvariant()
  $bytes = [IO.File]::ReadAllBytes($fullFile)
  $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" })
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.Close()
}
