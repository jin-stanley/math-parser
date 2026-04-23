import type { ArithmeticNode, AstNode } from './ast';

/**
 * Raised when the AST is structurally valid but cannot be evaluated
 * (e.g. division by zero). The parse API catches this and converts it
 * into a ParseErr so callers still only have one failure channel.
 */
export class EvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvaluationError';
  }
}

function evalArithmetic(node: ArithmeticNode): number {
  switch (node.type) {
    case 'Num':
      return node.value;
    case 'Neg':
      return -evalArithmetic(node.expr);
    case 'BinOp': {
      const l = evalArithmetic(node.left);
      const r = evalArithmetic(node.right);
      switch (node.op) {
        case '+':
          return l + r;
        case '-':
          return l - r;
        case '*':
          return l * r;
        case '/':
          if (r === 0) throw new EvaluationError('Division by zero');
          return l / r;
      }
    }
  }
}

/**
 * Evaluate an AST. Comparison nodes yield a boolean; any arithmetic
 * node yields a number. Callers use the AST's root `type` to know
 * which variant they receive.
 */
export function evaluate(node: AstNode): number | boolean {
  if (node.type === 'Compare') {
    const l = evalArithmetic(node.left);
    const r = evalArithmetic(node.right);
    return node.op === '=' ? l === r : l !== r;
  }
  return evalArithmetic(node);
}
