import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import UserManagementPage from './pages/UserManagementPage'
import SEOAgentPage from './pages/agents/SEOAgentPage'
import AEOAgentPage from './pages/agents/AEOAgentPage'
import KeywordsAgentPage from './pages/agents/KeywordsAgentPage'
import CompetitorsAgentPage from './pages/agents/CompetitorsAgentPage'
import OutreachAgentPage from './pages/agents/OutreachAgentPage'

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
          <Route path="leads" element={<LeadsPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="agents/seo" element={<SEOAgentPage />} />
          <Route path="agents/aeo" element={<AEOAgentPage />} />
          <Route path="agents/keywords" element={<KeywordsAgentPage />} />
          <Route path="agents/competitors" element={<CompetitorsAgentPage />} />
          <Route path="agents/outreach" element={<OutreachAgentPage />} />
          {authUser?.role === 'super_admin' && (
            <Route path="users" element={<UserManagementPage currentUser={authUser} />} />
          )}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
