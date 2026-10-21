import { writeFileSync } from 'node:fs';
import { compose } from '../src/engine/compose';
import { draw } from '../src/engine/draw';
import { seededRng } from '../src/engine/rng';
import { spreadsForTopic } from '../src/data/spreads';
import { personaIds, personas } from '../src/data/personas';
import { topicIds } from '../src/data/topic-ids';
import { th } from '../src/i18n/th';
import type { Reading } from '../src/data/types';
export const sampleReadings: Reading[] = Array.from({ length: 30 }, (_, i) => {
  const topic = topicIds[i % topicIds.length];
  const choices = spreadsForTopic(topic);
  const spread = choices[Math.floor(i / 4) % choices.length];
  const seed = 8051 + i * 7919;
  return {
    version: 2,
    topic,
    spread: spread.id,
    cards: draw(spread.positions.length, true, seededRng(seed)),
    seed,
    date: '2026-10-21',
    persona: personaIds[i % 5],
    spice: ((Math.floor(i / 5) % 3) + 1) as 1 | 2 | 3,
  };
});
const lines = [
  '# Thirty deterministic readings',
  '',
  'Generated offline. Fixed date 2026-10-21; seeds and styles below are replayable. These are fictional entertainment samples, not predictions about a real person.',
  '',
];
for (const [i, reading] of sampleReadings.entries()) {
  const r = compose(reading);
  lines.push(
    `## ${String(i + 1).padStart(2, '0')} · ${th.topics[reading.topic].name} · ${personas[r.persona].name} · spice ${r.spice}`,
    `Seed: ${reading.seed}; spread: ${reading.spread}`,
    '',
    `**${r.headline}**`,
    `${r.meter.label}`,
    r.overview,
    '',
  );
  if (r.hardTruth) lines.push(`ความจริงที่ไม่อยากฟัง: ${r.hardTruth}`, '');
  for (const slot of r.slots) {
    lines.push(
      `### ${slot.position.label} · ${slot.card.name.th}${slot.reversed ? ' (กลับหัว)' : ''}`,
    );
    if (slot.positionFrame) lines.push(`- มุมของตำแหน่ง: ${slot.positionFrame}`);
    if (r.spice === 3) lines.push(`- Bite: ${slot.bite}`);
    if (r.spice === 3 && slot.voice !== slot.meaning) lines.push(`- หมอดู: ${slot.voice}`);
    lines.push(`- ความหมาย: ${slot.meaning}`);
    if (r.spice < 3 && slot.voice !== slot.meaning) lines.push(`- หมอดู: ${slot.voice}`);
    lines.push('');
  }
  if (r.omens.length) lines.push(`ลางเตือน: ${r.omens.join(' / ')}`, '');
  lines.push(...r.tips.map((t) => `- ลองทำ: ${t}`), '');
  if (r.verdict) lines.push(r.verdict, r.cliffhanger, '');
  lines.push(r.closing, th.disclaimer, '');
}
writeFileSync('docs/sample-readings.md', lines.join('\n') + '\n');
console.log('Wrote 30 deterministic persona/spice/topic readings to docs/sample-readings.md');
