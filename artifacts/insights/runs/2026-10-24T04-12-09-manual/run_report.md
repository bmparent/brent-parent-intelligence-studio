# Insights publishing run - 2026-10-24T04-12-09-manual

Status: failed
Slot: manual
Started: 2026-10-24T04:12:09.688Z
Finished: 2026-10-24T04:12:10.132Z
Git commit before: 2c7dcf3cd6a01d88f23eb1da5d45e876d956f8f9
Dependency preflight: passed

## Commands
- npm run content:generate: passed
- npm run validate:insights: failed (1)

## Notes
- Blocking failure: npm run validate:insights exited with 1
- This script does not commit, push, or deploy by itself. The scheduled Codex automation performs those steps after reviewing the generated diff.