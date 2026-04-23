import type { AstNode, ArithmeticNode } from './ast';

/**
 * Render an AST back to source text with explicit parentheses around
 * every BinOp. The goal is readability for someone unfamiliar with the
 * tree view: `2 * 3 + 4 = 10` parses to `((2 * 3) + 4) = 10`, making
 * the operator precedence visible at a glance.
 */
export function prettyPrint(node: AstNode): string {
  switch (node.type) {
    case 'Num':
      return String(node.value);
    case 'Neg':
      return `-${printArith(node.expr)}`;
    case 'BinOp':
      return `(${printArith(node.left)} ${node.op} ${printArith(node.right)})`;
    case 'Compare':
      // Top-level comparison doesn't need outer parens — there's nothing
      // to be ambiguous with above it.
      return `${printArith(node.left)} ${node.op} ${printArith(node.right)}`;
  }
}

function printArith(node: ArithmeticNode): string {
  switch (node.type) {
    case 'Num':
      return String(node.value);
    case 'Neg':
      return `-${printArith(node.expr)}`;
    case 'BinOp':
      return `(${printArith(node.left)} ${node.op} ${printArith(node.right)})`;
  }
}
