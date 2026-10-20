# Starlit Tarot implementation plan

## Structure

`src/app` owns routes/layout; `components` owns SVG art and accessible UI;
`features` owns reading, daily, library/history; `data` owns cards, topics/spreads;
`engine` is pure TypeScript; `services` owns validated storage/weather;
`i18n/th.ts` owns UI copy. `scripts` validates content and creates SEO assets.

## Milestones

1. **M1 Foundation:** Vite/React/strict TypeScript, Tailwind, tooling, local fonts,
   celestial responsive shell, settings, routing, documentation; validate and commit.
2. **M2 Deck & art:** all 78 identities, original SVG card art, accessible library
   and details; validate and commit.
3. **M3 Engine & content:** complete Thai meanings, deterministic composition,
   secure shuffle, patterns/meter/share encoding, content and unit tests; commit.
4. **M4 Reading:** optional contexts, breathing/shuffle/pick/reveal, persisted flow,
   composed reading, daily card; UI tests, validate and commit.
5. **M5 Integrations:** resilient Open-Meteo, share/image, history/settings,
   crisis guard, mocked service tests; validate and commit.
6. **M6 Polish:** accessibility/motion/SEO, responsive browser QA where available,
   deployment configs, full README, build/package and private Sites publication.

## Assumptions

- Thai-first, browser-only SPA; no account, telemetry, commercial artwork or backend.
- Default location is Bangkok; local dates define daily cards. Weather is optional.
- Site URL is configured by VITE_SITE_URL; hosting stays private by default.
- No stretch features until every required milestone is complete.
- All checks are offline after dependency installation; external requests are mocked.
