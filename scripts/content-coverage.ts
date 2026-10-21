import { cards } from '../src/data/cards';
import { topicIds } from '../src/data/topic-ids';
const complete = cards.filter((c) => c.contentVersion === 2);
for (const field of ['meanings', 'bite', 'voice', 'omen', 'tone'] as const) {
  console.log(
    `${field}: ${complete.length}/78 cards (${((complete.length / 78) * 100).toFixed(1)}%) audited Phase 2`,
  );
}
for (const suit of ['major', 'wands', 'cups', 'swords', 'pentacles']) {
  const group = cards.filter((c) => c.suit === suit || c.arcana === suit);
  console.log(`${suit}: ${group.filter((c) => c.contentVersion === 2).length}/${group.length}`);
}
for (const topic of topicIds) {
  const count = cards.filter((c) =>
    ['upright', 'reversed'].every(
      (o) =>
        c.meanings[topic][o as 'upright' | 'reversed']?.trim() &&
        c.bite[topic][o as 'upright' | 'reversed']?.trim(),
    ),
  ).length;
  console.log(`${topic}: ${count}/78 complete meanings and bites`);
}
