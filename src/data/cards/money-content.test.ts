import { expect, it } from 'vitest';
import { moneyMajor } from './money-major';
import { moneyWands } from './money-wands';
import { moneyCups } from './money-cups';
import { moneySwords } from './money-swords';
import { moneyPentacles } from './money-pentacles';
it('audits every staged money meaning and bite', () => {
  const rows = [...moneyMajor, ...moneyWands, ...moneyCups, ...moneySwords, ...moneyPentacles];
  expect(rows).toHaveLength(78);

  expect(new Set(rows.map((r) => r.index)).size).toBe(rows.length);
  const seen = new Set<string>();
  for (const row of rows) {
    for (const line of Object.values(row.meanings)) {
      expect(line.length, `${row.index}: ${line}`).toBeGreaterThanOrEqual(60);
      expect(line.length).toBeLessThanOrEqual(180);
    }
    for (const line of Object.values(row.bite)) expect(line.length).toBeLessThanOrEqual(110);
    for (const line of [...Object.values(row.meanings), ...Object.values(row.bite)]) {
      expect(line).not.toMatch(/TODO|เสียชีวิต|ป่วยหนัก|ตั้งครรภ์|ถูกหวย|รับรองผล|แน่นอน|เลขเด็ด/);
      expect(seen.has(line)).toBe(false);
      seen.add(line);
    }
  }
});
