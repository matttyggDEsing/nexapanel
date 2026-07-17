import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ShoppingCart, Package, Wallet,
  Ticket, Code2, Settings, Plus, Shield,
  Bell, Search, Zap, Menu,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore }   from '@/store/uiStore'
import { NexaIcon }     from '@/components/ui/NexaIcon'
import SharedSidebar, { MobileSidebar } from '@/components/layout/SharedSidebar'

// ── Nav ───────────────────────────────────────────────────────────────────────
const NAV = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/dashboard/new-order', icon: Plus,            label: 'Nueva Orden', badge: 'hot' },
  { to: '/dashboard/orders',    icon: ShoppingCart,    label: 'Mis Órdenes' },
  { to: '/dashboard/services',  icon: Package,         label: 'Servicios' },
  { to: '/dashboard/wallet',    icon: Wallet,          label: 'Wallet' },
  { to: '/dashboard/tickets',   icon: Ticket,          label: 'Tickets' },
  { to: '/dashboard/api',       icon: Code2,           label: 'API' },
  { to: '/dashboard/settings',  icon: Settings,        label: 'Ajustes' },
]

// ── Sub-componentes ───────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <NexaIcon size={32} className="flex-shrink-0" />
      <span className="font-display font-bold text-base text-txt-primary whitespace-nowrap">
        Nexa<span className="text-em">Panel</span>
      </span>
    </div>
  )
}

function BalanceChip({ user }) {
  return (
    <div className="px-3 py-2 rounded-xl flex items-center gap-2 mb-1"
      style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
      <Wallet size={13} className="text-em flex-shrink-0" aria-hidden="true" />
      <span className="text-xs text-txt-secondary">Balance</span>
      <span className="text-xs font-display font-bold ml-auto text-em-3">
        ${user?.balance?.toFixed(2) ?? '0.00'}
      </span>
    </div>
  )
}

function UserRow({ user }) {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-black bg-gradient-to-br from-em to-em-2">
        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-txt-primary">{user?.name ?? 'Usuario'}</p>
        <p className="text-xs truncate text-txt-muted">{user?.email ?? ''}</p>
      </div>
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const { user, logout }                          = useAuthStore()
  const { sidebarCollapsed, collapseSidebar, unreadCount } = useUIStore()
  const [mobileOpen, setMobileOpen]               = useState(false)
  const location                                  = useLocation()
  const navigate                                  = useNavigate()

  // Cerrar sidebar mobile al cambiar de ruta
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/login') }

  // Links extra — link a Admin si el usuario es admin
  const extraLinks = user?.role === 'admin'
    ? [{ to: '/admin', icon: Shield, label: 'Admin Panel', accent: 'violet' }]
    : []

  // Footer slot: balance chip + fila de usuario
  const footerSlot = (
    <>
      <BalanceChip user={user} />
      <UserRow user={user} />
    </>
  )

  // Logo node
  const logo = <Logo />

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <SharedSidebar
        navItems={NAV}
        collapsed={sidebarCollapsed}
        onCollapse={collapseSidebar}
        onLogout={handleLogout}
        accent="em"
        logo={logo}
        footerSlot={footerSlot}
        extraLinks={extraLinks}
      />

      {/* ── Mobile sidebar ──────────────────────────────────────────────── */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {/* Reutilizamos SharedSidebar sin el botón collapse en mobile */}
        <SharedSidebar
          navItems={NAV}
          collapsed={false}
          onLogout={handleLogout}
          accent="em"
          logo={logo}
          footerSlot={footerSlot}
          extraLinks={extraLinks}
        />
      </MobileSidebar>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-4 border-b flex-shrink-0"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border-dim)' }}
        >
          {/* Mobile menu */}
          <button
            className="md:hidden p-2 rounded-lg text-txt-secondary"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          {/* Search */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 max-w-sm text-left transition-all text-txt-muted"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border-dim)' }}
            aria-label="Buscar servicios"
          >
            <Search size={14} aria-hidden="true" />
            <span className="text-sm">Buscar servicios...</span>
            <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded font-mono bg-bg-quad text-txt-muted">⌘K</kbd>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {/* Live indicator */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}
            >
              <span className="live-dot" aria-hidden="true" />
              <span className="text-xs text-em-3">Sistema activo</span>
            </div>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-xl transition-colors text-txt-secondary"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border-dim)' }}
              aria-label={unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Notificaciones'}
            >
              <Bell size={17} aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-black bg-em"
                  style={{ fontSize: '9px' }}
                  aria-hidden="true"
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* CTA */}
            <button
              onClick={() => navigate('/dashboard/new-order')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all bg-em text-black hover:bg-em-2"
            >
              <Zap size={14} aria-hidden="true" />
              Nueva Orden
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg-primary">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
