# Phase 2 decisions

- Continue the existing Vite/React source and Git history. Public GitHub Pages remains the deployment target authorized by the owner. The earlier deployment succeeded; the live root returns HTTP 200.
- Keep v1 readings and share links meaningful: normalize legacy style to gentle / spice 1. New sessions default to blunt / spice 2. Preserve legacy copy independently before applying sharper meanings.
- No new runtime dependencies are planned. Native dialog, SVG, CSS, WebAudio and browser storage cover the requested UI.
- Runtime network stays limited to Open-Meteo. Guidance/dependency installation and CI are development operations; tests and builds remain offline.
- Wave 0: npm ci needed an online retry because the sandbox npm cache lacked yocto-queue. Installation succeeded. All 40 v1 tests, lint, typecheck, content validation and production GitHub build pass.

- W1.1: keep binary v1 encoding intact for validation; decode to a v2 gentle/1 reading. History uses a versioned envelope and re-encodes its migrated IDs while preserving opt-in context. Settings migrate only validated legacy objects. Restyling holds cards/seed/date fixed and feeds the displayed style into share actions. Native modal focus containment replaces the redundant native-dialog trap; fallback trap remains for older hosts. No runtime dependency added.
