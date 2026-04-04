import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  UserCheck,
  Kanban,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  onLogout: () => void
}

export default function Sidebar({ user, onLogout }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [opsOpen, setOpsOpen] = useState(location.pathname.startsWith('/ops'))

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const isOpsActive = location.pathname.startsWith('/ops')
  const isTrafficActive = location.pathname.startsWith('/traffic')
  const isConversionActive = location.pathname.startsWith('/conversion')
  const isScalingActive = location.pathname.startsWith('/scaling')

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer mb-0.5 ${
      isActive
        ? 'bg-orange-50 text-orange-500 font-semibold'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`

  const subNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 pl-9 pr-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer mb-0.5 ${
      isActive
        ? 'bg-orange-50 text-orange-500 font-semibold'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-display font-bold text-sm">K</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-gray-900 leading-none">Kovil AI</p>
            <p className="text-[10px] text-orange-500 font-medium tracking-wide mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {/* Dashboard */}
        <NavLink to="/" end className={navLinkClass}>
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          <span className="flex-1">Dashboard</span>
        </NavLink>

        {/* Phase 1 */}
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-3 pt-4 pb-1.5">
          Phase 1
        </p>

        {/* Traffic Intelligence */}
        <NavLink
          to="/traffic"
          className={() =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer mb-0.5 ${
              isTrafficActive
                ? 'bg-orange-50 text-orange-500 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1">Traffic Intelligence</span>
          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">18</span>
        </NavLink>

        {/* Phase 2 */}
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-3 pt-4 pb-1.5">
          Phase 2
        </p>

        {/* Ops Management (collapsible) */}
        <button
          onClick={() => setOpsOpen(!opsOpen)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer mb-0.5 w-full ${
            isOpsActive
              ? 'bg-orange-50 text-orange-500 font-semibold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Briefcase className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Ops Management</span>
          {opsOpen
            ? <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            : <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          }
        </button>

        {opsOpen && (
          <div className="mb-1">
            <NavLink to="/ops/leads" className={subNavLinkClass}>
              <Users className="h-3.5 w-3.5 shrink-0" />
              Leads
            </NavLink>
            <NavLink to="/ops/applications" className={subNavLinkClass}>
              <FileText className="h-3.5 w-3.5 shrink-0" />
              Applications
            </NavLink>
            <NavLink to="/ops/roster" className={subNavLinkClass}>
              <UserCheck className="h-3.5 w-3.5 shrink-0" />
              Builder Roster
            </NavLink>
            <NavLink to="/ops/pipeline" className={subNavLinkClass}>
              <Kanban className="h-3.5 w-3.5 shrink-0" />
              Pipeline / CRM
            </NavLink>
          </div>
        )}

        {/* Phase 3 */}
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-3 pt-4 pb-1.5">
          Phase 3
        </p>

        {/* Conversion Intelligence */}
        <NavLink
          to="/conversion"
          className={() =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer mb-0.5 ${
              isConversionActive
                ? 'bg-orange-50 text-orange-500 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <Target className="h-4 w-4 shrink-0" />
          <span className="flex-1">Conversion Intelligence</span>
          <span className="text-[10px] font-bold bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full">Phase 3</span>
        </NavLink>

        {/* Phase 4 */}
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-3 pt-4 pb-1.5">
          Phase 4
        </p>

        {/* Scaling Intelligence */}
        <NavLink
          to="/scaling"
          className={() =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer mb-0.5 ${
              isScalingActive
                ? 'bg-orange-50 text-orange-500 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <TrendingUp className="h-4 w-4 shrink-0" />
          <span className="flex-1">Scaling Intelligence</span>
          <span className="text-[10px] font-bold bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full">Phase 4</span>
        </NavLink>

        {/* Divider */}
        <div className="border-t border-gray-100 my-3" />

        {/* Settings */}
        <NavLink to="/settings" className={navLinkClass}>
          <Settings className="h-4 w-4 shrink-0" />
          <span className="flex-1">Settings</span>
        </NavLink>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-orange-500">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">{user.email || 'Admin'}</p>
            <p className="text-[10px] text-gray-400 truncate capitalize">Super Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer w-full"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
