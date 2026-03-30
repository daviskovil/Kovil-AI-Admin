import jwt from 'jsonwebtoken'
import { supabase } from '../supabase/client.js'

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.id)
      .single()

    if (error || !profile) return res.status(401).json({ error: 'Invalid token' })

    req.user = profile
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
