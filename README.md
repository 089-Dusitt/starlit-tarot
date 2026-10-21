# Starlit Tarot / ทาโรต์ลายดาว

A complete Thai-language, mobile-first tarot SPA for entertainment and self-reflection.
No account, backend, analytics, ads, tracking scripts, commercial card art, or font CDNs.

## Quick start

Use Node **22.12 or newer** and npm.

```sh
npm install
npm run dev
```

Open Vite's printed URL. For a production preview:

```sh
npm run build
npm run preview
```

A fresh clone needs the network once for dependencies. All subsequent validation,
tests and builds work offline. The only app runtime requests outside its own origin
are the Open-Meteo forecast and geocoding APIs, requested from the weather flow.

## Milestones

| Milestone | Delivered                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1        | Vite/React/strict TypeScript, Router, Tailwind, ESLint/Prettier/Vitest, local fonts, responsive celestial shell, settings, Thai copy, agent guide                      |
| M2        | 22 Major + 56 Minor identities, original SVG art, upright/reversed card frames, searchable/filterable library and all detail pages                                     |
| M3        | 624 topic/orientation meanings, 156 advice lines, validation, secure shuffle, deterministic composer, patterns, qualitative meter and compact validated share codec    |
| M4        | All four topics, 1/3/5-card spreads where specified, optional context, breathing/shuffle/pick/reveal, keyboard fan, session restoration, daily card and symbolic color |
| M5        | Open-Meteo search/location/forecast, timeout/cache/retry/card-only fallback, share/LINE/copy/PNG, 50-item history, privacy controls and crisis guard                   |
| M6        | Responsive browser QA, focus/motion polish, route metadata, social/SEO assets, host fallback configs, portable smoke script and complete documentation                 |

Every milestone is committed separately as `feat: M<n> - ...`.

## Commands

| Script                     | Purpose                                                           |
| -------------------------- | ----------------------------------------------------------------- |
| `npm run dev`              | Local Vite development server                                     |
| `npm run build`            | Offline SEO generation, strict typecheck, production bundle       |
| `npm run preview`          | Serve the production build                                        |
| `npm run lint`             | ESLint, React Hooks and no explicit `any`                         |
| `npm run typecheck`        | Strict TypeScript without emitting files                          |
| `npm test`                 | Vitest + React Testing Library, no external requests              |
| `npm run validate:content` | All 78 identities, 624 meanings, length/uniqueness/wording checks |
| `npm run format`           | Prettier for source and documentation                             |
| `npm run smoke`            | Optional Playwright browser smoke checks; see below               |
| `npm run build:github`     | Build and copy the SPA shell as GitHub Pages `404.html`           |

## Architecture

```text
src/app          routes, metadata, shell, settings and error boundary
src/components   UI, original SVG art, flip cards, reading, sharing and weather
src/features     home, flow, daily, library, history, shared view and privacy/about
src/data         typed topics, spreads, identities and five content batches
src/engine       pure TypeScript RNG, shuffle/draw, meter, patterns, compose, share-code
src/services     validated storage/history, daily seed, weather, crisis guard, PNG/share
src/i18n/th.ts   all interface, narrative and weather-label copy
src/styles       tokens, responsive layouts, interaction and reduced-motion styles
scripts          offline content/SEO validation and optional browser QA
```

The engine has no React or DOM imports. UI, interpretation data and network/storage
services remain separate. All localStorage/sessionStorage/share/API input is validated.
Rendering uses React text nodes; no HTML injection is used.

## Content and original art

`src/config.ts` is the single authored source for the site name. The build generates
static title/manifest/social assets from it. UI text is in `src/i18n/th.ts`;
card-specific copy lives in the requested five batches under `src/data/cards/`.

Each batch row has 12 pipe-separated fields: upright keywords, reversed keywords,
general upright/reversed, love upright/reversed, exam upright/reversed, symbolic
weather upright/reversed, and upright/reversed advice. Keywords use commas. Metadata
arrays specify upright/reversed tone and sky mood. The typed author function expands
short meanings with that card's own advice (or its symbolic keywords), then validates
that every final meaning is 60–180 characters. No sentence repeats across different
cards. The content validator is also part of the test suite.

When editing a card, preserve its ID/order and honest traditional meaning. Follow the
Phase2 Tone Bible: specific Thai, wit aimed at behaviour, and care around vulnerability.
Do not assert medical, legal, financial, accident, cheating or exam outcomes. Keep
professional decisions grounded in real information. The deck validates exactly78 identities.
Replacing/correcting a card is data-only; a nonstandard larger deck needs an explicit
schema/codec version decision to protect existing links.

All artwork is original SVG built from shared celestial primitives. Major cards have
distinct emblems; Minor cards use suit-tinted aces, pip arrangements and court crests.
Only the art rotates for reversed cards. Thai/English labels remain upright.

### How to add a topic or spread

For a topic with the existing optional context behavior, make **data/copy changes**:

1. Append a stable key to `src/data/topic-ids.ts`; never reorder keys used by v1 links.
2. Add its Thai copy/icon/accent in `src/i18n/th.ts` and `src/data/topics.ts`.
3. Add upright/reversed meanings in the five card batches and the author mapping.
4. Add three headline/opening variants and a meter title in the Thai copy file.
5. Add the topic to spread data or append a new spread in `src/data/spreads.ts`.

Home, route selection, engine, library meanings and sitemap consume this data. A new
specialized context widget or a radically different layout is an explicit UI extension.
For a spread, append an ID, names, topics, prompts and position coordinates/weights.
Keep v1 spread order stable. The current polished fan supports the required 1–5-card
spreads. No Celtic Cross or other stretch spread is shipped.

## Reading, privacy and reproducibility

Fisher–Yates uses Web Crypto with rejection sampling for unbiased integer selection.
The full shuffled deck and orientations are persisted in sessionStorage before picking.
The seven visible choices are a fair random window of that deck; any of the 78 cards can
appear. Arrow keys/Home/End navigate choices, and Enter/Space selects. Picked cards stay
face-down until explicitly revealed. Refresh restores picks, reveals, context and stage.

Daily cards use the device's **local calendar date** plus a random device ID stored in
localStorage. They are stable on that device throughout the day. The color is symbolic.

Narratives use a seedable RNG. V1 share codes encode only version, topic/spread identity,
selected indices/orientations, seed, date and an integrity checksum. They are compact,
URL-safe and validated; the checksum detects mistakes and is not authentication.
Love situation framing is carried by data-defined spread variants. Two seed bits retain
only the broad exam preparation window (up to 3 / 4–14 / over 14 days); this preserves
identical shared practical tips without including a date or exact number of days.
Questions, place, coordinates and forecast data are never included in share links.

Local storage contains settings, device ID and at most 50 readings. History contains
questions only after the user explicitly selects “จดคำถามไว้ด้วย”, and may retain exam
context. Session storage contains the in-progress question, context, deck and stage.
A crisis question is cleared when the caring screen opens and is never saved to history.
Clear-all removes this app's keys, preserving unrelated sites' data. Sharing to LINE or
another Web Share destination happens only through the visitor's own action.

## Weather and support sources

Forecast and geocoding parameter names and the **29 documented WMO codes**, including
heavy thunderstorm code 97, were checked against the official
[Open-Meteo documentation](https://open-meteo.com/en/docs).
Calls have an 8-second deadline (including a fallback for fetch that ignores abort),
a 15-minute memory-only cache and an explicit retry. Null forecast values stay unknown.
Forecast dates use the selected place's timezone. History/shared weather views fetch
current weather only after “ดูพยากรณ์ล่าสุด”, using Bangkok when no place is available.
“พยากรณ์จริง” and “ไพ่ตีความ” are separate. Practical weather preparation follows real
forecast data; the cards cannot forecast actual weather.

[Weather data by Open-Meteo.com](https://open-meteo.com/).
**Before commercial use, check the owner's intended use against Open-Meteo's
[current terms](https://open-meteo.com/en/terms): the free API is intended for
non-commercial use and attribution is required.** No paid API key is included or exposed.

The caring screen uses the helpline connector's Thailand information for 1323 (24/7).
Emergency 1669 was checked against the
[National Institute for Emergency Medicine](https://www2.niems.go.th/procurement/detail?id=1efea1c4-b86b-6d01-bd96-45d14ee1cade).
This is a local wording guard and a route to human help, not a clinical assessment.

## QA

40 automated tests cover permutation/unique draws, deterministic seeds/composition,
orientation ratio, weighted meter, share round trips and garbage rejection, all card
content, weather codes/umbrella thresholds/cache/success/timeout/errors/geocoding,
all four reading flows, keyboard navigation, session restoration, settings persistence,
history save/delete/opt-in and crisis handling. External fetch is blocked globally in
unit tests; weather tests install explicit mocks.

The optional smoke script additionally checks all four topics and the five-card spread
at 360/390/1440px, keyboard selection, refresh stability, sheet focus return, OS motion
preference, all 78 card captions, search/detail SEO, identical shared text/tips, private
question exclusion, forecast opt-in, PNG dimensions (1080×1350), history deletion, daily
stability, crisis, invalid share and 404. Screenshots and `qa-report.json` go into the
ignored `qa-artifacts/` folder (or `SMOKE_OUTPUT`).

To run on a development machine:

```sh
npm install --no-save playwright
npx playwright install chromium
npm run dev
# In another terminal:
npm run smoke
```

`SMOKE_URL` selects another local server. `PLAYWRIGHT_CHANNEL=msedge` uses installed
Edge; `PLAYWRIGHT_MODULE` can select an existing local Playwright package. The original
Windows QA used installed headless Edge after the in-app browser could not attach.
The exact terminal screenshot report is delivered separately in `outputs/qa`.

Fonts are local with `font-display: swap`; lazy routes keep library/history content off
the home critical path. Motion uses transform/opacity, LazyMotion and at most 48 stars.
The home entry and its loaded route total approximately 132 KB gzip of JavaScript, below the 250 KB target. The smoke pass also covers 200% zoom, offline/card-only mode and absent location/clipboard/Web Share APIs. The UI avoids fixed-height text panels. No Lighthouse score
is claimed; Lighthouse was not installed in the provided environment.

## Deployment

Copy `.env.example` to an environment file or configure these variables on the host:

- `VITE_SITE_URL`: **full site root**, including a repository path when applicable, with
  no query/hash; used for share links, canonical/OG URLs, robots and sitemap.
- `VITE_BASE_PATH`: `/` normally, or `/repository/` on GitHub Pages.

### Vercel

Use the Vite preset, `npm run build`, output `dist`. `vercel.json` provides the SPA
fallback. Set the two variables before building; direct card/shared routes then work.

### Netlify

`netlify.toml` sets build/output. The copied `public/_redirects` provides
`/* /index.html 200`; `_headers` provides no-sniff/referrer headers without blocking
visitor-initiated geolocation. Set the environment variables in the build settings.

### GitHub Pages

The deployed GitHub repository is [089-Dusitt/starlit-tarot](https://github.com/089-Dusitt/starlit-tarot),
with the site at [089-dusitt.github.io/starlit-tarot](https://089-dusitt.github.io/starlit-tarot/).
`.github/workflows/pages.yml` validates, tests, builds and deploys on pushes to `master`
or `main`, or through **Actions → Deploy Starlit Tarot to GitHub Pages → Run workflow**.
Pages must use **GitHub Actions** as its publishing source. The workflow derives the
site URL and base path from GitHub's Pages metadata; no secret or custom token is needed.

Set `VITE_SITE_URL=https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY` and
`VITE_BASE_PATH=/YOUR-REPOSITORY/` in your build environment, run
`npm run build:github`, and upload `dist` with GitHub Pages Actions. The copied
`404.html` lets client routing recover direct links; Pages still returns an HTTP 404
for those recovered deep links. Root-domain hosting does not need a repository base.

### Sites

`.openai/hosting.json` declares the registered private Site and static `dist` output.
Source synchronization and publication use the Sites workflow helpers. Initial access
is owner-only. Share routes work for visitors who have hosting access; external public
sharing requires the owner to choose a suitable audience or a public host.

## Assumptions

- Thai-first UI; the device's timezone/calendar defines the daily card.
- Bangkok is the default weather place; every question/context field is optional.
- Seven selectable cards keep the required five-card maximum comfortable on phones.
- Missing exam days use the weekly plan; only a coarse window is shared via seed bits.
- In-app browser APIs are optional: clipboard has manual-copy fallback, Web Share falls
  back to a text sheet, location falls back to search, and PNG failure falls back to text.
- Optional vibration is off by default. No English switch, PWA/service worker, extra topic, Celtic Cross,
  static prerendering or other stretch feature is included.
- The initial hosted Site stays private. Commercial weather licensing is the owner's
  deployment decision; the app does not include a paid account or key.

## Known limitations

- Live weather needs internet and Open-Meteo availability. Offline mode provides cards
  with an explicit banner; no fake forecast is generated.
- Browser storage restrictions can prevent persistence; a banner explains this while the
  active reading stays usable. Data is device/browser-specific and is not cloud-synced.
- Web Crypto is available on supported secure origins. An older browser without it falls
  back to Math.random; use HTTPS for the intended random source and share/location APIs.
- Some in-app browsers block downloads or opening LINE; export can be copied as text and
  the UI suggests opening the main browser. LINE/Web Share delivery was not sent during QA.
- Client-side route metadata works after rendering. Crawlers without JS receive shared
  default metadata; prerendered per-card/share SEO is a stretch feature and is not included.
- The wording guard cannot recognize every possible expression of distress.
- The portable Sites dependency helper could not resolve its npm shim on this Windows host;
  installation used `npm.cmd install` directly. Cached guidance was retrieved offline after
  a network retry failed. Vitest runs one worker to avoid this sandbox's concurrent file
  permission errors. These workarounds do not add network dependencies to build/test.

## Credits

Original SVG card art and Thai interpretation copy created for this site. Icon line art:
Lucide (ISC). Self-hosted Noto Serif Thai, Noto Sans Thai and Cinzel: SIL Open Font License;
license copies are in `public/licenses/`. Weather attribution and sources are linked above.

## Phase 2 — current

The Tone Bible in [docs/PHASE2_BRIEF.md](docs/PHASE2_BRIEF.md) supersedes the original
always-encouraging interpretations. [Progress](docs/PROGRESS.md) records every task.

- Five personas: blunt, oracle, bestie, mu and gentle; three spice levels. New default
  is blunt/2. A skippable first-run sheet previews voices; spice3 needs confirmation once.
- Every card has honest traditional meanings/tones, four-topic bites, four new voice
  packs plus the preserved gentle text, and two omens. `content:coverage` is100%.
- 90 notable pairs/triples supply720 topic/spice lines, including positional stories.
  Seeded composition has short card-specific headlines, warnings, bounded tips,
  persona closings and spice3 verdict/cliffhanger. Negative strength slots and positive
  caution slots receive an explicit contextual reading; other-person slots are questions.
- An accessible pendulum replaces the bar. Theatre is finite and respects reduced
  motion; darkest card opens last at spice3. Optional haptics are off by default.
- Version2 links preserve persona/spice. Frozen v1 encoding remains decodable as
  gentle/1; old settings/history migrate to versioned local records with opt-in context.
- 145 tests cover migration, all60 persona/spice/topic modes, all624 legacy gentle
  meanings, combination detection and20,000-draw calibration for every topic/spread.
  Mobile/desktop browser QA covered120 reading cases; screenshots are delivered separately.

```sh
npm run check             # complete offline quality gate
npm run content:coverage  # per-field and suit audit coverage
npm run lint:tone         # cheer phrases, lengths via validation, Thai repetition
npm run sample:readings   # regenerate30 deterministic editorial samples
```

The fun review records24/30 passes after a candid18/30 first pass and targeted fixes.
This is an editorial simulation, not a real user study. Six weaker low-spice/gentle
samples remain documented for later content passes; no claim of universal accuracy is made.
