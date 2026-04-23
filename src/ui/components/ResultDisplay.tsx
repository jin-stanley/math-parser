import type { ParseResult } from '../../parser';

export type ResultDisplayProps = {
  input: string;
  result: ParseResult;
};

export function ResultDisplay({ input, result }: ResultDisplayProps) {
  if (!result.ok) {
    return (
      <section className="card" aria-live="polite">
        <h2>Error</h2>
        <ErrorWithCaret input={input} col={result.col} offset={result.offset} />
        <div className="error-message">{result.message}</div>
        <div className="error-location">
          line {result.line}, col {result.col} (offset {result.offset})
        </div>
      </section>
    );
  }

  const { kind, value } = result;
  const displayValue = typeof value === 'boolean' ? String(value) : String(value);

  return (
    <section className="card" aria-live="polite">
      <h2>Result</h2>
      <div className="result-row">
        <span className={resultClass(value)}>{displayValue}</span>
        <span className="kind-pill">{kind}</span>
      </div>
    </section>
  );
}

function resultClass(value: number | boolean): string {
  if (value === true) return 'result-value result-value--true';
  if (value === false) return 'result-value result-value--false';
  return 'result-value result-value--number';
}

/**
 * Render the offending line with a caret (^) pointing at the column
 * where parsing failed. Simulates the classic compiler error display.
 */
function ErrorWithCaret({
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
    <pre className="error-source">
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
