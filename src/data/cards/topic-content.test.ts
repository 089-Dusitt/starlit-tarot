import { expect, it } from 'vitest';
import { gamingMajor } from './gaming-major';
import { gamingWands } from './gaming-wands';
import { gamingCups } from './gaming-cups';
import { gamingSwords } from './gaming-swords';
it('audits staged new-topic meanings and bites before their topic is enabled', () => {
  const rows = [...gamingMajor, ...gamingWands, ...gamingCups, ...gamingSwords];
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
      expect(seen.has(line), `duplicate ${line}`).toBe(false);
      seen.add(line);
    }
  }
});
