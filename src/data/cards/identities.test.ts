import { describe, it, expect } from 'vitest';
import { identities } from './identities';
describe('complete deck identities', () => {
  it('contains 22 major and 56 minor unique cards', () => {
    expect(identities).toHaveLength(78);
    expect(new Set(identities.map((c) => c.id)).size).toBe(78);
    expect(identities.filter((c) => c.arcana === 'major')).toHaveLength(22);
    for (const suit of ['wands', 'cups', 'swords', 'pentacles'])
      expect(identities.filter((c) => c.suit === suit)).toHaveLength(14);
  });
});
