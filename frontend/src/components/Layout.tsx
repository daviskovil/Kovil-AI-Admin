import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
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
