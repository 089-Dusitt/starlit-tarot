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
export const cards = applyUpgrades(
  [...major, ...wands, ...cups, ...swords, ...pentacles],
  [...majorUpgrades, ...wandsUpgrades, ...cupsUpgrades, ...swordsUpgrades, ...pentaclesUpgrades],
);
