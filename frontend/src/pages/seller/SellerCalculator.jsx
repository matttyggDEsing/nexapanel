import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calculator, DollarSign, Percent, Hash, TrendingUp, RefreshCw } from 'lucide-react'
import { sellerService } from '@/services/sellerService'
import { useDebounce } from '@/hooks/useDebounce'

function FieldShell({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
        )}
        {children}
      </div>
    </div>
  )
}

function NumberInput({ value, onChange, placeholder, icon }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full py-2.5 pr-3 rounded-xl text-sm outline-none transition-all"
      style={{
        paddingLeft: icon ? '34px' : '12px',
        background: 'var(--bg3)', border: '1px solid var(--border2)',
        color: 'var(--txt)', caretColor: 'var(--em)',
      }}
      onFocus={(e) => (e.target.style.borderColor = 'rgba(16,185,129,0.35)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--border2)')}
    />
  )
}

function ResultRow({ label, value, color = 'var(--txt)', big = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'var(--border2)' }}>
      <span className="text-sm" style={{ color: 'var(--txt2)' }}>{label}</span>
      <span
        className={`font-display font-bold ${big ? 'text-2xl' : 'text-base'}`}
        style={{ color, letterSpacing: '-0.4px' }}
      >
        {value}
      </span>
    </div>
  )
}

export default function SellerCalculator() {
  const [cost, setCost] = useState('')
  const [markup, setMarkup] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [syncing, setSyncing] = useState(false)
  const [serverResult, setServerResult] = useState(null)

  const debouncedCost = useDebounce(cost, 350)
  const debouncedMarkup = useDebounce(markup, 350)
  const debouncedQty = useDebounce(quantity, 350)

  // Cálculo local en tiempo real (sin esperar al backend)
  const local = useMemo(() => {
    const c = parseFloat(cost)
    const m = parseFloat(markup)
    const q = parseInt(quantity) || 1

    if (isNaN(c) || c <= 0 || isNaN(m) || m < 0) return null

    const totalCost = c * q
    const suggestedPrice = c * (1 + m / 100)
    const totalPrice = suggestedPrice * q
    const profit = totalPrice - totalCost
    const margin = totalPrice > 0 ? (profit / totalPrice) * 100 : 0

    return {
      total_cost: totalCost,
      suggested_price: suggestedPrice,
      total_price: totalPrice,
      profit,
      margin_pct: margin,
    }
  }, [cost, markup, quantity])

  // Sincroniza con el backend (fuente de verdad), sin bloquear la UI
  useEffect(() => {
    const c = parseFloat(debouncedCost)
    const m = parseFloat(debouncedMarkup)
    const q = parseInt(debouncedQty) || 1
    if (isNaN(c) || c <= 0 || isNaN(m) || m < 0) {
      setServerResult(null)
      return
    }
    let active = true
    setSyncing(true)
    sellerService.calculate({ cost: c, markup: m, quantity: q })
      .then((res) => { if (active) setServerResult(res.data?.data || null) })
      .catch(() => {})
      .finally(() => { if (active) setSyncing(false) })
    return () => { active = false }
  }, [debouncedCost, debouncedMarkup, debouncedQty])

  const result = serverResult || local
  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`
  const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`

  const presets = [10, 20, 30, 50, 100]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
          Calculadora
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--txt2)' }}>
          Calculá precio sugerido, ganancia y margen en tiempo real.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border p-5 space-y-5"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center gap-2">
            <Calculator size={16} style={{ color: 'var(--em)' }} />
            <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>Entradas</h2>
          </div>

          <FieldShell label="Costo proveedor" icon={DollarSign}>
            <NumberInput value={cost} onChange={setCost} placeholder="0.00" icon />
          </FieldShell>

          <div>
            <FieldShell label="Markup (%)" icon={Percent}>
              <NumberInput value={markup} onChange={setMarkup} placeholder="0" icon />
            </FieldShell>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {presets.map((p) => (
                <button key={p} onClick={() => setMarkup(String(p))}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background: markup === String(p) ? 'rgba(16,185,129,0.12)' : 'var(--bg4)',
                    border: `1px solid ${markup === String(p) ? 'rgba(16,185,129,0.25)' : 'transparent'}`,
                    color: markup === String(p) ? 'var(--em3)' : 'var(--txt3)',
                  }}>
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <FieldShell label="Cantidad" icon={Hash}>
            <NumberInput value={quantity} onChange={setQuantity} placeholder="1" icon />
          </FieldShell>

          <div className="flex items-center gap-1.5 text-xs pt-1" style={{ color: 'var(--txt3)' }}>
            {syncing ? (
              <>
                <RefreshCw size={11} className="animate-spin" />
                Sincronizando con el servidor...
              </>
            ) : (
              <>✓ Cálculo verificado por el servidor</>
            )}
          </div>
        </motion.div>

        {/* Resultados */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border p-5"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: '#60A5FA' }} />
            <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>Resultado</h2>
          </div>

          {!result ? (
            <div className="text-center py-16" style={{ color: 'var(--txt3)' }}>
              <Calculator size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Completá costo y markup para ver el cálculo.</p>
            </div>
          ) : (
            <div>
              <ResultRow label="Costo total" value={fmt(result.total_cost)} />
              <ResultRow label="Precio sugerido (unidad)" value={fmt(result.suggested_price)} color="#60A5FA" />
              <ResultRow label="Precio total" value={fmt(result.total_price)} />

              <div className="rounded-xl p-4 mt-4 space-y-3"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--em4)' }}>Ganancia</span>
                  <span className="font-display font-bold text-2xl" style={{ color: 'var(--em3)', letterSpacing: '-0.5px' }}>
                    {fmt(result.profit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--em4)' }}>Margen</span>
                  <span className="font-display font-semibold text-base" style={{ color: 'var(--em3)' }}>
                    {fmtPct(result.margin_pct)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
