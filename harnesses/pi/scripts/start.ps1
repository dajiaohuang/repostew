param([string]$ConfigPath,[string]$RuntimePath)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (-not $RuntimePath) { $RuntimePath = Join-Path $projectRoot '.runtime' }
if (Test-Path -LiteralPath (Join-Path $runtimePath 'server.lock')) {
  $prior = Get-Content -LiteralPath (Join-Path $runtimePath 'server.lock') -Raw | ConvertFrom-Json
  if (Get-Process -Id $prior.pid -ErrorAction SilentlyContinue) { throw 'Runtime process exists; do not launch another service.' }
}
New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null
$nodeExe = (Get-Command node).Source
$cliPath = Join-Path $projectRoot 'src/cli.mjs'
if (-not $ConfigPath) { $ConfigPath = Join-Path $projectRoot 'config.local.json' }
# WMI owns this independent background service, so ending a tool terminal does
# not terminate it. Native harness Stop still owns and stops every C/W child.
$startup = New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ShowWindow=[uint16]0}
$created = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
  CommandLine=('"' + $nodeExe + '" "' + $cliPath + '" guard --config "' + $configPath + '"')
  CurrentDirectory=$projectRoot
  ProcessStartupInformation=$startup
}
if ($created.ReturnValue -ne 0) { throw ('Background service creation failed: ' + $created.ReturnValue) }
Write-Output ('Started independent harness process ' + $created.ProcessId)
