# Insights publishing run - 2026-09-23T23-24-53-midday

Status: failed
Slot: midday
Started: 2026-09-23T23:24:53.077Z
Finished: 2026-09-23T23:25:12.755Z
Git commit before: af22c30182984134b5ec1418ed4ffc547f2541c5

## Commands
- npm run content:generate: passed
- npm run validate:insights: failed (1)

## Notes
- Blocking failure: npm run validate:insights exited with 1
- This script does not commit, push, or deploy by itself. The scheduled Codex automation performs those steps after reviewing the generated diff.