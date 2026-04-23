import { useMemo, useState } from 'react';
import { parse } from './parser';
import { AstView } from './ui/components/AstView';
import { ExpressionInput } from './ui/components/ExpressionInput';
import { ResultDisplay } from './ui/components/ResultDisplay';
import './ui/styles.css';

const INITIAL = '2 * 3 + 4 = 10';

export default function App() {
  const [input, setInput] = useState(INITIAL);

  // Parsing is cheap and idempotent — memoising on input is enough.
  const result = useMemo(() => parse(input), [input]);

  return (
    <main className="app">
      <header className="app-header">
        <span className="app-eyebrow">Nearley · Moo · TypeScript</span>
        <h1 className="app-title">
          Math expression <span className="app-title-accent">parser</span>
        </h1>
        <p className="app-subtitle">
          Type an arithmetic expression or a comparison statement. The parser
          tokenises, builds an AST honouring operator precedence, and evaluates
          it in place.
        </p>
      </header>

      <ExpressionInput value={input} onChange={setInput} />

      <section className="block">
        <span className="block-label">
          {result.ok ? 'Result' : 'Error'}
          {result.ok && <span className="kind-pill">{result.kind}</span>}
        </span>
        <ResultDisplay input={input} result={result} />
      </section>

      {result.ok && (
        <section className="block">
          <span className="block-label">AST</span>
          <AstView node={result.ast} />
        </section>
      )}
    </main>
  );
}
