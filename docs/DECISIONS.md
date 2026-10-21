# Phase 2 decisions

- Continue the existing Vite/React source and Git history. Public GitHub Pages remains the deployment target authorized by the owner. The earlier deployment succeeded; the live root returns HTTP 200.
- Keep v1 readings and share links meaningful: normalize legacy style to gentle / spice 1. New sessions default to blunt / spice 2. Preserve legacy copy independently before applying sharper meanings.
- No new runtime dependencies are planned. Native dialog, SVG, CSS, WebAudio and browser storage cover the requested UI.
- Runtime network stays limited to Open-Meteo. Guidance/dependency installation and CI are development operations; tests and builds remain offline.
- Wave 0: npm ci needed an online retry because the sandbox npm cache lacked yocto-queue. Installation succeeded. All 40 v1 tests, lint, typecheck, content validation and production GitHub build pass.
