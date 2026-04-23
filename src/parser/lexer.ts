import moo from 'moo';

/**
 * Moo tokenizer.
 *
 * Rule order matters: `!=` must appear before `=` so that `!=` is not
 * split into two separate tokens.
 */
export const mooLexer = moo.compile({
  WS: /[ \t]+/,
  NL: { match: /\n/, lineBreaks: true },
  NUMBER: /\d+(?:\.\d+)?/,
  NEQ: '!=',
  EQ: '=',
  PLUS: '+',
  MINUS: '-',
  TIMES: '*',
  DIVIDE: '/',
  LPAREN: '(',
  RPAREN: ')',
});

type MooLexerShape = typeof mooLexer;
type MooToken = NonNullable<ReturnType<MooLexerShape['next']>>;

/**
 * Nearley expects an object with `next/save/reset/formatError/has`.
 * Wrapping the Moo lexer lets us silently drop whitespace tokens
 * *without* leaking them into every grammar rule. Offsets are preserved
 * because we only skip — we never rewrite the input.
 */
class WhitespaceFilteringLexer {
  private readonly inner: MooLexerShape;

  constructor(inner: MooLexerShape) {
    this.inner = inner;
  }

  reset(chunk: string, info?: unknown): this {
    this.inner.reset(chunk, info as never);
    return this;
  }

  next(): MooToken | undefined {
    while (true) {
      const tok = this.inner.next();
      if (!tok) return undefined;
      if (tok.type === 'WS' || tok.type === 'NL') continue;
      return tok;
    }
  }

  save(): unknown {
    return this.inner.save();
  }

  formatError(token: MooToken, message?: string): string {
    return this.inner.formatError(token, message);
  }

  has(tokenType: string): boolean {
    return this.inner.has(tokenType);
  }
}

export const lexer = new WhitespaceFilteringLexer(mooLexer);

/**
 * Tokenise an input string without feeding it to the parser.
 *
 * This exists so the UI can display the token stream alongside the
 * AST — showing lexer output gives visibility into the first phase
 * of the pipeline (the thing Moo actually does) that's invisible
 * once you look at the AST alone.
 *
 * Throws if the input contains an un-tokenisable character. Callers
 * in parse.ts catch this and convert it into a ParseErr.
 */
export type DisplayToken = {
  readonly type: string;
  readonly text: string;
  readonly offset: number;
  readonly line: number;
  readonly col: number;
};

export function tokenize(input: string): DisplayToken[] {
  const inner = mooLexer.reset(input);
  const tokens: DisplayToken[] = [];
  while (true) {
    const tok = inner.next();
    if (!tok) break;
    if (tok.type === 'WS' || tok.type === 'NL') continue;
    tokens.push({
      type: tok.type ?? 'UNKNOWN',
      text: tok.text,
      offset: tok.offset,
      line: tok.line,
      col: tok.col,
    });
  }
  return tokens;
}

export type { MooToken };
