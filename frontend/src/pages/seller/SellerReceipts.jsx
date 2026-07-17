// src/pages/seller/SellerReceipts.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, RefreshCw, Search, ChevronLeft, ChevronRight,
  Eye, Printer, Download, X, Loader2, Plus, FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sellerService } from '@/services/sellerService'
import { useAuthStore } from '@/store/authStore'

const STATUS_STYLE = {
  paid:     { bg: 'rgba(16,185,129,0.12)',  color: '#34D399',  label: 'Pagado' },
  pending:  { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D',  label: 'Pendiente' },
  cancelled:{ bg: 'rgba(239,68,68,0.12)',  color: '#FCA5A5',  label: 'Cancelado' },
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`

const escapeHtml = (str) => {
  if (str == null) return ''
  return String(str).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]))
}

// ── Generador de HTML para impresión/PDF ──────────────────────────────────────
function buildReceiptHTML(receipt, sellerName) {
  const items = receipt.items || []
  const rows = items.map(it => `
    <tr>
      <td>${escapeHtml(it.service_name) || '—'}</td>
      <td style="text-align:center">${it.quantity}</td>
      <td style="text-align:right">$${Number(it.unit_price).toFixed(2)}</td>
      <td style="text-align:right">$${Number(it.subtotal).toFixed(2)}</td>
    </tr>`).join('')

  const statusLabel = STATUS_STYLE[receipt.status]?.label || receipt.status

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Recibo ${escapeHtml(receipt.receipt_number)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      color: #111;
      padding: 40px;
      max-width: 680px;
      margin: 0 auto;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 2px solid #10B981;
    }
    .company { font-size: 20px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
    .receipt-title { font-size: 13px; color: #666; margin-top: 3px; }
    .receipt-number { font-size: 22px; font-weight: 800; color: #10B981; }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .meta-block label { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #999; display: block; margin-bottom: 3px; }
    .meta-block strong { font-size: 13px; color: #111; }
    .meta-block p { font-size: 12px; color: #666; margin-top: 1px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    thead tr { background: #f5f5f5; }
    th {
      text-align: left; padding: 8px 10px;
      font-size: 10px; text-transform: uppercase;
      letter-spacing: .06em; color: #666;
      border-bottom: 1px solid #e5e5e5;
    }
    td { padding: 9px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
    .total-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 24px;
      padding: 16px 0;
      border-top: 2px solid #10B981;
      margin-top: 4px;
    }
    .total-label { font-size: 13px; font-weight: 600; color: #666; }
    .total-value { font-size: 24px; font-weight: 800; color: #10B981; }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-paid      { background: #d1fae5; color: #065f46; }
    .badge-pending   { background: #fef3c7; color: #92400e; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }
    .notes-block {
      margin-top: 20px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
      font-size: 12px;
      color: #555;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-size: 11px;
      color: #aaa;
    }
    @media print {
      body { padding: 20px; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">NexaPanel</div>
      <div class="receipt-title">Recibo de venta</div>
    </div>
    <div style="text-align:right">
      <div class="receipt-number">${escapeHtml(receipt.receipt_number)}</div>
      <div style="font-size:12px;color:#666;margin-top:4px">${fmtDate(receipt.created_at)}</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <label>Cliente</label>
      <strong>${escapeHtml(receipt.first_name)} ${escapeHtml(receipt.last_name)}</strong>
      ${receipt.customer_email ? `<p>${escapeHtml(receipt.customer_email)}</p>` : ''}
      ${receipt.whatsapp ? `<p>📱 ${escapeHtml(receipt.whatsapp)}</p>` : ''}
    </div>
    <div class="meta-block">
      <label>Vendedor</label>
      <strong>${escapeHtml(receipt.seller_name || sellerName || '—')}</strong>
      ${receipt.seller_email ? `<p>${escapeHtml(receipt.seller_email)}</p>` : ''}
    </div>
    <div class="meta-block">
      <label>Método de pago</label>
      <strong>${escapeHtml(receipt.payment_method)}</strong>
    </div>
    <div class="meta-block">
      <label>Estado</label>
      <span class="badge badge-${receipt.status}">${escapeHtml(statusLabel)}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Servicio</th>
        <th style="text-align:center">Cant.</th>
        <th style="text-align:right">Precio</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="total-row">
    <span class="total-label">Total</span>
    <span class="total-value">$${Number(receipt.total).toFixed(2)}</span>
  </div>

  ${receipt.notes ? `<div class="notes-block"><strong>Observaciones:</strong> ${escapeHtml(receipt.notes)}</div>` : ''}

  <div class="footer">
    NexaPanel — generado el ${new Date().toLocaleString('es-AR')} · ${escapeHtml(receipt.receipt_number)}
  </div>
</body>
</html>`
}

function printReceipt(receipt, sellerName) {
  const html = buildReceiptHTML(receipt, sellerName)
  const w = window.open('', '_blank')
  if (!w) { toast.error('Habilitá las ventanas emergentes para imprimir'); return }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}

// ── Modal: detalle de recibo ──────────────────────────────────────────────────
function ReceiptModal({ receiptId, sellerName, onClose }) {
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!receiptId) return
    setLoading(true)
    sellerService.getReceipt(receiptId)
      .then(r => setReceipt(r.data?.data))
      .catch(() => toast.error('No se pudo cargar el recibo'))
      .finally(() => setLoading(false))
  }, [receiptId])

  if (!receiptId) return null
  const st = receipt ? (STATUS_STYLE[receipt.status] || STATUS_STYLE.paid) : null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border overflow-hidden"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>

          {/* Modal header */}
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border2)' }}>
            <div>
              <h2 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>
                {receipt ? receipt.receipt_number : 'Recibo'}
              </h2>
              {receipt && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--txt3)' }}>{fmtDate(receipt.created_at)}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {receipt && (
                <>
                  <button
                    onClick={() => printReceipt(receipt, sellerName)}
                    title="Imprimir"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}>
                    <Printer size={13} />
                    Imprimir
                  </button>
                  <button
                    onClick={() => printReceipt(receipt, sellerName)}
                    title="Descargar PDF"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--em3)' }}>
                    <Download size={13} />
                    PDF
                  </button>
                </>
              )}
              <button onClick={onClose} style={{ color: 'var(--txt3)' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin" style={{ color: 'var(--txt3)' }} />
              </div>
            ) : !receipt ? (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--txt3)' }}>No se encontró el recibo.</p>
            ) : (
              <>
                {/* Status + total */}
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                  <span className="font-display font-bold text-2xl" style={{ color: 'var(--em3)' }}>
                    {fmtMoney(receipt.total)}
                  </span>
                </div>

                {/* Cliente y vendedor */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Cliente',
                      name: `${receipt.first_name} ${receipt.last_name}`,
                      sub: receipt.customer_email || receipt.whatsapp || '',
                    },
                    {
                      label: 'Vendedor',
                      name: receipt.seller_name || sellerName || '—',
                      sub: receipt.seller_email || '',
                    },
                  ].map(b => (
                    <div key={b.label} className="rounded-xl p-3 border" style={{ borderColor: 'var(--border2)', background: 'var(--bg3)' }}>
                      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--txt3)' }}>{b.label}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>{b.name}</p>
                      {b.sub && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--txt3)' }}>{b.sub}</p>}
                    </div>
                  ))}
                </div>

                {/* Método de pago */}
                <div className="rounded-xl p-3 border flex items-center justify-between"
                  style={{ borderColor: 'var(--border2)', background: 'var(--bg3)' }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>Método de pago</p>
                  <span className="text-sm" style={{ color: 'var(--txt)' }}>{receipt.payment_method}</span>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--txt3)' }}>
                    Servicios
                  </p>
                  <div className="rounded-xl border divide-y overflow-hidden"
                    style={{ borderColor: 'var(--border2)', divideColor: 'var(--border2)' }}>
                    {(receipt.items || []).map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5"
                        style={{ borderBottom: i < receipt.items.length - 1 ? '1px solid var(--border2)' : 'none' }}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate" style={{ color: 'var(--txt)' }}>{item.service_name}</p>
                          <p className="text-xs" style={{ color: 'var(--txt3)' }}>
                            {item.quantity} × {fmtMoney(item.unit_price)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold ml-3 flex-shrink-0" style={{ color: 'var(--em3)' }}>
                          {fmtMoney(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-3 py-3"
                      style={{ background: 'rgba(16,185,129,0.04)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--txt2)' }}>Total</span>
                      <span className="font-display font-bold text-lg" style={{ color: 'var(--em3)' }}>
                        {fmtMoney(receipt.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {receipt.notes && (
                  <div className="rounded-xl p-3 border" style={{ borderColor: 'var(--border2)', background: 'var(--bg3)' }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--txt3)' }}>Observaciones</p>
                    <p className="text-xs" style={{ color: 'var(--txt2)' }}>{receipt.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Modal: generar recibo a partir de una venta ───────────────────────────────
function GenerateModal({ onClose, onCreated }) {
  const [salesQuery, setSalesQuery] = useState('')
  const [sales, setSales]           = useState([])
  const [loadingSales, setLoadingSales] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [notes, setNotes]           = useState('')
  const [status, setStatus]         = useState('paid')
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    setLoadingSales(true)
    sellerService.getSales({ page: 1, perPage: 20, search: salesQuery || undefined })
      .then(r => setSales(r.data?.data || []))
      .catch(() => setSales([]))
      .finally(() => setLoadingSales(false))
  }, [salesQuery])

  const handleCreate = async () => {
    if (!selectedSale) { toast.error('Seleccioná una venta'); return }
    setSaving(true)
    try {
      await sellerService.createReceipt({ sale_id: selectedSale.id, notes, status })
      toast.success('Recibo generado')
      onCreated()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al generar recibo')
    } finally { setSaving(false) }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border p-6 space-y-4"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>Generar recibo</h2>
            <button onClick={onClose} style={{ color: 'var(--txt3)' }}><X size={18} /></button>
          </div>

          {/* Buscar venta */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>
              Seleccionar venta
            </label>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
              <input value={salesQuery} onChange={e => setSalesQuery(e.target.value)}
                placeholder="Buscar por cliente..."
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              />
            </div>
            <div className="rounded-xl border overflow-y-auto" style={{ borderColor: 'var(--border2)', maxHeight: 200 }}>
              {loadingSales ? (
                <div className="py-6 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--txt3)' }} />
                </div>
              ) : sales.length === 0 ? (
                <p className="text-center py-6 text-sm" style={{ color: 'var(--txt3)' }}>Sin ventas</p>
              ) : (
                sales.map((s, i) => (
                  <button key={s.id}
                    onClick={() => setSelectedSale(s)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-all"
                    style={{
                      borderBottom: i < sales.length - 1 ? '1px solid var(--border2)' : 'none',
                      background: selectedSale?.id === s.id ? 'rgba(16,185,129,0.08)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (selectedSale?.id !== s.id) e.currentTarget.style.background = 'var(--bg3)' }}
                    onMouseLeave={e => { if (selectedSale?.id !== s.id) e.currentTarget.style.background = 'transparent' }}>
                    <div className="min-w-0">
                      <p className="text-sm" style={{ color: 'var(--txt)' }}>
                        #{s.id} · {s.first_name} {s.last_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--txt3)' }}>{fmtDate(s.created_at)}</p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--em3)' }}>
                      {fmtMoney(s.total)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Estado del recibo</label>
            <div className="flex gap-2">
              {[
                { id: 'paid',     label: 'Pagado' },
                { id: 'pending',  label: 'Pendiente' },
                { id: 'cancelled',label: 'Cancelado' },
              ].map(s => (
                <button key={s.id} onClick={() => setStatus(s.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: status === s.id ? (STATUS_STYLE[s.id]?.bg || 'var(--bg3)') : 'var(--bg3)',
                    color: status === s.id ? STATUS_STYLE[s.id]?.color : 'var(--txt3)',
                    border: `1px solid ${status === s.id ? 'transparent' : 'var(--border2)'}`,
                  }}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Observaciones</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={!selectedSale || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-display flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--em)', color: '#000' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {saving ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SellerReceipts() {
  const { user } = useAuthStore()

  const [receipts, setReceipts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })

  const [viewId, setViewId]           = useState(null)
  const [showGenerate, setShowGenerate] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sellerService.getReceipts({ page, perPage: 12 })
      setReceipts(res.data?.data || [])
      setPagination(res.data?.pagination || { total: 0, totalPages: 1 })
    } catch (_) {} finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
            Recibos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--txt2)' }}>
            {loading ? '—' : `${pagination.total} recibos generados`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}>
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all"
            style={{ background: 'var(--em)', color: '#000' }}>
            <Plus size={15} />
            Generar recibo
          </button>
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)', background: 'var(--bg3)' }}>
                {['Número', 'Cliente', 'Método', 'Estado', 'Total', 'Fecha', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--txt3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border2)' }}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded-lg animate-pulse"
                          style={{ background: 'var(--bg4)', width: j === 1 ? '120px' : '70px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16" style={{ color: 'var(--txt3)' }}>
                    <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm mb-1">No hay recibos todavía</p>
                    <p className="text-xs">Generá el primero desde una venta existente</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {receipts.map((r, i) => {
                    const st = STATUS_STYLE[r.status] || STATUS_STYLE.paid
                    return (
                      <motion.tr key={r.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        style={{ borderBottom: '1px solid var(--border2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                        <td className="px-4 py-3.5">
                          <span className="text-xs font-mono font-semibold" style={{ color: 'var(--em3)' }}>
                            {r.receipt_number}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="text-sm" style={{ color: 'var(--txt)' }}>
                            {r.first_name} {r.last_name}
                          </p>
                          {r.customer_email && (
                            <p className="text-xs truncate max-w-32" style={{ color: 'var(--txt3)' }}>{r.customer_email}</p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--txt2)' }}>
                          {r.payment_method}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-display font-bold text-sm"
                          style={{ color: 'var(--em3)' }}>
                          {fmtMoney(r.total)}
                        </td>

                        <td className="px-4 py-3.5 text-xs whitespace-nowrap"
                          style={{ color: 'var(--txt2)' }}>
                          {fmtDate(r.created_at)}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewId(r.id)}
                              title="Ver recibo"
                              className="p-1.5 rounded-lg transition-all"
                              style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--txt)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt2)'; e.currentTarget.style.borderColor = 'var(--border2)' }}>
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await sellerService.getReceipt(r.id)
                                  printReceipt(res.data?.data, user?.name)
                                } catch { toast.error('Error al cargar el recibo') }
                              }}
                              title="Imprimir / Descargar PDF"
                              className="p-1.5 rounded-lg transition-all"
                              style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--em3)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt2)'; e.currentTarget.style.borderColor = 'var(--border2)' }}>
                              <Printer size={13} />
                            </button>
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

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border2)' }}>
            <p className="text-xs" style={{ color: 'var(--txt3)' }}>
              Página {page} de {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modales */}
      {viewId && (
        <ReceiptModal
          receiptId={viewId}
          sellerName={user?.name}
          onClose={() => setViewId(null)}
        />
      )}

      {showGenerate && (
        <GenerateModal
          onClose={() => setShowGenerate(false)}
          onCreated={load}
        />
      )}
    </div>
  )
}
