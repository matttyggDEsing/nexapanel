import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, RefreshCw, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'

const STATUS_CFG = {
  completed:  { label: 'Completada',  cls: 'badge-completed' },
  active:     { label: 'Activa',      cls: 'badge-active'    },
  pending:    { label: 'Pendiente',   cls: 'badge-pending'   },
  cancelled:  { label: 'Cancelada',   cls: 'badge-cancelled' },
  processing: { label: 'Procesando',  cls: 'badge-processing'},
  partial:    { label: 'Parcial',     cls: 'badge-processing'},
}

export default function OrdersPage() {
  const { orders, stats, loading, statsLoading, pagination, params, setParams, refresh } = useOrders({ perPage: 10 })
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e) => {
    if (e.key === 'Enter') setParams({ search: searchInput })
  }
  const clearSearch = () => { setSearchInput(''); setParams({ search: '' }) }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
          Mis Órdenes
        </h1>
        <p className="text-sm" style={{ color:'var(--txt2)' }}>Historial completo de todas tus órdenes.</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total',       value: statsLoading ? '—' : (stats?.total ?? 0),     color:'#60A5FA' },
          { label:'Activas',     value: statsLoading ? '—' : (stats?.active ?? 0),    color:'#10B981' },
          { label:'Pendientes',  value: statsLoading ? '—' : (stats?.pending ?? 0),   color:'#FCD34D' },
          { label:'Completadas', value: statsLoading ? '—' : (stats?.completed ?? 0), color:'#A78BFA' },
        ].map(({ label, value, color }) => (
          <motion.div key={label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="rounded-xl border p-3 text-center"
            style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
            <p className="font-display font-bold text-xl" style={{ color, letterSpacing:'-0.5px' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color:'var(--txt3)' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }}
        className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--txt3)' }} />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={handleSearch}
            placeholder="Buscar ID, servicio... (Enter)"
            className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt)', caretColor:'var(--em)' }}
            onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor='var(--border2)'}
          />
          {searchInput && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'var(--txt3)' }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key:'',           label:'Todas'       },
            { key:'active',     label:'Activas'     },
            { key:'pending',    label:'Pendientes'  },
            { key:'processing', label:'Procesando'  },
            { key:'completed',  label:'Completadas' },
            { key:'cancelled',  label:'Canceladas'  },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setParams({ status: key || undefined })}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: (params.status ?? '') === key ? 'rgba(16,185,129,0.1)' : 'var(--bg2)',
                border:`1px solid ${(params.status ?? '') === key ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
                color: (params.status ?? '') === key ? 'var(--em3)' : 'var(--txt2)',
              }}>{label}</button>
          ))}
        </div>

        <button onClick={refresh} disabled={loading}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ml-auto"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <motion.div animate={{ rotate: loading ? 360 : 0 }}
            transition={{ duration:1, repeat: loading ? Infinity : 0, ease:'linear' }}>
            <RefreshCw size={14} />
          </motion.div>
          Actualizar
        </button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border2)', background:'var(--bg3)' }}>
                {['ID','Servicio','Enlace','Progreso','Estado','Monto','Fecha',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color:'var(--txt3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border2)' }}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded-lg animate-pulse" style={{ background:'var(--bg4)', width: j===1?'140px':'60px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16" style={{ color:'var(--txt3)' }}>
                    <p className="text-3xl mb-3">📦</p>
                    <p className="text-sm">No se encontraron órdenes</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {orders.map((order, i) => {
                    const qty      = Number(order.quantity ?? 0)
                    const remains  = Number(order.remains  ?? 0)
                    const start    = Number(order.start_count ?? 0)
                    const done     = qty - remains
                    const pct      = qty > 0 ? Math.round((done / qty) * 100) : 0
                    const dateStr  = order.created_at
                      ? new Date(order.created_at).toLocaleString('es', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
                      : '—'
                    return (
                      <motion.tr key={order.id}
                        initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                        exit={{ opacity:0 }} transition={{ duration:.2, delay:i*.03 }}
                        style={{ borderBottom:'1px solid var(--border2)' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td className="px-4 py-3.5 text-xs font-mono" style={{ color:'var(--txt3)' }}>#{order.id}</td>
                        <td className="px-4 py-3.5 max-w-44">
                          <p className="text-sm truncate" style={{ color:'var(--txt)' }}>
                            {order.service_name ?? order.service ?? '—'}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color:'var(--txt3)' }}>
                            Cant: {qty.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 max-w-28">
                          <a href={order.link?.startsWith('http') ? order.link : `https://${order.link}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs hover:underline"
                            style={{ color:'var(--txt3)' }}>
                            <span className="truncate max-w-20">{order.link}</span>
                            <ExternalLink size={10} className="flex-shrink-0" />
                          </a>
                        </td>
                        <td className="px-4 py-3.5 min-w-28">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'var(--bg4)' }}>
                              <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
                                transition={{ duration:.8, delay:.2+i*.04 }}
                                className="h-full rounded-full"
                                style={{ background: pct===100?'#10B981':pct>50?'#60A5FA':'#FCD34D' }} />
                            </div>
                            <span className="text-xs font-mono flex-shrink-0" style={{ color:'var(--txt3)' }}>{pct}%</span>
                          </div>
                          <p className="text-xs mt-1" style={{ color:'var(--txt3)' }}>Resto: {remains.toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`badge ${STATUS_CFG[order.status]?.cls ?? 'badge-pending'}`}>
                            {STATUS_CFG[order.status]?.label ?? order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-display font-bold text-sm" style={{ color:'var(--em3)' }}>
                          ${Number(order.charge ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color:'var(--txt3)' }}>
                          {dateStr}
                        </td>
                        <td className="px-4 py-3.5">
                          <button className="text-xs px-2.5 py-1 rounded-lg transition-all"
                            style={{ background:'var(--bg4)', color:'var(--txt3)', border:'1px solid var(--border2)' }}
                            onMouseEnter={e => { e.target.style.borderColor='rgba(16,185,129,0.3)'; e.target.style.color='var(--em3)' }}
                            onMouseLeave={e => { e.target.style.borderColor='var(--border2)'; e.target.style.color='var(--txt3)' }}>
                            Ver
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor:'var(--border2)' }}>
            <p className="text-xs" style={{ color:'var(--txt3)' }}>
              Mostrando {((pagination.page-1)*pagination.perPage)+1}–{Math.min(pagination.page*pagination.perPage, pagination.total)} de {pagination.total}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setParams({ page: pagination.page-1 })} disabled={pagination.page===1}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-all"
                style={{ background:'var(--bg3)', color:'var(--txt2)' }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const p = pagination.page <= 3
                  ? i + 1
                  : pagination.page >= pagination.totalPages - 2
                    ? pagination.totalPages - 4 + i
                    : pagination.page - 2 + i
                if (p < 1 || p > pagination.totalPages) return null
                return (
                  <button key={p} onClick={() => setParams({ page: p })}
                    className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: p===pagination.page ? 'rgba(16,185,129,0.12)' : 'var(--bg3)',
                      color: p===pagination.page ? 'var(--em3)' : 'var(--txt2)',
                      border:`1px solid ${p===pagination.page ? 'rgba(16,185,129,0.25)' : 'transparent'}`,
                    }}>{p}</button>
                )
              })}
              <button onClick={() => setParams({ page: pagination.page+1 })} disabled={pagination.page===pagination.totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-all"
                style={{ background:'var(--bg3)', color:'var(--txt2)' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
