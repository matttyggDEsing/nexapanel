import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

const STATUS_CFG = {
  completed:  { label:'Completada', cls:'badge-completed' },
  active:     { label:'Activa',     cls:'badge-active'    },
  pending:    { label:'Pendiente',  cls:'badge-pending'   },
  cancelled:  { label:'Cancelada',  cls:'badge-cancelled' },
  processing: { label:'Procesando', cls:'badge-processing'},
  partial:    { label:'Parcial',    cls:'badge-processing'},
}

export default function AdminOrders() {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page:1, totalPages:1, total:0 })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/orders', {
        params: { page: pagination.page, perPage: 15, search: search || undefined, status: statusFilter || undefined }
      })
      setOrders(data?.data ?? data?.orders ?? [])
      if (data?.pagination) setPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching orders:', err)
      toast.error('Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, search, statusFilter])

  useEffect(() => { fetchOrders() }, [pagination.page, search, statusFilter]) // eslint-disable-line

  const handleAction = async (orderId, action) => {
    try {
      await api.post(`/admin/orders/${orderId}/${action}`)
      toast.success(`Orden ${action === 'cancel' ? 'cancelada' : 'completada'}`)
      fetchOrders()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al procesar la acción')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
          Órdenes (Global)
        </h1>
        <p className="text-sm" style={{ color:'var(--txt2)' }}>
          {loading ? '—' : `${pagination.total} órdenes en total`}
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--txt3)' }}/>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') { setSearch(searchInput); setPagination(p=>({...p,page:1})) } }}
            placeholder="ID, usuario, enlace... (Enter)"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt)', caretColor:'var(--em)' }}
            onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor='var(--border2)'}
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'var(--txt3)' }}>
              <X size={12}/>
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['','pending','active','processing','completed','cancelled'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPagination(p=>({...p,page:1})) }}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: statusFilter===s ? 'rgba(16,185,129,0.1)' : 'var(--bg2)',
                border:`1px solid ${statusFilter===s ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
                color: statusFilter===s ? 'var(--em3)' : 'var(--txt2)',
              }}>
              {s === '' ? 'Todas' : STATUS_CFG[s]?.label ?? s}
            </button>
          ))}
        </div>
        <button onClick={fetchOrders} className="p-2.5 rounded-xl transition-all"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <RefreshCw size={14}/>
        </button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border2)', background:'var(--bg3)' }}>
                {['ID','Usuario','Servicio','Enlace','Qty','Progreso','Estado','Monto','Ganancia','Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color:'var(--txt3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border2)' }}>
                    {[...Array(10)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background:'var(--bg4)', width:j===2?'120px':'60px' }}/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16" style={{ color:'var(--txt3)' }}>
                    <p className="text-sm">No se encontraron órdenes</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {orders.map((o, i) => {
                    const qty     = Number(o.quantity ?? 0)
                    const remains = Number(o.remains ?? 0)
                    const pct     = qty > 0 ? Math.round(((qty-remains)/qty)*100) : 0
                    return (
                      <motion.tr key={o.id}
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        exit={{ opacity:0 }} transition={{ delay:i*.03 }}
                        style={{ borderBottom:'1px solid var(--border2)' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color:'var(--txt3)' }}>#{o.id}</td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--txt2)' }}>
                          {o.user_name ?? o.user_email ?? '—'}
                        </td>
                        <td className="px-4 py-3 max-w-36">
                          <p className="text-xs truncate" style={{ color:'var(--txt)' }}>{o.service_name ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 max-w-24">
                          <p className="text-xs truncate" style={{ color:'var(--txt3)' }}>{o.link}</p>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--txt2)' }}>
                          {qty.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 min-w-24">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'var(--bg4)' }}>
                              <div className="h-full rounded-full"
                                style={{ width:`${pct}%`, background: pct===100?'#10B981':pct>50?'#60A5FA':'#FCD34D' }}/>
                            </div>
                            <span className="text-xs font-mono" style={{ color:'var(--txt3)' }}>{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_CFG[o.status]?.cls ?? 'badge-pending'}`}>
                            {STATUS_CFG[o.status]?.label ?? o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-display font-bold text-xs" style={{ color:'var(--em3)' }}>
                          ${Number(o.charge ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color:'#A78BFA' }}>
                          ${Number(o.profit ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {['pending','active','processing'].includes(o.status) && (
                            <button onClick={() => handleAction(o.id, 'cancel')}
                              className="text-xs px-2 py-1 rounded-lg transition-all"
                              style={{ background:'rgba(239,68,68,0.08)', color:'#F87171', border:'1px solid rgba(239,68,68,0.15)' }}>
                              Cancelar
                            </button>
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
      </motion.div>
    </div>
  )
}
