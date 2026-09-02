import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './components/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import ConnectionsPage from './pages/ConnectionsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import ProductsPage from './pages/ProductsPage'
import CustomersPage from './pages/CustomersPage'
import OrdersPage from './pages/OrdersPage'
import BroadcastPage from './pages/BroadcastPage'
import SettingsPage from './pages/SettingsPage'
import LoadingScreen from './components/LoadingScreen'

function ProtectedRoutes() {
  const { user, business, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/landing" replace />
  if (!business) return <Navigate to="/onboarding" replace />
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default function App() {
  const { user, business, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return (
    <Routes>
      <Route path="/landing" element={user && business ? <Navigate to="/" replace /> : <LandingPage />} />
      <Route path="/auth" element={user && business ? <Navigate to="/" replace /> : user ? <Navigate to="/onboarding" replace /> : <AuthPage />} />
      <Route path="/onboarding" element={!user ? <Navigate to="/auth" replace /> : business ? <Navigate to="/" replace /> : <OnboardingPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  )
}
