# Affordable template drafts

Prepared October 22, 2026. This batch adds three working source products while
the existing paid collection continues testing. All prices are proposed USD
one-time amounts; `commercialAvailability` stays `unavailable`.

| Product | Price | Scope | Preview |
| --- | --- | --- | --- |
| Gatherline | $12 | Event section + calendar file | `gatherline/index.html` |
| Porchlight | $29 | Home/garden service landing page | `porchlight/index.html` |
| Plainspoken | $59 | Consultant Home, Services and Contact | `plainspoken/index.html` |

Open `index.html` for the review gallery. No backend or build is required to run
the examples. Landing/site previews use `shared/runtime.js`; Gatherline owns its
scoped `script.js`. Clean ZIPs include all required local scripts. A static HTTP
server is optional:

```bash
python3 -m http.server 4386
```

From the repository root, create deterministic private-review packages:

```bash
python3 scripts/build-value-templates.py
python3 scripts/build-value-template-preview.py
python3 scripts/verify-value-templates.py
```

The portable `Eidos_Affordable_Template_Preview_2026-10-22.html` in that output
folder embeds the exact source, styles and image for offline product/page/phone
review. Its sandbox routes only known sibling pages inside the review frame;
the standalone buyer files retain ordinary HTML navigation.

Generated ZIPs and manifests are under `artifacts/value-templates/`, outside
public static hosting and ignored by git. Product source, the generated asset,
design concepts, installation guides and build/verification scripts are retained
in the repository. The gallery is source-only; no site route, sitemap entry,
checkout catalog, provider configuration, price ID or payment flag is changed.

The sample forms prepare text in memory. They do not submit to a server, write
localStorage, set cookies, or invoke AI. Downloading or opening an explicitly
configured email draft is a separate visitor action. The calendar is a reminder,
not registration. Replace all fictional/demo text and remove `noindex` only when
publishing a real, reviewed business site.

See each package README, `docs/value-templates/DESIGN.md` and
`docs/value-templates/RELEASE_2026-10-22.md`. Native builder compatibility,
physical-device and screen-reader acceptance, final terms, pricing economics
and the paid fulfillment/recovery/refund path remain release gates.


## October 24 usability candidate

Private draft version 0.1.1 adds an offline `START-HERE.html` configuration editor
inside each package. It downloads a replacement config file and explains the
remaining source/metadata/hosting steps. Inquiry forms fail closed when scripts
are unavailable, service choices follow configured names, and long custom names
and headings reflow. Read the release evidence and remaining customer acceptance
in `docs/value-templates/QUALITY_2026-10-24.md`. No price or sale is activated.
