import type { CoreTarotCard } from '../types';
import type { CardUpgrade } from './phase2-types';
export function applyUpgrades(deck: CoreTarotCard[], upgrades: CardUpgrade[]): CoreTarotCard[] {
  const byId = new Map(upgrades.map((card) => [card.id, card]));
  return deck.map((card) => {
    const next = byId.get(card.id);
    return next
      ? { ...card, ...next, contentVersion: 2, voice: { ...next.voice, gentle: card.voice.gentle } }
      : card;
  });
}
