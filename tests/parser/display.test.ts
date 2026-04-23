import { describe, it, expect } from 'vitest';
import { parse, tokenize, prettyPrint } from '@/parser';

/**
 * These tests lock the behaviour of two library utilities that sit
 * alongside parse() — tokenize() and prettyPrint() — which callers
 * can use to render the lexer's output or an AST back to source with
 * explicit precedence. The UI does not use them, but they are part
 * of the public parser API.
 */

describe('tokenize()', () => {
  it('returns the Moo token stream, skipping whitespace', () => {
    const tokens = tokenize('2 * 3 + 4 = 10');
    expect(tokens.map((t) => t.type)).toEqual([
      'NUMBER',
      'TIMES',
      'NUMBER',
      'PLUS',
      'NUMBER',
      'EQ',
      'NUMBER',
    ]);
    expect(tokens[0]).toMatchObject({
      type: 'NUMBER',
      text: '2',
      offset: 0,
      line: 1,
      col: 1,
    });
  });

  it('skips all whitespace regardless of volume', () => {
    const tokens = tokenize('  1   +   2  ');
    expect(tokens.map((t) => t.text)).toEqual(['1', '+', '2']);
  });

  it('tokenises `!=` as a single token, not two', () => {
    const tokens = tokenize('1 != 2');
    expect(tokens.map((t) => t.type)).toEqual(['NUMBER', 'NEQ', 'NUMBER']);
  });
});

describe('prettyPrint()', () => {
  function pretty(input: string): string {
    const r = parse(input);
    if (!r.ok) throw new Error(`expected ok parse: ${r.message}`);
    return prettyPrint(r.ast);
  }

  it('wraps every BinOp in explicit parentheses', () => {
    expect(pretty('2 * 3 + 4')).toBe('((2 * 3) + 4)');
    expect(pretty('2 * (3 + 4)')).toBe('(2 * (3 + 4))');
    expect(pretty('1 + 2')).toBe('(1 + 2)');
  });

  it('does not wrap the top-level Compare', () => {
    expect(pretty('1 = 2')).toBe('1 = 2');
    expect(pretty('2 * 3 + 4 = 10')).toBe('((2 * 3) + 4) = 10');
  });

  it('renders unary minus without extra parentheses', () => {
    expect(pretty('-5 + 3')).toBe('(-5 + 3)');
    expect(pretty('-5')).toBe('-5');
  });
});
