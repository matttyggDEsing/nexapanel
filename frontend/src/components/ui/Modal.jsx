/**
 * Modal
 * ─────────────────────────────────────────────────────────────────────────────
 * Reemplaza Modal.jsx + BalanceModal inline de AdminUsers.jsx.
 * Agrega: focus trap, aria-modal, aria-labelledby, aria-describedby.
 *
 * Props:
 *   open            bool
 *   onClose         fn
 *   title           string
 *   subtitle        string
 *   size            'sm' | 'md' | 'lg' | 'xl'  (default: 'md')
 *   closeOnOverlay  bool (default: true)
 *   footer          ReactNode
 *   children        ReactNode
 */

import { useEffect, useRef, useId } from 'react'
import { createPortal }             from 'react-dom'
import { motion, AnimatePresence }  from 'framer-motion'
import { X }                        from 'lucide-react'

const MAX_WIDTH = {
  sm: '400px',
  md: '520px',
  lg: '680px',
  xl: '860px',
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size           = 'md',
  closeOnOverlay = true,
  footer,
  children,
}) {
  const titleId    = useId()
  const subtitleId = useId()
  const panelRef   = useRef(null)

  // ── Scroll lock ───────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Escape to close ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // ── Focus trap ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !panelRef.current) return

    const focusable = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    // Foco inicial
    first?.focus()

    const trap = (e) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }

    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
          role="presentation"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-xs"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={closeOnOverlay ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={subtitle ? subtitleId : undefined}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0,   scale: 0.95, y: 12  }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full flex flex-col overflow-hidden rounded-2xl"
            style={{
              maxWidth:  MAX_WIDTH[size] ?? MAX_WIDTH.md,
              maxHeight: 'calc(100vh - 32px)',
              background: 'var(--bg2)',
              border:     '1px solid var(--border2)',
              boxShadow:  '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.06)',
            }}
          >
            {/* Header */}
            {(title || onClose) && (
              <>
                <div className="flex items-start justify-between gap-3 px-6 pt-5">
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h2
                        id={titleId}
                        className="font-display font-bold text-lg text-txt-primary"
                        style={{ letterSpacing: '-0.3px' }}
                      >
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p id={subtitleId} className="text-sm text-txt-secondary mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {onClose && (
                    <button
                      onClick={onClose}
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-txt-muted hover:text-txt-primary bg-bg-tertiary border border-border-dim hover:bg-bg-quad focus-visible:ring-2 focus-visible:ring-em/40"
                      aria-label="Cerrar modal"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border-dim mt-4" aria-hidden="true" />
              </>
            )}

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: title ? '20px 24px' : '24px' }}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <>
                <div className="h-px bg-border-dim" aria-hidden="true" />
                <div className="flex items-center justify-end gap-2.5 px-6 py-4">
                  {footer}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
