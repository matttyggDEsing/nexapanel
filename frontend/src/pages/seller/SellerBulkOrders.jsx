import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Search, X, Check,
  Link as LinkIcon, Hash, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sellerService } from '@/services/sellerService'
import { useDebounce } from '@/hooks/useDebounce'

const PAYMENT_METHODS = [
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'mercadopago',   label: 'Mercado Pago' },
  { id: 'crypto',        label: 'Crypto' },
  { id: 'efectivo',      label: 'Efectivo' },
  { id: 'otro',          label: 'Otro' },
]

let rowIdSeq = 1
const emptyRow = () => ({ _id: rowIdSeq++, service_id: '', service: null, quantity: '', link: '', search: '', open: false, results: [], searching: false })

// ── Selector de cliente ──────────────────────────────────────────────────────
function CustomerPicker({ selected, onSelect }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(query, 350)
  const boxRef = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    sellerService.getCustomers({ page: 1, perPage: 8, search: debounced || undefined })
      .then(res => setResults(res.data?.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debounced, open])

  return (
    <div className="relative" ref={boxRef}>
      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Cliente</label>
      {selected ? (
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
            {selected.first_name?.charAt(0)?.toUpperCase()}{selected.last_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--txt)' }}>{selected.first_name} {selected.last_name}</p>
            {selected.whatsapp && <p className="text-xs" style={{ color: 'var(--txt3)' }}>{selected.whatsapp}</p>}
          </div>
          <button onClick={() => onSelect(null)} style={{ color: 'var(--txt3)' }}><X size={15} /></button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setOpen(true)}
              placeholder="Buscar cliente por nombre, email o WhatsApp..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          {open && (
            <div className="absolute z-20 mt-1.5 w-full rounded-xl border shadow-xl overflow-hidden max-h-64 overflow-y-auto"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border2)' }}>
              {loading ? (
                <div className="p-4 text-center text-xs flex items-center justify-center gap-2" style={{ color: 'var(--txt3)' }}>
                  <Loader2 size={12} className="animate-spin" /> Buscando...
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: 'var(--txt3)' }}>
                  Sin resultados. Creá el cliente desde la sección Clientes.
                </div>
              ) : (
                results.map(c => (
                  <button key={c.id} onClick={() => { onSelect(c); setOpen(false); setQuery('') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all"
                    style={{ borderBottom: '1px solid var(--border2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                      {c.first_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--txt)' }}>{c.first_name} {c.last_name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--txt3)' }}>{c.email || c.whatsapp || '—'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Selector de servicio (combobox compacto, para cada fila) ────────────────
function ServicePicker({ row, onChange }) {
  const boxRef = useRef(null)
  const debounced = useDebounce(row.search, 300)

  useEffect(() => {
    const onClickOutside = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) onChange({ open: false }) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (!row.open) return
    onChange({ searching: true })
    sellerService.getServices({ page: 1, perPage: 10, search: debounced || undefined })
      .then(res => onChange({ results: res.data?.data || [], searching: false }))
      .catch(() => onChange({ results: [], searching: false }))
  }, [debounced, row.open])

  return (
    <div className="relative flex-1 min-w-0" ref={boxRef}>
      <input
        value={row.service ? row.service.name : row.search}
        onChange={e => onChange({ search: e.target.value, service: null, service_id: '', open: true })}
        onFocus={() => onChange({ open: true })}
        placeholder="Buscar servicio..."
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'var(--bg3)',
          border: `1px solid ${row.service ? 'rgba(16,185,129,0.3)' : 'var(--border2)'}`,
          color: 'var(--txt)', caretColor: 'var(--em)',
        }}
      />
      {row.open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border shadow-xl overflow-hidden max-h-56 overflow-y-auto"
          style={{ background: 'var(--bg3)', borderColor: 'var(--border2)' }}>
          {row.searching ? (
            <div className="p-3 text-center text-xs flex items-center justify-center gap-2" style={{ color: 'var(--txt3)' }}>
              <Loader2 size={11} className="animate-spin" /> Buscando...
            </div>
          ) : (row.results || []).length === 0 ? (
            <div className="p-3 text-center text-xs" style={{ color: 'var(--txt3)' }}>Sin resultados</div>
          ) : (
            row.results.map(s => (
              <button key={s.id} onClick={() => onChange({ service: s, service_id: s.id, search: '', open: false })}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-all"
                style={{ borderBottom: '1px solid var(--border2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span className="text-sm truncate" style={{ color: 'var(--txt)' }}>{s.name}</span>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--em3)' }}>${Number(s.rate).toFixed(4)} / 1000</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SellerBulkOrders() {
  const [customer, setCustomer] = useState(null)
  const [rows, setRows] = useState([emptyRow()])
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateRow = (id, patch) => setRows(prev => prev.map(r => r._id === id ? { ...r, ...patch } : r))
  const addRow = () => setRows(prev => [...prev, emptyRow()])
  const removeRow = (id) => setRows(prev => prev.length > 1 ? prev.filter(r => r._id !== id) : prev)

  const validRows = rows.filter(r => r.service_id && parseInt(r.quantity) > 0)
  const total = validRows.reduce((sum, r) => sum + ((parseInt(r.quantity || 0) / 1000) * Number(r.service?.rate || 0)), 0)

  const isValid = customer && validRows.length > 0

  const handleSubmit = async () => {
    if (!customer) { toast.error('Seleccioná un cliente'); return }
    if (validRows.length === 0) { toast.error('Agregá al menos una orden válida (servicio y cantidad)'); return }

    setSubmitting(true)
    try {
      const orders = validRows.map(r => ({
        service_id: r.service_id,
        quantity: parseInt(r.quantity),
        link: r.link || undefined,
      }))
      const res = await sellerService.createBulkOrders({
        customer_id: customer.id,
        orders,
        payment_method: paymentMethod,
        notes: notes || undefined,
      })
      toast.success(res.data?.message || `${orders.length} órdenes creadas`)
      setCustomer(null)
      setRows([emptyRow()])
      setNotes('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al crear las órdenes')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
          Órdenes Masivas
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--txt2)' }}>
          Agregá varias órdenes para un mismo cliente y creálas en una sola operación.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border p-5 space-y-5"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
        <CustomerPicker selected={customer} onSelect={setCustomer} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>
              Órdenes ({rows.length})
            </label>
            <button onClick={addRow}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--em3)' }}>
              <Plus size={12} /> Agregar fila
            </button>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {rows.map((row) => {
                const subtotal = row.service && row.quantity ? (parseInt(row.quantity || 0) / 1000) * Number(row.service.rate) : 0
                return (
                  <motion.div key={row._id} layout
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border2)' }}>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1.4fr_0.7fr_1fr] gap-2">
                      <ServicePicker row={row} onChange={(patch) => updateRow(row._id, patch)} />
                      <div className="relative">
                        <Hash size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
                        <input type="number" min={1} value={row.quantity}
                          onChange={e => updateRow(row._id, { quantity: e.target.value })}
                          placeholder="Cant."
                          className="w-full pl-7 pr-2 py-2.5 rounded-xl text-sm outline-none transition-all"
                          style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
                        />
                      </div>
                      <div className="relative">
                        <LinkIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
                        <input value={row.link} onChange={e => updateRow(row._id, { link: e.target.value })}
                          placeholder="Link (opcional)"
                          className="w-full pl-7 pr-2 py-2.5 rounded-xl text-sm outline-none transition-all"
                          style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between h-full pl-1 flex-shrink-0" style={{ minWidth: 70 }}>
                      <span className="text-xs font-semibold mt-2.5" style={{ color: subtotal ? 'var(--em3)' : 'var(--txt3)' }}>
                        ${subtotal.toFixed(2)}
                      </span>
                      <button onClick={() => removeRow(row._id)} className="p-1.5 mt-1" style={{ color: '#FCA5A5' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Método de pago */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--txt3)' }}>Método de pago</label>
          <div className="flex gap-1.5 flex-wrap">
            {PAYMENT_METHODS.map(m => (
              <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: paymentMethod === m.id ? 'rgba(16,185,129,0.1)' : 'var(--bg3)',
                  border: `1px solid ${paymentMethod === m.id ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
                  color: paymentMethod === m.id ? 'var(--em3)' : 'var(--txt2)',
                }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Observaciones</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Notas internas para este lote de órdenes..."
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
          />
        </div>

        {/* Resumen + submit */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border2)' }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--txt3)' }}>
              {validRows.length} orden{validRows.length !== 1 ? 'es' : ''} válida{validRows.length !== 1 ? 's' : ''}
            </p>
            <p className="font-display font-bold text-xl" style={{ color: 'var(--em3)', letterSpacing: '-0.5px' }}>
              ${total.toFixed(2)}
            </p>
          </div>
          <motion.button whileHover={isValid ? { scale: 1.02 } : {}} whileTap={isValid ? { scale: 0.98 } : {}}
            onClick={handleSubmit} disabled={!isValid || submitting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm transition-all"
            style={{
              background: isValid ? 'var(--em)' : 'var(--bg4)',
              color: isValid ? '#000' : 'var(--txt3)',
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}>
            {submitting
              ? <><Loader2 size={15} className="animate-spin" /> Creando...</>
              : <><Check size={15} /> Crear {validRows.length || ''} órdenes</>
            }
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
