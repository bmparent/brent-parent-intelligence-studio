# Reflective essay validation recovery

The initial runner failed on DNS retrieval of unchanged older articles’ sources.
No validator or release workflow was changed. The new essay contains no external
factual claims and has no sources, as permitted by docs/insights-voice.md.

Subsequent supported `validate:insights -- --skip-source-fetch` passed for 22
articles. Lint, build (including typecheck and content generation),
verify:prerender, verify:editorial, validate:insights:dist, verify:urls and
build:functions all passed. Existing Wellway lint advisory only.
All 21 baseline article records compare equal to the original main records.
CI and production verification remain separate release gates.
