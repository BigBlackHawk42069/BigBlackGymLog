# concat.ps1 — concatenate Beautified\src\*.js into the dev output file.
# $PSScriptRoot is the Beautified\ directory (where this script lives).

$files = Get-ChildItem (Join-Path $PSScriptRoot 'src\*.js') | Sort-Object Name
$parts = $files | ForEach-Object { [IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8) }
$out   = Join-Path $PSScriptRoot 'Big-Black-Gym-Log-Test.beautified.js'
[IO.File]::WriteAllText($out, ($parts -join ''), [Text.Encoding]::UTF8)
Write-Host "Built: $($files.Count) files -> $out"
