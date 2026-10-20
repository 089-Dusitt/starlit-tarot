import { it, expect } from 'vitest';
import { validateContent } from '../../../scripts/validate-content';
it('validates all 78 cards and every orientation/topic meaning', () => {
  expect(validateContent()).toEqual([]);
});
