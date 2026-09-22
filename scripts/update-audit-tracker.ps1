$ErrorActionPreference = 'Stop'
$auditRows = Import-Csv -LiteralPath docs/implementation/phase-tracker.csv
$auditEvidence = Get-Content -LiteralPath docs/implementation/item-evidence.json -Raw | ConvertFrom-Json -AsHashtable
foreach ($auditRow in $auditRows) {
  $auditItem = $auditEvidence[$auditRow.ID]
  if (-not $auditItem) { throw "Missing tracker item $($auditRow.ID)" }
  $auditRow.Status = $auditItem[0]
  $auditRow.'PR or commit' = 'codex/works-audit-implementation-20260921; paired codex/works-audit-backend-20260921'
  $auditRow.'Verification evidence' = $auditItem[1]
  $auditRow.'Remaining blocker' = $auditItem[2]
}
if ($auditRows.Count -ne 50) { throw 'Expected exactly 50 audit items' }
$auditRows | Export-Csv -LiteralPath docs/implementation/phase-tracker.csv -NoTypeInformation -Encoding utf8
$auditRows | Group-Object Status | Select-Object Name,Count
