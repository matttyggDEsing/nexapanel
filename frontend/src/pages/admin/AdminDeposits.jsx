// src/pages/admin/AdminDeposits.jsx — ARCHIVO NUEVO
// Panel para que el admin apruebe o rechace solicitudes de depósito

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, CheckCircle, XCircle, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmModal'

const STATUS_CFG = {
  pending:   { label:'Pendiente',  bg:'rgba(245,158,11,0.12)',  color:'#FCD34D' },
  completed: { label:'Completado', bg:'rgba(16,185,129,0.12)',  color:'#34D399' },
  rejected:  { label:'Rechazado',  bg:'rgba(239,68,68,0.12)',   color:'#FCA5A5' },
  expired:   { label:'Vencido',    bg:'rgba(100,116,139,0.12)', color:'var(--txt3)' },
}

const METHOD_LABEL = {
  manual: 'Transferencia',
  crypto: 'Cripto (USDT)',
  paypal: 'PayPal',
  stripe: 'Stripe',
}

export default function AdminDeposits() {
  const [deposits, setDeposits]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [pagination, setPagination] = useState({ page:1, totalPages:1, total:0 })
  const [processing, setProcessing] = useState({})
  const { confirm, modal } = useConfirm()

  const fetchDeposits = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/deposits', {
        params: {
          page: pagination.page,
          perPage: 15,
          status: statusFilter || undefined,
        },
      })
      setDeposits(data?.data ?? [])
      if (data?.pagination) setPagination(data.pagination)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [pagination.page, statusFilter])

  useEffect(() => { fetchDeposits() }, [pagination.page, statusFilter]) // eslint-disable-line

  const approve = async (deposit) => {
    const confirmed = await confirm(
      'Aprobar depósito',
      `¿Aprobar depósito de $${deposit.amount} (${METHOD_LABEL[deposit.method] ?? deposit.method}) de ${deposit.user_email}?\n\nSe acreditará el saldo inmediatamente.`,
      { confirmText: 'Aprobar' }
    )
    if (!confirmed) return
    setProcessing(p => ({ ...p, [deposit.id]: 'approving' }))
    try {
      const { data } = await api.post(`/admin/deposits/${deposit.id}/approve`)
      toast.success(`Depósito aprobado. Nuevo balance: $${parseFloat(data?.data?.newBalance ?? 0).toFixed(2)}`)
      fetchDeposits()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al aprobar')
    } finally {
      setProcessing(p => ({ ...p, [deposit.id]: null }))
    }
  }

  const reject = async (deposit) => {
    const confirmed = await confirm(
      'Rechazar depósito',
      `¿Rechazar depósito de $${deposit.amount} de ${deposit.user_email}?`,
      { confirmText: 'Rechazar', variant: 'danger' }
    )
    if (!confirmed) return
    setProcessing(p => ({ ...p, [deposit.id]: 'rejecting' }))
    try {
      await api.post(`/admin/deposits/${deposit.id}/reject`, { reason })
      toast.success('Depósito rechazado')
      fetchDeposits()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al rechazar')
    } finally {
      setProcessing(p => ({ ...p, [deposit.id]: null }))
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
            Solicitudes de Depósito
          </h1>
          <p className="text-sm" style={{ color:'var(--txt2)' }}>
            Aprobá o rechazá los depósitos pendientes de los usuarios.
          </p>
        </div>
        <button onClick={fetchDeposits} className="p-2 rounded-xl transition-all"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <RefreshCw size={15}/>
        </button>
      </motion.div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value:'',          label:'Todos'      },
          { value:'pending',   label:'Pendientes' },
          { value:'completed', label:'Aprobados'  },
          { value:'rejected',  label:'Rechazados' },
        ].map(({ value, label }) => (
          <button key={value}
            onClick={() => { setStatusFilter(value); setPagination(p=>({...p,page:1})) }}
            className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: statusFilter===value ? 'rgba(16,185,129,0.1)' : 'var(--bg2)',
              border:`1px solid ${statusFilter===value ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
              color: statusFilter===value ? 'var(--em3)' : 'var(--txt2)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border2)', background:'var(--bg3)' }}>
                {['ID','Usuario','Monto','Método','Estado','Referencia','Fecha','Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color:'var(--txt3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border2)' }}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background:'var(--bg4)', width:j===1?'120px':'60px' }}/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16" style={{ color:'var(--txt3)' }}>
                    <DollarSign size={32} className="mx-auto mb-3 opacity-30"/>
                    <p className="text-sm">No hay solicitudes {statusFilter === 'pending' ? 'pendientes' : 'en esta categoría'}</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {deposits.map((d, i) => {
                    const sc = STATUS_CFG[d.status] ?? STATUS_CFG.pending
                    const isProcessing = !!processing[d.id]
                    return (
                      <motion.tr key={d.id}
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        exit={{ opacity:0 }} transition={{ delay:i*.03 }}
                        style={{ borderBottom:'1px solid var(--border2)' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color:'var(--txt3)' }}>#{d.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium" style={{ color:'var(--txt)' }}>{d.user_name}</p>
                          <p className="text-xs" style={{ color:'var(--txt3)' }}>{d.user_email}</p>
                        </td>
                        <td className="px-4 py-3 font-display font-bold text-sm" style={{ color:'var(--em3)' }}>
                          ${parseFloat(d.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--txt2)' }}>
                          {METHOD_LABEL[d.method] ?? d.method}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ background:sc.bg, color:sc.color }}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color:'var(--txt3)' }}>
                          {d.external_ref || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--txt2)' }}>
                          {formatDate(d.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          {d.status === 'pending' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => approve(d)}
                                disabled={isProcessing}
                                title="Aprobar depósito"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                                style={{ background:'rgba(16,185,129,0.1)', color:'#34D399', border:'1px solid rgba(16,185,129,0.2)' }}>
                                {processing[d.id]==='approving'
                                  ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"/>
                                  : <CheckCircle size={13}/>
                                }
                                Aprobar
                              </button>
                              <button
                                onClick={() => reject(d)}
                                disabled={isProcessing}
                                title="Rechazar depósito"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                                style={{ background:'rgba(239,68,68,0.08)', color:'#F87171', border:'1px solid rgba(239,68,68,0.15)' }}>
                                {processing[d.id]==='rejecting'
                                  ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"/>
                                  : <XCircle size={13}/>
                                }
                                Rechazar
                              </button>
                            </div>
                          )}
                          {d.status !== 'pending' && (
                            <span className="text-xs" style={{ color:'var(--txt3)' }}>—</span>
                          )}
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
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor:'var(--border2)' }}>
            <p className="text-xs" style={{ color:'var(--txt3)' }}>Página {pagination.page} de {pagination.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPagination(p=>({...p,page:p.page-1}))} disabled={pagination.page===1}
                className="p-1.5 rounded-lg disabled:opacity-30" style={{ background:'var(--bg3)', color:'var(--txt2)' }}>
                <ChevronLeft size={14}/>
              </button>
              <button onClick={() => setPagination(p=>({...p,page:p.page+1}))} disabled={pagination.page===pagination.totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30" style={{ background:'var(--bg3)', color:'var(--txt2)' }}>
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      {modal}
      </motion.div>
    </div>
  )
}
