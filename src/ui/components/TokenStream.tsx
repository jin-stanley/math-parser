import type { DisplayToken } from '../../parser';

export type TokenStreamProps = {
  tokens: readonly DisplayToken[];
};

/**
 * Tabular listing of the Moo token stream.
 *
 * Shown alongside the AST so the reviewer can see both parser phases —
 * the lexer's tokens and the grammar's tree — which is invisible if
 * you only look at the final AST.
 */
export function TokenStream({ tokens }: TokenStreamProps) {
  return (
    <div className="token-stream" aria-label="Token stream">
      <div className="token-stream__header">
        <span>Type</span>
        <span>Text</span>
        <span>Pos</span>
      </div>
      {tokens.map((tok) => (
        <div key={tok.offset} className="token-row">
          <span className="token-type">{tok.type}</span>
          <span className="token-text">{tok.text}</span>
          <span className="token-pos">
            {tok.line}:{tok.col}
          </span>
        </div>
      ))}
    </div>
  );
}
