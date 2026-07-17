import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { ShoppingCart, Clock, CheckCircle, Wallet, Zap, ArrowUpRight, Plus, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

const STATUS_CFG = {
  completed:  { label: 'Completada',  cls: 'badge-completed' },
  active:     { label: 'Activa',      cls: 'badge-active'    },
  pending:    { label: 'Pendiente',   cls: 'badge-pending'   },
  cancelled:  { label: 'Cancelada',   cls: 'badge-cancelled' },
  processing: { label: 'Procesando',  cls: 'badge-processing'},
  partial:    { label: 'Parcial',     cls: 'badge-processing'},
}

function StatCard({ icon: Icon, label, value, color, delay = 0, loading }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:.4, delay, ease:[.25,.46,.45,.94] }}
      className="rounded-2xl p-5 border relative overflow-hidden hover-glow transition-all"
      style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5"
        style={{ background:color, transform:'translate(30%,-30%)' }} />
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      {loading
        ? <div className="h-8 w-20 rounded-lg animate-pulse mb-1" style={{ background:'var(--bg4)' }} />
        : <div className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-1px' }}>{value}</div>
      }
      <div className="text-sm" style={{ color:'var(--txt2)' }}>{label}</div>
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

export default function DashboardHome() {
  const { user, updateUser } = useAuthStore()
  const [timeRange, setTimeRange]     = useState('7d')
  const [stats, setStats]             = useState(null)
  const [chartData, setChartData]     = useState([])
  const [topServices, setTopServices] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)

  const fetchAll = useCallback(async (range = '7d', silent = false) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      const [statsRes, chartRes, recentRes, balanceRes] = await Promise.allSettled([
        api.get('/orders/stats'),
        api.get('/orders/chart', { params: { range } }),
        api.get('/orders', { params: { perPage: 5, page: 1 } }),
        api.get('/wallet/balance'),
      ])

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data ?? statsRes.value.data)
      }
      if (chartRes.status === 'fulfilled') {
        const d = chartRes.value.data?.data ?? {}
        setChartData(Array.isArray(d) ? d : d.chart ?? [])
        setTopServices(d.topServices ?? chartRes.value.data?.topServices ?? [])
      }
      if (recentRes.status === 'fulfilled') {
        const raw = recentRes.value.data
        setRecentOrders(raw?.data ?? raw?.orders ?? [])
      }
      if (balanceRes.status === 'fulfilled') {
        const bal = balanceRes.value.data?.data?.balance ?? balanceRes.value.data?.balance
        if (bal !== undefined) updateUser({ balance: Number(bal) })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [updateUser])

  useEffect(() => { fetchAll(timeRange) }, [timeRange, fetchAll])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
            {greeting}, {user?.name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="text-sm" style={{ color:'var(--txt2)' }}>Aquí está el resumen de tu actividad.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchAll(timeRange, true)} disabled={refreshing} title="Actualizar"
            className="p-2 rounded-xl transition-all"
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
            <motion.div animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration:1, repeat: refreshing ? Infinity : 0, ease:'linear' }}>
              <RefreshCw size={15} />
            </motion.div>
          </button>
          <Link to="/dashboard/new-order">
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold"
              style={{ background:'var(--em)', color:'#000', boxShadow:'0 4px 20px rgba(16,185,129,0.3)' }}>
              <Plus size={16} /> Nueva Orden
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loading} icon={Wallet}       label="Balance disponible"
          value={`$${Number(user?.balance ?? 0).toFixed(2)}`}  color="#10B981" delay={0}   />
        <StatCard loading={loading} icon={ShoppingCart} label="Total órdenes"
          value={stats?.total ?? 0}                            color="#60A5FA" delay={.05} />
        <StatCard loading={loading} icon={Clock}        label="Pendientes"
          value={stats?.pending ?? 0}                          color="#FCD34D" delay={.1}  />
        <StatCard loading={loading} icon={CheckCircle}  label="Completadas"
          value={stats?.completed ?? 0}                        color="#A78BFA" delay={.15} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.2 }}
          className="lg:col-span-2 rounded-2xl p-5 border"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Órdenes y Revenue</h2>
              <p className="text-xs mt-0.5" style={{ color:'var(--txt2)' }}>
                {timeRange === '7d' ? 'Últimos 7 días' : timeRange === '30d' ? 'Últimos 30 días' : 'Últimos 90 días'}
              </p>
            </div>
            <div className="flex gap-1">
              {['7d','30d','90d'].map(r => (
                <button key={r} onClick={() => setTimeRange(r)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: timeRange===r ? 'rgba(16,185,129,0.12)' : 'transparent',
                    color: timeRange===r ? 'var(--em3)' : 'var(--txt3)',
                    border:`1px solid ${timeRange===r ? 'rgba(16,185,129,0.2)' : 'transparent'}`,
                  }}>{r}</button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-48 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }} />
          ) : chartData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2" style={{ color:'var(--txt3)' }}>
              <p className="text-2xl">📊</p>
              <p className="text-sm">Sin datos aún. ¡Crea tu primera orden!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#60A5FA" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize:12, fill:'var(--txt3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:12, fill:'var(--txt3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="orders"  name="orders"  stroke="#10B981" strokeWidth={2} fill="url(#ordersGrad)"  dot={false} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#60A5FA" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2 text-xs" style={{ color:'var(--txt2)' }}>
              <div className="w-3 h-0.5 rounded" style={{ background:'#10B981' }} /> Órdenes
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color:'var(--txt2)' }}>
              <div className="w-3 h-0.5 rounded" style={{ background:'#60A5FA' }} /> Revenue ($)
            </div>
          </div>
        </motion.div>

        {/* Top services */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.25 }}
          className="rounded-2xl p-5 border"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          <h2 className="font-display font-semibold text-base mb-1" style={{ color:'var(--txt)' }}>Top Categorías</h2>
          <p className="text-xs mb-4" style={{ color:'var(--txt2)' }}>Por cantidad de órdenes</p>
          {loading ? (
            <div className="h-48 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }} />
          ) : topServices.length === 0 ? (
            <div className="h-48 flex items-center justify-center" style={{ color:'var(--txt3)' }}>
              <p className="text-sm">Sin datos aún</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topServices} margin={{ top:0, right:0, left:-30, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--txt3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--txt3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="orders" fill="#10B981" radius={[4,4,0,0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Recent orders */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.3 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border2)' }}>
          <div>
            <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Órdenes Recientes</h2>
            <p className="text-xs mt-0.5" style={{ color:'var(--txt2)' }}>Últimas 5 órdenes</p>
          </div>
          <Link to="/dashboard/orders" className="text-xs flex items-center gap-1" style={{ color:'var(--em3)' }}>
            Ver todas <ArrowUpRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }} />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-16 text-center" style={{ color:'var(--txt3)' }}>
            <p className="text-3xl mb-3">📦</p>
            <p className="text-sm mb-2">Todavía no tienes órdenes.</p>
            <Link to="/dashboard/new-order">
              <span className="text-sm" style={{ color:'var(--em3)' }}>Crea tu primera orden →</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border2)' }}>
                  {['ID','Servicio','Enlace','Cant.','Estado','Monto'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider"
                      style={{ color:'var(--txt3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <motion.tr key={order.id}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    transition={{ duration:.3, delay:i*.05 }}
                    style={{ borderBottom:'1px solid var(--border2)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td className="px-5 py-3.5 text-sm font-mono" style={{ color:'var(--txt3)' }}>#{order.id}</td>
                    <td className="px-5 py-3.5 text-sm max-w-48" style={{ color:'var(--txt)' }}>
                      <div className="truncate">{order.service_name ?? order.service ?? '—'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs max-w-32" style={{ color:'var(--txt3)' }}>
                      <div className="truncate">{order.link}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color:'var(--txt2)' }}>
                      {Number(order.quantity ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUS_CFG[order.status]?.cls ?? 'badge-pending'}`}>
                        {STATUS_CFG[order.status]?.label ?? order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold font-display" style={{ color:'var(--em3)' }}>
                      ${Number(order.charge ?? 0).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Nueva Orden',   icon:Plus,         to:'/dashboard/new-order', color:'var(--em)' },
          { label:'Agregar Saldo', icon:Wallet,       to:'/dashboard/wallet',    color:'#60A5FA'  },
          { label:'Ver API',       icon:Zap,          to:'/dashboard/api',       color:'#A78BFA'  },
          { label:'Soporte',       icon:ShoppingCart, to:'/dashboard/tickets',   color:'#FCD34D'  },
        ].map(({ label, icon:Icon, to, color }, i) => (
          <motion.div key={to} initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
            transition={{ duration:.3, delay:.35 + i*.05 }}>
            <Link to={to}>
              <motion.div whileHover={{ y:-3 }} whileTap={{ scale:.97 }}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all hover-glow"
                style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-xs font-medium" style={{ color:'var(--txt2)' }}>{label}</span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
