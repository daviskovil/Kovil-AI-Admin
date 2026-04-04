import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { AdminUser } from '../hooks/useAuth'

interface Props {
  user: AdminUser
  onLogout: () => void
}

export default function Layout({ user, onLogout }: Props) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
