import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('App', () => {
  it('renders the default example and shows a true result', () => {
    render(<App />);
    // Initial input is "2 * 3 + 4 = 10" → statement, value true
    expect(screen.getByLabelText(/math expression/i)).toHaveValue(
      '2 * 3 + 4 = 10',
    );
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('statement')).toBeInTheDocument();
    // AST shows the root compare node
    expect(screen.getByLabelText(/ast structure/i)).toHaveTextContent('Compare');
  });

  it('updates the result when the user types a new expression', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/math expression/i);
    await user.clear(input);
    await user.type(input, '2 * 3 = 7');
    expect(screen.getByText('false')).toBeInTheDocument();
  });

  it('shows an error caret and message for invalid input', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText(/math expression/i);
    await user.clear(input);
    await user.type(input, '1 + (2 = 3');
    // The error card shows line/col location
    expect(screen.getByText(/line \d+, col \d+/i)).toBeInTheDocument();
    // The AST card is hidden when parsing fails
    expect(screen.queryByLabelText(/ast structure/i)).not.toBeInTheDocument();
  });

  it('fills the input when an example chip is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '2 * 3 + 4 = 10' }));
    expect(screen.getByLabelText(/math expression/i)).toHaveValue(
      '2 * 3 + 4 = 10',
    );
    expect(screen.getByText('true')).toBeInTheDocument();
  });
});
