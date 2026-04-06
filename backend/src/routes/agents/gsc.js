import { Router } from 'express'
import { google } from 'googleapis'
import path from 'path'
import { fileURLToPath } from 'url'
import { requireAuth } from '../../middleware/auth.js'
import { agentLimiter } from '../../middleware/rateLimit.js'
import { supabase } from '../../supabase/client.js'

const router = Router()

// ─── Google Auth ──────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getGSCClient() {
  const keyFile = path.resolve(
    __dirname, '../../../../',
    process.env.GSC_SERVICE_ACCOUNT_PATH || './gsc-service-account.json'
  )
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  return google.searchconsole({ version: 'v1', auth })
}

const SITE_URL = process.env.GSC_SITE_URL || 'https://kovil.ai/'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dateStr(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

async function queryAnalytics(sc, dimensions, rowLimit = 500, extraFilters = []) {
  const endDate   = dateStr(3)   // GSC has ~3 day lag
  const startDate = dateStr(31)  // 28-day window ending 3 days ago

  const res = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit,
    },
  })
  return { rows: res.data.rows || [], startDate, endDate }
}

// ─── POST /sync ───────────────────────────────────────────────────────────────
// Calls the GSC API and stores a fresh snapshot in Supabase
router.post('/sync', requireAuth, agentLimiter, async (req, res) => {
  try {
    const sc = getGSCClient()

    // Fetch all dimensions in parallel
    const [overall, byQuery, byPage, byCountry, byDevice, byDate] = await Promise.all([
      queryAnalytics(sc, []),                   // overall totals
      queryAnalytics(sc, ['query'], 100),       // top queries
      queryAnalytics(sc, ['page'],  50),        // top pages
      queryAnalytics(sc, ['country'], 20),      // top countries
      queryAnalytics(sc, ['device'], 10),       // device breakdown
      queryAnalytics(sc, ['date'],  35),        // daily trend
    ])

    // ── Calculate overview ──
    const overallRow = overall.rows[0]?.keys ? null : overall.rows
    let totalClicks = 0, totalImpressions = 0
    overall.rows.forEach(r => {
      totalClicks      += r.clicks      || 0
      totalImpressions += r.impressions || 0
    })
    // If no dimensions, the single row has totals
    const singleRow = overall.rows[0] || {}
    const overview = {
      clicks:       singleRow.clicks       || totalClicks,
      impressions:  singleRow.impressions  || totalImpressions,
      ctr:          singleRow.ctr          ? +(singleRow.ctr * 100).toFixed(2)          : 0,
      avgPosition:  singleRow.position     ? +singleRow.position.toFixed(1)             : 0,
    }

    // ── Shape row arrays ──
    const shapeRows = (rows, dims) =>
      rows.map(r => {
        const obj = {}
        dims.forEach((d, i) => { obj[d] = r.keys?.[i] ?? null })
        obj.clicks      = r.clicks      || 0
        obj.impressions = r.impressions || 0
        obj.ctr         = r.ctr         ? +(r.ctr * 100).toFixed(2) : 0
        obj.position    = r.position    ? +r.position.toFixed(1)    : 0
        return obj
      })

    const snapshot = {
      date_range_start: byQuery.startDate,
      date_range_end:   byQuery.endDate,
      overview,
      by_query:   shapeRows(byQuery.rows,   ['query']),
      by_page:    shapeRows(byPage.rows,    ['page']),
      by_country: shapeRows(byCountry.rows, ['country']),
      by_device:  shapeRows(byDevice.rows,  ['device']),
      by_date:    shapeRows(byDate.rows,    ['date']),
    }

    // ── Store in Supabase ──
    const { data, error } = await supabase
      .from('gsc_snapshots')
      .insert(snapshot)
      .select()
      .single()

    if (error) throw new Error(error.message)

    res.json({ ok: true, snapshot: data })
  } catch (err) {
    console.error('GSC sync error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── GET /data ────────────────────────────────────────────────────────────────
// Returns the most recent snapshot from Supabase
router.get('/data', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gsc_snapshots')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)

    res.json({ snapshot: data || null })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── GET /snapshots ───────────────────────────────────────────────────────────
// Returns last N snapshots for trend comparison
router.get('/snapshots', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const { data, error } = await supabase
      .from('gsc_snapshots')
      .select('id, synced_at, date_range_start, date_range_end, overview')
      .order('synced_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    res.json({ snapshots: data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── GET /actions ─────────────────────────────────────────────────────────────
// Returns all GSC action item states
router.get('/actions', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gsc_action_states')
      .select('*')
      .order('id')

    if (error) throw new Error(error.message)
    res.json({ actions: data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── PUT /actions/:id ─────────────────────────────────────────────────────────
// Update status and/or remarks for a single action item
router.put('/actions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status, remarks } = req.body

    const updates = { updated_at: new Date().toISOString() }
    if (status  !== undefined) updates.status  = status
    if (remarks !== undefined) updates.remarks = remarks

    const { data, error } = await supabase
      .from('gsc_action_states')
      .upsert({ id, ...updates }, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw new Error(error.message)
    res.json({ action: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
