import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TrafficIntelligencePage from './pages/TrafficIntelligencePage'
import AgentDetailPage from './pages/AgentDetailPage'
import GSCAgentPage from './pages/GSCAgentPage'
import BlogOptimizerPage from './pages/BlogOptimizerPage'
import OpsManagementPage from './pages/OpsManagementPage'
import ConversionIntelligencePage from './pages/ConversionIntelligencePage'
import ScalingIntelligencePage from './pages/ScalingIntelligencePage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children, user, loading }: { children: React.ReactNode; user: any; loading: boolean }) {
  if (loading) return (
    <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { user, loading, logout } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          !loading && user ? <Navigate to="/" replace /> : <LoginPage onLogin={() => {}} />
        } />
        <Route path="/" element={
          <ProtectedRoute user={user} loading={loading}>
            <Layout user={user!} onLogout={logout} />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />

          {/* Traffic Intelligence */}
          <Route path="traffic" element={<TrafficIntelligencePage />} />
          <Route path="traffic/t-gsc" element={<GSCAgentPage />} />
          <Route path="traffic/t-blog-optimizer" element={<BlogOptimizerPage />} />
          <Route path="traffic/:agentId" element={<AgentDetailPage />} />

          {/* Ops Management */}
          <Route path="ops" element={<Navigate to="/ops/leads" replace />} />
          <Route path="ops/leads" element={<OpsManagementPage defaultTab="leads" />} />
          <Route path="ops/applications" element={<OpsManagementPage defaultTab="applications" />} />
          <Route path="ops/roster" element={<OpsManagementPage defaultTab="roster" />} />
          <Route path="ops/pipeline" element={<OpsManagementPage defaultTab="pipeline" />} />

          {/* Conversion Intelligence */}
          <Route path="conversion" element={<ConversionIntelligencePage />} />
          <Route path="conversion/:agentId" element={<AgentDetailPage />} />

          {/* Scaling Intelligence */}
          <Route path="scaling" element={<ScalingIntelligencePage />} />
          <Route path="scaling/:agentId" element={<AgentDetailPage />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
