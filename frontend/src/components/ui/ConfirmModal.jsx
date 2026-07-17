import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '', onConfirm: null, confirmText: 'Confirmar', variant: 'primary' })

  const confirm = useCallback((title, message, opts = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, onConfirm: resolve, confirmText: opts.confirmText || 'Confirmar', variant: opts.variant || 'primary' })
    })
  }, [])

  const handleClose = useCallback(() => {
    setState(s => ({ ...s, open: false }))
    setTimeout(() => { state.onConfirm?.(false); setState(s => ({ ...s, onConfirm: null })) }, 200)
  }, [state.onConfirm])

  const handleConfirm = useCallback(() => {
    setState(s => ({ ...s, open: false }))
    setTimeout(() => { state.onConfirm?.(true); setState(s => ({ ...s, onConfirm: null })) }, 200)
  }, [state.onConfirm])

  const modal = state.open ? (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm rounded-xl border p-6 space-y-4"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>{state.title}</h2>
            <button onClick={handleClose} style={{ color: 'var(--txt3)' }}><X size={18} /></button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--txt2)' }}>{state.message}</p>
          <div className="flex gap-2 pt-1">
            <button onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
              Cancelar
            </button>
            <button onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold font-display transition-all"
              style={{
                background: state.variant === 'danger' ? 'rgba(239,68,68,0.9)' : 'var(--em)',
                color: state.variant === 'danger' ? '#fff' : '#000',
              }}>
              {state.confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null

  return { confirm, modal }
}
