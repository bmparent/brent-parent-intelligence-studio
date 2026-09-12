# Wellway — Your wellness journey

A working local-first concept by Eidos Works. It uses Wellway's original wordmark, Spectral headings, Inter interface text, and the navy/slate colors observed on its public site. All member health records are fictional.

## Open the app

Open `wellway-demo.html` in a desktop browser. This is the complete app with its fonts and logo embedded. It needs no installation, hosted database, or live account. In the source checkout, the file is generated at `dist/wellway-demo.html`.

Your changes save in that browser. Use **Help & guide → Export backup** before moving computers or clearing browser data. Restore the JSON backup through the app. Google Drive stores manually transferred backups and this release package; it is not a live database or an automatic browser sync service.

## Try this five-minute demonstration

The expanded edition adds fictional portraits, member/advisor profiles, a dated mock health history, and subtle movement with a **Pause motion** control. System reduced-motion preferences are respected.

Select **Try a video visit** on Today or Advisor to prepare an agenda, choose whether to include fictional context, enter a scripted visit, toggle the sample camera/mic/captions, and explore discussion topics. End the demo visit, edit the follow-up, and save it for advisor review. Only **Approve in demo** updates the plan. The images are static portraits; no actual camera, microphone, audio, recording, or call service is used.

1. On Today, select **Start check-in**. Choose an energy rating, available time, and a fictional note about a changed schedule.
2. Open **My journey**, switch measurements, and select a chart day. The source record appears. A missing night is excluded from the average.
3. In **My plan**, adjust the walk's duration or time and mark it complete.
4. In **Advisor**, select **Prepare a draft**, inspect its sources, edit it, and select **Approve in demo**. The approved note appears in My plan and the journey timeline.
5. In **Connections**, try the sample sleep tracker. Watch a duplicate get skipped and an invalid record stay out of the history.
6. Export a backup and restore it. **Explore the next day** advances only the fictional calendar; it does not invent wearable readings.

## What is live and what is simulated

| Capability                                        | Status                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Check-ins, editable plans, completion, timeline   | Working locally                                                             |
| Charts, averages, missingness, source inspection  | Computed from local records                                                 |
| CSV ingestion, duplicate handling, backup restore | Working locally                                                             |
| Advisor draft/review/plan update                  | Working local workflow; no advisor communication                            |
| Guided assistant                                  | Transparent topic-based local explanations                                  |
| Optional OpenAI agent                             | Implemented in `server.mjs`; unconfigured and not live-tested in this build |
| Health-provider cards                             | Explicitly labeled sample flows; no OAuth or provider access                |
| Authentication and member isolation               | Not implemented; perspective switch is a demo control                       |
| GitHub                                            | Source/version control                                                      |
| Google Drive                                      | Release files and manual backups                                            |

This app is not Wellway's live service. It does not diagnose, prescribe, predict illness, or monitor emergencies. Use fictional information only. Browser-local storage is not encrypted clinical storage.

## Develop locally

Node 22.12 or later:

```sh
npm ci
npm run dev
```

The Vite development server binds to `127.0.0.1:4173`. Production files use relative asset paths and hash-based navigation, making the app suitable for a subdirectory in Eidos Works or a sandboxed iframe.

```sh
npm test
npm run test:ui
npm run test:server
npm run build
```

The UI test executes the complete standalone bundle in a DOM test environment. It is not a substitute for browser, mobile, or visual acceptance; see `docs/VALIDATION.md`.

## Optional live AI, without a cloud deployment

The optional loopback server serves the same static app and supports a bounded OpenAI Responses workflow. With an existing server-side OpenAI API configuration available to the process, run `npm start` and open the printed loopback address. The assistant offers an explicit per-conversation live-AI switch only when that local server reports a configured connection.

No key was created, committed, embedded, or tested here. Use the secure OpenAI Platform setup flow to configure credentials; never put them in frontend code, a gallery bundle, GitHub, or Google Drive. Without a configured key, `npm start` serves the fully functional local guide.

The workflow must retrieve the supplied evidence through `get_wellness_evidence` before answering. It has no write or provider tools. Requests use `store:false`, max 1,800 output tokens per call, at most three calls per request, one in-flight request, and a persisted limit of 24 calls per UTC day. These are application call/token limits, not a dollar guarantee. `store:false` does not mean zero data retention. Before real health data use, review model/endpoint eligibility, retention, applicable agreements, and Wellway's governance requirements.

The default candidate model is `gpt-6-astra`; account availability and behavior must be validated. `WELLWAY_OPENAI_MODEL` and `WELLWAY_PORT` can override the model and local port. The public/file edition never exposes this server or a key.

References: [OpenAI agents](https://developers.openai.com/api/docs/guides/agents), [data controls](https://developers.openai.com/api/docs/guides/your-data), [HealthKit](https://developer.apple.com/documentation/healthkit/setting-up-healthkit), [Health Connect](https://developer.android.com/health-and-fitness/health-connect/read-data).

## Data conventions

CSV requires `id,date,metric,value,unit,sourceId`. Supported values are sleep in `h`, daily movement in `steps`, and self-reported energy in `score` (1–5). The combination `sourceId + id` is the deduplication key. A duplicate ID does not overwrite a previously imported record. Corrections/versioned provider events are a production extension.

Overlapping sources are retained but not added together. The chart prefers direct check-ins for energy and the sample wearable for device measures, then the latest imported alternative. This is an explicit demo selection rule, not a claim that all devices are clinically interchangeable. Averages divide by the count of available days, and charts leave gaps for missing observations.

Production additions include real consent/OAuth, background ingestion, revocation and retention policy, identity/access controls, provider-specific metric semantics, clinical review, and representative evaluations. None is implied by this demonstration.
