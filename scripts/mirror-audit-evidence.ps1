$ErrorActionPreference = 'Stop'
$auditSource = (Resolve-Path -LiteralPath 'artifacts/implementation/2026-09-21').Path
$auditRoot = $env:EIDOS_PROOF_DRIVE_DIR
if (-not $auditRoot) { $auditRoot = $env:EIDOS_ARTIFACT_ROOT }
if (-not $auditRoot -or -not (Test-Path -LiteralPath $auditRoot -PathType Container)) { throw 'Configured artifact mirror is unavailable; local evidence retained.' }
$auditRoot = (Resolve-Path -LiteralPath $auditRoot).Path
$auditDestination = [System.IO.Path]::GetFullPath((Join-Path $auditRoot 'Eidos_Works_Audit/2026-09-21/works-audit-candidate'))
if (-not $auditDestination.StartsWith($auditRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Mirror destination is outside the configured root.' }
New-Item -ItemType Directory -Path $auditDestination -Force | Out-Null
Get-ChildItem -LiteralPath $auditSource | Copy-Item -Destination $auditDestination -Recurse -Force
$auditDocs = Join-Path $auditDestination 'implementation-notes'
New-Item -ItemType Directory -Path $auditDocs -Force | Out-Null
Get-ChildItem -LiteralPath docs/implementation | Copy-Item -Destination $auditDocs -Recurse -Force
$auditFiles = @(Get-ChildItem -LiteralPath $auditSource -File -Recurse | Where-Object { $_.Name -notin @('manifest.json','drive-status.json') })
foreach ($auditFile in $auditFiles) {
  $auditRelative = [System.IO.Path]::GetRelativePath($auditSource,$auditFile.FullName)
  $auditCopy = Join-Path $auditDestination $auditRelative
  if ((Get-FileHash -LiteralPath $auditFile.FullName -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $auditCopy -Algorithm SHA256).Hash) { throw "Mirror checksum mismatch: $auditRelative" }
}
$auditReceipt = @{timestamp_utc=[DateTime]::UtcNow.ToString('o');copyAttempted=$true;copySuccess=$true;configuredLocalDestination=$true;root=$auditRoot;destination=$auditDestination;verifiedArtifactFiles=$auditFiles.Count;reason='Copied to configured mounted Google Drive folder and verified SHA-256. Remote cloud synchronization was not independently observed.'}
$auditReceipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $auditSource 'drive-status.json') -Encoding utf8
$auditManifest = @(Get-ChildItem -LiteralPath $auditSource -File -Recurse | Where-Object Name -ne 'manifest.json' | ForEach-Object { @{path=[System.IO.Path]::GetRelativePath($auditSource,$_.FullName).Replace('\','/');bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()} })
@{timestamp=[DateTime]::UtcNow.ToString('o');scope='Local candidate and redacted production baseline; generated reference explicitly named';files=$auditManifest} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $auditSource 'manifest.json') -Encoding utf8
foreach ($auditName in @('drive-status.json','manifest.json')) {
  Copy-Item -LiteralPath (Join-Path $auditSource $auditName) -Destination (Join-Path $auditDestination $auditName) -Force
  if ((Get-FileHash -LiteralPath (Join-Path $auditSource $auditName)).Hash -ne (Get-FileHash -LiteralPath (Join-Path $auditDestination $auditName)).Hash) { throw 'Final receipt mirror mismatch.' }
}
$auditReceipt | ConvertTo-Json
