import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parser';

/** Helper: assert parse ok and return the numeric/boolean value. */
function value(input: string): number | boolean {
  const r = parse(input);
  if (!r.ok) throw new Error(`expected ok parse: ${r.message}`);
  return r.value;
}

describe('operator precedence and associativity', () => {
  it('multiplication binds tighter than addition', () => {
    expect(value('1 + 2 * 3')).toBe(7);
    expect(value('2 * 3 + 1')).toBe(7);
  });

  it('division binds tighter than subtraction', () => {
    expect(value('10 - 6 / 2')).toBe(7);
  });

  it('parentheses override precedence', () => {
    expect(value('(1 + 2) * 3')).toBe(9);
  });

  it('same-precedence operators are left-associative', () => {
    // 10 - 3 - 2 parses as (10 - 3) - 2 = 5, not 10 - (3 - 2) = 9
    expect(value('10 - 3 - 2')).toBe(5);
    // 12 / 2 / 3 parses as (12 / 2) / 3 = 2
    expect(value('12 / 2 / 3')).toBe(2);
  });

  it('comparison has the lowest precedence', () => {
    // 1 + 2 * 3 = 7 → (1 + (2 * 3)) = 7 → 7 = 7 → true
    expect(value('1 + 2 * 3 = 7')).toBe(true);
  });
});
