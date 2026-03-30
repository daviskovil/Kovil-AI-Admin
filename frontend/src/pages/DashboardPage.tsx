import { useEffect, useState } from 'react'
import { Users, UserCheck, FileText, BookOpen, TrendingUp, Clock } from 'lucide-react'
import api from '../lib/api'

interface Stats {
  totalLeads: number; newLeads: number
  totalApplications: number; newApplications: number
  approvedBuilders: number; publishedPosts: number; publishedCaseStudies: number
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-orange-100 text-orange-700',
  matched: 'bg-purple-100 text-purple-700',
  closed: 'bg-green-100 text-green-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => {
        setStats(data.stats)
        setRecentLeads(data.recentLeads || [])
        setRecentApplications(data.recentApplications || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-gray-400 text-sm">Loading dashboard...</div>
    </div>
  )

  const statCards = [
    { label: 'Total Leads', value: stats?.totalLeads, sub: `${stats?.newLeads} new`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Applications', value: stats?.totalApplications, sub: `${stats?.newApplications} new`, icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Builders', value: stats?.approvedBuilders, sub: 'approved & ready', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Published Content', value: (stats?.publishedPosts || 0) + (stats?.publishedCaseStudies || 0), sub: `${stats?.publishedPosts} posts · ${stats?.publishedCaseStudies} case studies`, icon: FileText, color: 'text-accent', bg: 'bg-orange-50' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </div>
              </div>
              <p className="font-display font-bold text-2xl text-gray-900">{card.value ?? '—'}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-sm text-gray-900">Recent Leads</h2>
            <a href="/leads" className="text-xs text-accent hover:underline">View all</a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeads.length === 0 && (
              <p className="text-xs text-gray-400 px-5 py-4">No leads yet.</p>
            )}
            {recentLeads.map((lead) => (
              <div key={lead.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{lead.name || lead.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{lead.engagement_type?.replace(/_/g, ' ')}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-sm text-gray-900">Recent Applications</h2>
            <a href="/applications" className="text-xs text-accent hover:underline">View all</a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentApplications.length === 0 && (
              <p className="text-xs text-gray-400 px-5 py-4">No applications yet.</p>
            )}
            {recentApplications.map((app) => (
              <div key={app.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{app.full_name}</p>
                  <p className="text-xs text-gray-400">{app.role}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                  {app.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
