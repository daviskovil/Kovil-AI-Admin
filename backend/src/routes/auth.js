import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../supabase/client.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'

const router = Router()

// Login
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(401).json({ error: 'Invalid credentials' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (!profile) return res.status(403).json({ error: 'No admin profile found' })

  await supabase.from('profiles').update({ last_login: new Date() }).eq('id', profile.id)
  await supabase.from('activity_log').insert({ user_id: profile.id, action: 'login', resource_type: 'auth' })

  const token = jwt.sign({ id: profile.id, role: profile.role }, process.env.JWT_SECRET, { expiresIn: '8h' })

  res.json({ token, user: { id: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role } })
})

// Get current user
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// Create new admin (Super Admin only)
router.post('/users', requireAuth, requireRole('super_admin'), async (req, res) => {
  const { email, password, full_name, role } = req.body
  if (!email || !password || !role) return res.status(400).json({ error: 'email, password, role required' })
  if (!['admin', 'reviewer'].includes(role)) return res.status(400).json({ error: 'Invalid role' })

  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) return res.status(400).json({ error: error.message })

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id, email, full_name, role, created_by: req.user.id
  })
  if (profileError) return res.status(500).json({ error: profileError.message })

  await supabase.from('activity_log').insert({
    user_id: req.user.id, action: 'create_user',
    resource_type: 'profile', resource_id: data.user.id,
    details: { email, role }
  })

  res.status(201).json({ message: 'Admin user created' })
})

// List all admin users (Super Admin only)
router.get('/users', requireAuth, requireRole('super_admin'), async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('id, email, full_name, role, created_at, last_login').order('created_at')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Delete admin user (Super Admin only)
router.delete('/users/:id', requireAuth, requireRole('super_admin'), async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' })

  await supabase.auth.admin.deleteUser(req.params.id)
  await supabase.from('profiles').delete().eq('id', req.params.id)

  await supabase.from('activity_log').insert({
    user_id: req.user.id, action: 'delete_user',
    resource_type: 'profile', resource_id: req.params.id
  })

  res.json({ message: 'User deleted' })
})

export default router
