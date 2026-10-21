import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { cards } from '../src/data/cards';
import type { TarotCard } from '../src/data/types';
import { topicIds } from '../src/data/topic-ids';
import { personaIds } from '../src/data/personas';
export function validateContent(deck: TarotCard[] = cards): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const sentences = new Map<string, string>();
  const deny =
    /TODO|lorem|xxx|เสียชีวิต|ป่วยหนัก|ตั้งครรภ์|ถูกหวย|รับรองผล|แน่นอน|เลขเด็ด|[\u4e00-\u9fff]/i;
  if (deck.length !== 78) errors.push(`Expected 78 cards, got ${deck.length}`);
  for (const c of deck) {
    if (ids.has(c.id)) errors.push(`Duplicate id ${c.id}`);
    ids.add(c.id);
    if (
      !c.id ||
      !c.name.th ||
      !c.name.en ||
      !c.arcana ||
      !Number.isInteger(c.number) ||
      !c.element ||
      !c.skyMood ||
      !/^#[\da-f]{6}$/i.test(c.luckyColor.hex) ||
      !c.luckyColor.th
    )
      errors.push(`${c.id}: missing identity field`);
    for (const orientation of ['upright', 'reversed'] as const) {
      if (
        c.keywords[orientation].length < 3 ||
        c.keywords[orientation].length > 4 ||
        c.keywords[orientation].some((k) => !k.trim())
      )
        errors.push(`${c.id}: keywords`);
      if (![-2, -1, 0, 1, 2].includes(c.tone[orientation])) errors.push(`${c.id}: tone`);
      if (!c.advice[orientation]?.trim()) errors.push(`${c.id}: advice`);
      if (c.contentVersion === 2) {
        const omen = c.omen[orientation];
        if (!omen?.trim() || omen.length > 40)
          errors.push(`${c.id} ${orientation}: omen length ${omen?.length}`);
        for (const persona of personaIds) {
          const voice = c.voice[persona][orientation];
          if (!voice?.trim() || voice.length > 240)
            errors.push(`${c.id} ${persona} ${orientation}: voice length`);
        }
        for (const topic of topicIds) {
          const bite = c.bite[topic][orientation];
          if (!bite?.trim() || bite.length > 110)
            errors.push(`${c.id} ${topic} ${orientation}: bite length ${bite?.length}`);
        }
      }
      for (const topic of topicIds) {
        const value = c.meanings[topic][orientation];
        if (!value || value.length < 60 || value.length > 180)
          errors.push(`${c.id} ${topic} ${orientation}: length ${value?.length}`);
      }
    }
    for (const value of [
      ...Object.values(c.meanings).flatMap((pair) => Object.values(pair)),
      ...Object.values(c.advice),
      ...(c.contentVersion === 2
        ? [
            ...Object.values(c.bite).flatMap((p) => Object.values(p)),
            ...Object.values(c.voice).flatMap((p) => Object.values(p)),
            ...Object.values(c.omen),
          ]
        : []),
    ]) {
      if (deny.test(value)) errors.push(`${c.id}: prohibited wording`);
      for (const sentence of value
        .split(/[.!?\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)) {
        const owner = sentences.get(sentence);
        if (owner && owner !== c.id) errors.push(`${c.id}: duplicate sentence with ${owner}`);
        sentences.set(sentence, c.id);
      }
    }
  }
  return errors;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = validateContent();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else
    console.log(
      `78 cards · 624 complete topic meanings · ${cards.filter((c) => c.contentVersion === 2).length}/78 Phase 2 audits · no invalid fields, duplicates or prohibited wording`,
    );
}
