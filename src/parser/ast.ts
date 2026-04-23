/**
 * AST node types for arithmetic + comparison expressions.
 *
 * Uses a discriminated union on `type` so every consumer (evaluator,
 * renderer, tests) can exhaustively pattern-match in one `switch`.
 */

export type ArithmeticOp = '+' | '-' | '*' | '/';
export type CompareOp = '=' | '!=';

export type NumNode = {
  readonly type: 'Num';
  readonly value: number;
};

export type NegNode = {
  readonly type: 'Neg';
  readonly expr: ArithmeticNode;
};

export type BinOpNode = {
  readonly type: 'BinOp';
  readonly op: ArithmeticOp;
  readonly left: ArithmeticNode;
  readonly right: ArithmeticNode;
};

export type CompareNode = {
  readonly type: 'Compare';
  readonly op: CompareOp;
  readonly left: ArithmeticNode;
  readonly right: ArithmeticNode;
};

/** Nodes that produce a number when evaluated. */
export type ArithmeticNode = NumNode | NegNode | BinOpNode;

/** Top-level node: either a statement (boolean result) or a bare expression. */
export type AstNode = ArithmeticNode | CompareNode;

/** Constructor helpers keep grammar postprocessors terse and typed. */
export const ast = {
  num: (value: number): NumNode => ({ type: 'Num', value }),
  neg: (expr: ArithmeticNode): NegNode => ({ type: 'Neg', expr }),
  bin: (op: ArithmeticOp, left: ArithmeticNode, right: ArithmeticNode): BinOpNode => ({
    type: 'BinOp',
    op,
    left,
    right,
  }),
  cmp: (op: CompareOp, left: ArithmeticNode, right: ArithmeticNode): CompareNode => ({
    type: 'Compare',
    op,
    left,
    right,
  }),
};
