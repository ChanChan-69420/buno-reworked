import {
  Car,
  Clapperboard,
  Package,
  ShoppingBag,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/lib/types'

const ICONS: Record<Category, LucideIcon> = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  bills: Zap,
  entertainment: Clapperboard,
  other: Package,
}

export const CATEGORY_LABELS: Record<Category, string> = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills',
  entertainment: 'Entertainment',
  other: 'Other',
}

export function CategoryIcon({ category }: { category: Category }) {
  const Icon = ICONS[category]
  return (
    <span
      role="img"
      aria-label={CATEGORY_LABELS[category]}
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-muted-foreground"
    >
      <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.6} />
    </span>
  )
}
