import React from 'react'

export interface HighlightProps {
  children: React.ReactNode
  className?: string
}

export const Highlight: React.FC<HighlightProps> = ({ children, className = '' }) => {
  return (
    <span className={`font-montserrat font-medium tracking-tight capitalize text-yellow-800 dark:text-orange-100 ${className}`}>
      {children}
    </span>
  )
}
