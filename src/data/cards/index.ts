import { major } from './major';
import { wands } from './wands';
import { cups } from './cups';
import { swords } from './swords';
import { pentacles } from './pentacles';
import { applyUpgrades } from './upgrade';
import { majorUpgrades } from './phase2-major';
export const cards = applyUpgrades(
  [...major, ...wands, ...cups, ...swords, ...pentacles],
  [...majorUpgrades],
);
