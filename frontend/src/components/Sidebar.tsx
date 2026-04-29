import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, Globe, Navigation,
  BookOpen, BookMarked, Search, Image, BarChart2,
  Settings, LogOut,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  onLogout: () => void
}

export default function Sidebar({ user, onLogout }: Props) {
  const navigate = useNavigate()
  const handleLogout = () => { onLogout(); navigate('/login') }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer mb-0.5 border-l-[3px] ${
      isActive
        ? 'bg-orange-50 text-orange-500 font-semibold border-orange-400'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-transparent'
    }`

  const userInitial = user.email?.charAt(0).toUpperCase() ?? 'A'

  const navItems = [
    { to: '/',                  end: true,  icon: LayoutDashboard, label: 'Dashboard'          },
    { to: '/leads',             end: false, icon: Users,           label: 'Leads'              },
    { to: '/applications',      end: false, icon: FileText,        label: 'Applications'       },
    { to: '/pages',             end: false, icon: Globe,           label: 'Pages'              },
    { to: '/navigation',        end: false, icon: Navigation,      label: 'Navigation Editor'  },
    { to: '/blog-editor',       end: false, icon: BookOpen,        label: 'Blog Editor'        },
    { to: '/case-study-editor', end: false, icon: BookMarked,      label: 'Case Study Editor'  },
    { to: '/seo',               end: false, icon: Search,          label: 'SEO Panel'          },
    { to: '/media',             end: false, icon: Image,           label: 'Media Library'      },
    { to: '/analytics',         end: false, icon: BarChart2,       label: 'Analytics'          },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-30">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-bold text-base">K</span>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 leading-none tracking-tight">Kovil AI</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}

        {/* Divider */}
        <div className="pt-2 border-t border-gray-100 mt-2" />

        <NavLink to="/settings" className={navLinkClass}>
          <Settings className="h-4 w-4 shrink-0" />
          <span className="flex-1">Settings</span>
        </NavLink>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-orange-500">{userInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user.email || 'Admin'}</p>
            <p className="text-[10px] text-gray-400">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer p-1"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

    </aside>
  )
}
