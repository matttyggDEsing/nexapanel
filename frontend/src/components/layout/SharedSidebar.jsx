/**
 * SharedSidebar
 * ──────────────────────────────────────────────────────────────────────────────
 * Sidebar unificado para los tres paneles: Dashboard, Admin y Seller.
 * Reemplaza la lógica duplicada en DashboardLayout, AdminLayout y SellerLayout.
 *
 * Props:
 *   navItems      NavItem[]   — lista de rutas del panel
 *   collapsed     boolean     — estado colapsado (controlado por el padre)
 *   onCollapse    () => void  — callback para toggle collapse
 *   onLogout      () => void  — callback para cerrar sesión
 *   accent        'em' | 'violet' | 'amber'  — paleta de acento del panel
 *   logo          ReactNode   — logo o ícono del panel (en el header del sidebar)
 *   footerSlot    ReactNode   — contenido extra antes del botón de logout (ej: balance chip)
 *   extraLinks    NavItem[]   — links adicionales debajo del nav principal (ej: "Admin Panel")
 *
 * Tipo NavItem:
 *   { to: string, icon: LucideIcon, label: string, end?: boolean, badge?: string }
 */

import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, LogOut } from 'lucide-react'
import clsx from 'clsx'

// ── Paletas de acento ─────────────────────────────────────────────────────────
const ACCENT = {
  em: {
    border:       'rgba(16,185,129,0.15)',
    activeBg:     'rgba(16,185,129,0.10)',
    activeBorder: 'rgba(16,185,129,0.20)',
    activeColor:  '#34D399',      // em-3
    dotColor:     '#10B981',      // em
    badgeBg:      'rgba(16,185,129,0.15)',
    badgeColor:   '#34D399',
  },
  violet: {
    border:       'rgba(139,92,246,0.15)',
    activeBg:     'rgba(139,92,246,0.12)',
    activeBorder: 'rgba(139,92,246,0.25)',
    activeColor:  '#A78BFA',      // violet-3
    dotColor:     '#8B5CF6',      // violet
    badgeBg:      'rgba(139,92,246,0.15)',
    badgeColor:   '#A78BFA',
  },
  amber: {
    border:       'rgba(245,158,11,0.15)',
    activeBg:     'rgba(245,158,11,0.10)',
    activeBorder: 'rgba(245,158,11,0.22)',
    activeColor:  '#FCD34D',      // amber-3
    dotColor:     '#F59E0B',      // amber
    badgeBg:      'rgba(245,158,11,0.15)',
    badgeColor:   '#FCD34D',
  },
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ to, icon: Icon, label, badge, end = false, collapsed, accent }) {
  const a = ACCENT[accent]

  return (
    <NavLink to={to} end={end} className="block">
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative cursor-pointer"
          style={{
            background:  isActive ? a.activeBg     : 'transparent',
            border:     `1px solid ${isActive ? a.activeBorder : 'transparent'}`,
            color:       isActive ? a.activeColor  : 'var(--txt2)',
          }}
          title={collapsed ? label : undefined}
          aria-label={collapsed ? label : undefined}
        >
          <Icon size={17} className="flex-shrink-0" aria-hidden="true" />

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium flex-1 whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Badge (ej: HOT) */}
          {badge && !collapsed && (
            <span
              className="text-2xs px-1.5 py-0.5 rounded-md font-semibold tracking-wide"
              style={{ background: a.badgeBg, color: a.badgeColor }}
            >
              {badge.toUpperCase()}
            </span>
          )}

          {/* Active dot */}
          {isActive && (
            <motion.div
              layoutId={`active-pill-${accent}`}
              className="absolute right-2 w-1.5 h-1.5 rounded-full"
              style={{ background: a.dotColor }}
            />
          )}
        </motion.div>
      )}
    </NavLink>
  )
}

// ── SharedSidebar ─────────────────────────────────────────────────────────────
export default function SharedSidebar({
  navItems     = [],
  collapsed    = false,
  onCollapse,
  onLogout,
  accent       = 'em',
  logo,
  footerSlot,
  extraLinks   = [],
}) {
  const a = ACCENT[accent]

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="hidden md:flex flex-col flex-shrink-0 border-r relative"
      style={{ background: 'var(--bg2)', borderColor: a.border }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b flex-shrink-0"
        style={{ borderColor: a.border }}
      >
        {/* El nodo logo siempre se muestra; el título se anima */}
        <div className="flex-shrink-0">{logo}</div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="overflow-hidden"
            >
              {/* El padre puede pasar un ReactNode con el nombre */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            collapsed={collapsed}
            accent={accent}
          />
        ))}

        {/* Links extra (ej: acceso Admin desde Dashboard) */}
        {extraLinks.length > 0 && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-dim)' }}>
            {extraLinks.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                collapsed={collapsed}
                accent={item.accent || accent}
              />
            ))}
          </div>
        )}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="p-3 border-t flex-shrink-0" style={{ borderColor: a.border }}>
        {/* Slot libre: balance chip, nombre de usuario, etc. */}
        {footerSlot && (
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2"
              >
                {footerSlot}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Logout */}
        {onLogout && (
          <motion.button
            whileHover={{ x: 2 }}
            onClick={onLogout}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all',
              'hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-red-500/40',
            )}
            style={{ color: 'var(--txt-muted)' }}
            aria-label="Cerrar sesión"
          >
            <LogOut size={17} className="flex-shrink-0" aria-hidden="true" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm"
                >
                  Cerrar sesión
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>

      {/* ── Collapse button ───────────────────────────────────────────────── */}
      {onCollapse && (
        <button
          onClick={onCollapse}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all"
          style={{
            background:  'var(--bg4)',
            border:      `1px solid ${a.border}`,
            color:       a.activeColor,
          }}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronLeft size={12} aria-hidden="true" />
          </motion.div>
        </button>
      )}
    </motion.aside>
  )
}

// ── Mobile Sidebar (overlay) ──────────────────────────────────────────────────
// Se usa en DashboardLayout y SellerLayout para pantallas chicas.
export function MobileSidebar({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-60 flex flex-col md:hidden"
            style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border-dim)' }}
            aria-modal="true"
            role="dialog"
            aria-label="Menú de navegación"
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
