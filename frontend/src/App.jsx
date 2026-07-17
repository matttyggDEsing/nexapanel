import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import ErrorBoundary    from '@/components/ErrorBoundary'

// ── Layouts (síncronos — necesarios para el shell inicial) ────────────────────
import PublicLayout    from '@/components/layout/PublicLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminLayout     from '@/components/layout/AdminLayout'
import SellerLayout, { SellerRoute } from '@/components/layout/SellerLayout'

// ── Public pages ─────────────────────────────────────────────────────────────
const LandingPage     = lazy(() => import('@/pages/LandingPage'))
const LoginPage       = lazy(() => import('@/pages/LoginPage'))
const RegisterPage    = lazy(() => import('@/pages/RegisterPage'))
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'))

// ── Dashboard pages ───────────────────────────────────────────────────────────
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'))
const NewOrderPage  = lazy(() => import('@/pages/dashboard/NewOrderPage'))
const OrdersPage    = lazy(() => import('@/pages/dashboard/OrdersPage'))
const ServicesPage  = lazy(() => import('@/pages/dashboard/ServicesPage'))
const WalletPage    = lazy(() => import('@/pages/dashboard/WalletPage'))
const TicketsPage   = lazy(() => import('@/pages/dashboard/TicketsPage'))
const ApiPage       = lazy(() => import('@/pages/dashboard/ApiPage'))
const SettingsPage  = lazy(() => import('@/pages/dashboard/SettingsPage'))

// ── Admin pages ───────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsers     = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminOrders    = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminServices  = lazy(() => import('@/pages/admin/AdminServices'))
const AdminProviders       = lazy(() => import('@/pages/admin/AdminProviders'))
const AdminProviderFinance = lazy(() => import('@/pages/admin/AdminProviderFinance'))
const AdminTickets         = lazy(() => import('@/pages/admin/AdminTickets'))
const AdminDeposits  = lazy(() => import('@/pages/admin/AdminDeposits'))
const AdminSettings  = lazy(() => import('@/pages/admin/AdminSettings'))

// ── Seller pages ──────────────────────────────────────────────────────────────
const SellerDashboard      = lazy(() => import('@/pages/seller/SellerDashboard'))
const SellerCustomers      = lazy(() => import('@/pages/seller/SellerCustomers'))
const SellerNewSale        = lazy(() => import('@/pages/seller/SellerNewSale'))
const SellerSales          = lazy(() => import('@/pages/seller/SellerSales'))
const SellerBulkOrders     = lazy(() => import('@/pages/seller/SellerBulkOrders'))
const SellerCalculator     = lazy(() => import('@/pages/seller/SellerCalculator'))
const SellerReceipts       = lazy(() => import('@/pages/seller/SellerReceipts'))
const SellerPaymentMethods = lazy(() => import('@/pages/seller/SellerPaymentMethods'))
const SellerSettings       = lazy(() => import('@/pages/seller/SellerSettings'))

// ── Fallback de carga ─────────────────────────────────────────────────────────
// Spinner mínimo que respeta el design system; no hace flash de layout.
function PageLoader() {
  return (
    <div
      className="flex items-center justify-center w-full h-full min-h-[60vh]"
      aria-label="Cargando página"
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-em/20 border-t-em animate-spin"
        role="status"
      />
    </div>
  )
}

// ── Route guards ──────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated)           return <Navigate to="/login"     replace />
  if (user?.role !== 'admin')     return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated)           return children
  if (user?.role === 'admin')     return <Navigate to="/admin"     replace />
  if (user?.role === 'seller')    return <Navigate to="/vendedor"  replace />
  return <Navigate to="/dashboard" replace />
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login"       element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"    element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* Dashboard (usuarios) */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index               element={<DashboardHome />} />
          <Route path="new-order"    element={<NewOrderPage />} />
          <Route path="orders"       element={<OrdersPage />} />
          <Route path="services"     element={<ServicesPage />} />
          <Route path="wallet"       element={<WalletPage />} />
          <Route path="tickets"      element={<TicketsPage />} />
          <Route path="api"          element={<ApiPage />} />
          <Route path="settings"     element={<SettingsPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index             element={<AdminDashboard />} />
          <Route path="users"      element={<AdminUsers />} />
          <Route path="orders"     element={<AdminOrders />} />
          <Route path="services"   element={<AdminServices />} />
          <Route path="providers"        element={<AdminProviders />} />
          <Route path="providers/finance" element={<AdminProviderFinance />} />
          <Route path="tickets"          element={<AdminTickets />} />
          <Route path="deposits"   element={<AdminDeposits />} />
          <Route path="settings"   element={<AdminSettings />} />
        </Route>

        {/* Vendedor */}
        <Route path="/vendedor" element={<SellerRoute><SellerLayout /></SellerRoute>}>
          <Route index                    element={<SellerDashboard />} />
          <Route path="clientes"          element={<SellerCustomers />} />
          <Route path="nueva-venta"       element={<SellerNewSale />} />
          <Route path="ventas"            element={<SellerSales />} />
          <Route path="ordenes-masivas"   element={<SellerBulkOrders />} />
          <Route path="calculadora"       element={<SellerCalculator />} />
          <Route path="recibos"           element={<SellerReceipts />} />
          <Route path="metodos-pago"      element={<SellerPaymentMethods />} />
          <Route path="configuracion"     element={<SellerSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  )
}
