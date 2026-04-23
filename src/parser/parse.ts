import nearley from 'nearley';
import grammar from './grammar';
import { evaluate, EvaluationError } from './evaluator';
import { tokenize } from './lexer';
import { prettyPrint } from './pretty';
import type { ParseResult } from './types';
import type { AstNode } from './ast';

type NearleyParseError = Error & {
  /** Token index into Nearley's stream — NOT a character offset. */
  offset?: number;
  /** Moo token; its own `offset` is the character offset we want. */
  token?: { line?: number; col?: number; text?: string; offset?: number };
};

function isParseError(err: unknown): err is NearleyParseError {
  return err instanceof Error;
}

/**
 * Derive a sensible error location from whatever Nearley throws.
 *
 * `err.token` is present for unexpected-token errors (most cases).
 * For unexpected-EOF the token is missing; we fall back to the end
 * of the input so the caret lands on the correct character.
 */
function locateError(err: NearleyParseError, input: string): {
  line: number;
  col: number;
  offset: number;
} {
  // Case 1: Nearley attached the offending Moo token — use its char offset.
  if (err.token && typeof err.token.offset === 'number') {
    return {
      line: err.token.line ?? 1,
      col: err.token.col ?? 1,
      offset: err.token.offset,
    };
  }

  // Case 2: Moo itself threw on an un-tokenizable char. Its message has the
  // form "invalid syntax at line L col C: X" — parse that to avoid pointing
  // at the end of input.
  const mooMatch = err.message.match(/line (\d+) col (\d+)/);
  if (mooMatch) {
    const line = Number(mooMatch[1]);
    const col = Number(mooMatch[2]);
    return { line, col, offset: offsetFromLineCol(input, line, col) };
  }

  // Case 3: Genuine unexpected-EOF — fall back to the end of input.
  const offset = input.length;
  return {
    line: deriveLine(input, offset),
    col: deriveCol(input, offset),
    offset,
  };
}

function offsetFromLineCol(input: string, line: number, col: number): number {
  let currentLine = 1;
  let lineStart = 0;
  for (let i = 0; i < input.length; i++) {
    if (currentLine === line) return Math.min(lineStart + col - 1, input.length);
    if (input[i] === '\n') {
      currentLine++;
      lineStart = i + 1;
    }
  }
  return Math.min(lineStart + col - 1, input.length);
}

function deriveLine(input: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < input.length; i++) {
    if (input[i] === '\n') line++;
  }
  return line;
}

function deriveCol(input: string, offset: number): number {
  let col = 1;
  for (let i = 0; i < offset && i < input.length; i++) {
    col = input[i] === '\n' ? 1 : col + 1;
  }
  return col;
}

/**
 * Nearley dumps a multi-line report like:
 *
 *   Syntax error at line 1 col 8:
 *     1 + (2 = 3
 *            ^
 *   Unexpected EQ token: "=". Instead, I was expecting...
 *
 * The location is already shown by the UI, and the "Instead, I was
 * expecting" tail is noisy. Keep just the "Unexpected X" sentence if
 * we can find it; otherwise fall back to the first line.
 */
function shortenMessage(raw: string): string {
  const unexpected = raw.match(/Unexpected [^\n]+/);
  if (unexpected) {
    // Trim at the first period or "Instead," to drop the "expecting..." tail.
    return unexpected[0].replace(/\.\s+Instead,.*$/, '.');
  }
  const firstLine = raw.split('\n')[0] ?? raw;
  return firstLine.replace(/^Syntax error at /, '');
}

/**
 * Parse + evaluate a math expression. Never throws: all failures
 * (syntax, ambiguity, division by zero) are returned as ParseErr.
 */
export function parse(input: string): ParseResult {
  if (input.trim().length === 0) {
    return {
      ok: false,
      message: 'Empty input',
      line: 1,
      col: 1,
      offset: 0,
    };
  }

  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  try {
    parser.feed(input);
  } catch (err) {
    if (!isParseError(err)) throw err;
    const { line, col, offset } = locateError(err, input);
    return {
      ok: false,
      message: shortenMessage(err.message),
      line,
      col,
      offset,
    };
  }

  const results = parser.results as AstNode[];

  if (results.length === 0) {
    // Valid prefix but grammar expected more — treat as unexpected EOF.
    return {
      ok: false,
      message: 'Unexpected end of input',
      line: deriveLine(input, input.length),
      col: deriveCol(input, input.length),
      offset: input.length,
    };
  }

  if (results.length > 1) {
    // Our grammar is unambiguous; this would be a bug, not user error.
    return {
      ok: false,
      message: `Ambiguous parse (${results.length} trees)`,
      line: 1,
      col: 1,
      offset: 0,
    };
  }

  const ast = results[0]!;
  const kind: 'arithmetic' | 'statement' = ast.type === 'Compare' ? 'statement' : 'arithmetic';

  try {
    const value = evaluate(ast);
    // Tokenising a second time for display purposes — the parser already
    // consumed the stream to build the AST, and this gives us a clean
    // array for the UI without hooking into nearley's internals.
    const tokens = tokenize(input);
    const prettyForm = prettyPrint(ast);
    return { ok: true, ast, tokens, prettyForm, kind, value };
  } catch (err) {
    if (err instanceof EvaluationError) {
      return {
        ok: false,
        message: err.message,
        line: 1,
        col: 1,
        offset: 0,
      };
    }
    throw err;
  }
}
