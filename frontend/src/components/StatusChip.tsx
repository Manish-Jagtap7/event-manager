import React from 'react'

export interface StatusChipProps {
  status: 'approved' | 'pending' | 'attended' | 'cancelled' | 'upcoming' | 'completed' | 'draft' | string
  className?: string
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, className = '' }) => {
  const norm = status.toLowerCase()
  let borderAndText = 'border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400'

  if (norm === 'approved' || norm === 'attended' || norm === 'completed') {
    borderAndText = 'border-emerald-500/40 text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-400'
  } else if (norm === 'pending' || norm === 'upcoming') {
    borderAndText = 'border-amber-500/40 text-amber-600 dark:border-amber-400/40 dark:text-amber-300'
  } else if (norm === 'cancelled' || norm === 'rejected') {
    borderAndText = 'border-red-500/40 text-red-600 dark:border-red-400/40 dark:text-red-400'
  } else if (norm === 'draft') {
    borderAndText = 'border-purple-500/40 text-purple-600 dark:border-purple-400/40 dark:text-purple-300'
  }

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider ${borderAndText} ${className}`}
    >
      {status}
    </span>
  )
}
