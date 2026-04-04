import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TrafficIntelligencePage from './pages/TrafficIntelligencePage'
import AgentDetailPage from './pages/AgentDetailPage'
import OpsManagementPage from './pages/OpsManagementPage'
import ConversionIntelligencePage from './pages/ConversionIntelligencePage'
import ScalingIntelligencePage from './pages/ScalingIntelligencePage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children, user }: { children: React.ReactNode; user: any }) {
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { user, logout } = useAuth()
  const [authUser, setAuthUser] = useState(user)

  const handleLogin = (u: any) => setAuthUser(u)
  const handleLogout = () => { logout(); setAuthUser(null) }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={authUser ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/" element={
          <ProtectedRoute user={authUser}>
            <Layout user={authUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />

          {/* Traffic Intelligence */}
          <Route path="traffic" element={<TrafficIntelligencePage />} />
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
