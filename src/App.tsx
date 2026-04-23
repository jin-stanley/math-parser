import { useMemo, useState } from 'react';
import { parse } from './parser';
import { AstView } from './ui/components/AstView';
import { ExpressionInput } from './ui/components/ExpressionInput';
import { ResultDisplay } from './ui/components/ResultDisplay';
import { TokenStream } from './ui/components/TokenStream';
import './ui/styles.css';

const INITIAL = '2 * 3 + 4 = 10';

export default function App() {
  const [input, setInput] = useState(INITIAL);

  // Parsing is cheap and idempotent — memoising on input is enough.
  const result = useMemo(() => parse(input), [input]);

  return (
    <div className="app">
      <div className="app-brandbar">
        <div className="app-brandbar-inner">
          <span className="app-brand-name">Math Parser</span>
          <span className="app-brand-tag">Nearley &middot; Moo</span>
        </div>
      </div>

      <div className="app-banner">
        <div className="app-banner-inner">
          <h1 className="app-title">Math Expression Parser</h1>
        </div>
      </div>

      <main className="app-main">
        <p className="app-intro">
          This page demonstrates a grammar-driven parser for arithmetic and
          comparison expressions. Type an expression below to see its token
          stream, the parsed abstract syntax tree, and the evaluated result.
          Invalid input is reported with a line and column pointer.
        </p>

        <ExpressionInput value={input} onChange={setInput} />

        <section className="block">
          <h2 className="block-heading">
            {result.ok ? 'Result' : 'Error'}
            {result.ok && <span className="kind-pill">{result.kind}</span>}
          </h2>
          <ResultDisplay input={input} result={result} />
          {result.ok && (
            <p className="parsed-as">
              <span className="parsed-as__label">Parsed as</span>
              <code className="parsed-as__code">{result.prettyForm}</code>
            </p>
          )}
        </section>

        {result.ok && (
          <section className="block">
            <h2 className="block-heading">Abstract Syntax Tree</h2>
            <div className="tree-and-tokens">
              <AstView node={result.ast} />
              <TokenStream tokens={result.tokens} />
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>Built with Nearley &amp; Moo</span>
          <span>Source available on request</span>
        </div>
      </footer>
    </div>
  );
}
