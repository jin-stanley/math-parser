import type { ParseResult } from '../../parser';

export type ResultDisplayProps = {
  input: string;
  result: ParseResult;
};

/**
 * Render either the evaluated value (for ParseOk) or a compiler-style
 * error display with the offending line and a caret at the bad column.
 *
 * Kept as a single component rather than splitting Ok/Err because the
 * caller slot is always the same shape (one block under one label).
 */
export function ResultDisplay({ input, result }: ResultDisplayProps) {
  if (!result.ok) {
    return (
      <div className="error-block" aria-live="polite">
        <ErrorCaret input={input} col={result.col} offset={result.offset} />
        <div className="error-message">{result.message}</div>
        <div className="error-location">
          line {result.line}, col {result.col}, offset {result.offset}
        </div>
      </div>
    );
  }

  return (
    <div className="result-inline" aria-live="polite">
      <span className={resultClass(result.value)}>{formatValue(result.value)}</span>
    </div>
  );
}

function resultClass(value: number | boolean): string {
  if (value === true) return 'result-value--true';
  if (value === false) return 'result-value--false';
  return 'result-value--number';
}

/** Truncate noisy float results (e.g. 0.1 + 0.2) to ~10 significant digits. */
function formatValue(value: number | boolean): string {
  if (typeof value === 'boolean') return String(value);
  if (Number.isInteger(value)) return String(value);
  return Number.parseFloat(value.toPrecision(10)).toString();
}

function ErrorCaret({
  input,
  col,
  offset,
}: {
  input: string;
  col: number;
  offset: number;
}) {
  const line = extractLine(input, offset);
  const caret = ' '.repeat(Math.max(0, col - 1)) + '^';
  return (
    <pre className="error-source" aria-hidden="true">
      <div>{line || ' '}</div>
      <div className="error-caret-line">{caret}</div>
    </pre>
  );
}

function extractLine(input: string, offset: number): string {
  const safeOffset = Math.min(offset, input.length);
  const lineStart = input.lastIndexOf('\n', safeOffset - 1) + 1;
  const nextNewline = input.indexOf('\n', safeOffset);
  const lineEnd = nextNewline === -1 ? input.length : nextNewline;
  return input.slice(lineStart, lineEnd);
}
