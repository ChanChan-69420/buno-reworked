const BUDGET_KEY = 'buno_budget'

export function getStoredBudget(): number | null {
  try {
    const raw = localStorage.getItem(BUDGET_KEY)
    if (!raw) return null
    const num = Number(raw)
    return Number.isFinite(num) && num > 0 ? num : null
  } catch {
    return null
  }
}

export function setStoredBudget(amount: number): void {
  try {
    localStorage.setItem(BUDGET_KEY, String(amount))
  } catch (err) {
    console.warn('Failed to save budget to localStorage:', err)
  }
}
