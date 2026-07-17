import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, ShoppingCart, Package,
  DollarSign, Server, Ticket, Settings, Shield, LogOut, BarChart3,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore }   from '@/store/uiStore'
import SharedSidebar    from '@/components/layout/SharedSidebar'

// ── Nav ───────────────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/admin/users',      icon: Users,           label: 'Usuarios' },
  { to: '/admin/orders',     icon: ShoppingCart,    label: 'Órdenes' },
  { to: '/admin/services',   icon: Package,         label: 'Servicios' },
  { to: '/admin/providers',        icon: Server,          label: 'Proveedores' },
  { to: '/admin/providers/finance', icon: BarChart3,       label: 'Finanzas' },
  { to: '/admin/tickets',          icon: Ticket,          label: 'Tickets' },
  { to: '/admin/deposits',   icon: DollarSign,      label: 'Depósitos' },
  { to: '/admin/settings',   icon: Settings,        label: 'Ajustes' },
]

// ── Logo ──────────────────────────────────────────────────────────────────────
function AdminLogo({ collapsed }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
      >
        <Shield size={14} className="text-white" aria-hidden="true" />
      </div>
      {!collapsed && (
        <span className="font-display font-bold text-sm whitespace-nowrap" style={{ color: '#A78BFA' }}>
          Admin Panel
        </span>
      )}
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { user }                           = useAuthStore()
  const { sidebarCollapsed, collapseSidebar } = useUIStore()
  const location                           = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <SharedSidebar
        navItems={ADMIN_NAV}
        collapsed={sidebarCollapsed}
        onCollapse={collapseSidebar}
        accent="violet"
        logo={<AdminLogo collapsed={sidebarCollapsed} />}
        extraLinks={[
          { to: '/dashboard', icon: LogOut, label: 'Volver al panel', accent: 'em' },
        ]}
      />

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-4 border-b flex-shrink-0"
          style={{ background: 'var(--bg2)', borderColor: 'rgba(139,92,246,0.15)' }}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: '#A78BFA' }} aria-hidden="true" />
            <span className="font-display font-semibold text-sm" style={{ color: '#A78BFA' }}>
              Admin — {user?.name}
            </span>
          </div>

          <div
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} aria-hidden="true" />
            <span className="text-xs" style={{ color: '#A78BFA' }}>Panel Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg-primary">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
