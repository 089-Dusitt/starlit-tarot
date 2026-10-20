# Starlit Tarot / ทาโรต์ลายดาว

Thai-first, browser-only tarot for entertainment and self-reflection.

## Quick start
Node 22.12+; `npm install`, then `npm run dev`. `npm run build` and `npm run preview`
serve the production bundle. Dependencies install once; builds and tests are offline.

## Assumptions
- Daily cards follow the device's local calendar date and a random browser-local ID.
- Bangkok is the default location. All context is optional. No user accounts or backend.
- Site URL comes from `VITE_SITE_URL`; local preview uses its current origin.
- Private Sites publication is the initial audience. No stretch features are included.

## Known limitations
- The portable Sites dependency helper could not resolve its npm shim on this Windows host;
  installation used `npm.cmd install` directly. The required guidance tool's network retry
  was replaced by its cached offline retrieval. Neither issue affects the app or build.
- Real weather needs an internet connection and Open-Meteo availability.
- Restricted browser storage can prevent persistence; the active reading remains usable.
- Open-Meteo free API is intended for non-commercial use. Review its [terms](https://open-meteo.com/en/terms)
  and attribution requirements before commercial use.

## Credits
Original SVG card illustrations and Thai interpretation text. Self-hosted Noto Serif Thai,
Noto Sans Thai and Cinzel (SIL Open Font License). [Weather data by Open-Meteo.com](https://open-meteo.com/).
