import { cards } from '../src/data/cards';
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
