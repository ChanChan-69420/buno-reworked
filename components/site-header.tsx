import { BunnyLogo } from '@/components/bunny-logo'

type TabId = 'budget' | 'insights' | 'transactions'

const TABS = [
  { id: 'budget', label: 'Budget Range' },
  { id: 'insights', label: 'Spending Insights' },
  { id: 'transactions', label: 'Transactions' },
] as const

export function SiteHeader({
  activeTab,
  onTabChange,
  onTabKeyDown,
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onTabKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void
}) {
  return (
    <header className="sanctuary-navbar mt-5 flex h-[68px] min-h-[68px] shrink-0 items-center justify-between rounded-full border border-white/50 bg-card/55 px-3 shadow-lg shadow-black/10 backdrop-blur-md sm:px-6">
      <div className="flex w-full items-center justify-between gap-2 sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <BunnyLogo size={38} priority className="border border-white/60 shadow-xs" />
          <span className="font-serif text-xl font-semibold leading-none text-foreground">
            Buno
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Sanctuary views"
          className="flex shrink-0 items-center gap-1 rounded-full border border-white bg-primary/10 p-1"
        >
          {TABS.map((tab) => {
            const selected = tab.id === activeTab
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={onTabKeyDown}
                className={`rounded-full px-1.5 py-1.5 text-xs sm:px-3 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                  selected
                    ? 'bg-tile font-medium text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
