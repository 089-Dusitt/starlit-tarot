# Phase 2 decisions

- Continue the existing Vite/React source and Git history. Public GitHub Pages remains the deployment target authorized by the owner. The earlier deployment succeeded; the live root returns HTTP 200.
- Keep v1 readings and share links meaningful: normalize legacy style to gentle / spice 1. New sessions default to blunt / spice 2. Preserve legacy copy independently before applying sharper meanings.
- No new runtime dependencies are planned. Native dialog, SVG, CSS, WebAudio and browser storage cover the requested UI.
- Runtime network stays limited to Open-Meteo. Guidance/dependency installation and CI are development operations; tests and builds remain offline.
- Wave 0: npm ci needed an online retry because the sandbox npm cache lacked yocto-queue. Installation succeeded. All 40 v1 tests, lint, typecheck, content validation and production GitHub build pass.

- W1.1: keep binary v1 encoding intact for validation; decode to a v2 gentle/1 reading. History uses a versioned envelope and re-encodes its migrated IDs while preserving opt-in context. Settings migrate only validated legacy objects. Restyling holds cards/seed/date fixed and feeds the displayed style into share actions. Native modal focus containment replaces the redundant native-dialog trap; fallback trap remains for older hosts. No runtime dependency added.

- Meter calibration: integer face tones contain17 at-2 and73 at-1 outof156 faces, so a single-card cutoff can only yield10.9% or57.7% low, outside the requested30-45%. Explicit traditional pressure classes add a bounded+/-0.125 nuance only within-1 (never crossing zero), leaving all integer tones untouched. Fixed cutoffs per spread size operate on the actual weighted mean; no random/hash labels or runtime quantiles. Calibration and sign/weight/determinism tests audit the choice. These are relative symbolic moods, not event probabilities.

- W1 fun gate: skeptical editorial simulation scored18/30 initially,24/30 after fixes. Hidden spice1bites could not earn credit. Negative strength/positive caution slots now receive explicit interpretation, with the opposite-face caution clearly labelled as excess and no change to drawnorientation. Other-person slots invite a question, not mind-reading. Headlines use per-card omen fragments(max55characters) rather than keyword clauses. Finalverdict does not paste the hardtruth a third time. Six weak low-spice/gentle samples remain candidly flagged for later passes. No real-user study is claimed.

- W2.1 uses same-origin SVG plus widely supported Canvas2D export; no experimental HTML-in-Canvas or new dependency is needed. Fate kind reflects actualface tone and card suit; neutralfaces choose a stable comic kind byseed. The local ledger retains all days and never overwrites corrupt/unsupported bytes. Share links add a validated daily-purpose flag; questions/device IDs/streak are excluded. Preserved remote Pages workflow update with a merge and deployed Wave1 successfully (run39578306326).

- Oracle repeat detection is intentionally session-memory only so questions never become stored fingerprints. Only a versioned cooldown timestamp persists. Refusal is a game mechanic, not an anti-abuse/security system. Sensitive real-world outcome questions are redirected to action/preparation questions; the caring crisis path takes precedence.

- Duel scores are a deterministic comparison of actualtones, labelled symbolicpoints, never real-world probabilities. Shared URLs hold two validated readings and only explicitlytyped displaynames. Result can be copied without a messaging service or backend. New guarded writes preserve corrupt/unsupported existing values.

- Collection stores compact validated readingcodes only, canonicalized without voice/spice so restyling cannot inflate counts. Foil is deterministic perdraw/slot, purely visual and never sold. It does not alter cards/tones/answers. Cardbacks use SVG/CSS without importing deckcontent into the homepage. Optional cardBack keeps existing v2settings compatible.
