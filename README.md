# Math Expression Parser

A small parser for arithmetic and comparison expressions, built with
[Nearley](https://nearley.js.org/) and [Moo](https://github.com/no-context/moo),
with a React + TypeScript demo app that visualises the AST and the
evaluated result.

Given `2 * 3 + 4 = 10`, the parser builds:

```
Compare =
├─ BinOp +
│  ├─ BinOp *
│  │  ├─ Num 2
│  │  └─ Num 3
│  └─ Num 4
└─ Num 10
```

and evaluates it to `true`.

---

## Getting started

```bash
npm install
npm run dev       # start the demo at http://localhost:5173
npm test          # run the full test suite
npm run build     # production build
npm run typecheck # TypeScript type-check
npm run lint      # ESLint
```

The grammar is compiled from `src/parser/grammar.ne` into
`src/parser/grammar.ts` by the `build:grammar` script, which runs
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

Whitespace is insignificant. The lexer wrapper drops it before the
grammar sees the token stream, and token offsets are preserved so
error messages point at the original column.

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

```
src/
├── parser/                  Standalone library, no React dependencies
│   ├── lexer.ts             Moo tokenizer + whitespace-filtering wrapper
│   ├── grammar.ne           Nearley grammar (source)
│   ├── grammar.ts           Generated from grammar.ne (git-ignored)
│   ├── ast.ts               AST node types and constructor helpers
│   ├── evaluator.ts         AST → number | boolean
│   ├── parse.ts             Public parse() API; returns a Result
│   ├── pretty.ts            AST → fully parenthesised source
│   └── index.ts             Re-exports
│
├── components/              React UI, one file per component
│   ├── ExpressionInput.tsx
│   ├── AstView.tsx
│   └── ResultDisplay.tsx
│
├── hooks/
│   └── useParsedExpression.ts   useMemo-wrapped parse()
│
├── utils/
│   └── format.ts            formatValue / extractLine / caretLine / resultClass
│
├── i18n/
│   ├── en.ts                All UI strings, typed
│   └── index.ts             Active locale
│
├── App.tsx                  Page composition
├── main.tsx                 React root
├── styles.css               Component styles
└── index.css                Global tokens + reset

tests/
├── parser/
│   ├── examples.test.ts     The eight worked examples from the brief
│   ├── precedence.test.ts   Precedence and associativity
│   ├── edge-cases.test.ts   Unary minus, floats, whitespace, errors
│   ├── ast-shape.test.ts    Snapshot-style AST structure checks
│   └── display.test.ts      tokenize() and prettyPrint() utilities
└── ui/
    └── App.test.tsx         End-to-end smoke test via RTL
```

## Design decisions

1. **AST types are a discriminated union, not a class hierarchy.**
   `type AstNode = NumNode | NegNode | BinOpNode | CompareNode`, keyed
   by `type`. Every consumer uses a single `switch` and TypeScript
   enforces exhaustiveness. No dynamic dispatch, no `instanceof`.

2. **`parse()` never throws; it returns a `Result`.** The public API
   is `parse(input: string): ParseOk | ParseErr`. Syntax errors,
   ambiguous parses, and division-by-zero all collapse into the same
   `ParseErr` shape with `line`, `col`, `offset`, and `message`.

3. **Whitespace is handled by a lexer wrapper, not the grammar.** Moo
   tokenises whitespace as `WS`, and a thin `WhitespaceFilteringLexer`
   drops those tokens before Nearley sees them. The grammar reads
   cleanly, and token offsets are preserved so error carets land in
   the right column.

4. **`=`/`!=` sit above `+`/`-`/`*`/`/` at the grammar level.** The
   precedence hierarchy `Statement → Expression → Term → Factor` makes
   comparison lower precedence than arithmetic by construction, not
   by a runtime check. Parentheses are a single `Factor` rule that
   recurses into `Expression`.

5. **Arithmetic vs. statement is explicit in the public Result.** A
   bare expression like `2 + 3 * 4` is valid input and evaluates to a
   number (`14`, `kind: 'arithmetic'`). A comparison evaluates to a
   boolean (`kind: 'statement'`). The UI renders each variant
   distinctly.

6. **Grammar rules directly build AST nodes.** Each Nearley
   postprocessor calls a typed constructor from `ast.ts`, so
   `parser.results[0]` is already a fully-formed AST. No post-walk.

## What is intentionally **not** implemented

Everything listed here was considered and rejected as out of scope
for a simple parser brief. Each would be a small extension of the
four-layer architecture.

- Additional comparison operators (`<`, `>`, `<=`, `>=`).
- Chained comparisons (`1 < 2 < 3`).
- Variables / `let` bindings.
- Exponentiation (`^` or `**`).
- Big-number arithmetic. The evaluator uses native JS `number`, so
  very large inputs lose precision.
- Graphical AST rendering (d3 / Mermaid). The text tree is enough to
  read associativity and precedence at a glance.
- A CLI entry point. `parse()` is a pure function, so wrapping it in
  a CLI is a few lines if ever needed.

## Testing

Vitest and React Testing Library. Tests live under `tests/`:

- The eight examples from the assignment, verbatim.
- Precedence and associativity (including same-precedence
  left-associativity).
- Edge cases: unary minus, nested unary minus, floats, whitespace
  variants, deeply nested parens, bare arithmetic, division by zero,
  empty input.
- Explicit AST-shape snapshots so grammar regressions surface fast.
- `tokenize()` and `prettyPrint()` as library utilities.
- An end-to-end App test that types into the textarea and asserts
  the rendered AST and result.

Run `npm test` to execute them all.
