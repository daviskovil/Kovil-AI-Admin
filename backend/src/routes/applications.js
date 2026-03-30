import { Router } from 'express'
import multer from 'multer'
import { supabase } from '../supabase/client.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', requireAuth, async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query
  let query = supabase.from('applications').select('*', { count: 'exact' }).order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,role.ilike.%${search}%`)

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({ data, count, page: Number(page), limit: Number(limit) })
})

router.get('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('applications').select('*').eq('id', req.params.id).single()
  if (error) return res.status(404).json({ error: 'Application not found' })
  res.json(data)
})

router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['status', 'notes', 'reviewed_by']
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
  if (updates.status && ['approved', 'rejected', 'under_review'].includes(updates.status)) {
    updates.reviewed_by = req.user.id
  }
  updates.updated_at = new Date()

  const { data, error } = await supabase.from('applications').update(updates).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })

  await supabase.from('activity_log').insert({
    user_id: req.user.id, action: `application_${updates.status || 'updated'}`,
    resource_type: 'application', resource_id: req.params.id
  })

  res.json(data)
})

export default router
