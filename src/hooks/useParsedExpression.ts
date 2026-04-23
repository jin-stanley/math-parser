import { useMemo } from 'react';
import { parse } from '../parser';
import type { ParseResult } from '../parser';

/**
 * Parse on every input change, memoised so the same input doesn't
 * re-run the grammar. Parsing is cheap, so no debouncing is needed;
 * the memo is enough to keep typing smooth.
 */
export function useParsedExpression(input: string): ParseResult {
  return useMemo(() => parse(input), [input]);
}
