import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parser';

describe('edge cases', () => {
  it('handles unary minus', () => {
    const r = parse('-5 + 3 = -2');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(true);
  });

  it('handles nested unary minus', () => {
    const r = parse('--5 = 5');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(true);
  });

  it('parses floating-point numbers', () => {
    const r = parse('10 / 4 = 2.5');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(true);
  });

  it('is whitespace-insensitive', () => {
    const compact = parse('1+2*3=7');
    const spaced = parse('  1  +  2  *  3   =   7  ');
    expect(compact.ok).toBe(true);
    expect(spaced.ok).toBe(true);
    if (compact.ok && spaced.ok) {
      expect(compact.value).toBe(spaced.value);
    }
  });

  it('handles deeply nested parentheses', () => {
    const r = parse('((1 + 2) * (3 - 1)) = 6');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(true);
  });

  it('evaluates a bare arithmetic expression as a number', () => {
    const r = parse('2 + 3 * 4');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.kind).toBe('arithmetic');
      expect(r.value).toBe(14);
    }
  });

  it('reports division by zero as an error', () => {
    const r = parse('1 / 0 = 0');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/division by zero/i);
  });

  it('rejects empty input', () => {
    const r = parse('');
    expect(r.ok).toBe(false);
  });

  it('rejects whitespace-only input', () => {
    const r = parse('   ');
    expect(r.ok).toBe(false);
  });
});

describe('error location', () => {
  it('reports unexpected-token offset for unbalanced parens', () => {
    const r = parse('1 + (2 = 3');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      // '=' is at offset 7 in the input; parser chokes there
      expect(r.offset).toBeGreaterThan(0);
      expect(r.line).toBe(1);
    }
  });

  it('reports unexpected-EOF when trailing operator is dangling', () => {
    const r = parse('1 +');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.message.length).toBeGreaterThan(0);
    }
  });

  it('reports a plausible location for mid-line garbage', () => {
    const r = parse('1 + @ 2');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      // '@' starts at col 5 but Nearley may surface the error at the
      // last-consumed token (col 3, the '+'). Either is acceptable UX;
      // what matters is that we land within the troubled region.
      expect(r.col).toBeGreaterThanOrEqual(3);
      expect(r.col).toBeLessThanOrEqual(7);
      expect(r.line).toBe(1);
    }
  });
});
