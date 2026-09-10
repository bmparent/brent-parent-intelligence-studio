# Insights publishing run - 2026-09-10T22-00-26-midday

Status: failed
Slot: midday
Started: 2026-09-10T22:00:26.791Z
Finished: 2026-09-10T22:00:49.226Z
Git commit before: c7f681a93e8b2f08af40c2a756a7f38847143dcf

## Commands
- npm run content:generate: passed
- npm run validate:insights: passed
- npm run lint: failed (1)

## Notes
- Blocking failure: npm run lint exited with 1
- This script does not commit, push, or deploy by itself. The scheduled Codex automation performs those steps after reviewing the generated diff.