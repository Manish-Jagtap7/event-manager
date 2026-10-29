import React from 'react'

export interface AnimatedBadgeProps {
  children: React.ReactNode
  className?: string
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({ children, className = '' }) => {
  return (
    <span className={`relative inline-flex w-fit overflow-hidden rounded-full p-px ${className}`}>
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-5 w-[300px] rounded-full bg-gradient-to-r from-transparent via-transparent to-orange-500 animate-chai-spin pointer-events-none"
        style={{ transform: 'translate(-50%,-50%)' }}
      />
      <span className="relative z-10 rounded-full bg-neutral-100 px-3.5 py-1.5 text-xs font-medium text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
        {children}
      </span>
    </span>
  )
}
