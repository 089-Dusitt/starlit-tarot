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
import { workMajor } from './work-major';
import { workWands } from './work-wands';
import { workCups } from './work-cups';
import { workSwords } from './work-swords';
import { workPentacles } from './work-pentacles';
import { moneyMajor } from './money-major';
import { moneyWands } from './money-wands';
import { moneyCups } from './money-cups';
import { moneySwords } from './money-swords';
import { moneyPentacles } from './money-pentacles';
const money = [...moneyMajor, ...moneyWands, ...moneyCups, ...moneySwords, ...moneyPentacles];
const work = [...workMajor, ...workWands, ...workCups, ...workSwords, ...workPentacles];
const gaming = [...gamingMajor, ...gamingWands, ...gamingCups, ...gamingSwords, ...gamingPentacles];
export const cards: TarotCard[] = applyUpgrades(
  [...major, ...wands, ...cups, ...swords, ...pentacles],
  [...majorUpgrades, ...wandsUpgrades, ...cupsUpgrades, ...swordsUpgrades, ...pentaclesUpgrades],
).map((card, index) => {
  const entry = gaming.find((e) => e.index === index);
  if (!entry) throw Error(`Missing gaming content ${index}`);
  const job = work.find((e) => e.index === index);
  if (!job) throw Error(`Missing work content ${index}`);
  const spending = money.find((e) => e.index === index);
  if (!spending) throw Error(`Missing money content ${index}`);
  return {
    ...card,
    meanings: {
      ...card.meanings,
      gaming: entry.meanings,
      work: job.meanings,
      money: spending.meanings,
    },
    gentleMeanings: {
      ...card.gentleMeanings,
      gaming: entry.meanings,
      work: job.meanings,
      money: spending.meanings,
    },
    bite: { ...card.bite, gaming: entry.bite, work: job.bite, money: spending.bite },
  };
});
