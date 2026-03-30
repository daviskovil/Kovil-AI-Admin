import { Router } from 'express'
import { supabase } from '../supabase/client.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/stats', requireAuth, async (req, res) => {
  const [
    { count: totalLeads },
    { count: newLeads },
    { count: totalApplications },
    { count: newApplications },
    { count: approvedBuilders },
    { count: publishedPosts },
    { count: publishedCaseStudies },
    { data: recentLeads },
    { data: recentApplications },
    { data: recentActivity }
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('case_studies').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('leads').select('id, name, email, engagement_type, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('applications').select('id, full_name, email, role, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('activity_log').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(10)
  ])

  res.json({
    stats: {
      totalLeads, newLeads,
      totalApplications, newApplications,
      approvedBuilders,
      publishedPosts, publishedCaseStudies
    },
    recentLeads,
    recentApplications,
    recentActivity
  })
})

export default router
