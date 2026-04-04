import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? 'https://jhqfdvhmleiutjxpodud.supabase.co'
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  try {
    // Verify the caller is authenticated and is a super_admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Get the calling user from their JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callerUser }, error: authErr } = await userClient.auth.getUser(token)
    if (authErr || !callerUser) return json({ error: 'Unauthorized' }, 401)

    // Check caller's role in profiles
    const { data: callerProfile } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (callerProfile?.role !== 'super_admin') {
      return json({ error: 'Only super admins can manage users' }, 403)
    }

    const body = await req.json()
    const { action } = body

    // ── LIST USERS ──────────────────────────────────────────────────────────
    if (action === 'list') {
      const { data: profiles, error } = await userClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) return json({ error: error.message }, 500)
      return json({ users: profiles })
    }

    // ── CREATE USER ─────────────────────────────────────────────────────────
    if (action === 'create') {
      const { email, password, full_name, role } = body

      if (!email || !password || !full_name || !role) {
        return json({ error: 'email, password, full_name, and role are required' }, 400)
      }

      if (!['admin', 'reviewer'].includes(role)) {
        return json({ error: 'Role must be admin or reviewer' }, 400)
      }

      // Create auth user
      const { data: newUser, error: createErr } = await userClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role },
      })

      if (createErr) return json({ error: createErr.message }, 500)

      // Insert into profiles
      const { error: profileErr } = await userClient.from('profiles').insert({
        id: newUser.user.id,
        email,
        full_name,
        role,
        created_by: callerUser.id,
      })

      if (profileErr) return json({ error: profileErr.message }, 500)

      return json({ ok: true, user: { id: newUser.user.id, email, full_name, role } })
    }

    // ── DELETE USER ─────────────────────────────────────────────────────────
    if (action === 'delete') {
      const { user_id } = body
      if (!user_id) return json({ error: 'user_id required' }, 400)

      // Prevent deleting yourself
      if (user_id === callerUser.id) return json({ error: 'Cannot delete your own account' }, 400)

      // Delete from auth
      const { error: deleteErr } = await userClient.auth.admin.deleteUser(user_id)
      if (deleteErr) return json({ error: deleteErr.message }, 500)

      // Delete from profiles
      await userClient.from('profiles').delete().eq('id', user_id)

      return json({ ok: true })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (err) {
    console.error('manage-users error:', err)
    return json({ error: String(err) }, 500)
  }
})
