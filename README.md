# Math Expression Parser

A small parser for arithmetic and comparison expressions, built with
[Nearley](https://nearley.js.org/) and [Moo](https://github.com/no-context/moo),
with a React + TypeScript demo app that visualises the AST and the
evaluated result.

Example: given `2 * 3 + 4 = 10`, the parser builds

```
Compare =
├── left:  BinOp +
│          ├── left:  BinOp *
│          │          ├── left:  Num 2
│          │          └── right: Num 3
│          └── right: Num 4
└── right: Num 10
```

and evaluates it to `true`.

---

## Getting started

```bash
npm install
npm run dev       # start the demo at http://localhost:5173
npm test          # run the full test suite (32 tests)
npm run build     # production build
npm run typecheck # TypeScript type-check
npm run lint      # ESLint
```

The grammar is compiled from `src/parser/grammar.ne` into
`src/parser/grammar.ts` by the `build:grammar` script, which is run
automatically before `dev`, `build`, `test`, and `typecheck`.

## Supported grammar

```
Statement  → Expression "="  Expression          ; yields boolean
           | Expression "!=" Expression          ; yields boolean
           | Expression                          ; yields number

Expression → Expression "+" Term                 ; left-associative
           | Expression "-" Term
           | Term

Term       → Term "*" Factor                     ; left-associative
           | Term "/" Factor
           | Factor

Factor     → NUMBER                              ; integer or decimal
           | "(" Expression ")"
           | "-" Factor                          ; unary minus
```

Whitespace is insignificant (stripped before Nearley sees the token
stream, but offsets are preserved so error messages point at the
original column).

## Example inputs

| Input | Kind | Result |
| --- | --- | --- |
| `1 + 2 = 3` | statement | `true` |
| `2 * 3 + 4 = 10` | statement | `true` |
| `2 * (3 + 4) = 10` | statement | `false` |
| `6 = 10 / 2 + 1` | statement | `true` |
| `12 + 3 != 4 / 2 + 5` | statement | `true` |
| `2 + 3 * 2 = 10` | statement | `false` |
| `2 * 3 + 4 != 10` | statement | `false` |
| `1 + (2 = 3` | invalid | error at col 8 (`=` after an unclosed paren) |
| `-5 + 3 = -2` | statement | `true` |
| `10 / 4 = 2.5` | statement | `true` |
| `2 + 3 * 4` | arithmetic | `14` |
| `1 / 0 = 0` | invalid | `Division by zero` |

## Architecture

The project separates four concerns so each layer can be read and tested
on its own:

```
src/parser/
├── lexer.ts       Moo tokenizer (+ a tiny wrapper that filters whitespace)
├── grammar.ne     Nearley grammar (source)
├── grammar.ts     Generated from grammar.ne (git-ignored)
├── ast.ts         AST node types + constructor helpers
├── evaluator.ts   AST → number | boolean
├── parse.ts       Public parse() API — catches all errors, returns Result
└── index.ts       Re-exports

src/ui/
├── styles.css
└── components/
    ├── ExpressionInput.tsx
    ├── AstView.tsx
    └── ResultDisplay.tsx

tests/
├── parser/
│   ├── examples.test.ts     The eight worked examples from the brief
│   ├── precedence.test.ts   Precedence & associativity
│   ├── edge-cases.test.ts   Unary minus, floats, whitespace, errors
│   └── ast-shape.test.ts    Snapshot-style AST structure checks
└── ui/
    └── App.test.tsx         End-to-end smoke test via RTL
```

## Design decisions

1. **AST types are a discriminated union, not a class hierarchy.**
   `type AstNode = NumNode | NegNode | BinOpNode | CompareNode`, keyed
   by `type`. Every consumer (`evaluate`, the React tree view, the
   tests) uses a single `switch` and TypeScript enforces exhaustiveness.
   No dynamic dispatch, no `instanceof`, no base class.

2. **`parse()` never throws — it returns a `Result`.** The public API
   is `parse(input: string): ParseOk | ParseErr`. Syntax errors,
   ambiguous parses, and runtime issues like division-by-zero all
   collapse into the same `ParseErr` shape with `line`, `col`, `offset`,
   and `message`. Callers get one thing to match on.

3. **Whitespace is handled by a lexer wrapper, not the grammar.** Moo
   tokenises whitespace as `WS`, and a thin `WhitespaceFilteringLexer`
   drops those tokens before Nearley sees them. The grammar therefore
   reads cleanly — no `_` helpers between every symbol — and token
   offsets are preserved so error carets land in the right column.

4. **`=`/`!=` split from `+`/`-`/`*`/`/` at the grammar level.** The
   precedence hierarchy `Statement → Expression → Term → Factor` means
   comparison is lower precedence than arithmetic by construction, not
   by a runtime check. Parentheses are a single `Factor` rule that
   recurses into `Expression`.

5. **Arithmetic vs statement is made explicit in the public Result.**
   A bare expression like `2 + 3 * 4` is valid input and evaluates to
   a number (`14`, `kind: 'arithmetic'`). A comparison evaluates to a
   boolean (`kind: 'statement'`). The UI renders each variant
   distinctly. This mirrors the expression-vs-statement distinction
   in language theory rather than treating non-comparisons as "invalid".

6. **Grammar rules directly build AST nodes.** Each Nearley
   postprocessor calls a typed constructor from `ast.ts`, so the final
   `parser.results[0]` is already a fully-formed AST. No post-walk,
   no array-of-arrays to unwrap.

## What is intentionally **not** implemented

Everything listed here was considered and rejected as out of scope for
a "simple parser" brief. Each would be a one-function extension of the
four-layer architecture.

- Additional comparison operators (`<`, `>`, `<=`, `>=`).
- Chained comparisons (`1 < 2 < 3`).
- Variables / `let` bindings.
- Exponentiation (`^` or `**`).
- Big-number arithmetic — the evaluator uses native JS `number`, so
  very large inputs lose precision.
- Graphical AST rendering (d3/Mermaid); the HTML tree view is enough
  to read associativity and precedence at a glance.
- A CLI entry point — `parse()` is a pure function, so wrapping it in
  a CLI is a few lines if ever needed.

## Testing

Vitest + React Testing Library. 32 tests across 5 files:

- The eight examples from the assignment, verbatim.
- Precedence / associativity (including same-precedence left-assoc).
- Edge cases: unary minus, nested unary minus, floats, whitespace
  variants, deeply nested parens, bare arithmetic, division by zero,
  empty input.
- Explicit AST-shape snapshots so grammar regressions surface fast.
- An end-to-end App test that types into the textarea and asserts the
  rendered AST and result.
