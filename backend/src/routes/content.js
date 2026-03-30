import { Router } from 'express'
import { supabase } from '../supabase/client.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// --- Blog Posts ---
router.get('/posts', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/posts', requireAuth, async (req, res) => {
  const { title, slug, excerpt, content, author, tags } = req.body
  if (!title || !slug) return res.status(400).json({ error: 'title and slug required' })

  const { data, error } = await supabase.from('blog_posts')
    .insert({ title, slug, excerpt, content, author, tags, created_by: req.user.id })
    .select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.put('/posts/:id', requireAuth, async (req, res) => {
  const updates = { ...req.body, updated_at: new Date() }
  if (updates.published && !updates.published_at) updates.published_at = new Date()

  const { data, error } = await supabase.from('blog_posts').update(updates).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/posts/:id', requireAuth, async (req, res) => {
  await supabase.from('blog_posts').delete().eq('id', req.params.id)
  res.json({ message: 'Post deleted' })
})

// --- Case Studies ---
router.get('/case-studies', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('case_studies').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/case-studies', requireAuth, async (req, res) => {
  const { title, slug, client_industry, summary, content, tags, results } = req.body
  if (!title || !slug) return res.status(400).json({ error: 'title and slug required' })

  const { data, error } = await supabase.from('case_studies')
    .insert({ title, slug, client_industry, summary, content, tags, results, created_by: req.user.id })
    .select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.put('/case-studies/:id', requireAuth, async (req, res) => {
  const updates = { ...req.body, updated_at: new Date() }
  if (updates.published && !updates.published_at) updates.published_at = new Date()

  const { data, error } = await supabase.from('case_studies').update(updates).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/case-studies/:id', requireAuth, async (req, res) => {
  await supabase.from('case_studies').delete().eq('id', req.params.id)
  res.json({ message: 'Case study deleted' })
})

export default router
