import type { AstNode } from './ast';

/**
 * Functional Result type: parse() never throws, it returns one of these.
 * Lets callers exhaustively handle success/failure without try/catch.
 */

export type ParseOk = {
  readonly ok: true;
  /** Root AST node. */
  readonly ast: AstNode;
  /**
   * Arithmetic expressions evaluate to a number (e.g. `1 + 2` → `3`);
   * statements with `=` / `!=` evaluate to a boolean.
   */
  readonly kind: 'arithmetic' | 'statement';
  readonly value: number | boolean;
};

export type ParseErr = {
  readonly ok: false;
  readonly message: string;
  /** 1-based line number where the error was detected. */
  readonly line: number;
  /** 1-based column within the line. */
  readonly col: number;
  /** 0-based character offset into the original input. */
  readonly offset: number;
};

export type ParseResult = ParseOk | ParseErr;
