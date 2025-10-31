# build.ps1
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$pathjs = Join-Path $scriptDir 'plse.js'
$pathminjs = Join-Path $scriptDir 'plse.min.js'
$pathobfjs = Join-Path $scriptDir 'plse.obf.js'
$htmlFileName = 'index.html'
$mshSubholderPath = './msh/'

Write-Host "Minifying..."
npx terser $pathjs -c -m -o $pathminjs --ecma 2020

Write-Host "Obfuscating..."
npx javascript-obfuscator $pathminjs --output $pathobfjs --compact true --control-flow-flattening true --string-array true --string-array-encoding base64 --disable-console-output true

Write-Host "Overriding index.html in subfolders..."
Copy-Item $htmlFileName $mshSubholderPath -Force

Write-Host "Overriding obf.js in subfolders..."
Copy-Item $pathobfjs $mshSubholderPath -Force

Write-Host "Done. Output:" $nout

