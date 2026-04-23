/**
 * English UI strings.
 *
 * Kept as a plain nested object so the rest of the app can import
 * with static type-checking and no runtime framework. If another
 * locale is added later, mirror this shape in a sibling file and
 * switch `t` in index.ts to pick the active locale.
 */
export const en = {
  brand: {
    name: 'Math Parser',
    tag: 'Nearley · Moo',
  },
  page: {
    title: 'Math Expression Parser',
    intro:
      'This page demonstrates a grammar-driven parser for arithmetic and ' +
      'comparison expressions. Type an expression below to see its abstract ' +
      'syntax tree and the evaluated result. Invalid input is reported with ' +
      'a line and column pointer.',
  },
  input: {
    label: 'Expression',
    placeholder: 'e.g. 2 * (3 + 4) = 14',
    ariaLabel: 'Math expression to parse',
    ariaExamples: 'Example inputs',
  },
  result: {
    label: 'Result',
    errorLabel: 'Error',
    kind: {
      statement: 'statement',
      arithmetic: 'arithmetic',
    },
  },
  ast: {
    label: 'Abstract Syntax Tree',
    ariaLabel: 'AST structure',
  },
  footer: {
    left: 'Built with Nearley & Moo',
    right: 'Source available on request',
  },
} as const;

export type Messages = typeof en;
