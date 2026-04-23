import type { ParseResult } from '../parser';
import { caretLine, extractLine, formatValue, resultClass } from '../utils/format';

export type ResultDisplayProps = {
  input: string;
  result: ParseResult;
};

/**
 * Render either the evaluated value (for ParseOk) or a compiler-style
 * error display with the offending line and a caret at the bad column.
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
  return (
    <pre className="error-source" aria-hidden="true">
      <div>{line || ' '}</div>
      <div className="error-caret-line">{caretLine(col)}</div>
    </pre>
  );
}
