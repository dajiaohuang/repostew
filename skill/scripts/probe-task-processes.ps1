param([Parameter(Mandatory=$true)][string]$Root)
$ErrorActionPreference='Stop'
$target=[IO.Path]::GetFullPath($Root).TrimEnd('\','/').Replace('\','/').ToLowerInvariant()
$processes=@(Get-CimInstance Win32_Process)
$ancestors=@{};$cursor=$PID
while($cursor -and !$ancestors.ContainsKey([int]$cursor)) {
 $ancestors[[int]$cursor]=$true
 $parent=$processes|Where-Object ProcessId -eq $cursor|Select-Object -First 1
 if(!$parent){break};$cursor=$parent.ParentProcessId
}
$matched=@($processes|Where-Object {
 $_.CommandLine -and $_.CommandLine.Replace('\','/').ToLowerInvariant().Contains($target)
})
$rows=@($matched|Where-Object {!$ancestors.ContainsKey([int]$_.ProcessId)}|Select-Object ProcessId,ParentProcessId,Name)
$probeChain=@($matched|Where-Object {$ancestors.ContainsKey([int]$_.ProcessId)}|Select-Object ProcessId,ParentProcessId,Name)
@{root=$target;at=[DateTime]::UtcNow.ToString('o');matches=$rows;probeAncestors=$probeChain;limit='Command-line matches only; not proof of writer or handle clearance. Probe ancestors are listed separately, not killed.'}|ConvertTo-Json -Depth 4 -Compress
