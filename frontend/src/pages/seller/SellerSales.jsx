import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, RefreshCw, X, ChevronLeft, ChevronRight, Eye, Edit2,
  FileText, Download, Copy, Loader2, Filter, Receipt,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sellerService } from '@/services/sellerService'
import { useDebounce } from '@/hooks/useDebounce'

const STATUS_OPTS = [
  { id: '',          label: 'Todas' },
  { id: 'pending',   label: 'Pendiente' },
  { id: 'completed', label: 'Completada' },
  { id: 'cancelled', label: 'Cancelada' },
]
const STATUS_STYLE = {
  pending:   { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', label: 'Pendiente' },
  completed: { bg: 'rgba(16,185,129,0.12)', color: '#34D399', label: 'Completada' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',  color: '#FCA5A5', label: 'Cancelada' },
}
const METHOD_OPTS = [
  { id: '',              label: 'Todos' },
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'mercadopago',   label: 'Mercado Pago' },
  { id: 'crypto',        label: 'Crypto' },
  { id: 'efectivo',      label: 'Efectivo' },
  { id: 'otro',          label: 'Otro' },
]

const fmtDate = (d) => d ? new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'
const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`
const escapeHtml = (str) => {
  if (str == null) return ''
  return String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
}

// ── Selector de cliente compacto (para el filtro) ────────────────────────────
function CustomerFilter({ selected, onSelect }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const debounced = useDebounce(query, 350)
  const boxRef = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    sellerService.getCustomers({ page: 1, perPage: 8, search: debounced || undefined })
      .then(res => setResults(res.data?.data || []))
      .catch(() => setResults([]))
  }, [debounced, open])

  if (selected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--em3)' }}>
        <span className="truncate max-w-32">{selected.first_name} {selected.last_name}</span>
        <button onClick={() => onSelect(null)}><X size={12} /></button>
      </div>
    )
  }

  return (
    <div className="relative" ref={boxRef}>
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
      <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setOpen(true)}
        placeholder="Cliente..."
        className="pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all w-40"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
      />
      {open && (
        <div className="absolute z-20 mt-1.5 w-56 rounded-xl border shadow-xl overflow-hidden max-h-56 overflow-y-auto"
          style={{ background: 'var(--bg3)', borderColor: 'var(--border2)' }}>
          {results.length === 0 ? (
            <div className="p-3 text-center text-xs" style={{ color: 'var(--txt3)' }}>Sin resultados</div>
          ) : (
            results.map(c => (
              <button key={c.id} onClick={() => { onSelect(c); setOpen(false); setQuery('') }}
                className="w-full text-left px-3 py-2 text-sm transition-all"
                style={{ color: 'var(--txt)', borderBottom: '1px solid var(--border2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {c.first_name} {c.last_name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Modal: ver detalle ────────────────────────────────────────────────────────
function ViewModal({ saleId, onClose }) {
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!saleId) return
    setLoading(true)
    sellerService.getSale(saleId).then(res => setSale(res.data?.data)).finally(() => setLoading(false))
  }, [saleId])

  if (!saleId) return null
  const st = sale ? (STATUS_STYLE[sale.status] || STATUS_STYLE.pending) : null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: .95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border p-6 space-y-4 max-h-[85vh] overflow-y-auto"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>Venta #{saleId}</h2>
            <button onClick={onClose} style={{ color: 'var(--txt3)' }}><X size={18} /></button>
          </div>

          {loading ? (
            <div className="py-10 text-center" style={{ color: 'var(--txt3)' }}>
              <Loader2 size={20} className="animate-spin mx-auto" />
            </div>
          ) : !sale ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--txt3)' }}>No se pudo cargar la venta.</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>{sale.first_name} {sale.last_name}</p>
                  <p className="text-xs" style={{ color: 'var(--txt3)' }}>{fmtDate(sale.created_at)}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              </div>

              <div className="rounded-xl border divide-y" style={{ borderColor: 'var(--border2)' }}>
                {(sale.items || []).map(item => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2.5" style={{ borderColor: 'var(--border2)' }}>
                    <div className="min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--txt)' }}>{item.service_name}</p>
                      <p className="text-xs" style={{ color: 'var(--txt3)' }}>{item.quantity} × {fmtMoney(item.unit_price)}</p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--em3)' }}>{fmtMoney(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border2)' }}>
                <span className="text-sm" style={{ color: 'var(--txt2)' }}>Método: {sale.payment_method}</span>
                <span className="font-display font-bold text-lg" style={{ color: 'var(--em3)' }}>{fmtMoney(sale.total)}</span>
              </div>

              {sale.notes && (
                <p className="text-xs p-3 rounded-xl" style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}>{sale.notes}</p>
              )}

              {sale.voucher_path && (
                <a href={sale.voucher_path} target="_blank" rel="noopener noreferrer"
                  className="block text-center text-xs py-2 rounded-xl transition-all"
                  style={{ background: 'var(--bg3)', color: 'var(--em3)', border: '1px solid var(--border2)' }}>
                  Ver comprobante
                </a>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Modal: editar ─────────────────────────────────────────────────────────────
function EditModal({ sale, onClose, onSaved }) {
  const [status, setStatus] = useState(sale?.status || 'pending')
  const [paymentMethod, setPaymentMethod] = useState(sale?.payment_method || 'efectivo')
  const [notes, setNotes] = useState(sale?.notes || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sale) {
      setStatus(sale.status); setPaymentMethod(sale.payment_method); setNotes(sale.notes || '')
    }
  }, [sale])

  if (!sale) return null

  const save = async () => {
    setSaving(true)
    try {
      await sellerService.updateSale(sale.id, { status, payment_method: paymentMethod, notes })
      toast.success('Venta actualizada')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: .95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border p-6 space-y-4"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>Editar venta #{sale.id}</h2>
            <button onClick={onClose} style={{ color: 'var(--txt3)' }}><X size={18} /></button>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Estado</label>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTS.filter(s => s.id).map(s => (
                <button key={s.id} onClick={() => setStatus(s.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: status === s.id ? (STATUS_STYLE[s.id]?.bg || 'var(--bg3)') : 'var(--bg3)',
                    color: status === s.id ? STATUS_STYLE[s.id]?.color : 'var(--txt2)',
                    border: `1px solid ${status === s.id ? 'transparent' : 'var(--border2)'}`,
                  }}>{s.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Método de pago</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}>
              {METHOD_OPTS.filter(m => m.id).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Observaciones</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>Cancelar</button>
            <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-display disabled:opacity-50"
              style={{ background: 'var(--em)', color: '#000' }}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Imprimir / "Descargar PDF" (usa la ventana de impresión del navegador) ───
function printSale(sale) {
  const items = sale.items || []
  const rows = items.map(it => `
    <tr>
      <td>${escapeHtml(it.service_name)}</td>
      <td style="text-align:center">${it.quantity}</td>
      <td style="text-align:right">$${Number(it.unit_price).toFixed(2)}</td>
      <td style="text-align:right">$${Number(it.subtotal).toFixed(2)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Venta #${escapeHtml(String(sale.id))}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#111;padding:32px;max-width:640px;margin:0 auto}
    h1{font-size:20px;margin-bottom:4px} .muted{color:#666;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th,td{padding:8px 6px;border-bottom:1px solid #ddd;font-size:13px;text-align:left}
    th{color:#666;font-size:11px;text-transform:uppercase}
    .total{display:flex;justify-content:flex-end;margin-top:16px;font-size:16px;font-weight:bold}
    .row{display:flex;justify-content:space-between;margin-top:4px;font-size:13px}
  </style></head><body>
    <h1>Venta #${escapeHtml(String(sale.id))}</h1>
    <p class="muted">${escapeHtml(new Date(sale.created_at).toLocaleString('es-AR'))}</p>
    <div class="row"><span>Cliente</span><strong>${escapeHtml(sale.first_name)} ${escapeHtml(sale.last_name)}</strong></div>
    <div class="row"><span>Método de pago</span><strong>${escapeHtml(sale.payment_method)}</strong></div>
    <div class="row"><span>Estado</span><strong>${escapeHtml(STATUS_STYLE[sale.status]?.label || sale.status)}</strong></div>
    <table><thead><tr><th>Servicio</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="total">Total: $${Number(sale.total).toFixed(2)}</div>
    ${sale.notes ? `<p class="muted" style="margin-top:16px">Obs: ${escapeHtml(sale.notes)}</p>` : ''}
  </body></html>`

  const w = window.open('', '_blank')
  if (!w) { toast.error('Habilitá las ventanas emergentes para descargar el PDF'); return }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 250)
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SellerSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, perPage: 10 })

  const [customer, setCustomer] = useState(null)
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [viewId, setViewId] = useState(null)
  const [editSale, setEditSale] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sellerService.getSales({
        page, perPage: 10,
        status: status || undefined,
        payment_method: method || undefined,
        customer_id: customer?.id || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      })
      setSales(res.data?.data || [])
      setPagination(res.data?.pagination || { total: 0, totalPages: 1, perPage: 10 })
    } catch (_) {} finally { setLoading(false) }
  }, [page, status, method, customer, dateFrom, dateTo])

  useEffect(() => { setPage(1) }, [status, method, customer, dateFrom, dateTo])
  useEffect(() => { load() }, [load])

  // Filtro de monto — aplicado del lado del cliente sobre la página cargada
  const visibleSales = sales.filter(s => {
    const total = Number(s.total)
    if (amountMin && total < parseFloat(amountMin)) return false
    if (amountMax && total > parseFloat(amountMax)) return false
    return true
  })

  const handleGenerateReceipt = async (sale) => {
    setBusyId(sale.id)
    try {
      const res = await sellerService.createReceipt({ sale_id: sale.id })
      toast.success(res.data?.message || 'Recibo generado')
    } catch (err) {
      const msg = err?.response?.data?.message
      toast[err?.response?.status === 409 ? 'success' : 'error'](msg || 'Error al generar el recibo')
    } finally { setBusyId(null) }
  }

  const handleDownloadPDF = async (sale) => {
    setBusyId(sale.id)
    try {
      const res = await sellerService.getSale(sale.id)
      printSale(res.data?.data)
    } catch (_) {
      toast.error('No se pudo generar el PDF')
    } finally { setBusyId(null) }
  }

  const handleDuplicate = async (sale) => {
    setBusyId(sale.id)
    try {
      await sellerService.duplicateSale(sale.id)
      toast.success('Venta duplicada')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al duplicar')
    } finally { setBusyId(null) }
  }

  const clearFilters = () => {
    setCustomer(null); setStatus(''); setMethod(''); setDateFrom(''); setDateTo(''); setAmountMin(''); setAmountMax('')
  }
  const hasFilters = customer || status || method || dateFrom || dateTo || amountMin || amountMax

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>Ventas</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--txt2)' }}>{pagination.total} ventas registradas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            style={{
              background: showFilters || hasFilters ? 'rgba(16,185,129,0.1)' : 'var(--bg2)',
              border: `1px solid ${showFilters || hasFilters ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
              color: showFilters || hasFilters ? 'var(--em3)' : 'var(--txt2)',
            }}>
            <Filter size={14} /> Filtros {hasFilters && `(${Object.values({ customer, status, method, dateFrom, dateTo, amountMin, amountMax }).filter(Boolean).length})`}
          </button>
          <button onClick={load} disabled={loading}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}>
            <motion.div animate={{ rotate: loading ? 360 : 0 }} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={15} />
            </motion.div>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border p-4" style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
            <div className="flex flex-wrap items-end gap-3">
              <CustomerFilter selected={customer} onSelect={setCustomer} />

              <div className="flex gap-1.5 flex-wrap">
                {STATUS_OPTS.map(s => (
                  <button key={s.id} onClick={() => setStatus(s.id)}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: status === s.id ? 'rgba(16,185,129,0.1)' : 'var(--bg3)',
                      border: `1px solid ${status === s.id ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
                      color: status === s.id ? 'var(--em3)' : 'var(--txt2)',
                    }}>{s.label}</button>
                ))}
              </div>

              <select value={method} onChange={e => setMethod(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}>
                {METHOD_OPTS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>

              <div className="flex items-center gap-1.5">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }} />
                <span className="text-xs" style={{ color: 'var(--txt3)' }}>a</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }} />
              </div>

              <div className="flex items-center gap-1.5">
                <input type="number" value={amountMin} onChange={e => setAmountMin(e.target.value)} placeholder="Monto mín"
                  className="w-24 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }} />
                <span className="text-xs" style={{ color: 'var(--txt3)' }}>—</span>
                <input type="number" value={amountMax} onChange={e => setAmountMax(e.target.value)} placeholder="Monto máx"
                  className="w-24 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }} />
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="text-xs px-3 py-2.5 rounded-xl transition-all"
                  style={{ color: '#FCA5A5' }}>Limpiar</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)', background: 'var(--bg3)' }}>
                {['ID', 'Cliente', 'Fecha', 'Método', 'Estado', 'Monto', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border2)' }}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 rounded-lg animate-pulse" style={{ background: 'var(--bg4)', width: j === 1 ? '140px' : '60px' }} /></td>
                    ))}
                  </tr>
                ))
              ) : visibleSales.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16" style={{ color: 'var(--txt3)' }}>
                  <Receipt size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No se encontraron ventas</p>
                </td></tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {visibleSales.map((sale, i) => {
                    const st = STATUS_STYLE[sale.status] || STATUS_STYLE.pending
                    const busy = busyId === sale.id
                    return (
                      <motion.tr key={sale.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        style={{ borderBottom: '1px solid var(--border2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-4 py-3.5 text-xs font-mono" style={{ color: 'var(--txt3)' }}>#{sale.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm" style={{ color: 'var(--txt)' }}>{sale.first_name} {sale.last_name}</p>
                          {sale.customer_email && <p className="text-xs" style={{ color: 'var(--txt3)' }}>{sale.customer_email}</p>}
                        </td>
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: 'var(--txt3)' }}>{fmtDate(sale.created_at)}</td>
                        <td className="px-4 py-3.5 text-xs capitalize" style={{ color: 'var(--txt2)' }}>{sale.payment_method}</td>
                        <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-md" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                        <td className="px-4 py-3.5 font-display font-bold text-sm" style={{ color: 'var(--em3)' }}>{fmtMoney(sale.total)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <ActionBtn icon={Eye} title="Ver" onClick={() => setViewId(sale.id)} />
                            <ActionBtn icon={Edit2} title="Editar" onClick={() => setEditSale(sale)} />
                            <ActionBtn icon={FileText} title="Generar recibo" busy={busy} onClick={() => handleGenerateReceipt(sale)} />
                            <ActionBtn icon={Download} title="Descargar PDF" busy={busy} onClick={() => handleDownloadPDF(sale)} />
                            <ActionBtn icon={Copy} title="Duplicar" busy={busy} onClick={() => handleDuplicate(sale)} />
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border2)' }}>
            <p className="text-xs" style={{ color: 'var(--txt3)' }}>Página {pagination.page || page} de {pagination.totalPages} · {pagination.total} ventas</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-all" style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-all" style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <ViewModal saleId={viewId} onClose={() => setViewId(null)} />
      <EditModal sale={editSale} onClose={() => setEditSale(null)} onSaved={load} />
    </div>
  )
}

function ActionBtn({ icon: Icon, title, onClick, busy }) {
  return (
    <button onClick={onClick} disabled={busy} title={title}
      className="p-1.5 rounded-lg transition-all disabled:opacity-40"
      style={{ background: 'var(--bg4)', color: 'var(--txt3)' }}
      onMouseEnter={e => { if (!busy) { e.currentTarget.style.color = 'var(--em3)'; e.currentTarget.style.background = 'rgba(16,185,129,0.1)' } }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt3)'; e.currentTarget.style.background = 'var(--bg4)' }}>
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
    </button>
  )
}
