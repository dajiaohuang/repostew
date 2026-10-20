param([Parameter(Mandatory=$true)][string]$BindingPath)
$ErrorActionPreference='Stop'
$bindingFile=(Resolve-Path -LiteralPath $BindingPath).Path
$listenerFile=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot 'listen.mjs')).Path
$binding=Get-Content -LiteralPath $bindingFile -Raw | ConvertFrom-Json
$directory=Split-Path -Parent $bindingFile
$pidFile=Join-Path $directory ($binding.id+'.pid')
if(Test-Path -LiteralPath $pidFile) {
  $prior=Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
  $existing=Get-CimInstance Win32_Process -Filter ('ProcessId='+$prior.pid)
  if($existing) {
    if($existing.Name -eq 'node.exe' -and $existing.CommandLine.Contains($listenerFile) -and $existing.CommandLine.Contains($bindingFile)) { Write-Output ('Reused listener PID '+$prior.pid);exit 0 }
    throw 'Existing listener identity is uncertain; reconcile it before replacement.'
  }
}
$startup=New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ShowWindow=[uint16]0}
$created=Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
  CommandLine=('"'+(Get-Command node).Source+'" "'+$listenerFile+'" "'+$bindingFile+'" --background-log')
  CurrentDirectory=$directory
  ProcessStartupInformation=$startup
}
if($created.ReturnValue -ne 0){throw ('Listener creation failed: '+$created.ReturnValue)}
@{pid=$created.ProcessId;binding=$bindingFile;startedAt=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath $pidFile
Write-Output ('Started independent event listener PID '+$created.ProcessId)
