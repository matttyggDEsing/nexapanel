import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Users, DollarSign, Package,
  ShoppingBag, Plus, RefreshCw, Trophy, ArrowRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { sellerService } from '@/services/sellerService'
import { useAuthStore } from '@/store/authStore'

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toFixed(2)
const fmtN = (n) => Number(n || 0).toLocaleString('es-AR')

const STATUS_STYLE = {
  pending:   { bg: 'rgba(245,158,11,0.12)', color: 'var(--status-pending, #FCD34D)', label: 'Pendiente' },
  completed: { bg: 'rgba(16,185,129,0.12)', color: 'var(--status-active, #34D399)', label: 'Completada' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',  color: 'var(--status-cancelled, #FCA5A5)', label: 'Cancelada' },
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'var(--em)', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .35, delay }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="font-display font-bold text-2xl mb-0.5" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
        {value}
      </p>
      <p className="text-xs font-medium" style={{ color: 'var(--txt3)' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--txt3)' }}>{sub}</p>}
    </motion.div>
  )
}

// ── Tooltip del gráfico ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border px-3 py-2 text-xs"
      style={{ background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--txt)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--txt2)' }}>{label}</p>
      <p style={{ color: 'var(--em3)' }}>Ventas: {payload[0]?.value}</p>
      <p style={{ color: '#60A5FA' }}>Ingresos: ${fmt(payload[1]?.value)}</p>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const res = await sellerService.getDashboard()
      setData(res.data.data)
    } catch (_) {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--bg2)' }} />
      </div>
    )
  }

  const today   = data?.today   || {}
  const week    = data?.week    || {}
  const chart   = data?.chart   || []
  const topSvc  = data?.top_services  || []
  const recent  = data?.recent_sales  || []
  const ranking = data?.ranking || {}

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
            ¡Hola, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--txt2)' }}>
            Acá está el resumen de tu actividad.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}>
            <RefreshCw size={15} />
          </button>
          <button onClick={() => navigate('/vendedor/nueva-venta')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold font-display"
            style={{ background: 'var(--em)', color: '#000' }}>
            <Plus size={14} /> Nueva Venta
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Ventas hoy"      value={fmtN(today.count)}     sub={`$${fmt(today.revenue)}`}     color="var(--em)"  delay={0} />
        <StatCard icon={TrendingUp}  label="Ventas semana"   value={fmtN(week.count)}      sub={`$${fmt(week.revenue)}`}      color="#60A5FA"    delay={.05} />
        <StatCard icon={Users}       label="Clientes activos" value={fmtN(data?.customers?.total)} sub="con al menos 1 compra" color="#A78BFA"    delay={.1} />
        <StatCard icon={Package}     label="Servicios vendidos" value={fmtN(data?.services?.total_quantity)} sub="unidades totales" color="#FCD34D" delay={.15} />
      </div>

      {/* Chart + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}
          className="lg:col-span-2 rounded-2xl border p-5"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>
              Ventas — últimos 30 días
            </h2>
          </div>
          {chart.length === 0 ? (
            <div className="h-48 flex items-center justify-center" style={{ color: 'var(--txt3)' }}>
              <div className="text-center">
                <p className="text-3xl mb-2">📈</p>
                <p className="text-sm">Aún no hay ventas registradas</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--txt3)', fontSize: 10 }}
                  tickFormatter={d => d?.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--txt3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="sales"   stroke="#10B981" fill="url(#gSales)"   strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="revenue" stroke="#60A5FA" fill="url(#gRevenue)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Ranking */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}
          className="rounded-2xl border p-5"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={15} style={{ color: '#FCD34D' }} />
            <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>Tu ranking</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Pos. semanal',  value: ranking.week_position  ? `#${ranking.week_position}`  : '—', color: '#FCD34D' },
              { label: 'Pos. mensual',  value: ranking.month_position ? `#${ranking.month_position}` : '—', color: '#A78BFA' },
              { label: 'Ingresos mes',  value: `$${fmt(ranking.month_revenue)}`,                              color: 'var(--em3)' },
              { label: 'Ingresos sem.', value: `$${fmt(ranking.week_revenue)}`,                               color: '#60A5FA' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: 'var(--border2)' }}>
                <span className="text-xs" style={{ color: 'var(--txt3)' }}>{label}</span>
                <span className="font-display font-bold text-sm" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top services + Recent sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top servicios */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}
          className="rounded-2xl border p-5"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <h2 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--txt)' }}>
            Top servicios vendidos
          </h2>
          {topSvc.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--txt3)' }}>Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {topSvc.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: i === 0 ? 'rgba(252,211,77,0.15)' : 'var(--bg3)', color: i === 0 ? '#FCD34D' : 'var(--txt3)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--txt)' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: 'var(--txt3)' }}>{fmtN(s.total_qty)} unidades</p>
                  </div>
                  <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--em3)' }}>
                    ${fmt(s.total_revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Últimas ventas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }}
          className="rounded-2xl border p-5"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>
              Últimas ventas
            </h2>
            <button onClick={() => navigate('/vendedor/ventas')}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: 'var(--em3)' }}>
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--txt3)' }}>Sin ventas recientes</p>
          ) : (
            <div className="space-y-2">
              {recent.map((sale) => {
                const st = STATUS_STYLE[sale.status] || STATUS_STYLE.pending
                const date = sale.created_at
                  ? new Date(sale.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
                  : '—'
                return (
                  <div key={sale.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                    style={{ background: 'var(--bg3)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-medium" style={{ color: 'var(--txt)' }}>
                        {sale.customer_name || `Cliente #${sale.customer_id}`}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--txt3)' }}>{date}</p>
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--em3)' }}>
                      ${fmt(sale.total)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
