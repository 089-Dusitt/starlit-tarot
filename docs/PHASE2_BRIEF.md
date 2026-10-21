# PHASE 2 BRIEF - "Starlit Tarot": make it fun, give it bite, keep building

You are continuing an existing project in this repo: a Thai tarot website (Vite + React +
TypeScript + Tailwind + framer-motion, no backend). Do NOT start over. First read AGENTS.md,
README.md, PLAN.md and `git log`, run the app once, and learn the real structure (file names
below follow the v1 plan - adapt to what actually exists). Everything in the v1 spec still
applies (stack, no backend/trackers, self-hosted fonts, original SVG art, Thai-first,
accessibility, performance, tests) EXCEPT where this brief overrides it.

## 0. THE PROBLEM (top priority)
v1 readings are 100% encouraging, like a motivational poster. The owner finds that boring.
These v1 rules are now REVOKED: "modern, empowering interpretation", "never doom",
"dark cards are always framed as growth", "readings end in cheerful tips".
New goal: FUN first, TRUTH second, COMFORT third. A reading should sound like a witty mystic who
actually tells you something - sometimes sweet, often a little scary, never generic.

## 1. RULES OF ENGAGEMENT
1. Work autonomously and continuously. Never ask questions and never stop after a wave: go on to
   the next one. Record decisions in docs/DECISIONS.md.
2. First actions: save this entire brief verbatim to docs/PHASE2_BRIEF.md and create
   docs/PROGRESS.md (wave checklist, "Next up" top 5, blockers). Update PROGRESS.md after EVERY task.
3. Keep the repo green: lint, typecheck, test, validate:content and build pass at every commit.
   Commit after every task ("feat(w1.2): ...", "content(...)", "fix(...)"); commit content in
   chunks (one suit or ~20 cards per commit) so nothing is lost if the session ends.
4. Plan, act, verify. Check UI work with screenshots (390x844 and 1440x900) when a headless
   browser exists, otherwise with component tests. Review your own diff before committing.
5. Backwards compatibility: v1 share links must still open (version the share code; v1 decodes
   as persona "gentle", spice 1). Version localStorage data and write migrations.
6. Budget discipline: at most 3 new runtime dependencies in total (justify each in
   DECISIONS.md); initial JS <= 300 KB gzip; no trackers; no network except Open-Meteo; no
   third-party art or audio (synthesise sound with WebAudio).
7. Safety rails (section 2.5) stay ON. Spicy is not cruel.
8. Never force-push, rewrite git history, or delete user data.

## 2. TONE BIBLE (applies to ALL copy: cards, composer, UI text, errors, empty states)
2.1 Voice anatomy
- One idea per sentence, short and rhythmic Thai. Pattern: observation + a sting or twist in the
  last clause. Specific beats generic; an image beats an abstraction.
- Allowed flavour: teasing, mock-fatalism, ominous imagery, cliffhangers, gossip, dry sarcasm,
  "you already know" call-outs.
- Banned cheer cliches (lint them): "คุณทำได้", "เชื่อมั่นในตัวเอง", "ทุกอย่างจะดีขึ้น",
  "จักรวาลจะช่วย", "อย่ายอมแพ้", "ทุกอย่างเกิดขึ้นเพื่อสิ่งที่ดีกว่า". Allowed only in the gentle
  persona, at most 1 per 40 lines.
- Hard truths target behaviours, patterns and situations - never the user's body, identity,
  family, mental health or trauma, and never a named third party as fact.
2.2 Balance (measurable)
- Card `tone` values must follow the traditional meaning honestly, including the ugly ones
  (Tower, Death, Devil, 3/5/9/10 of Swords, 5 of Cups, 5 of Pentacles...). Do not soften them
  into "growth".
- Calibrate the meter's bucket thresholds per spread size, then simulate 20,000 random readings
  per topic x spread (default 50% reversal): the two lowest buckets must total 30-45% and the two
  highest 25-40%. Make this a Vitest test and fix tones/thresholds until it passes.
2.3 Spice levels (user-selectable, default 2; UI = 3 chilli icons in inline SVG, label "เผ็ดแค่ไหน?")
- 1 "ไม่เผ็ด": balanced and gentle, still honest about cautions.
- 2 "เผ็ดกลาง" (default): honest + warnings + light teasing; adds the sections
  "ความจริงที่ไม่อยากฟัง" and "ลางเตือน".
- 3 "เผ็ดสะใจ": blunt, dramatic, roast-y; hard truth FIRST; a persona punchline on every card; a
  final verdict with a cliffhanger; theatrical effects on ominous cards. The first time it is
  chosen, show an in-character confirmation ("ไพ่ระดับนี้ไม่ปราณีนะ ไปต่อไหม?").
2.4 Personas (voice packs; default "blunt"; also a "สุ่มหมอดู" random option)
- blunt "ซินแสปากตรง": dry, short, no sugar.
- oracle "ราตรีมืด": ominous, poetic, cryptic; foreshadowing; speaks in images (candles, tides, doors).
- bestie "เพื่อนสนิทปากร้าย": casual spoken Thai ("เนี่ย", "แก", "ใช่ปะ"), gossip + roast, warm
  underneath, no swearing.
- mu "แม่หมอสายมู": มูเตลู flavour - lucky/unlucky colours and days, small harmless rituals;
  affectionate, never mocking any religion; no selling amulets/donations; no lottery.
- gentle "ใจดี": the old v1 tone for people who want comfort (reuse and polish the v1 texts).
2.5 Safety rails (spicy is not cruel)
- Never state as fact: death, illness, pregnancy, legal outcomes, money/investment outcomes,
  accidents, or that a real person is cheating. Endings are endings of phases and situations.
  Exam: never state pass/fail or a score - the bite targets preparation habits.
- Never roast vulnerabilities. No humiliation, sexual content, slurs/stereotypes, lottery/gambling.
- The crisis guard stays: self-harm wording → no reading, a caring message with 1323 (and 1669).
- Photosensitivity: nothing flashes more than 3 times per second; every theatrical effect has a
  prefers-reduced-motion version. Sound only after a user tap, gain <= 0.25, fade-in, persistent mute.
- Keep one short, witty disclaimer on every reading, e.g. "ไพ่ไม่ใช่ศาล ไม่ใช่หมอ ไม่ใช่นักลงทุน -
  เอาไว้เล่นสนุกและคิดเล่นๆ นะ".
2.6 Data model additions (extend v1's TarotCard; gentle reuses the old texts)
    bite:  Record<"general"|"love"|"exam"|"weather", { upright: string; reversed: string }>; // 1 sentence, <= 110 chars
    voice: Record<"blunt"|"oracle"|"bestie"|"mu"|"gentle", { upright: string; reversed: string }>; // 1-2 sentences about the card itself
    omen:  { upright: string; reversed: string };   // ominous/teasing fragment, <= 40 chars
2.7 Reading anatomy
- Always: headline (persona voice, <= 60 chars, quotable) → pendulum gauge → card items → closing line.
- Spice 2+: "ความจริงที่ไม่อยากฟัง" (the bite of the lowest-tone card, or a combo line) and
  "ลางเตือน" (0-2 omen/combo lines).
- Spice 3: each card item leads with its bite, then the persona punchline; add "คำทำนายสุดท้าย"
  (verdict + cliffhanger, e.g. "ใบสุดท้ายคือใบที่คุณไม่อยากเจอ... แต่ไพ่ไม่ได้ถามความเห็นคุณ");
  the lowest-tone card is flipped last with extra suspense.
- Practical tips stay, but only 1-3, in the persona's voice (a tip may be sarcastic). They are
  no longer the centrepiece.
2.8 Calibration sample - match this level of bite (positive cards stay positive but get attitude)
    The Tower
    meanings.general.upright : "สิ่งที่คุณเชื่อว่ามั่นคงกำลังถูกสั่นจนร้าว ไม่ใช่เพราะโชคร้าย แต่เพราะฐานไม่แน่นมาตั้งแต่แรก"
    meanings.general.reversed: "คุณรู้อยู่แล้วว่ามีบางอย่างต้องพัง แต่ยังเอามือยันไว้ ยิ่งยื้อ ตอนถล่มจะยิ่งหนัก"
    meanings.love.upright    : "ความสัมพันธ์ที่ประคองด้วยความเงียบและคำแก้ตัวเล็กๆ กำลังถึงจุดที่ปิดไม่อยู่"
    bite.love.upright        : "ความจริงจะโผล่มาแบบไม่ขออนุญาต และคุณไม่ได้ตกใจเท่าที่ทำหน้า"
    bite.exam.upright        : "แผนอ่านหนังสือที่คุณภูมิใจนักหนา มีรอยรั่ว และข้อสอบจะหาเจอก่อนคุณ"
    voice.blunt.upright      : "พังก็คือพัง อย่าเสียเวลาหาคนผิด ไปหาที่ที่ฐานแน่นกว่า"
    voice.oracle.upright     : "ฟ้าร้องก่อนที่ปากคุณจะทันปฏิเสธ หอคอยไม่เคยถามใครว่าพร้อมหรือยัง"
    voice.bestie.upright     : "แก... สัญญาณมันชัดมาตั้งนานแล้ว นี่ไม่ใช่เซอร์ไพรส์ นี่คือเรื่องที่แกแกล้งไม่เห็น"
    voice.mu.upright         : "ไพ่ใบนี้ไม่ควรมองข้าม วันนี้เลี่ยงตัดสินใจเรื่องใหญ่ ใส่สีขาวหรือน้ำเงินช่วยให้ใจนิ่ง"
    omen.upright             : "รอยร้าวแรกเกิดขึ้นแล้ว"
    The Sun (upright)
    voice.blunt.upright      : "วันนี้โชคเข้าข้าง อย่าถ่อมตัวจนปล่อยของดีหลุดมือ"
    voice.bestie.upright     : "ได้ซีนแล้วแก ไปเลย อย่ามัวทำเป็นเขินอยู่"
    omen.upright             : "ฟ้าเปิด แต่อย่าลืมกันแดด"

## 3. WAVE 1 - REWIRE THE TONE (do this first and finish it completely; worth more than the rest combined)
W1.1 Settings & plumbing: add Persona and Spice to types, settings store, history and share code
     v2 (+ v1 compatibility). First-run sheet "เลือกสไตล์หมอดู" (persona cards + chilli selector,
     skippable, plus "สุ่มหมอดู"). On the reading screen add a quick switch "เปลี่ยนสไตล์ → อ่านใหม่
     ด้วยไพ่ใบเดิม" (same cards, new voice).
W1.2 Content audit: re-read every v1 meaning; rewrite over-softened `meanings` and `tone` into
     honest versions; move the old soft texts into voice.gentle.
W1.3 New content for all 78 cards x 2 orientations: bite (general/love/exam/weather), voice
     (blunt/oracle/bestie/mu; gentle reused) and omen, matching the calibration sample. Order:
     Major Arcana, then wands, cups, swords, pentacles. `npm run content:coverage` prints % complete
     per field; `validate:content` must enforce 100% by the end of Wave 1 (extend its deny-list
     for the new fields).
W1.4 Combos: src/data/combos.ts with >= 80 notable pairs/triples (e.g. Lovers+Devil, Tower+Moon,
     Death+Wheel of Fortune, 3 of Swords+5 of Cups, Sun+Star, Ace of Cups+2 of Cups...), each with
     topic-aware lines for spice 2-3. The composer detects combos by presence (and by position
     where it matters).
W1.5 Composer rewrite per 2.7: persona x spice template banks (>= 6 variants per slot per persona),
     deterministic by seed, a headline generator, verdict + cliffhanger, zero generic filler.
     Meter labels become fun and persona-flavoured (blunt example: ฟ้าถล่ม / เมฆครึ้ม / กลางๆ /
     ลมเปลี่ยนทิศ / ดาวเข้าข้าง).
W1.6 Pendulum gauge replaces the 5-step bar: a mystic pendulum that swings and settles (static
     under reduced motion), with an accessible text label.
W1.7 Theatre: effects for ominous cards (vignette, candle flicker, tremor for the Tower, ink-bleed
     for the Moon...), persona-themed accent colours on the reading screen, optional haptics; obey
     the 2.5 rules.
W1.8 Microcopy sweep: rewrite every UI string (home, buttons, empty states, errors, 404,
     disclaimer) in the Tone Bible voice. Fun must never hurt clarity.
W1.9 Tests & lint: `npm run lint:tone` (banned cheer phrases; repetition check using
     Intl.Segmenter("th") - no 4-word sequence in more than 3% of voice lines; length bounds), the
     distribution test from 2.2, composer determinism, share v1/v2 round-trip, settings/history
     migration from v1 fixtures.
W1.10 Fun test: scripts/sample-readings.ts writes 30 deterministic readings (mixed topics,
     personas, spice) to docs/sample-readings.md. Critique them as a skeptical 22-year-old Thai
     user: specific? surprising? quotable? screenshot-worthy? Rewrite lines/templates until at
     least 70% pass; log the verdicts in docs/DECISIONS.md.

## 4. WAVE 2 - MORE THINGS TO PLAY WITH (ship each one complete, with tests, before the next)
W2.1 พร/คำสาปประจำวัน: the daily card becomes a daily blessing or mini-curse (a harmless comic
     taboo or boon, e.g. "ห้ามทักแชทเก่า", "ห้ามเปิดแอปสั่งอาหารก่อนเที่ยง"). >= 40 blessings and
     >= 40 mini-curses mapped by card tone/suit/topic; share card; streak counter; for the mu
     persona add "ของมูวันนี้" (colour/day/direction - no numbers, no lottery).
W2.2 Oracle Yes/No: one card → ใช่ / ไม่ / ไพ่ยังไม่อยากตอบ, with persona + spice lines, a 60 s
     cooldown with in-character excuses, and asking the same question 3 times makes the cards
     refuse (comic).
W2.3 Duel "ท้าเพื่อนเปิดไพ่": the challenger's cards go into a link; the friend draws and sees a
     side-by-side comparison + scoreboard ("ใครดวงดีกว่าวันนี้", compatibility verdict with
     persona lines); the final result is shareable. No backend, no names unless typed.
W2.4 Collection "สมุดสะสมไพ่": 78 slots with locked silhouettes, >= 25 achievements with witty
     names (e.g. "รอดจากหอคอย 3 ครั้ง"), a rare foil/holographic variant (about 1 in 25 draws,
     cosmetic only), personal stats (most-drawn card, reversed ratio, favourite topic) and
     unlockable card-back designs.
W2.5 Check-in "ตรวจคำทำนาย": after N days (1/3/7, user-chosen) the next visit asks "ตรงไหม?"
     (ตรง / ครึ่งๆ / ไม่ตรง) → local accuracy stats shown as a joke scoreboard. Weather: auto-compare
     the tarot sky mood with the actual weather (Open-Meteo past_days) → "ไพ่ vs พยากรณ์: ใครแม่นกว่า".
W2.6 Spicy spreads: Celtic Cross (10, proper layout); "ผ่าชันสูตรรักเก่า" (5: ต้นเหตุ / สิ่งที่คุณ
     ไม่ยอมรับ / สิ่งที่อีกฝ่ายไม่ยอมรับ / ที่ยังค้าง / ปล่อยหรือไปต่อ); exam "แผนอ่านหนังสือ
     โดนจับผิด" (4: ที่อ้างว่าทำแล้ว / ที่กำลังหนี / จุดที่ข้อสอบจะเล่นงาน / ทางรอด);
     "สัปดาห์นี้" (7 cards, one per day).
W2.7 New topics (data-driven; each needs meanings + bite for all 78 cards; ship one at a time in
     this order): ดวงเกม (ranked / win streaks / loot luck / tilt warnings - the playful one),
     การงาน, เงินทอง (spending/saving vibes only - no instruments, no returns, no lottery).

## 5. WAVE 3 - LOOK, SOUND, FEEL
W3.1 Art pass: richer Major Arcana illustrations (layered SVG with gradients, glows and small idle
     animations that play on reveal), more distinctive court cards, a CSS foil effect for rare
     cards, 3 extra card-back designs. Visually QA all 78 at card size and thumbnail size.
W3.2 Synthesised sound (WebAudio only): shuffle swish, flip, a low ambient drone, a bell for good
     cards, a dissonant sting for ominous ones, per-persona ambience. Off by default, a one-tap
     "เปิดเสียง" on the ritual screen, persistent mute, obey the limits in 2.5.
W3.3 Motion: pointer/gyro tilt with sheen on cards (iOS permission flow, graceful fallback),
     particles on reveal, a smoke/candle layer behind the table, a suspense beat before the final
     card; pause everything when the tab is hidden; stay at 60 fps on a mid-range Android.
W3.4 Share images: 6 templates (blessing, mini-curse, "ใบทำนายสุดโหด", duel result, daily omen,
     collection milestone), 1080x1350 and 1080x1920, persona-themed, site name + URL from config,
     caption "ส่งให้เพื่อนอ่านก่อนนะ".
W3.5 Home redesign: a dramatic hero scene (oracle table: candles, crystal ball, floating cards
     built from SVG/CSS), a "ลางวันนี้" ticker, and a persona preview carousel showing the same
     card read by each persona.

## 6. WAVE 4 - REACH
W4.1 Static prerender of key routes + the 78 card pages ("ความหมายไพ่ <ชื่อ>") for SEO (small
     custom script or vite-react-ssg; unique title/description/OG per page; sitemap updated).
W4.2 PWA: installable, offline-capable shell, manifest shortcuts (ไพ่ประจำวัน, ถามใช่/ไม่), an
     update toast. Be careful with cache invalidation.
W4.3 CI: .github/workflows/ci.yml (install, lint, typecheck, test, validate:content, build) and an
     updated deploy guide.
W4.4 [STRETCH] English UI toggle (i18n/en.ts) - persona lines stay Thai; card names and UI chrome
     translate.

## 7. WAVE 5 - HARDEN
- axe-core accessibility tests on every route; a keyboard-only run-through of every flow; screen
  reader labels for the new widgets (pendulum, duel, collection).
- Playwright e2e (if installable): each topic x each persona x each spice level, the duel flow,
  share-link round-trip, offline weather fallback, settings migration from a v1 localStorage fixture.
- Performance budget check (initial JS <= 300 KB gzip, LCP/CLS sanity); lazy-load everything
  non-critical (audio, foil, share-image libraries).
- Error boundaries, storage-quota failures, corrupted localStorage, malformed share codes, API
  failures - all with friendly in-voice messages.
- Update README.md, AGENTS.md and docs/CHANGELOG.md; add guides "how to add a persona / topic /
  spread / combo".

## 8. WAVE INFINITY - NEVER-ENDING IMPROVEMENT LOOP (start when Waves 0-5 are done; keep going until interrupted)
Repeat:
 1. Play the whole product like a skeptical 22-year-old Thai user and like a QA engineer: every
    topic x persona x spice level, mobile and desktop, offline, slow network.
 2. Write the 10 most valuable improvements (fun, content quality, bugs, polish, speed,
    accessibility) in docs/BACKLOG.md; score each by impact and effort.
 3. Implement the top 3 (with tests and verification), commit, update PROGRESS.md and CHANGELOG.md.
 4. Every 3rd iteration run a content pass: re-run the fun test (W1.10), rewrite the weakest 10%
    of lines, remove repetition, add new combos, omens, blessings and curses.
Rules: no rewrite churn, no dependency bloat, never break share links or stored data, revert any
change that cannot be verified or that hurts performance or accessibility.

## 9. WAVE 0 AND FINAL REPORT
Wave 0 (before anything else): install, lint, typecheck, test, validate:content, build - fix anything
red from v1. When you finish or are interrupted, your final message is max 20 lines: waves done,
what is in progress, how to run, top risks.