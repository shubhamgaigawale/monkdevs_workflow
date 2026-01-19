import { cn } from '@/lib/utils/cn'
import type { LeadStatus } from '@/types'

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

const statusConfig: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: 'New',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  CONTACTED: {
    label: 'Contacted',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  QUALIFIED: {
    label: 'Qualified',
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  NEGOTIATION: {
    label: 'Negotiation',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  WON: {
    label: 'Won',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  LOST: {
    label: 'Lost',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
