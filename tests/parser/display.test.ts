import { describe, it, expect } from 'vitest';
import { parse } from '../../src/parser';

describe('ParseOk display fields', () => {
  it('includes the token stream produced by Moo', () => {
    const r = parse('2 * 3 + 4 = 10');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const types = r.tokens.map((t) => t.type);
      expect(types).toEqual([
        'NUMBER',
        'TIMES',
        'NUMBER',
        'PLUS',
        'NUMBER',
        'EQ',
        'NUMBER',
      ]);
      // Offsets and line/col are populated from Moo.
      expect(r.tokens[0]?.offset).toBe(0);
      expect(r.tokens[0]?.line).toBe(1);
      expect(r.tokens[0]?.col).toBe(1);
    }
  });

  it('skips whitespace tokens in the display stream', () => {
    const r = parse('  1   +   2  ');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.tokens).toHaveLength(3);
      expect(r.tokens.map((t) => t.text)).toEqual(['1', '+', '2']);
    }
  });

  it('renders the parenthesised pretty form with explicit grouping', () => {
    expect(extract(parse('2 * 3 + 4 = 10'))).toBe('((2 * 3) + 4) = 10');
    expect(extract(parse('2 * (3 + 4) = 10'))).toBe('(2 * (3 + 4)) = 10');
    expect(extract(parse('1 + 2'))).toBe('(1 + 2)');
    expect(extract(parse('-5 + 3'))).toBe('(-5 + 3)');
  });

  it('does not wrap the top-level Compare in outer parentheses', () => {
    expect(extract(parse('1 = 2'))).toBe('1 = 2');
  });
});

function extract(r: ReturnType<typeof parse>): string | undefined {
  return r.ok ? r.prettyForm : undefined;
}
