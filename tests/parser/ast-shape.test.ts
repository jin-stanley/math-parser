import { describe, it, expect } from 'vitest';
import { parse } from '@/parser';

/**
 * Snapshot-style assertions on AST structure.
 * These protect against silent regressions in grammar semantics
 * (e.g. accidentally flipping associativity).
 */
describe('AST shape', () => {
  it('builds a Compare at the root for a statement', () => {
    const r = parse('1 + 2 = 3');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ast).toEqual({
        type: 'Compare',
        op: '=',
        left: {
          type: 'BinOp',
          op: '+',
          left: { type: 'Num', value: 1 },
          right: { type: 'Num', value: 2 },
        },
        right: { type: 'Num', value: 3 },
      });
    }
  });

  it('respects * over + in the tree (2 * 3 + 4)', () => {
    const r = parse('2 * 3 + 4');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ast).toEqual({
        type: 'BinOp',
        op: '+',
        left: {
          type: 'BinOp',
          op: '*',
          left: { type: 'Num', value: 2 },
          right: { type: 'Num', value: 3 },
        },
        right: { type: 'Num', value: 4 },
      });
    }
  });

  it('wraps unary minus as Neg', () => {
    const r = parse('-3');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ast).toEqual({
        type: 'Neg',
        expr: { type: 'Num', value: 3 },
      });
    }
  });
});
