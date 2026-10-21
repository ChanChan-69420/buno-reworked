import { useState } from 'react';
import type { FormEvent } from 'react';
import BunnyLogo from './icons/BunnyLogo';

interface BudgetSetupProps {
  onBudgetSet: (amount: number) => void;
}

export default function BudgetSetup({ onBudgetSet }: BudgetSetupProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = amount.trim();
    const num = Number(clean);

    if (!clean || isNaN(num) || num <= 0) {
      setError('Please enter a valid monthly budget amount (greater than ₹0).');
      return;
    }

    setError(null);
    onBudgetSet(num);
  };

  return (
    <div className="setup-card">
      <div className="setup-logo">
        <BunnyLogo size={60} />
      </div>

      <h2 className="setup-title">Set your monthly boundary</h2>
      <p className="setup-subtitle">
        How much do you intend to spend this month? Buno uses this baseline to gauge your spending comfort zone.
      </p>

      <form onSubmit={handleSubmit} className="setup-form">
        <div className="input-group">
          <label htmlFor="budget-input" className="input-label">
            Monthly Budget
          </label>
          <div className="input-wrapper">
            <span className="currency-prefix">₹</span>
            <input
              id="budget-input"
              type="number"
              placeholder="e.g. 25000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError(null);
              }}
              className={`text-input ${error ? 'input-error' : ''}`}
              autoFocus
            />
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        <button type="submit" className="primary-btn">
          Start with Buno →
        </button>
      </form>
    </div>
  );
}
