import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, TrendingUp, TrendingDown, RefreshCw,
  Plus, X, ChevronDown, ChevronRight, Calendar,
  ArrowUpRight, ArrowDownRight, Banknote, Wallet,
  BarChart3, PieChart, Download, AlertTriangle, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

const METHOD_LABEL = {
  bank_transfer: 'Transferencia',
  crypto: 'Cripto',
  manual: 'Manual',
}

export default function AdminProviderFinance() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [fundingModal, setFundingModal] = useState(null)
  const [detail, setDetail]       = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [alerts, setAlerts]       = useState([])

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get('/admin/providers/financial-summary')
      setData(res?.data ?? res)
    } catch (err) {
      toast.error('Error al cargar finanzas')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const { data: res } = await api.get('/admin/balance-alerts')
      setAlerts(res?.data ?? [])
    } catch (_) {}
  }, [])

  useEffect(() => { fetchOverview(); fetchAlerts() }, [fetchOverview, fetchAlerts])

  const openDetail = async (providerId) => {
    setDetailLoading(true)
    setDetail(null)
    try {
      const { data: res } = await api.get(`/admin/providers/${providerId}/financial`)
      setDetail(res?.data ?? res)
    } catch (err) {
      toast.error('Error al cargar detalle')
    } finally {
      setDetailLoading(false)
    }
  }

  const formatCurrency = (v) => {
    const n = parseFloat(v ?? 0)
    return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleString('es-AR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
  }

  const totals = data?.totals ?? { funded: 0, cost: 0, charge: 0, profit: 0, orders: 0 }
  const providers = data?.providers ?? []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
            Finanzas de Proveedores
          </h1>
          <p className="text-sm" style={{ color: 'var(--txt2)' }}>
            Control de recargas, costos y ganancias por proveedor.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchOverview(); fetchAlerts() }} className="p-2 rounded-xl transition-all"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}
            title="Actualizar">
            <RefreshCw size={15} />
          </button>
        </div>
      </motion.div>

      {/* ── Summary Cards ── */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Recargado', value: totals.funded, icon: Banknote, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
            { label: 'Costo en Proveedores', value: totals.cost, icon: TrendingDown, color: '#F87171', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Ganancia Neta', value: totals.profit, icon: TrendingUp, color: '#34D399', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Órdenes', value: totals.orders, icon: BarChart3, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', suffix: '' },
          ].map(({ label, value, icon: Icon, color, bg, suffix = '' }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border p-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>{label}</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <p className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-1px' }}>
                {label === 'Órdenes' ? value : formatCurrency(value)}{suffix}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Balance Alerts ── */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4 space-y-2"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} style={{ color: '#F87171' }} />
            <span className="font-display font-semibold text-sm" style={{ color: '#F87171' }}>Alertas de saldo bajo</span>
          </div>
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)' }}>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} style={{ color: a.severity === 'critical' ? '#F87171' : '#FBBF24' }} />
                <span style={{ color: 'var(--txt)' }}>{a.message}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
                style={{
                  background: a.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
                  color: a.severity === 'critical' ? '#F87171' : '#FBBF24',
                }}>
                {a.severity === 'critical' ? 'CRÍTICO' : 'ADVERTENCIA'}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Loading State ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg4)' }} />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--txt3)' }}>
          <Wallet size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No hay proveedores configurados</p>
        </div>
      ) : (
        <>
          {/* ── Per-provider table ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border2)' }}>
              <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>Detalle por Proveedor</h2>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}>
                {providers.length} proveedores
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                    {['Proveedor', 'Recargado', 'Costo', 'Facturado', 'Ganancia', 'Balance API', 'Posición Neta', 'Órdenes', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {providers.map((p, i) => (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        style={{ borderBottom: '1px solid var(--border2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{
                              background: p.status === 'active' ? '#34D399' : p.status === 'error' ? '#F87171' : 'var(--txt3)'
                            }} />
                            <span className="font-medium text-sm" style={{ color: 'var(--txt)' }}>{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: '#A78BFA' }}>{formatCurrency(p.funded)}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: '#F87171' }}>{formatCurrency(p.cost)}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--txt)' }}>{formatCurrency(p.charge)}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: p.profit >= 0 ? '#34D399' : '#F87171' }}>{formatCurrency(p.profit)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span style={{ color: parseFloat(p.balance) < 10 ? '#F87171' : 'var(--txt2)' }}>
                              {formatCurrency(p.balance)}
                            </span>
                            {parseFloat(p.balance) < 10 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                                style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171' }}>
                                BAJO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: p.net_position >= 0 ? '#34D399' : '#F87171' }}>{formatCurrency(p.net_position)}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--txt2)' }}>{p.orders}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => openDetail(p.id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: 'rgba(139,92,246,0.08)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.15)' }}>
                            Detalle
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Provider Detail Panel ── */}
          <AnimatePresence>
            {detailLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--bg4)' }} />
            )}

            {detail && !detailLoading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-2xl border overflow-hidden"
                style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border2)' }}>
                  <div className="flex items-center gap-3">
                    <Wallet size={16} style={{ color: '#A78BFA' }} />
                    <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>
                      {detail.provider?.name ?? 'Proveedor'}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', color: '#A78BFA' }}>
                      Balance API: {formatCurrency(detail.provider?.balance)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--txt3)' }}>
                      Última sync: {formatDate(detail.provider?.last_sync)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFundingModal(detail.provider)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--em3)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <Plus size={13} /> Registrar Recarga
                    </button>
                    <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg transition-all"
                      style={{ color: 'var(--txt3)' }}><X size={15} /></button>
                  </div>
                </div>

                <div className="p-5">
                  {/* Detail summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {[
                      { label: 'Total Recargado', value: detail.totals?.funded, color: '#A78BFA' },
                      { label: 'Costo Total', value: detail.totals?.cost, color: '#F87171' },
                      { label: 'Facturado', value: detail.totals?.charge, color: 'var(--txt)' },
                      { label: 'Ganancia Neta', value: detail.totals?.profit, color: '#34D399' },
                      { label: 'Posición', value: detail.totals?.net_position, color: '#60A5FA' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-4 rounded-xl" style={{ background: 'var(--bg3)', border: '1px solid var(--border2)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--txt3)' }}>{label}</p>
                        <p className="font-display font-bold text-lg" style={{ color }}>{formatCurrency(value)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Monthly breakdown */}
                  {detail.monthly?.length > 0 && (
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--txt)' }}>
                        <Calendar size={14} style={{ color: '#A78BFA' }} />
                        Evolución Mensual
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                              {['Mes', 'Órdenes', 'Costo', 'Facturado', 'Ganancia'].map(h => (
                                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {detail.monthly.map(m => (
                              <tr key={m.month} style={{ borderBottom: '1px solid var(--border2)' }}>
                                <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--txt)' }}>{m.month}</td>
                                <td className="px-4 py-2.5" style={{ color: 'var(--txt2)' }}>{m.orders}</td>
                                <td className="px-4 py-2.5 font-medium" style={{ color: '#F87171' }}>{formatCurrency(m.cost)}</td>
                                <td className="px-4 py-2.5" style={{ color: 'var(--txt)' }}>{formatCurrency(m.charge)}</td>
                                <td className="px-4 py-2.5 font-medium" style={{ color: m.profit >= 0 ? '#34D399' : '#F87171' }}>{formatCurrency(m.profit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {(!detail.monthly || detail.monthly.length === 0) && (
                    <div className="text-center py-8" style={{ color: 'var(--txt3)' }}>
                      <p className="text-sm">Sin órdenes registradas para este proveedor</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Funding Modal ── */}
      <AnimatePresence>
        {fundingModal && (
          <FundingModal
            provider={fundingModal}
            onClose={() => setFundingModal(null)}
            onSaved={() => { setFundingModal(null); fetchOverview(); fetchAlerts(); if (detail?.provider?.id === fundingModal.id) openDetail(fundingModal.id) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function FundingModal({ provider, onClose, onSaved }) {
  const [form, setForm] = useState({ amount: '', method: 'bank_transfer', reference: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) { toast.error('Ingresá un monto válido'); return }
    setLoading(true)
    try {
      await api.post(`/admin/providers/${provider.id}/funding`, form)
      toast.success('Recarga registrada')
      onSaved()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: .95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border p-6 space-y-5"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote size={16} style={{ color: 'var(--em3)' }} />
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>
              Recarga a {provider?.name}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--txt3)' }}><X size={18} /></button>
        </div>

        <div>
          <label className="block text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>Monto (USD)</label>
          <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
            placeholder="0.00" type="number" step="0.01" min="0"
            className="w-full px-4 py-2.5 rounded-xl text-lg font-display font-bold outline-none transition-all"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
        </div>

        <div>
          <label className="block text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>Método</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'bank_transfer', label: 'Transferencia' },
              { id: 'crypto', label: 'Cripto' },
              { id: 'manual', label: 'Manual' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setForm(p => ({ ...p, method: id }))}
                className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: form.method === id ? 'rgba(16,185,129,0.1)' : 'var(--bg3)',
                  border: `1px solid ${form.method === id ? 'rgba(16,185,129,0.3)' : 'var(--border2)'}`,
                  color: form.method === id ? 'var(--em3)' : 'var(--txt3)',
                }}>{label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>Referencia (opcional)</label>
          <input value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
            placeholder="ID de transacción, hash, etc."
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
        </div>

        <div>
          <label className="block text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>Notas (opcional)</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Notas sobre esta recarga..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
          onClick={handleSubmit} disabled={loading || !form.amount || parseFloat(form.amount) <= 0}
          className="w-full py-3 rounded-xl font-display font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'var(--em)', color: '#000' }}>
          {loading ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Registrando...</>
            : <><Plus size={15} /> Registrar Recarga</>}
        </motion.button>
      </motion.div>
    </div>
  )
}