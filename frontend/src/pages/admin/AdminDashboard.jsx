import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { Users, ShoppingCart, DollarSign, TrendingUp, RefreshCw, Activity } from 'lucide-react'
import api from '@/services/api'

function StatCard({ icon: Icon, label, value, sub, color, loading, delay = 0 }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:.4, delay, ease:[.25,.46,.45,.94] }}
      className="rounded-2xl p-5 border relative overflow-hidden"
      style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5"
        style={{ background:color, transform:'translate(30%,-30%)' }} />
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      {loading
        ? <div className="h-8 w-24 rounded-lg animate-pulse mb-1" style={{ background:'var(--bg4)' }}/>
        : <div className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-1px' }}>{value}</div>
      }
      <div className="text-sm" style={{ color:'var(--txt2)' }}>{label}</div>
      {sub && !loading && <div className="text-xs mt-1" style={{ color:'var(--em3)' }}>{sub}</div>}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 text-sm" style={{ background:'var(--bg3)', border:'1px solid var(--border2)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
      <p className="font-medium mb-2" style={{ color:'var(--txt)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:p.color }}>
          {p.name === 'orders' ? `${p.value} órdenes` : `$${p.value}`}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null)
  const [chart, setChart]       = useState([])
  const [topSvcs, setTopSvcs]   = useState([])
  const [recent, setRecent]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      const [statsRes, chartRes, recentRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/chart', { params: { range: '30d' } }),
        api.get('/admin/orders/recent'),
      ])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data ?? statsRes.value.data)
      if (chartRes.status === 'fulfilled') {
        const d = chartRes.value.data?.data ?? {}
        setChart(Array.isArray(d) ? d : d.chart ?? [])
        setTopSvcs(d.topServices ?? [])
      }
      if (recentRes.status === 'fulfilled') {
        setRecent(recentRes.value.data?.data ?? recentRes.value.data?.orders ?? [])
      }
    } catch {
      // handled globally
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const STATUS_CFG = {
    completed:  { label:'Completada', cls:'badge-completed' },
    active:     { label:'Activa',     cls:'badge-active'    },
    pending:    { label:'Pendiente',  cls:'badge-pending'   },
    cancelled:  { label:'Cancelada',  cls:'badge-cancelled' },
    processing: { label:'Procesando', cls:'badge-processing'},
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
            Panel Administrativo
          </h1>
          <p className="text-sm" style={{ color:'var(--txt2)' }}>Resumen global de la plataforma.</p>
        </div>
        <button onClick={() => fetchAll(true)} disabled={refreshing}
          className="p-2 rounded-xl transition-all"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <motion.div animate={{ rotate: refreshing ? 360 : 0 }}
            transition={{ duration:1, repeat: refreshing ? Infinity : 0, ease:'linear' }}>
            <RefreshCw size={15} />
          </motion.div>
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loading} icon={Users}        label="Usuarios totales"
          value={stats?.users?.total ?? '—'}
          sub={stats?.users?.today ? `+${stats.users.today} hoy` : null}
          color="#60A5FA" delay={0} />
        <StatCard loading={loading} icon={ShoppingCart} label="Órdenes totales"
          value={stats?.orders?.total ?? '—'}
          sub={stats?.orders?.today ? `+${stats.orders.today} hoy` : null}
          color="#10B981" delay={.05} />
        <StatCard loading={loading} icon={DollarSign}   label="Revenue total"
          value={stats?.revenue?.total ? `$${Number(stats.revenue.total).toFixed(2)}` : '—'}
          sub={stats?.revenue?.today ? `+$${Number(stats.revenue.today).toFixed(2)} hoy` : null}
          color="#A78BFA" delay={.1} />
        <StatCard loading={loading} icon={TrendingUp}   label="Ganancia neta"
          value={stats?.profit?.total ? `$${Number(stats.profit.total).toFixed(2)}` : '—'}
          color="#FCD34D" delay={.15} />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Órdenes activas',   value: stats?.orders?.active     ?? '—', color:'#10B981' },
          { label:'Tickets abiertos',  value: stats?.tickets?.open      ?? '—', color:'#F87171' },
          { label:'Balance usuarios',  value: stats?.wallets?.total ? `$${Number(stats.wallets.total).toFixed(0)}` : '—', color:'#60A5FA' },
          { label:'Servicios activos', value: stats?.services?.active   ?? '—', color:'#A78BFA' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label}
            initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:.3, delay:.2+i*.04 }}
            className="rounded-xl border p-4 text-center"
            style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
            {loading
              ? <div className="h-7 w-16 rounded-lg animate-pulse mx-auto mb-1" style={{ background:'var(--bg4)' }}/>
              : <p className="font-display font-bold text-xl mb-0.5" style={{ color, letterSpacing:'-0.5px' }}>{value}</p>
            }
            <p className="text-xs" style={{ color:'var(--txt3)' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.25 }}
          className="lg:col-span-2 rounded-2xl p-5 border"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          <h2 className="font-display font-semibold text-base mb-1" style={{ color:'var(--txt)' }}>Órdenes y Revenue</h2>
          <p className="text-xs mb-5" style={{ color:'var(--txt2)' }}>Últimos 30 días</p>
          {loading ? (
            <div className="h-48 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }}/>
          ) : chart.length === 0 ? (
            <div className="h-48 flex items-center justify-center" style={{ color:'var(--txt3)' }}>
              <p className="text-sm">Sin datos para este período</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chart} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="admOG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="admRG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'var(--txt3)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'var(--txt3)' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="orders"  name="orders"  stroke="#10B981" strokeWidth={2} fill="url(#admOG)" dot={false}/>
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#A78BFA" strokeWidth={2} fill="url(#admRG)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}
          className="rounded-2xl p-5 border"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          <h2 className="font-display font-semibold text-base mb-1" style={{ color:'var(--txt)' }}>Top Servicios</h2>
          <p className="text-xs mb-4" style={{ color:'var(--txt2)' }}>Por volumen de órdenes</p>
          {loading ? (
            <div className="h-48 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }}/>
          ) : topSvcs.length === 0 ? (
            <div className="h-48 flex items-center justify-center" style={{ color:'var(--txt3)' }}>
              <p className="text-sm">Sin datos</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topSvcs} margin={{ top:0, right:0, left:-30, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{ fontSize:9, fill:'var(--txt3)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'var(--txt3)' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="value" name="orders" fill="#10B981" radius={[4,4,0,0]} fillOpacity={0.8}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Recent orders global */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.35 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor:'var(--border2)' }}>
          <Activity size={16} style={{ color:'var(--em)' }}/>
          <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Órdenes Recientes (global)</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }}/>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-12 text-center" style={{ color:'var(--txt3)' }}>
              <p className="text-sm">Sin órdenes aún</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border2)', background:'var(--bg3)' }}>
                  {['ID','Usuario','Servicio','Cantidad','Estado','Monto'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider"
                      style={{ color:'var(--txt3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((o, i) => (
                  <motion.tr key={o.id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*.04 }}
                    style={{ borderBottom:'1px solid var(--border2)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color:'var(--txt3)' }}>#{o.id}</td>
                    <td className="px-5 py-3 text-sm" style={{ color:'var(--txt2)' }}>{o.user_name ?? o.user_email ?? '—'}</td>
                    <td className="px-5 py-3 text-sm max-w-40">
                      <div className="truncate" style={{ color:'var(--txt)' }}>{o.service_name ?? '—'}</div>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color:'var(--txt2)' }}>
                      {Number(o.quantity ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_CFG[o.status]?.cls ?? 'badge-pending'}`}>
                        {STATUS_CFG[o.status]?.label ?? o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-display font-bold text-sm" style={{ color:'var(--em3)' }}>
                      ${Number(o.charge ?? 0).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}
