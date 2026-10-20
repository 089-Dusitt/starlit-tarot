# Agent guide

- Use `npm ci`, `npm run dev`; before each milestone commit run `npm run lint`,
  `npm run typecheck`, `npm test`, `npm run build` and (M3 onward) `npm run validate:content`.
- Strict TypeScript, no `any` or HTML injection. Format with `npm run format`.
- UI copy lives in `src/i18n/th.ts`, identities/meanings in `src/data`, name in `src/config.ts`.
- Pure engine has no DOM/React imports. Validate every storage/share/API input.
- Runtime network is limited to Open-Meteo. Mock requests in tests; never fetch in build.
- Original SVG art only. Preserve Thai line height, visible focus, 44px controls,
  motion preference and browser API fallbacks. No fatalistic claims or gambling content.
- Do not store questions without explicit opt-in or encode them in sharing.
- Commit each accepted milestone as `feat: M<n> - <summary>`.
