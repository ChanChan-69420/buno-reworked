import {
  Car,
  Clapperboard,
  Home,
  Package,
  ShoppingBag,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/lib/types'

const ICONS: Record<Category, LucideIcon> = {
  housing: Home,
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  bills: Zap,
  entertainment: Clapperboard,
  other: Package,
}

export const CATEGORY_LABELS: Record<Category, string> = {
  housing: 'Housing',
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills',
  entertainment: 'Entertainment',
  other: 'Others',
}

export function CategoryIcon({ category }: { category: Category }) {
  const Icon = ICONS[category] ?? Package
  return (
    <span
      role="img"
      aria-label={CATEGORY_LABELS[category] ?? 'Category'}
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-muted-foreground"
    >
      <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.6} />
    </span>
  )
}
