# build.ps1
# Assembles all src\ files into the beautified userscript.

$srcDir  = "$PSScriptRoot\src"
$outFile = "$PSScriptRoot\Big-Black-Gym-Log-Test.beautified.js"

$files = Get-ChildItem "$srcDir\*.js" | Sort-Object Name

$parts = $files | ForEach-Object { [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8) }
$joined = $parts -join ""

[System.IO.File]::WriteAllText($outFile, $joined, [System.Text.Encoding]::UTF8)

Write-Host "Built: $($files.Count) files -> $outFile"
