param([Parameter(Mandatory=$true)][string]$SessionPath,[Parameter(Mandatory=$true)][string]$ReceiptPath)
$ErrorActionPreference = 'Stop'
$matches = @(Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -and ($_.Name -eq 'node.exe' -or $_.Name -eq 'python.exe') -and
  ($_.CommandLine.Contains($SessionPath) -or $_.CommandLine.Contains($ReceiptPath))
} | Select-Object ProcessId,ParentProcessId,Name)
@{checkedAt=[DateTime]::UtcNow.ToString('o');matchingProcesses=$matches;noMatchingOwnerOrTarget=($matches.Count -eq 0)} | ConvertTo-Json -Depth 4
