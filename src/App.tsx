import { useMemo, useState } from 'react';
import { parse } from './parser';
import { AstView } from './ui/components/AstView';
import { ExpressionInput } from './ui/components/ExpressionInput';
import { ResultDisplay } from './ui/components/ResultDisplay';
import './ui/styles.css';

const INITIAL = '1 + 2 = 3';

export default function App() {
  const [input, setInput] = useState(INITIAL);

  // Parsing is cheap and idempotent — memoising on input is enough.
  const result = useMemo(() => parse(input), [input]);

  return (
    <main>
      <header className="app-header">
        <h1 className="app-title">Math Expression Parser</h1>
        <p className="app-subtitle">
          Built with Nearley + Moo. Type a math expression or statement and see
          the AST it builds and the value it evaluates to.
        </p>
      </header>

      <ExpressionInput value={input} onChange={setInput} />

      <ResultDisplay input={input} result={result} />

      {result.ok && (
        <section className="card">
          <h2>AST</h2>
          <AstView node={result.ast} />
        </section>
      )}
    </main>
  );
}
