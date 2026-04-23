import { useId } from 'react';

const EXAMPLES = [
  '1 + 2 = 3',
  '2 * 3 + 4 = 10',
  '2 * (3 + 4) = 10',
  '6 = 10 / 2 + 1',
  '12 + 3 != 4 / 2 + 5',
  '1 + (2 = 3',
] as const;

export type ExpressionInputProps = {
  value: string;
  onChange: (next: string) => void;
};

export function ExpressionInput({ value, onChange }: ExpressionInputProps) {
  const inputId = useId();

  return (
    <section className="card">
      <h2>
        <label htmlFor={inputId}>Expression</label>
      </h2>
      <textarea
        id={inputId}
        className="expression-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        rows={1}
        aria-label="Math expression to parse"
      />
      <div className="example-row" aria-label="Example inputs">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="example-chip"
            onClick={() => onChange(ex)}
          >
            {ex}
          </button>
        ))}
      </div>
    </section>
  );
}
