import React, { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { ChaiButton } from './ChaiButton'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm action',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}) => {
  const safeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      safeButtonRef.current?.focus()
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-card p-6 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-red-500/30 text-red-500">
              <AlertTriangle className="size-5" />
            </div>
            <h3 id="dialog-title" className="font-montserrat text-lg font-semibold">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="size-5" />
          </button>
        </div>

        <p id="dialog-desc" className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <ChaiButton
            ref={safeButtonRef}
            variant="outline"
            size="sm"
            iconRight={null}
            onClick={onCancel}
          >
            {cancelLabel}
          </ChaiButton>
          <ChaiButton
            variant={tone === 'danger' ? 'danger' : 'soft'}
            size="sm"
            iconRight={null}
            onClick={onConfirm}
          >
            {confirmLabel}
          </ChaiButton>
        </div>
      </div>
    </div>
  )
}
