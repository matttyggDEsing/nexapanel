/**
 * StatCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Tarjeta de métrica unificada. Reemplaza las implementaciones inline de:
 *   - AdminDashboard.jsx  (con prop `sub`)
 *   - DashboardHome.jsx   (sin prop `sub`, con `hover-glow`)
 *   - SellerDashboard.jsx (idem)
 *
 * Props:
 *   icon      LucideIcon  — ícono central
 *   label     string      — etiqueta descriptiva
 *   value     string|num  — valor principal
 *   color     string      — color hex del acento (ícono, glow, orbe)
 *   sub       string?     — línea secundaria opcional (Admin usa esto)
 *   loading   bool        — muestra skeleton mientras carga
 *   delay     number      — delay de la animación de entrada (stagger)
 *   glow      bool        — agrega hover-glow (Dashboard usuario/Seller)
 */

import { motion } from 'framer-motion'

export default function StatCard({
  icon: Icon,
  label,
  value,
  color   = 'var(--em)',
  sub,
  loading = false,
  delay   = 0,
  glow    = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`rounded-2xl p-5 border relative overflow-hidden transition-all ${glow ? 'hover-glow' : ''}`}
      style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}
    >
      {/* Orbe decorativo */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 pointer-events-none"
        style={{ background: color, transform: 'translate(30%, -30%)' }}
        aria-hidden="true"
      />

      {/* Ícono */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `${color}18`,
          border:     `1px solid ${color}30`,
        }}
      >
        <Icon size={18} style={{ color }} aria-hidden="true" />
      </div>

      {/* Valor */}
      {loading ? (
        <div
          className="h-8 w-24 rounded-lg animate-pulse mb-1"
          style={{ background: 'var(--bg4)' }}
          aria-busy="true"
        />
      ) : (
        <div
          className="font-display font-bold text-2xl mb-1"
          style={{ color: 'var(--txt)', letterSpacing: '-1px' }}
        >
          {value}
        </div>
      )}

      {/* Label */}
      <div className="text-sm" style={{ color: 'var(--txt2)' }}>
        {label}
      </div>

      {/* Sub — línea opcional (Admin) */}
      {sub && !loading && (
        <div className="text-xs mt-1" style={{ color: 'var(--em3)' }}>
          {sub}
        </div>
      )}
    </motion.div>
  )
}
