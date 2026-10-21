# Agent guide

- Continue this project; Phase2 overrides revoked v1 tone rules. Read docs/PHASE2_BRIEF.md,
  docs/PROGRESS.md and docs/DECISIONS.md before work. Update progress after each task.
- Use npm ci and npm run dev. Before every task commit run npm run check (lint,
  strict typecheck, offline tests, validate:content, lint:tone, GitHub production build).
  Review the diff and capture UI at390x844 and1440x900. Commit tasks separately;
  content in suit/~20-card chunks. Never rewrite history or force-push.
- Strict TypeScript, no explicit any or HTML injection. Format changed sources.
- UI copy is in src/i18n, card/story copy in src/data, identity in src/config.ts.
  Pure engine has no DOM/React imports. Validate all storage/share/API inputs.
- Five personas and three spice levels. New defaults blunt/2; legacy v1 becomes
  gentle/1. Preserve legacy meaning text and codec indices. New IDs append only.
- Be witty and honest about traditional ugly meanings. Target observable behaviour,
  never identity, vulnerabilities, mental health, trauma or a named third party as fact.
  Never predict death/illness/pregnancy, legal/investment outcomes, accidents,
  cheating, exam results or scores. No gambling. Preserve the caring crisis route.
- Runtime network only Open-Meteo plus same-origin app assets; no trackers/backend.
  Tests/builds offline. No new runtime dependency without a recorded justification;
  Phase2 limit3 total, initial JavaScript budget300KB gzip.
- Original SVG art, self-hosted fonts,44px controls, visible focus, Thai line height,
  reduced-motion fallbacks, no >3Hz flashes. Audio only after tap, gain<=0.25.
- Do not store questions without opt-in or put them in share links. Migrate versioned
  storage without discarding user records. Handle quota/corrupt input without a crash.
