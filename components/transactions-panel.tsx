'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { Plus, Trash2, X } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import type { Category, Transaction, TransactionSource } from '@/lib/types'

const STORAGE_KEY = 'buno_cash_entries'

const CATEGORY_OPTIONS: { id: Category; label: string }[] = [
  { id: 'housing', label: 'Housing' },
  { id: 'food', label: 'Food' },
  { id: 'transport', label: 'Transport' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'other', label: 'Others' },
]

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Kolkata',
})

const amountFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function getLocalDatetimeNow(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function TransactionsPanel({
  transactions: initialTransactions = [],
}: {
  transactions?: Transaction[]
}) {
  const [mounted, setMounted] = useState(false)
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [isRefund, setIsRefund] = useState(false)
  const [category, setCategory] = useState<Category>('food')
  const [date, setDate] = useState('')
  const [source, setSource] = useState<TransactionSource>('cash')
  const [errors, setErrors] = useState<{
    description?: string
    amount?: string
    date?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Animation refs
  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const isClosingRef = useRef(false)

  // Client mount check for portal and localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setManualTransactions(parsed)
        }
      }
    } catch (err) {
      console.error('Failed to load transactions from localStorage:', err)
    }
  }, [])

  // Modal opening animation
  useLayoutEffect(() => {
    if (!isModalOpen) return
    isClosingRef.current = false

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) {
      if (backdropRef.current) gsap.set(backdropRef.current, { opacity: 1 })
      if (modalRef.current) gsap.set(modalRef.current, { opacity: 1, scale: 1 })
      return
    }

    if (backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.22, ease: 'power2.out' },
      )
    }

    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' },
      )
    }
  }, [isModalOpen])

  // Close modal on Escape key
  useEffect(() => {
    if (!isModalOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  const allTransactions = useMemo(() => {
    return [...manualTransactions, ...initialTransactions]
  }, [manualTransactions, initialTransactions])

  const sorted = useMemo(() => {
    return [...allTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [allTransactions])

  function handleOpenModal() {
    setDescription('')
    setAmount('')
    setIsRefund(false)
    setCategory('food')
    setDate(getLocalDatetimeNow())
    setSource('cash')
    setErrors({})
    setIsSubmitting(false)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    if (isClosingRef.current) return
    isClosingRef.current = true

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion || !backdropRef.current || !modalRef.current) {
      setIsModalOpen(false)
      isClosingRef.current = false
      return
    }

    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.19,
      ease: 'power2.in',
    })

    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.96,
      duration: 0.19,
      ease: 'power2.in',
      onComplete: () => {
        setIsModalOpen(false)
        isClosingRef.current = false
      },
    })
  }

  function handleDeleteManualTransaction(id: string) {
    const updated = manualTransactions.filter((t) => t.id !== id)
    setManualTransactions(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('buno_transactions_changed'))
    } catch (err) {
      console.error('Failed to update localStorage:', err)
    }
  }

  function validate() {
    const nextErrors: {
      description?: string
      amount?: string
      date?: string
    } = {}

    if (!description.trim()) {
      nextErrors.description = 'Transaction name or description is required.'
    }

    const parsedAmount = Math.abs(parseFloat(amount))
    if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = 'Please enter a valid amount greater than ₹0.'
    }

    if (!date) {
      nextErrors.date = 'Date and time is required.'
    } else {
      const d = new Date(date)
      if (isNaN(d.getTime())) {
        nextErrors.date = 'Please enter a valid date and time.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting || isClosingRef.current) return

    if (!validate()) return

    setIsSubmitting(true)

    const rawAbsAmount = Math.round(Math.abs(parseFloat(amount)) * 100) / 100
    const finalAmount = isRefund ? -rawAbsAmount : rawAbsAmount
    const isoDate = new Date(date).toISOString()

    const newTx: Transaction = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      description: description.trim(),
      category,
      amount: finalAmount,
      date: isoDate,
      source,
    }

    const updated = [newTx, ...manualTransactions]
    setManualTransactions(updated)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('buno_transactions_changed'))
    } catch (err) {
      console.error('Failed to save manual transaction to localStorage:', err)
    }

    setIsSubmitting(false)
    handleCloseModal()
  }

  return (
    <section aria-label="Recent transactions">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-coffee-label">
            Recent activity
          </h3>
          <p className="text-sm text-muted-foreground">
            {sorted.length} transactions this month
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3.5 py-1.5 text-xs font-medium text-coffee-label shadow-xs transition hover:bg-primary/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          <span>Add Transaction</span>
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl bg-tile px-6 py-12 text-center font-serif text-lg text-muted-foreground">
          There are no transactions here. Feel free to spend a little on yourself.
        </p>
      ) : (
        <ul
          tabIndex={0}
          aria-label="Transactions, scroll horizontally to browse"
          className="-mx-6 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain px-6 pb-3 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] scroll-px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {sorted.map((t) => {
            const isManual = t.id.startsWith('manual-')
            const isNegative = t.amount < 0
            return (
              <li
                key={t.id}
                className="relative flex min-h-40 w-48 shrink-0 snap-start flex-col justify-between gap-3 rounded-2xl bg-tile p-4 shadow-sm shadow-black/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <CategoryIcon category={t.category} />
                  <div className="flex items-center gap-1">
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        isNegative
                          ? 'border-safe/30 bg-safe/10 text-safe'
                          : t.source === 'bank'
                            ? 'border-border bg-card text-muted-foreground'
                            : 'border-primary/40 bg-primary/10 text-coffee-label'
                      }`}
                    >
                      {isNegative ? 'Refund' : t.source === 'bank' ? 'Bank' : 'Cash'}
                    </span>
                    {isManual && (
                      <button
                        type="button"
                        onClick={() => handleDeleteManualTransaction(t.id)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-critical/15 hover:text-critical"
                        aria-label={`Delete ${t.description}`}
                        title="Delete entry"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 min-h-10 break-words font-medium leading-5">
                    {t.description}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {dateFormatter.format(new Date(t.date))}
                  </p>
                </div>
                <p
                  className={`text-lg font-medium tabular-nums ${
                    isNegative ? 'text-safe font-semibold' : ''
                  }`}
                >
                  {isNegative
                    ? `+ ${amountFormatter.format(Math.abs(t.amount))}`
                    : amountFormatter.format(t.amount)}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      {isModalOpen && mounted && createPortal(
        <div
          ref={backdropRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-tx-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal()
          }}
        >
          <div
            ref={modalRef}
            className="relative flex flex-col w-full max-w-[480px] max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-3xl border border-border bg-card p-5 sm:p-7 text-card-foreground shadow-2xl shadow-black/20 focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2
                id="modal-add-tx-title"
                className="font-serif text-xl font-medium text-foreground sm:text-2xl"
              >
                Add Transaction
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
              {/* Transaction Type: Expense vs Refund */}
              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-coffee-label">
                  Transaction Type
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRefund(false)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-medium transition sm:text-sm ${
                      !isRefund
                        ? 'border-primary/60 bg-primary/20 font-semibold text-coffee-label shadow-xs'
                        : 'border-border bg-tile/70 text-muted-foreground hover:bg-tile'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRefund(true)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-medium transition sm:text-sm ${
                      isRefund
                        ? 'border-safe/60 bg-safe/20 font-semibold text-safe shadow-xs'
                        : 'border-border bg-tile/70 text-muted-foreground hover:bg-tile'
                    }`}
                  >
                    Refund / Credit
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="tx-desc"
                  className="mb-1 block text-xs font-medium uppercase tracking-wider text-coffee-label"
                >
                  Transaction Name / Description *
                </label>
                <input
                  id="tx-desc"
                  type="text"
                  placeholder={isRefund ? 'e.g. Returned shoes, Store refund' : 'e.g. Chai, Groceries, Rent'}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: undefined }))
                    }
                  }}
                  className={`w-full rounded-xl border bg-tile px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 ${
                    errors.description
                      ? 'border-critical focus:ring-critical/30'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                  autoFocus
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-critical-deep">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="tx-amount"
                  className="mb-1 block text-xs font-medium uppercase tracking-wider text-coffee-label"
                >
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-muted-foreground">
                    {isRefund ? '+ ₹' : '₹'}
                  </span>
                  <input
                    id="tx-amount"
                    type="number"
                    min="1"
                    step="any"
                    placeholder="e.g. 250"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      if (errors.amount) {
                        setErrors((prev) => ({ ...prev, amount: undefined }))
                      }
                    }}
                    className={`w-full rounded-xl border bg-tile py-2 ${
                      isRefund ? 'pl-11' : 'pl-8'
                    } pr-3.5 text-sm tabular-nums text-foreground focus:outline-none focus:ring-2 ${
                      errors.amount
                        ? 'border-critical focus:ring-critical/30'
                        : 'border-border focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs text-critical-deep">
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="tx-category"
                    className="mb-1 block text-xs font-medium uppercase tracking-wider text-coffee-label"
                  >
                    Category
                  </label>
                  <select
                    id="tx-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full rounded-xl border border-border bg-tile px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="tx-date"
                    className="mb-1 block text-xs font-medium uppercase tracking-wider text-coffee-label"
                  >
                    Date & Time
                  </label>
                  <input
                    id="tx-date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      if (errors.date) {
                        setErrors((prev) => ({ ...prev, date: undefined }))
                      }
                    }}
                    className={`w-full rounded-xl border bg-tile px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 sm:text-sm ${
                      errors.date
                        ? 'border-critical focus:ring-critical/30'
                        : 'border-border focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-critical-deep">
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-coffee-label">
                  Payment Method
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSource('cash')}
                    className={`flex-1 rounded-xl border py-2 text-xs font-medium transition sm:text-sm ${
                      source === 'cash'
                        ? 'border-primary/60 bg-primary/20 font-semibold text-coffee-label shadow-xs'
                        : 'border-border bg-tile/70 text-muted-foreground hover:bg-tile'
                    }`}
                  >
                    Cash (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSource('bank')}
                    className={`flex-1 rounded-xl border py-2 text-xs font-medium transition sm:text-sm ${
                      source === 'bank'
                        ? 'border-foreground/40 bg-foreground/10 font-semibold text-foreground shadow-xs'
                        : 'border-border bg-tile/70 text-muted-foreground hover:bg-tile'
                    }`}
                  >
                    Bank
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-border pt-3.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-primary/90 active:scale-95 disabled:opacity-50 sm:text-sm"
                >
                  {isSubmitting ? 'Saving...' : isRefund ? 'Save Refund' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
