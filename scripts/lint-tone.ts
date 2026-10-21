import { cards } from '../src/data/cards';
import { personaIds } from '../src/data/personas';
import { th, styleCopy } from '../src/i18n/th';
import { ritualCopy } from '../src/i18n/ritual';
import { voiceBanks } from '../src/data/voice-banks';
import { combos } from '../src/data/combos';
export const cheerPhrases = [
  'คุณทำได้',
  'เชื่อมั่นในตัวเอง',
  'ทุกอย่างจะดีขึ้น',
  'จักรวาลจะช่วย',
  'อย่ายอมแพ้',
  'ทุกอย่างเกิดขึ้นเพื่อสิ่งที่ดีกว่า',
];
export function lintTone(): string[] {
  const errors: string[] = [];
  const strings = (value: unknown): string[] =>
    typeof value === 'string'
      ? [value]
      : value && typeof value === 'object'
        ? Object.values(value).flatMap(strings)
        : [];
  const globalCopy = [
    ...strings(th),
    ...strings(styleCopy),
    ...strings(ritualCopy),
    ...Object.entries(voiceBanks)
      .filter(([persona]) => persona !== 'gentle')
      .flatMap(([, bank]) => strings(bank)),
    ...combos.flatMap((combo) => strings(combo.lines)),
  ];
  for (const text of globalCopy)
    if (cheerPhrases.some((phrase) => text.includes(phrase)))
      errors.push(`Global copy contains banned cheer: ${text}`);
  const voices: { id: string; persona: string; text: string }[] = [];
  for (const card of cards.filter((c) => c.contentVersion === 2)) {
    for (const persona of personaIds)
      for (const text of Object.values(card.voice[persona]))
        voices.push({ id: card.id, persona, text });
    const other = [
      ...Object.values(card.meanings).flatMap(Object.values),
      ...Object.values(card.bite).flatMap(Object.values),
      ...Object.values(card.omen),
    ];
    for (const text of other)
      if (cheerPhrases.some((phrase) => text.includes(phrase)))
        errors.push(`${card.id}: banned cheer outside gentle`);
  }
  let gentleCheer = 0;
  for (const line of voices)
    if (cheerPhrases.some((phrase) => line.text.includes(phrase))) {
      if (line.persona === 'gentle') gentleCheer++;
      else errors.push(`${line.id} ${line.persona}: banned cheer`);
    }
  if (gentleCheer > Math.floor(voices.filter((v) => v.persona === 'gentle').length / 40))
    errors.push('Gentle cheer frequency exceeds 1 per 40 lines');
  const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
  const sequences = new Map<string, Set<number>>();
  voices.forEach((line, index) => {
    const words = [...segmenter.segment(line.text)]
      .filter((s) => s.isWordLike)
      .map((s) => s.segment);
    for (let i = 0; i <= words.length - 4; i++) {
      const sequence = words.slice(i, i + 4).join(' ');
      const set = sequences.get(sequence) || new Set<number>();
      set.add(index);
      sequences.set(sequence, set);
    }
  });
  for (const [sequence, owners] of sequences)
    if (owners.size > Math.max(3, voices.length * 0.03))
      errors.push(`Repeated four-word sequence (${owners.size}/${voices.length}): ${sequence}`);
  return errors;
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/lint-tone.ts')) {
  const errors = lintTone();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log('Tone Bible: cheer frequency and Thai four-word repetition checks pass');
}
