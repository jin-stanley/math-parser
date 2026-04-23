import { useState } from 'react';
import { AstView } from './components/AstView';
import { ExpressionInput } from './components/ExpressionInput';
import { ResultDisplay } from './components/ResultDisplay';
import { useParsedExpression } from './hooks/useParsedExpression';
import { t } from './i18n';
import './styles.css';

const INITIAL = '2 * 3 + 4 = 10';

export default function App() {
  const [input, setInput] = useState(INITIAL);
  const result = useParsedExpression(input);

  return (
    <div className="app">
      <div className="app-brandbar">
        <div className="app-brandbar-inner">
          <span className="app-brand-name">{t.brand.name}</span>
          <span className="app-brand-tag">{t.brand.tag}</span>
        </div>
      </div>

      <div className="app-banner">
        <div className="app-banner-inner">
          <h1 className="app-title">{t.page.title}</h1>
        </div>
      </div>

      <main className="app-main">
        <p className="app-intro">{t.page.intro}</p>

        <ExpressionInput value={input} onChange={setInput} />

        <section className="block">
          <h2 className="block-heading">
            {result.ok ? t.result.label : t.result.errorLabel}
            {result.ok && (
              <span className="kind-pill">{t.result.kind[result.kind]}</span>
            )}
          </h2>
          <ResultDisplay input={input} result={result} />
        </section>

        {result.ok && (
          <section className="block">
            <h2 className="block-heading">{t.ast.label}</h2>
            <AstView node={result.ast} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>{t.footer.left}</span>
          <span>{t.footer.right}</span>
        </div>
      </footer>
    </div>
  );
}
