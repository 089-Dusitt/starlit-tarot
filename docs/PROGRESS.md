# Phase 2 progress

## Wave checklist

- [x] W0: preserve brief, inspect v1, install and establish green baseline
- [x] W1.1: persona/spice settings, migration, share v2, onboarding, same-card restyle
- [x] W1.2: audit traditional meanings and tones; retain gentle voice
- [x] W1.3: all 78 cards bite/voice/omen; coverage and validation
- [x] W1.4: at least 80 topic-aware combinations
- [x] W1.5: deterministic persona/spice composer and template banks
- [x] W1.6: accessible pendulum gauge
- [x] W1.7: reduced-motion-safe ominous theatre and accents
- [x] W1.8: UI microcopy sweep
- [x] W1.9: tone lint, 20k distribution simulations, migrations and compatibility tests
- [x] W1.10: 30 sample readings and skeptical fun review
- [ ] W2: daily blessing/curse; oracle; duel; collection; check-in; spreads; topics
- [ ] W3: original art; sound; motion; share images; home
- [ ] W4: prerender; PWA; CI; optional English UI
- [ ] W5: accessibility, e2e, performance, failure resilience, documentation
- [ ] Infinity: scored backlog, verified top three improvements, recurring content review

## Next up

1. W2.1 daily blessings/mini-curses, streak and harmless mu item.
2. W2.2 yes/no oracle with cooldown and repeat-question refusal.
3. W2.3 backend-free duel links and comparison.
4. W2.4 collection, achievements, foil and personal stats.
5. W2.5 check-ins and weather comparison.

Blockers

None identified. The existing public GitHub repository is authorized by the owner.

## Task log

- Saved the complete Phase 2 brief verbatim. Read AGENTS, README, PLAN and Git history.

- W0 complete: locked dependency install, lint/typecheck/40 tests/content/build green; live GitHub root HTTP 200 and local app launched.

- W1.1 complete: five persona choices, random choice, three chilli levels with first-use confirmation, skippable onboarding and same-card restyle. Share v2 retains style; v1 links/history/settings migrate to gentle/1. All 44 tests plus lint/typecheck/content/build pass. Mobile 390x844 and desktop 1440x900 screenshots reviewed; no horizontal overflow.

- W1.3 infrastructure complete: preserve v1 meanings independently, typed upgrade batches, per-field coverage command and extended bite/voice/omen checks. Tone lint uses Intl.Segmenter. All 44 tests and full checks pass. Content is being authored in the requested suit order; coverage honestly remains 0 until the first batch is applied.

- W1.2/W1.3 Major Arcana complete: 22 cards audited (176 meanings, 176 bites, 176 new voice lines, 44 omens). Death/Devil/Tower retain real endings, entanglement and disruption. Gentle keeps all v1 topic meanings. Coverage 28.2%; tone lint and all 44 tests/full checks pass.

- W1.2/W1.3 Wands complete: 14 cards, honest momentum/conflict/burden and court reversals; all topic meanings, bites, voices and omens. Coverage 36/78 (46.2%). Full checks and tone lint pass.

- W1.2/W1.3 Cups complete: 14 cards with attraction, disappointment, nostalgia, avoidance and honest court reversals. Coverage 50/78 (64.1%). Full checks/tone lint pass; gentle preserved.

- W1.2/W1.3 Swords complete: 14 cards retain conflict, heartbreak, exhausted arguments and endings. Roasts target avoidance and reasoning, never distress. Coverage 64/78 (82.1%). Full checks and tone lint pass.

- W1.2/W1.3 Pentacles complete: final14 cards audit scarcity, hoarding, work and exchange without predicting financial outcomes. All78 cards now have all meanings/bites/voices/omens, 100% coverage. Validator requires every card audited. Full checks and tone lint pass.

- W1.6 complete: accessible ordinal meter text plus an original SVG pendulum, persona labels/accents, finite settling animation and static reduced-motion state. Reviewed 390x844 and1440x900 screenshots, fixed pendulum direction, no overflow. Full74 tests/checks pass.

- W1.8 complete: Thai UI now uses short witty language across home, buttons, flows, errors, empty states, library, history and404. Crisis support remains caring. New disclaimer is on every reading. Reviewed mobile/desktop screenshots; full74 tests/checks pass.

- W1.9 meter calibration complete: all24 topic/spread combinations simulate20,000 unique-card draws at50% reversal, plus future4/7/10-card layouts. Lower buckets36.810-40.525%, upper30.890-32.240%. Added30 deterministic/sign/weight/distribution tests; total74 tests pass. Remaining W1.9 work: composer/template/tone integration tests.

- W1.7 complete: ominous vignette, finite Tower tremor, slow Moon ink, persona accent; CSS pauses in hidden tabs and obeys reduced motion. Optional20ms haptics require opt-in. Spice3 reveal order holds the lowest-tone card last with a short suspense beat, preserving original positions and refresh state. Browser run at390/1440 verified order1,2,0 for Tower/Sun/Moon; screenshots reviewed and no overflow. All75 tests/full checks pass.

- W1 content safety/editorial fix: replaced12 weak lines across4batches, removing coercion-blame implications, recovery commands, topic-specific email leakage and repetitive weather reminders. Tones/identities unchanged; all145 tests/full checks pass.

- W1.4 complete:90 unique notable pairs/triples,720 distinct topic-aware medium/hot lines. Pure detection respects presence and explicit positions, independent of orientation. All145 tests/full checks pass.

- W1.5 complete: persona/spice seeded composer, six variants per bank slot/persona, card-specific omen headlines(max55chars), warnings, persona voice and closing, spice3verdict/cliffhanger. Position frames explain difficult strengths/bright cautions and avoid mind-reading. Restyled share links use displayed style and route changes reset correctly. Browser120mobile/desktop cases pass; screenshots reviewed. All145 tests/full checks pass.

- W1.9 complete:66 additional engine contract cases plus migration/combination/position tests; known frozen v1 code and all624 gentle meanings retained. Every persona/spice/topic mode shares/replays deterministically; every headline template checked against all156 omens (maximum55chars). Global UI/bank/combo cheer lint and Thai4word voice repetition enforced. Total145 tests and all checks pass.

- W1.10 complete: sample generator writes30 deterministic readings matching visible spice anatomy. Editorial first pass18/30(60%); fixed12 card lines, clause-like headlines, positional contradictions, repetitive verdicts and duplicategentle display. Re-read24/30(80%) passes, sixexplicit weaknesses retained in FUN_REVIEW. This is an editorial simulation, not real-user validation. Full145 tests/checks and120browser cases pass. Wave1 complete; proceed to sequential Wave2.

- W2.1 complete:40blessings/40harmless comic taboos mapped bytone/suit, frozen localday card/orientation, versioned non-destructive ledger, idempotentstreak, mu colour/day/direction, share-link purpose and1080x1350 fateimage. Corrupt/quota cases preserve original bytes and activecard.13newtests;158total and fullchecks pass. Mobile/desktop screenshots, same-device refresh andPNGdimensions verified.

- W2.2 complete: one-card yes/no/undecided oracle, persona/spice lines,60second persisted cooldown, thirdsame-question comic refusal, crisis/professional-outcome guards and replayable sharelinks/images. Question text/repeatcounter remain memory-only; no question enters storage/sharing.161tests/fullchecks pass. Browser virtualclock verified cooldown/refusal/crisisclear and nooverflow at390/1440.

- W2.3 complete:3card duel invitations, independent frienddraw, side-by-side score/compatibility/persona verdict and frozen resultlinks. Names absent unless typed, with explicit sharevisibility hint. Replay validates both compactreadings; saved localanswer avoids refreshrerolls.164tests/fullchecks pass; two-browser invitation/resultreplay verified at390/1440 with screenshots/nooverflow.

- W2.4 complete:78locked/unlocked slots,30earned achievements, deterministic cosmeticfoil around1/25faces, most-drawn/reversal/favourite-topic stats and3unlockable originalSVGbacks. Actual draws across flow/daily/oracle/duel feed a versioned style-independent album; oldhistory imports without questions. Corruptalbums are preserved.167tests/fullchecks pass; browser verified all78slots/30achievements and persistentbacks at390/1440.

- W2.5 complete: explicit1/3/7day local check-ins, next-visit due banner, immutable three-choice feedback and subjective scoreboard. Optional consent stores city only for weather reads; first-card wet/dry symbolism auto-compares against Open-Meteo past_days with missing/ambiguous/old data excluded. Archived model output is labelled honestly, not observation or scientific accuracy.170tests/fullchecks pass;390/1440 screenshots reviewed, due/vote/reload/mockweather verified.

- W2.6 complete: appended CelticCross10 (crossing pair and four-card staff), loveautopsy5, examaudit4 and nextseven-days7. Frozen codec order retained. Selection fan expands to13 accessible choices for10card draws; roving keyboard controls and persisted validation adapt to count.179tests/fullchecks pass including20k distributions for every new spread; eight mobile/desktop browser flows and screenshots reviewed, manual10card pick/reload verified.

- W2.7 gaming MajorArcana staged:22card-specific upright/reversed meanings and bites audited for length, uniqueness and restricted claims. New topic stays hidden until all78cards are ready.180tests/fullchecks pass.

- W2.7 gaming Wands staged:14cards cover initiative, teamcalls, conflict, recognition, overload and court leadership.36/78 authored;180tests/fullchecks pass.

- W2.7 gaming Cups staged:14cards about team trust, boredom, nostalgia, choice, leaving, satisfaction and emotional boundaries.50/78 authored;180tests/fullchecks pass.

- W2.7 gaming Swords staged:14cards about evidence, chatconflict, rest, overthinking and honest leadership.64/78 authored;180tests/fullchecks pass.

- W2.7 gaming Pentacles staged:final14cards cover training, time/resources, equipment and sustainable teamplay.78/78 gaming meanings/bites complete;180tests/fullchecks pass before activation.

- W2.7 gaming shipped:all78cards have156originalmeanings/156bites; topic appended without codec index changes,1/3card flows, library and share replay integrated. Core content types preserve legacy624meanings exactly; newtopic gentle uses its new authored copy. No unrelated core-topic combo fallback.198tests/fullchecks pass and30browser persona/spice/mobile-desktop cases/screenshots reviewed. Next:work, then spending/saving.

- W2.7 work MajorArcana staged:22card-specific meanings and bites about scope, evidence, collaboration, change and delivery.199tests/fullchecks pass; topic hidden until complete. Pushed completed features through gaming to main40b0a0d for Pages deployment.

- W2.7 work Wands staged:14cards about initiative, plans, disagreement, recognition and workload.36/78 authored;199tests/fullchecks pass.

- W2.7 work Cups staged:14cards about collaboration, belonging, boredom, feedback and emotional boundaries.50/78 authored;199tests/fullchecks pass. Pages deployment39657601487 succeeded for completed gaming build40b0a0d.

- W2.7 work Swords staged:14cards about clarity, feedback, evidence, limits and ending broken processes.64/78 authored;199tests/fullchecks pass.
