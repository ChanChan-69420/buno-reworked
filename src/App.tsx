import { useState, useEffect } from 'react';
import './App.css';
import type { Transaction } from './types';
import { calculateZone } from './lib/zoneEngine';
import { getRandomNote } from './lib/notes';
import { getStoredBudget, setStoredBudget } from './lib/storage';
import Intro from './components/Intro';
import BudgetSetup from './components/BudgetSetup';

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Grocery run', amount: 3200, date: '2026-10-18', category: 'food', source: 'bank' },
  { id: '2', description: 'Metro pass recharge', amount: 800, date: '2026-10-19', category: 'transport', source: 'bank' },
  { id: '3', description: 'Electricity bill', amount: 2100, date: '2026-10-19', category: 'bills', source: 'bank' },
  { id: '4', description: 'Weekend cafe & snacks', amount: 950, date: '2026-10-20', category: 'food', source: 'cash' },
  { id: '5', description: 'Bookstore purchase', amount: 650, date: '2026-10-21', category: 'shopping', source: 'cash' },
];

type AppScreen = 'loading' | 'intro' | 'setup' | 'main';

export default function App() {
  const [budget, setBudget] = useState<number | null>(null);
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Check localStorage on initial mount
  useEffect(() => {
    const saved = getStoredBudget();
    if (saved) {
      setBudget(saved);
      setScreen('main');
    } else {
      setScreen('intro');
    }
  }, []);

  const handleStartSetup = () => {
    setScreen('setup');
  };

  const handleBudgetSaved = (newBudget: number) => {
    setStoredBudget(newBudget);
    setBudget(newBudget);
    setScreen('main');
  };

  if (screen === 'loading') {
    return null;
  }

  if (screen === 'intro') {
    return (
      <div className="buno-container">
        <Intro onContinue={handleStartSetup} />
      </div>
    );
  }

  if (screen === 'setup') {
    return (
      <div className="buno-container">
        <BudgetSetup onBudgetSet={handleBudgetSaved} />
      </div>
    );
  }

  // Main Zone view
  const currentBudget = budget ?? 25000;
  const zoneCalc = calculateZone(currentBudget, transactions);
  const note = getRandomNote(zoneCalc.zone);

  const handleReset = () => {
    localStorage.removeItem('buno_budget');
    setBudget(null);
    setScreen('intro');
  };

  return (
    <div className="buno-container">
      <header className="header">
        <h1 className="brand-title">Buno</h1>
        <p className="brand-subtitle">Qualitative Spending Zones</p>
      </header>

      <section className={`zone-display zone-${zoneCalc.zone}`}>
        <h2 className="zone-label">{zoneCalc.zoneLabel}</h2>
        <p className="zone-pct">{Math.round(zoneCalc.pct)}% remaining balance</p>

        <div className="simple-bar-track">
          <div
            className="simple-bar-fill"
            style={{ width: `${Math.max(0, Math.min(100, zoneCalc.pct))}%` }}
          />
        </div>

        <p className="human-note">"{note}"</p>
        <p className="budget-ref">Monthly budget: ₹{currentBudget.toLocaleString('en-IN')}</p>
        
        <button 
          onClick={handleReset} 
          className="reset-btn"
          title="Reset onboarding and budget"
        >
          ↺ Reset / Restart Intro
        </button>
      </section>

      <section className="transactions-preview">
        <h3 className="transactions-heading">Transactions ({transactions.length})</h3>
        {transactions.map(t => (
          <div key={t.id} className="txn-item">
            <span>{t.description}</span>
            <span>₹{t.amount.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
