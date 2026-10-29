import React from 'react'
import { ArrowUpRight } from 'lucide-react'

export interface ChaiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  iconRight?: React.ReactNode | null
  children?: React.ReactNode
}

export const ChaiButton = React.forwardRef<HTMLButtonElement, ChaiButtonProps>(
  ({ variant = 'soft', size = 'md', iconRight, children, className = '', ...props }, ref) => {
    let sizeClasses = 'h-9 px-4 text-sm'
    if (size === 'sm') sizeClasses = 'h-8 px-3 text-xs'
    if (size === 'lg') sizeClasses = 'h-11 px-6 text-base'
    if (size === 'icon') sizeClasses = 'size-9 p-0 flex items-center justify-center'

    let variantClasses = ''
    let defaultIcon = null

    switch (variant) {
      case 'solid':
        // The one main action on a screen: asymmetric corners, white on dark
        variantClasses =
          'btn-asym font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-colors'
        defaultIcon = <ArrowUpRight className="size-4 -ml-0.5" aria-hidden="true" />
        break

      case 'outline':
        // Beside the solid button: mirrored asymmetric corners
        variantClasses =
          'btn-asym-mirror font-medium border border-border bg-transparent text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors'
        break

      case 'soft':
        // Default card / secondary buttons
        variantClasses =
          'rounded-md font-semibold font-montserrat bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
        break

      case 'ghost':
        variantClasses =
          'rounded-md text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'
        break

      case 'danger':
        variantClasses =
          'rounded-md font-medium bg-red-600 text-white hover:bg-red-700 transition-colors'
        break
    }

    const icon = iconRight !== undefined ? iconRight : defaultIcon

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
        {icon}
      </button>
    )
  }
)

ChaiButton.displayName = 'ChaiButton'
