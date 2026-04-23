import { describe, it, expect } from 'vitest';
import { parse } from '@/parser';

/**
 * The eight worked examples from the assignment, verbatim.
 * These are the "first thing a reviewer runs".
 */
describe('homework examples', () => {
  const cases: ReadonlyArray<[string, boolean | 'invalid']> = [
    ['1 + 2 = 3', true],
    ['2 * 3 + 4 = 10', true],
    ['2 * (3 + 4) = 10', false],
    ['6 = 10 / 2 + 1', true],
    ['12 + 3 != 4 / 2 + 5', true],
    ['2 + 3 * 2 = 10', false],
    ['2 * 3 + 4 != 10', false],
    ['1 + (2 = 3', 'invalid'],
  ];

  it.each(cases)('%s → %s', (input, expected) => {
    const r = parse(input);
    if (expected === 'invalid') {
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.line).toBeGreaterThanOrEqual(1);
        expect(r.col).toBeGreaterThanOrEqual(1);
        expect(r.offset).toBeGreaterThanOrEqual(0);
        expect(r.message.length).toBeGreaterThan(0);
      }
    } else {
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.kind).toBe('statement');
        expect(r.value).toBe(expected);
      }
    }
  });
});
