import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Plus, ShoppingBag, ListOrdered,
  Calculator, FileText, CreditCard, Settings, Store, Menu,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import SharedSidebar, { MobileSidebar } from '@/components/layout/SharedSidebar'

// ── Guard (se mantiene igual) ─────────────────────────────────────────────────
export function SellerRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'seller' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

// ── Nav ───────────────────────────────────────────────────────────────────────
const SELLER_NAV = [
  { to: '/vendedor',                  icon: LayoutDashboard, label: 'Dashboard',       end: true },
  { to: '/vendedor/clientes',         icon: Users,           label: 'Clientes' },
  { to: '/vendedor/nueva-venta',      icon: Plus,            label: 'Nueva Venta' },
  { to: '/vendedor/ventas',           icon: ShoppingBag,     label: 'Ventas' },
  { to: '/vendedor/ordenes-masivas',  icon: ListOrdered,     label: 'Órdenes Masivas' },
  { to: '/vendedor/calculadora',      icon: Calculator,      label: 'Calculadora' },
  { to: '/vendedor/recibos',          icon: FileText,        label: 'Recibos' },
  { to: '/vendedor/metodos-pago',     icon: CreditCard,      label: 'Métodos de Pago' },
  { to: '/vendedor/configuracion',    icon: Settings,        label: 'Configuración' },
]

// ── Logo ──────────────────────────────────────────────────────────────────────
function SellerLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
      >
        <Store size={14} className="text-black" aria-hidden="true" />
      </div>
      <span
        className="font-display font-bold text-sm whitespace-nowrap"
        style={{ color: '#FCD34D' }}
      >
        Panel Vendedor
      </span>
    </div>
  )
}

// ── Footer slot ───────────────────────────────────────────────────────────────
function SellerUserRow({ user }) {
  return (
    <div className="flex items-center gap-3 px-2 py-2 mb-1">
      <div
        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-black"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
      >
        {user?.name?.charAt(0)?.toUpperCase() ?? 'V'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-txt-primary">{user?.name}</p>
        <p className="text-xs truncate text-txt-muted">Vendedor</p>
      </div>
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function SellerLayout() {
  const { user, logout }        = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location                = useLocation()
  const navigate                = useNavigate()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/login') }

  // Nombre de página activa para el header
  const activeNav = SELLER_NAV.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  )

  const logo       = <SellerLogo />
  const footerSlot = <SellerUserRow user={user} />

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <SharedSidebar
        navItems={SELLER_NAV}
        collapsed={collapsed}
        onCollapse={() => setCollapsed((c) => !c)}
        onLogout={handleLogout}
        accent="amber"
        logo={logo}
        footerSlot={footerSlot}
      />

      {/* ── Mobile sidebar ──────────────────────────────────────────────── */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SharedSidebar
          navItems={SELLER_NAV}
          collapsed={false}
          onLogout={handleLogout}
          accent="amber"
          logo={logo}
          footerSlot={footerSlot}
        />
      </MobileSidebar>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-4 border-b flex-shrink-0"
          style={{ background: 'var(--bg2)', borderColor: 'rgba(245,158,11,0.15)' }}
        >
          {/* Mobile menu */}
          <button
            className="md:hidden p-2 rounded-lg text-txt-secondary"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          {/* Título página activa */}
          <div className="flex items-center gap-2">
            <Store size={16} style={{ color: '#F59E0B' }} aria-hidden="true" />
            <span className="font-display font-semibold text-sm" style={{ color: '#FCD34D' }}>
              {activeNav?.label ?? 'Panel Vendedor'}
            </span>
          </div>

          {/* Right */}
          <div className="ml-auto flex items-center gap-3">
            {/* Live indicator */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: '#F59E0B' }}
                aria-hidden="true"
              />
              <span className="text-xs" style={{ color: '#FCD34D' }}>Vendedor activo</span>
            </div>

            {/* User chip */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold text-black"
                style={{ background: '#F59E0B' }}
                aria-hidden="true"
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? 'V'}
              </div>
              <span className="text-xs hidden sm:block" style={{ color: '#FDE68A' }}>
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
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
