const BUDGET_KEY = 'buno_budget';
const CASH_ENTRIES_KEY = 'buno_cash_entries';

export function getStoredBudget(): number | null {
  try {
    const val = localStorage.getItem(BUDGET_KEY);
    if (!val) return null;
    const num = Number(val);
    return isNaN(num) || num <= 0 ? null : num;
  } catch {
    return null;
  }
}

export function setStoredBudget(budget: number): void {
  try {
    localStorage.setItem(BUDGET_KEY, budget.toString());
  } catch (e) {
    console.warn('localStorage is unavailable, budget will be kept in memory only.', e);
  }
}

export function clearStoredBudget(): void {
  try {
    localStorage.removeItem(BUDGET_KEY);
  } catch {
    // Ignore error
  }
}

export function getStoredCashEntries<T>(): T[] {
  try {
    const val = localStorage.getItem(CASH_ENTRIES_KEY);
    if (!val) return [];
    return JSON.parse(val) as T[];
  } catch {
    return [];
  }
}

export function setStoredCashEntries<T>(entries: T[]): void {
  try {
    localStorage.setItem(CASH_ENTRIES_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('localStorage is unavailable, cash entries will be kept in memory only.', e);
  }
}
