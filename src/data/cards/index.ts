import { major } from './major';
import { wands } from './wands';
import { cups } from './cups';
import { swords } from './swords';
import { pentacles } from './pentacles';
import { applyUpgrades } from './upgrade';
import { majorUpgrades } from './phase2-major';
import { wandsUpgrades } from './phase2-wands';
import { cupsUpgrades } from './phase2-cups';
import { swordsUpgrades } from './phase2-swords';
import { pentaclesUpgrades } from './phase2-pentacles';
import type { TarotCard } from '../types';
import { gamingMajor } from './gaming-major';
import { gamingWands } from './gaming-wands';
import { gamingCups } from './gaming-cups';
import { gamingSwords } from './gaming-swords';
import { gamingPentacles } from './gaming-pentacles';
const gaming = [...gamingMajor, ...gamingWands, ...gamingCups, ...gamingSwords, ...gamingPentacles];
export const cards: TarotCard[] = applyUpgrades(
  [...major, ...wands, ...cups, ...swords, ...pentacles],
  [...majorUpgrades, ...wandsUpgrades, ...cupsUpgrades, ...swordsUpgrades, ...pentaclesUpgrades],
).map((card, index) => {
  const entry = gaming.find((e) => e.index === index);
  if (!entry) throw Error(`Missing gaming content ${index}`);
  return {
    ...card,
    meanings: { ...card.meanings, gaming: entry.meanings },
    gentleMeanings: { ...card.gentleMeanings, gaming: entry.meanings },
    bite: { ...card.bite, gaming: entry.bite },
  };
});
