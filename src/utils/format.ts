/**
 * Format a Result's value for display.
 * Booleans render as-is; integers render without a decimal; floats are
 * truncated to 10 significant digits so (0.1 + 0.2) doesn't leak
 * IEEE-754 noise into the UI.
 */
export function formatValue(value: number | boolean): string {
  if (typeof value === 'boolean') return String(value);
  if (Number.isInteger(value)) return String(value);
  return Number.parseFloat(value.toPrecision(10)).toString();
}

/** CSS class for the result span based on the evaluated value. */
export function resultClass(value: number | boolean): string {
  if (value === true) return 'result-value--true';
  if (value === false) return 'result-value--false';
  return 'result-value--number';
}

/** Extract the single line containing `offset` from a (possibly multi-line) input. */
export function extractLine(input: string, offset: number): string {
  const safeOffset = Math.min(offset, input.length);
  const lineStart = input.lastIndexOf('\n', safeOffset - 1) + 1;
  const nextNewline = input.indexOf('\n', safeOffset);
  const lineEnd = nextNewline === -1 ? input.length : nextNewline;
  return input.slice(lineStart, lineEnd);
}

/** Build the caret line (spaces + `^`) that points at `col` under the source. */
export function caretLine(col: number): string {
  return `${' '.repeat(Math.max(0, col - 1))}^`;
}
