import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, BookOpen, Search,
  Cpu, BarChart2, TrendingUp, LogOut, ChevronRight,
  UserCheck, Settings, Megaphone
} from 'lucide-react'
import { AdminUser } from '../hooks/useAuth'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Leads', path: '/leads', icon: Users },
  { label: 'Applications', path: '/applications', icon: UserCheck },
  { label: 'Content Manager', path: '/content', icon: FileText },
  { type: 'divider', label: 'AI Agents' },
  { label: 'SEO Optimizer', path: '/agents/seo', icon: Search },
  { label: 'AEO Optimizer', path: '/agents/aeo', icon: Cpu },
  { label: 'Keyword Analysis', path: '/agents/keywords', icon: BarChart2 },
  { label: 'Competitor Analysis', path: '/agents/competitors', icon: TrendingUp },
  { label: 'Outreach Agent', path: '/agents/outreach', icon: Megaphone },
  { type: 'divider', label: 'Settings' },
  { label: 'User Management', path: '/users', icon: Settings, superAdminOnly: true },
]

interface Props {
  user: AdminUser
  onLogout: () => void
}

export default function Sidebar({ user, onLogout }: Props) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <img src="/kovil-logo-symbol.png" alt="Kovil AI" className="h-7 w-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div>
            <p className="font-display font-bold text-sm text-gray-900 leading-none">Kovil AI</p>
            <p className="text-[10px] text-accent font-medium tracking-wide mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item, i) => {
          if (item.type === 'divider') {
            return (
              <p key={i} className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-3 pt-4 pb-1.5">
                {item.label}
              </p>
            )
          }
          if (item.superAdminOnly && user.role !== 'super_admin') return null
          const Icon = item.icon!
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer mb-0.5 ${
                  isActive
                    ? 'bg-orange-50 text-accent'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
            </NavLink>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-accent">
              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-900 truncate">{user.full_name || 'Admin'}</p>
            <p className="text-[10px] text-gray-400 truncate capitalize">{user.role.replace('_', ' ')}</p>
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
