import { Router } from 'express'
import { supabase } from '../supabase/client.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query
  let query = supabase.from('leads').select('*', { count: 'exact' }).order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (search) query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,company.ilike.%${search}%`)

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({ data, count, page: Number(page), limit: Number(limit) })
})

router.get('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*').eq('id', req.params.id).single()
  if (error) return res.status(404).json({ error: 'Lead not found' })
  res.json(data)
})

router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['status', 'notes', 'assigned_to']
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
  updates.updated_at = new Date()

  const { data, error } = await supabase.from('leads').update(updates).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })

  await supabase.from('activity_log').insert({
    user_id: req.user.id, action: 'update_lead',
    resource_type: 'lead', resource_id: req.params.id,
    details: updates
  })

  res.json(data)
})

router.delete('/:id', requireAuth, async (req, res) => {
  await supabase.from('leads').delete().eq('id', req.params.id)
  res.json({ message: 'Lead deleted' })
})

export default router
