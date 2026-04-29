import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import PagesPage from './pages/PagesPage'
import NavigationEditorPage from './pages/NavigationEditorPage'
import BlogEditorPage from './pages/BlogEditorPage'
import CaseStudyEditorPage from './pages/CaseStudyEditorPage'
import SEOPanelPage from './pages/SEOPanelPage'
import MediaLibraryPage from './pages/MediaLibraryPage'
import AnalyticsPage from './pages/AnalyticsPage'
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
          <Route index                  element={<DashboardPage />} />
          <Route path="leads"           element={<LeadsPage />} />
          <Route path="applications"    element={<ApplicationsPage />} />
          <Route path="pages"           element={<PagesPage />} />
          <Route path="navigation"      element={<NavigationEditorPage />} />
          <Route path="blog-editor"     element={<BlogEditorPage />} />
          <Route path="case-study-editor" element={<CaseStudyEditorPage />} />
          <Route path="seo"             element={<SEOPanelPage />} />
          <Route path="media"           element={<MediaLibraryPage />} />
          <Route path="analytics"       element={<AnalyticsPage />} />
          <Route path="settings"        element={<SettingsPage />} />

          {/* Legacy redirects — keep old deep-links working */}
          <Route path="ops/leads"        element={<Navigate to="/leads" replace />} />
          <Route path="ops/applications" element={<Navigate to="/applications" replace />} />
          <Route path="ops"              element={<Navigate to="/leads" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
