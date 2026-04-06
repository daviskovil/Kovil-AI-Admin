import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus,
         AlertTriangle, CheckCircle, Info, ExternalLink, Bell, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
interface GSCSnapshot {
  id: string
  synced_at: string
  date_range_start: string
  date_range_end: string
  overview: { clicks: number; impressions: number; ctr: number; avgPosition: number }
  by_query:   { query: string;   clicks: number; impressions: number; ctr: number; position: number }[]
  by_page:    { page: string;    clicks: number; impressions: number; ctr: number; position: number }[]
  by_country: { country: string; clicks: number; impressions: number; ctr: number; position: number }[]
  by_device:  { device: string;  clicks: number; impressions: number; ctr: number; position: number }[]
  by_date:    { date: string;    clicks: number; impressions: number; ctr: number; position: number }[]
}

// ─── Data: real GSC sync 2026-04-05 ──────────────────────────────────────────
const LAST_SYNCED = '2026-04-05 · 09:45 EST'
const DATE_RANGE  = 'Mar 8 – Apr 4, 2026 (28 days)'

const overview = { clicks: 257, impressions: 60064, ctr: 0.43, avgPosition: 18.6 }

// Health scorecard (Module 1)
const healthTiles = [
  { label: 'Indexing',        status: 'amber', summary: '~18 pages indexed · 2 gaps detected' },
  { label: 'Coverage',        status: 'red',   summary: '30+ /onlines/ spam pages still indexed' },
  { label: 'Core Web Vitals', status: 'green', summary: 'All key pages passing CWV' },
  { label: 'Sitemap',         status: 'green', summary: 'Submitted · No errors' },
  { label: 'Manual Actions',  status: 'green', summary: 'No penalties detected' },
  { label: 'Mobile Usability',status: 'green', summary: 'No mobile errors detected' },
]

// Alert feed (Section 6)
const alerts = [
  { severity: 'critical', headline: 'n8n article: 13,300 impressions, 0.06% CTR — title is not driving clicks', url: '/blog/n8n-vs-zapier-vs-power-automate', action: 'Rewrite title + add H2 comparison section', ts: '2026-04-05' },
  { severity: 'critical', headline: '30+ spam /onlines/ pages still indexed — absorbing crawl budget and brand equity', url: '/onlines/*', action: 'GSC removal requests submitted — monitor weekly', ts: '2026-04-05' },
  { severity: 'high',     headline: '"ai lifecycle" cluster: 962 impressions at position 25 — no dedicated page until now', url: '/blog/ai-development-lifecycle', action: 'New post published Apr 6 — monitor indexing weekly', ts: '2026-04-05' },
  { severity: 'high',     headline: '/engage/managed-ai-engineer ranking pos 18.4 — primary service page below page 1', url: '/engage/managed-ai-engineer', action: 'Add internal links from homepage + blog posts with target anchor text', ts: '2026-04-05' },
  { severity: 'medium',   headline: 'US traffic is 22% of clicks — Kovil AI is US-targeted but most impressions are non-US', url: null, action: 'Review geo distribution once spam deindex completes', ts: '2026-04-05' },
  { severity: 'medium',   headline: '/blog/what-is-ai-integration at position 23.4 — high impression page stuck on page 3', url: '/blog/what-is-ai-integration', action: 'Strengthen with internal links + content refresh', ts: '2026-04-05' },
  { severity: 'positive', headline: '9 broken redirects fixed — 1,800+ impressions now properly routed', url: null, action: null, ts: '2026-04-05' },
  { severity: 'positive', headline: 'Homepage CTR 3.5% — healthy click rate, position 6.9', url: '/', action: null, ts: '2026-04-05' },
]

// Quick stats (Row 3 of Dashboard)
const stats = [
  { label: 'Clicks (28d)',    value: '257',    change: null,    note: 'No prior period data yet' },
  { label: 'Impressions',     value: '60,064', change: null,    note: 'No prior period data yet' },
  { label: 'Avg CTR',         value: '0.43%',  change: 'down',  note: 'Target >3%' },
  { label: 'Avg Position',    value: '18.6',   change: 'down',  note: 'Target <10' },
]

// Top 3 opportunity cards (Row 4 of Dashboard)
const topOpportunities = [
  { type: 'CTR Gap', page: '/blog/n8n-vs-zapier-vs-power-automate', query: 'power automate vs n8n', impact: '+30–50 clicks/mo', action: 'Rewrite title to "Power Automate vs n8n vs Zapier vs Make (2026)" — CTR should move from 0.06% to 1%+' },
  { type: 'Page 2 Keyword', page: '/blog/ai-development-lifecycle', query: 'ai lifecycle', impact: '+15–25 clicks/mo', action: 'New post published Apr 6. Needs indexing + internal links from /what-is-ai-integration to push from pos 25 to page 1' },
  { type: 'Service Page', page: '/engage/managed-ai-engineer', query: 'managed ai engineer', impact: '+20–40 clicks/mo', action: 'Add internal links from homepage and top blog posts with exact anchor "managed AI engineer"' },
]

// Daily brief
const dailyBrief = `As of April 5, your site has 257 organic clicks and 60,064 impressions over the last 28 days — an average CTR of 0.43% against a target of 3%. The good news: your homepage is healthy at position 6.9 with a 3.5% CTR, and your automation blog post has 43,000+ impressions showing strong topical authority.

The critical issue holding back performance is your n8n article. Google is showing it 13,300 times per month but almost nobody is clicking — 0.06% CTR suggests the title is not matching what searchers want to click on. This single fix could add 30–50 clicks per month immediately.

Today's priority: rewrite the n8n article title to explicitly lead with "Power Automate vs n8n" and include "vs Make" — this matches the actual queries driving impressions. Then add a dedicated H2 comparison section between those two tools.

The ai-development-lifecycle post published today starts a new ranking campaign for the 962-impression "ai lifecycle" cluster. Expect first rankings within 2–3 weeks. Watch for indexing confirmation.`

// Traffic module data
const trafficTrend = [
  { week: 'W1 Mar', clicks: 52, impressions: 12800 },
  { week: 'W2 Mar', clicks: 61, impressions: 14200 },
  { week: 'W3 Mar', clicks: 68, impressions: 15900 },
  { week: 'W4 Mar', clicks: 76, impressions: 17164 },
]
const devices = [
  { d: 'Mobile',  clicks: 144, impressions: 23999, pct: 56 },
  { d: 'Desktop', clicks: 108, impressions: 35777, pct: 42 },
  { d: 'Tablet',  clicks: 5,   impressions: 288,   pct: 2  },
]
const countries = [
  { country: 'United States', clicks: 57, impressions: 24490, flag: '🇺🇸' },
  { country: 'India',         clicks: 29, impressions: 2273,  flag: '🇮🇳' },
  { country: 'Spain',         clicks: 21, impressions: 4000,  flag: '🇪🇸' },
  { country: 'Italy',         clicks: 21, impressions: 3296,  flag: '🇮🇹' },
  { country: 'United Kingdom',clicks: 13, impressions: 4013,  flag: '🇬🇧' },
  { country: 'Canada',        clicks: 9,  impressions: 1360,  flag: '🇨🇦' },
  { country: 'Mexico',        clicks: 9,  impressions: 1713,  flag: '🇲🇽' },
]

// Keywords module data
const topQueries = [
  { query: 'kovil ai',                               clicks: 14, impressions: 45,    ctr: 31.1, position: 2.8,  tag: 'branded',     trend: 'stable' },
  { query: 'power automate vs n8n',                  clicks: 3,  impressions: 577,   ctr: 0.5,  position: 11.1, tag: 'opportunity', trend: 'rising' },
  { query: 'n8n vs power automate',                  clicks: 1,  impressions: 579,   ctr: 0.2,  position: 11.1, tag: 'opportunity', trend: 'rising' },
  { query: 'ai development life cycle',              clicks: 3,  impressions: 138,   ctr: 2.2,  position: 6.6,  tag: 'quick-win',   trend: 'stable' },
  { query: 'ai life cycle',                          clicks: 2,  impressions: 138,   ctr: 1.4,  position: 14.6, tag: 'opportunity', trend: 'stable' },
  { query: 'ai lifecycle',                           clicks: 1,  impressions: 962,   ctr: 0.1,  position: 25.5, tag: 'opportunity', trend: 'rising' },
  { query: 'n8n vs zapier vs make vs power automate',clicks: 1,  impressions: 106,   ctr: 0.9,  position: 3.7,  tag: 'quick-win',   trend: 'stable' },
  { query: 'n8n vs zapier vs power automate',        clicks: 1,  impressions: 13,    ctr: 7.7,  position: 3.1,  tag: 'quick-win',   trend: 'stable' },
  { query: 'kovil.ai',                               clicks: 2,  impressions: 13,    ctr: 15.4, position: 1.0,  tag: 'branded',     trend: 'stable' },
  { query: 'hire machine learning engineer',         clicks: 0,  impressions: 739,   ctr: 0.0,  position: 30.3, tag: 'opportunity', trend: 'stable' },
]

const ctrGaps = [
  { query: 'ai lifecycle',          impressions: 962,  ctr: 0.1,  position: 25.5, page: '/blog/ai-development-lifecycle', currentTitle: 'What is AI Integration', suggestedTitle: 'The AI Development Lifecycle: Complete Guide (2026)', expectedCTRLift: '+0.8–1.2%' },
  { query: 'power automate vs n8n', impressions: 577,  ctr: 0.5,  position: 11.1, page: '/blog/n8n-vs-zapier-vs-power-automate', currentTitle: 'n8n vs Zapier vs Power Automate', suggestedTitle: 'Power Automate vs n8n vs Zapier vs Make: Honest Comparison (2026)', expectedCTRLift: '+1.5–2.0%' },
  { query: 'n8n vs power automate', impressions: 579,  ctr: 0.2,  position: 11.1, page: '/blog/n8n-vs-zapier-vs-power-automate', currentTitle: 'n8n vs Zapier vs Power Automate', suggestedTitle: 'Same page — add dedicated H2: "Power Automate vs n8n: Head-to-Head"', expectedCTRLift: '+0.5–1.0%' },
  { query: 'hire machine learning engineer', impressions: 739, ctr: 0.0, position: 30.3, page: '/engage/managed-ai-engineer', currentTitle: 'Managed AI Engineer', suggestedTitle: 'Hire a Managed AI Engineer | 2-Week Trial | Kovil AI', expectedCTRLift: '+0.3–0.6%' },
]

const page2Keywords = [
  { query: 'power automate vs n8n',             position: 11.1, impressions: 577, page: '/blog/n8n-vs-zapier-vs-power-automate', action: 'Add comparison table + H2 targeting this exact query string' },
  { query: 'n8n vs power automate',             position: 11.1, impressions: 579, page: '/blog/n8n-vs-zapier-vs-power-automate', action: 'Same page as above — both queries point to same content opportunity' },
  { query: 'ai life cycle',                     position: 14.6, impressions: 138, page: '/blog/ai-development-lifecycle',       action: 'New post should capture this variant — monitor over 30 days' },
  { query: 'what is ai integration',            position: 18.2, impressions: 2043,page: '/blog/what-is-ai-integration',         action: 'Refresh content + add internal links from homepage + service pages' },
  { query: 'managed ai engineer',               position: 18.4, impressions: 193, page: '/engage/managed-ai-engineer',          action: 'Internal links from homepage and blog posts with exact anchor text' },
]

const zeroClickQueries = [
  { query: 'hire machine learning engineer', impressions: 739,  position: 30.3, diagnosis: 'Page 3 — not visible enough for clicks. Content gap.', recommendation: 'Dedicated landing page or stronger service page targeting this query' },
  { query: 'ai lifecycle',                   impressions: 962,  position: 25.5, diagnosis: 'Page 3 — new post just published. Give it 3–4 weeks to rank.',  recommendation: 'Monitor weekly. Add internal links from /blog and /what-is-ai-integration' },
  { query: 'rag pipeline engineer',          impressions: 84,   position: 28.1, diagnosis: 'Deep in page 3 — not showing up for clicks at this position.',    recommendation: 'Add dedicated blog post on RAG engineering services' },
]

const brandSplit = { branded: 18, nonBranded: 82, brandedClicks: 16, nonBrandedClicks: 241 }

// Pages module data
const topPages = [
  { page: '/',                                      label: 'Homepage',              weight: 'critical', clicks: 19, impressions: 541,   ctr: 3.5,  position: 6.9,  status: 'healthy' },
  { page: '/blog/n8n-vs-zapier-vs-power-automate',  label: 'n8n vs Power Automate', weight: 'standard', clicks: 8,  impressions: 13300, ctr: 0.06, position: 7.0,  status: 'critical' },
  { page: '/blog/what-is-ai-integration',           label: 'What is AI Integration',weight: 'standard', clicks: 8,  impressions: 2043,  ctr: 0.39, position: 23.4, status: 'warning' },
  { page: '/about',                                 label: 'About',                 weight: 'low',      clicks: 7,  impressions: 93,    ctr: 7.5,  position: 2.9,  status: 'healthy' },
  { page: '/contact',                               label: 'Contact',               weight: 'high',     clicks: 4,  impressions: 128,   ctr: 3.1,  position: 3.5,  status: 'healthy' },
  { page: '/how-it-works',                          label: 'How It Works',          weight: 'high',     clicks: 4,  impressions: 39,    ctr: 10.3, position: 4.9,  status: 'healthy' },
  { page: '/engage/managed-ai-engineer',            label: 'Managed AI Engineer',   weight: 'critical', clicks: 2,  impressions: 193,   ctr: 1.0,  position: 18.4, status: 'warning' },
  { page: '/blog/ai-development-lifecycle',         label: 'AI Dev Lifecycle',      weight: 'standard', clicks: 0,  impressions: 0,     ctr: 0,    position: 0,    status: 'new' },
]

const underperformingPages = [
  { page: '/blog/n8n-vs-zapier-vs-power-automate', impressions: 13300, clicks: 8, issue: 'CTR Gap: 13K impressions, 0.06% CTR', fix: 'Rewrite title to lead with "Power Automate vs n8n" + add H2 comparison table' },
  { page: '/blog/what-is-ai-integration',          impressions: 2043,  clicks: 8, issue: 'Position 23 — too deep for meaningful clicks', fix: 'Content refresh + internal links from homepage and service pages' },
  { page: '/engage/managed-ai-engineer',           impressions: 193,   clicks: 2, issue: 'Critical service page at position 18 — not on page 1', fix: 'Internal link boost from homepage + 3 blog posts' },
]

// Spam tracker
const spamUrls = [
  { url: '/onlines/6I517101578', clicks: 3, impressions: 69, status: 'Removal requested' },
  { url: '/onlines/6I16750173',  clicks: 3, impressions: 4,  status: 'Removal requested' },
  { url: '/onlines/6I661874415', clicks: 2, impressions: 22, status: 'Removal requested' },
  { url: '/onlines/6I664563702', clicks: 2, impressions: 15, status: 'Removal requested' },
  { url: '/onlines/6I791174623', clicks: 2, impressions: 5,  status: 'Removal requested' },
]

// ─── Action items (Actions tab) ───────────────────────────────────────────────
type ActionStatus = 'todo' | 'in-progress' | 'done'
interface ActionItem {
  id: string
  title: string
  detail: string
  criticality: 'critical' | 'high' | 'medium' | 'low'
  category: string
  scoreImpact: number
  page: string | null
}

const actionItems: ActionItem[] = [
  {
    id: 'a1',
    title: 'Rewrite n8n article title to lead with "Power Automate vs n8n"',
    detail: 'Current title is not matching what searchers type. Change to: "Power Automate vs n8n vs Zapier vs Make: Honest Comparison (2026)". Expected CTR lift from 0.06% to 1%+.',
    criticality: 'critical',
    category: 'CTR Optimisation',
    scoreImpact: 8,
    page: '/blog/n8n-vs-zapier-vs-power-automate',
  },
  {
    id: 'a2',
    title: 'Add H2 "Power Automate vs n8n: Head-to-Head" + comparison table',
    detail: '577 impressions for "power automate vs n8n" at pos 11 — content needs a dedicated section answering this exact comparison. Add a 5-row comparison table covering: price, integrations, complexity, self-hosted, and best for.',
    criticality: 'critical',
    category: 'Content',
    scoreImpact: 6,
    page: '/blog/n8n-vs-zapier-vs-power-automate',
  },
  {
    id: 'a3',
    title: 'Monitor and confirm deindexing of /onlines/ spam pages',
    detail: '30+ legacy spam pages still indexed. GSC removal requests submitted. Check GSC Coverage report weekly — these should deindex within 4–8 weeks. Once clear, Coverage score will jump from red to green.',
    criticality: 'critical',
    category: 'Coverage / Technical',
    scoreImpact: 6,
    page: '/onlines/*',
  },
  {
    id: 'a4',
    title: 'Add internal links to /engage/managed-ai-engineer from 3 pages',
    detail: 'Service page stuck at pos 18.4. Add link with anchor "managed AI engineer" from: (1) Homepage hero or nav, (2) /blog/n8n-vs-zapier-vs-power-automate closing section, (3) /blog/ai-development-lifecycle Phase 4 section.',
    criticality: 'high',
    category: 'Internal Links',
    scoreImpact: 5,
    page: '/engage/managed-ai-engineer',
  },
  {
    id: 'a5',
    title: 'Submit /blog/ai-development-lifecycle for URL inspection in GSC',
    detail: 'New post published Apr 6. Submit URL in Google Search Console → URL Inspection → Request Indexing. Confirm indexed within 7–14 days. This starts the ranking clock for the 962-impression "ai lifecycle" cluster.',
    criticality: 'high',
    category: 'Indexing',
    scoreImpact: 4,
    page: '/blog/ai-development-lifecycle',
  },
  {
    id: 'a6',
    title: 'Add internal links to /blog/ai-development-lifecycle from existing posts',
    detail: 'New post needs link equity to rank. Add contextual links from /blog/what-is-ai-integration (high-traffic, same topic) and /engage/managed-ai-engineer. Use anchor text: "AI development lifecycle".',
    criticality: 'high',
    category: 'Internal Links',
    scoreImpact: 3,
    page: '/blog/ai-development-lifecycle',
  },
  {
    id: 'a7',
    title: 'Refresh /blog/what-is-ai-integration — stuck at position 23.4',
    detail: '2,043 impressions at pos 23 = page 3. This page is not getting clicked. Update intro, improve H2 structure, add 3–5 internal links pointing IN from homepage and service pages. Target: move to pos 10–15 within 6 weeks.',
    criticality: 'high',
    category: 'Content',
    scoreImpact: 4,
    page: '/blog/what-is-ai-integration',
  },
  {
    id: 'a8',
    title: 'Add FAQ schema markup to n8n article',
    detail: 'Article has strong topical authority. Adding FAQ schema can earn a rich result in Google, boosting CTR by 20–30% without any ranking change. Add 4–5 FAQ items covering: "Is n8n better than Power Automate?", "n8n vs Zapier pricing", etc.',
    criticality: 'medium',
    category: 'Technical SEO',
    scoreImpact: 3,
    page: '/blog/n8n-vs-zapier-vs-power-automate',
  },
  {
    id: 'a9',
    title: 'Verify /blog/ai-agents-vs-chatbots and /blog/rag-vs-fine-tuning are in sitemap',
    detail: 'Upcoming posts (Apr 6 and Apr 9) must appear in sitemap.xml at publish time. Confirm auto-generation or manually add. Missing from sitemap = slower indexing.',
    criticality: 'medium',
    category: 'Indexing',
    scoreImpact: 2,
    page: '/blog/*',
  },
  {
    id: 'a10',
    title: 'Review US traffic share after spam deindex completes',
    detail: 'Currently 22% US clicks — low for a US-targeted business. Spain + Italy traffic (42 clicks) is likely residual spam audience that will drop once /onlines/ pages deindex. Re-evaluate geo split in 6–8 weeks.',
    criticality: 'medium',
    category: 'Traffic Analysis',
    scoreImpact: 2,
    page: null,
  },
  {
    id: 'a11',
    title: 'Build a dedicated landing page targeting "hire AI engineer startup"',
    detail: '739 impressions at pos 30 — Google thinks we are relevant, but there is no page strong enough to rank. A dedicated page or an expanded section on /engage/managed-ai-engineer could move this to page 1 within 8–12 weeks.',
    criticality: 'medium',
    category: 'Content',
    scoreImpact: 3,
    page: '/engage/managed-ai-engineer',
  },
  {
    id: 'a12',
    title: 'Add meta description to all service pages — most are auto-generated',
    detail: 'Auto-generated meta descriptions reduce CTR. Write custom 155-char meta descriptions for: /engage/managed-ai-engineer, /engage/outcome-based-project, /engage/app-rescue. Focus on value prop + CTA.',
    criticality: 'low',
    category: 'CTR Optimisation',
    scoreImpact: 2,
    page: '/engage/*',
  },
]

// Health sub-scores
const subScores = [
  { label: 'Organic CTR',          score: 15, note: '0.43% vs 3%+ target' },
  { label: 'Avg Position',         score: 38, note: '18.6 avg — needs top-10 pages' },
  { label: 'High-Value Page CTR',  score: 12, note: 'n8n article: 13K impr, 0.06% CTR' },
  { label: 'Quick Win Coverage',   score: 55, note: '3 keywords in pos 3–7, not optimised' },
  { label: 'Spam Deindex Progress',score: 42, note: '30+ /onlines/ pages still indexed' },
  { label: 'Redirect Health',      score: 65, note: '9 broken redirects fixed 2026-04-05' },
]
const overallScore = Math.round(subScores.reduce((s, x) => s + x.score, 0) / subScores.length)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreCol(s: number) {
  if (s >= 80) return 'text-green-600'
  if (s >= 60) return 'text-amber-500'
  if (s >= 40) return 'text-orange-500'
  return 'text-red-500'
}
function scoreBg(s: number) {
  if (s >= 80) return 'bg-green-500'
  if (s >= 60) return 'bg-amber-400'
  if (s >= 40) return 'bg-orange-400'
  return 'bg-red-500'
}
function ctrCol(ctr: number) {
  if (ctr >= 5)  return 'text-green-600 font-semibold'
  if (ctr >= 1)  return 'text-amber-500 font-semibold'
  return 'text-red-500 font-semibold'
}
function posEl(pos: number) {
  if (pos === 0) return <span className="text-gray-300">—</span>
  if (pos <= 3)  return <span className="text-green-600 font-semibold flex items-center gap-1"><TrendingUp className="h-3 w-3"/>{pos.toFixed(1)}</span>
  if (pos <= 10) return <span className="text-amber-500 font-semibold flex items-center gap-1"><Minus className="h-3 w-3"/>{pos.toFixed(1)}</span>
  return <span className="text-red-500 font-semibold flex items-center gap-1"><TrendingDown className="h-3 w-3"/>{pos.toFixed(1)}</span>
}
function tileColor(status: string) {
  if (status === 'green') return { dot: 'bg-green-400', border: 'border-green-100', bg: 'bg-green-50/50', text: 'text-green-700' }
  if (status === 'amber') return { dot: 'bg-amber-400', border: 'border-amber-100', bg: 'bg-amber-50/50', text: 'text-amber-700' }
  return { dot: 'bg-red-400', border: 'border-red-100', bg: 'bg-red-50/50', text: 'text-red-700' }
}
function severityStyle(s: string) {
  if (s === 'critical') return { bg: 'bg-red-50 border-red-100', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Critical' }
  if (s === 'high')     return { bg: 'bg-orange-50 border-orange-100', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', label: 'High' }
  if (s === 'medium')   return { bg: 'bg-amber-50 border-amber-100', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', label: 'Medium' }
  if (s === 'positive') return { bg: 'bg-green-50 border-green-100', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Positive' }
  return { bg: 'bg-blue-50 border-blue-100', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400', label: 'Info' }
}
function weightBadge(w: string) {
  if (w === 'critical') return 'bg-red-50 text-red-600 border-red-100'
  if (w === 'high')     return 'bg-orange-50 text-orange-600 border-orange-100'
  if (w === 'standard') return 'bg-gray-50 text-gray-500 border-gray-100'
  return 'bg-gray-50 text-gray-400 border-gray-100'
}
function statusBadge(s: string) {
  if (s === 'healthy')  return 'bg-green-50 text-green-700 border-green-100'
  if (s === 'warning')  return 'bg-amber-50 text-amber-700 border-amber-100'
  if (s === 'critical') return 'bg-red-50 text-red-700 border-red-100'
  return 'bg-blue-50 text-blue-700 border-blue-100'
}
function tagEl(tag: string) {
  const map: Record<string, { cls: string; label: string }> = {
    branded:     { cls: 'bg-green-50 text-green-700', label: 'Branded' },
    'quick-win': { cls: 'bg-amber-50 text-amber-700',  label: 'Quick Win' },
    opportunity: { cls: 'bg-orange-50 text-orange-700',label: 'Opportunity' },
  }
  const t = map[tag] ?? { cls: 'bg-gray-50 text-gray-400', label: tag }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.cls}`}>{t.label}</span>
}

type Tab = 'dashboard' | 'traffic' | 'keywords' | 'pages' | 'reports' | 'actions'
type KwTab = 'top' | 'ctr-gaps' | 'page2' | 'zero-click' | 'brand'
type ActionFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'todo' | 'in-progress' | 'done'

// ─── Component ────────────────────────────────────────────────────────────────
export default function GSCAgentPage() {
  const [scanning, setScanning]         = useState(false)
  const [syncError, setSyncError]       = useState<string | null>(null)
  const [tab, setTab]                   = useState<Tab>('dashboard')
  const [kwTab, setKwTab]               = useState<KwTab>('top')
  const [dismissed, setDismissed]       = useState<number[]>([])
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [expandedAction, setExpandedAction] = useState<string | null>(null)
  const [actionStates, setActionStates] = useState<Record<string, { status: ActionStatus; remarks: string }>>({})
  const [savingAction, setSavingAction] = useState<string | null>(null)
  const [snapshot, setSnapshot]         = useState<GSCSnapshot | null>(null)
  const [loadingData, setLoadingData]   = useState(true)
  const remarksTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // ── Load snapshot + action states on mount ──────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [dataRes, actionsRes] = await Promise.all([
          api.get('/agents/gsc/data'),
          api.get('/agents/gsc/actions'),
        ])
        if (dataRes.data.snapshot) setSnapshot(dataRes.data.snapshot)
        const states: Record<string, { status: ActionStatus; remarks: string }> = {}
        ;(actionsRes.data.actions || []).forEach((a: any) => {
          states[a.id] = { status: a.status as ActionStatus, remarks: a.remarks || '' }
        })
        setActionStates(states)
      } catch {
        // fallback: keep empty state, user can still use the UI
      } finally {
        setLoadingData(false)
      }
    }
    init()
  }, [])

  // ── Sync GSC data ───────────────────────────────────────────────────────────
  async function handleScan() {
    setScanning(true)
    setSyncError(null)
    try {
      const { data } = await api.post('/agents/gsc/sync')
      if (data.snapshot) setSnapshot(data.snapshot)
    } catch (err: any) {
      setSyncError(err.response?.data?.error || 'Sync failed — check backend logs')
    } finally {
      setScanning(false)
    }
  }

  // ── Action state handlers (API-backed) ──────────────────────────────────────
  async function setActionStatus(id: string, status: ActionStatus) {
    setActionStates(prev => ({ ...prev, [id]: { ...prev[id], status } }))
    setSavingAction(id)
    try {
      await api.put(`/agents/gsc/actions/${id}`, { status })
    } finally {
      setSavingAction(null)
    }
  }

  function setActionRemarks(id: string, remarks: string) {
    setActionStates(prev => ({ ...prev, [id]: { ...prev[id], remarks } }))
    // Debounce save to API
    if (remarksTimers.current[id]) clearTimeout(remarksTimers.current[id])
    remarksTimers.current[id] = setTimeout(async () => {
      try { await api.put(`/agents/gsc/actions/${id}`, { remarks }) } catch {}
    }, 800)
  }

  const doneCount    = Object.values(actionStates).filter(s => s.status === 'done').length
  const inProgCount  = Object.values(actionStates).filter(s => s.status === 'in-progress').length
  const scoreGained  = actionItems.filter(a => actionStates[a.id]?.status === 'done').reduce((s, a) => s + a.scoreImpact, 0)
  const scorePotential = actionItems.reduce((s, a) => s + a.scoreImpact, 0)

  // ── Live data — use snapshot when available, else fall back to static ────────
  const liveOverview = snapshot?.overview ?? overview

  const liveStats = [
    { label: 'Clicks (28d)',  value: liveOverview.clicks.toLocaleString(),            change: null,   note: 'No prior period data yet' },
    { label: 'Impressions',   value: liveOverview.impressions.toLocaleString(),        change: null,   note: 'No prior period data yet' },
    { label: 'Avg CTR',       value: `${liveOverview.ctr}%`,                           change: 'down', note: 'Target >3%' },
    { label: 'Avg Position',  value: `${liveOverview.avgPosition}`,                    change: 'down', note: 'Target <10' },
  ]

  const flagMap: Record<string, string> = {
    usa: '🇺🇸', ind: '🇮🇳', esp: '🇪🇸', ita: '🇮🇹', gbr: '🇬🇧', can: '🇨🇦', mex: '🇲🇽',
    deu: '🇩🇪', fra: '🇫🇷', aus: '🇦🇺', bra: '🇧🇷', phl: '🇵🇭', pak: '🇵🇰', nld: '🇳🇱',
    sgp: '🇸🇬', nzl: '🇳🇿', zaf: '🇿🇦', are: '🇦🇪', prt: '🇵🇹', pol: '🇵🇱',
  }

  const liveCountries = snapshot?.by_country?.map(c => ({
    country: c.country.charAt(0).toUpperCase() + c.country.slice(1),
    clicks: c.clicks, impressions: c.impressions,
    flag: flagMap[c.country.toLowerCase()] ?? '🌐',
  })) ?? countries

  const maxCountryClicks = Math.max(1, ...liveCountries.map(c => c.clicks))

  const liveDevices = snapshot?.by_device?.map(d => ({
    d: d.device.charAt(0).toUpperCase() + d.device.slice(1),
    clicks: d.clicks, impressions: d.impressions,
    pct: liveOverview.clicks > 0 ? Math.round((d.clicks / liveOverview.clicks) * 100) : 0,
  })) ?? devices

  const liveDateTrend = snapshot?.by_date
    ? (() => {
        // Group daily data into weekly buckets
        const sorted = [...snapshot.by_date].sort((a, b) => a.date.localeCompare(b.date))
        const weeks: { week: string; clicks: number; impressions: number }[] = []
        for (let i = 0; i < sorted.length; i += 7) {
          const chunk = sorted.slice(i, i + 7)
          const start = chunk[0]?.date?.slice(5) ?? ''
          weeks.push({
            week: `w/c ${start}`,
            clicks: chunk.reduce((s, r) => s + r.clicks, 0),
            impressions: chunk.reduce((s, r) => s + r.impressions, 0),
          })
        }
        return weeks
      })()
    : trafficTrend

  const maxWeekClicks = Math.max(1, ...liveDateTrend.map(w => w.clicks))

  const liveKeywords = snapshot?.by_query?.slice(0, 50).map(q => ({
    query: q.query, clicks: q.clicks, impressions: q.impressions,
    ctr: q.ctr, position: q.position,
    tag: q.position <= 3 ? 'quick-win' : q.impressions > 500 && q.ctr < 1 ? 'opportunity' : 'standard',
    trend: 'stable' as const,
  })) ?? topQueries

  const livePages = snapshot?.by_page?.slice(0, 20).map(p => ({
    page: p.page.replace('https://kovil.ai', ''),
    label: p.page.replace('https://kovil.ai', ''),
    weight: 'standard' as const,
    clicks: p.clicks, impressions: p.impressions,
    ctr: p.ctr, position: p.position,
    status: p.ctr < 0.5 && p.impressions > 200 ? 'critical' : p.position > 15 ? 'warning' : 'healthy',
  })) ?? topPages

  const lastSyncedDisplay = snapshot
    ? new Date(snapshot.synced_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
    : LAST_SYNCED

  const dateRangeDisplay = snapshot
    ? `${snapshot.date_range_start} – ${snapshot.date_range_end} (28 days)`
    : DATE_RANGE

  const activeAlerts = alerts.filter((_, i) => !dismissed.includes(i))

  // ── Tab nav ──────────────────────────────────────────────────────────────────
  const mainTabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'traffic',   label: 'Traffic' },
    { key: 'keywords',  label: 'Keywords' },
    { key: 'pages',     label: 'Pages' },
    { key: 'reports',   label: 'Reports' },
    { key: 'actions',   label: 'Actions' },
  ]

  return (
    <div className="p-8 max-w-7xl">

      {/* Back */}
      <Link to="/traffic" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Traffic Intelligence
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">T-GSC · Traffic Intelligence</span>
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Critical · {overallScore}/100</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">GSC Performance Agent</h1>
          <p className="text-sm text-gray-400 mt-1">Google Search Console · {dateRangeDisplay}</p>
          <p className="text-[10px] text-gray-300 mt-0.5">
            {loadingData ? 'Loading…' : snapshot ? `Last synced: ${lastSyncedDisplay} · Live data` : `Last synced: ${lastSyncedDisplay} · No sync yet — click Sync GSC Data`}
            {' '}· Data has 2–3 day lag inherent to GSC API
          </p>
          {syncError && (
            <p className="text-[10px] text-red-500 mt-1 bg-red-50 px-2 py-1 rounded-lg">⚠ {syncError}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" strokeWidth="8"
                  strokeDasharray={`${(overallScore / 100) * 213.6} 213.6`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-xl text-red-500">{overallScore}</span>
                <span className="text-[8px] text-gray-400">/ 100</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Health Score</p>
          </div>
          <button onClick={handleScan} disabled={scanning}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${scanning ? 'animate-spin' : ''}`}/>
            {scanning ? 'Syncing GSC…' : 'Sync GSC Data'}
          </button>
        </div>
      </div>

      {/* Main tab bar */}
      <div className="flex border-b border-gray-100 mb-6">
        {mainTabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-xs font-semibold transition-colors ${tab === t.key ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
            {t.label}
            {t.key === 'dashboard' && activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full inline-flex items-center justify-center">
                {activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
              </span>
            )}
            {t.key === 'actions' && (
              <span className={`ml-1.5 text-[9px] font-bold w-4 h-4 rounded-full inline-flex items-center justify-center ${doneCount === actionItems.length ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {doneCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ─────────────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">

          {/* Row 1: Health Scorecard */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Site Health Scorecard</h2>
            <div className="grid grid-cols-6 gap-3">
              {healthTiles.map(tile => {
                const c = tileColor(tile.status)
                return (
                  <div key={tile.label} className={`border rounded-xl p-3.5 ${c.border} ${c.bg}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-2 h-2 rounded-full ${c.dot}`}/>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{tile.label}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{tile.summary}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Row 2: Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            {liveStats.map(s => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`font-display font-bold text-3xl ${s.change === 'down' ? 'text-red-500' : 'text-gray-900'}`}>{s.value}</p>
                <p className="text-[10px] text-gray-300 mt-1">{s.note}</p>
              </div>
            ))}
          </div>

          {/* Row 3: Alert Feed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-3.5 w-3.5 text-gray-400"/>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Alerts</h2>
              <span className="text-[10px] text-gray-300">{activeAlerts.length} active</span>
            </div>
            <div className="space-y-2">
              {activeAlerts.map((alert, i) => {
                const s = severityStyle(alert.severity)
                return (
                  <div key={i} className={`border rounded-xl p-4 flex items-start gap-3 ${s.bg}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
                        {alert.url && <span className="text-[10px] text-gray-400 font-mono truncate">{alert.url}</span>}
                      </div>
                      <p className="text-[12px] font-semibold text-gray-800 leading-snug">{alert.headline}</p>
                      {alert.action && <p className="text-[11px] text-gray-500 mt-1">→ {alert.action}</p>}
                    </div>
                    <button onClick={() => setDismissed(d => [...d, i])}
                      className="text-[10px] text-gray-300 hover:text-gray-500 shrink-0">Dismiss</button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Row 4: Top Opportunities */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top Opportunities</h2>
            <div className="grid grid-cols-3 gap-4">
              {topOpportunities.map((o, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{o.type}</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{o.impact}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mb-2">{o.page}</p>
                  <p className="text-xs font-semibold text-gray-700 mb-2">"{o.query}"</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{o.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 5: Daily Brief */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">AI Daily Brief</span>
              <span className="text-[10px] text-gray-300">Generated {LAST_SYNCED}</span>
            </div>
            <div className="space-y-3">
              {dailyBrief.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TRAFFIC TAB ───────────────────────────────────────────────────────── */}
      {tab === 'traffic' && (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Organic Clicks', value: liveOverview.clicks.toLocaleString(),       sub: '28-day total', color: 'text-gray-900' },
              { label: 'Impressions',    value: liveOverview.impressions.toLocaleString(),   sub: '28-day total', color: 'text-gray-900' },
              { label: 'Avg CTR',        value: `${liveOverview.ctr}%`,                      sub: 'Target: >3%',  color: 'text-red-500' },
              { label: 'Avg Position',   value: `${liveOverview.avgPosition}`,               sub: 'Target: <10',  color: 'text-red-500' },
            ].map(k => (
              <div key={k.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{k.label}</p>
                <p className={`font-display font-bold text-3xl ${k.color}`}>{k.value}</p>
                <p className="text-[10px] text-gray-300 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Weekly trend (simple bar chart) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 mb-5">Weekly Click Trend {snapshot && <span className="font-normal text-orange-400 ml-1">· live</span>}</h3>
            <div className="flex items-end gap-4 h-32">
              {liveDateTrend.map((w, i) => {
                const pct = (w.clicks / maxWeekClicks) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-orange-500">{w.clicks}</span>
                    <div className="w-full bg-gray-50 rounded-t-lg relative" style={{ height: '80px' }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-orange-400 rounded-t-lg transition-all"
                        style={{ height: `${pct}%` }}/>
                    </div>
                    <span className="text-[9px] text-gray-400">{w.week}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-4 italic">
              {snapshot ? 'Live data from Google Search Console.' : 'Snapshot from Apr 5 sync. Click "Sync GSC Data" for live numbers.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Device split */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-700 mb-4">Device Breakdown {snapshot && <span className="font-normal text-orange-400">· live</span>}</h3>
              <div className="space-y-4">
                {liveDevices.map(d => (
                  <div key={d.d}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-gray-600 font-semibold">{d.d}</span>
                      <span className="text-[11px] text-gray-500">{d.clicks} clicks · {d.impressions.toLocaleString()} impr</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-orange-400 rounded-full" style={{ width: `${d.pct}%` }}/>
                    </div>
                    <p className="text-[9px] text-gray-300 mt-0.5">{d.pct}% of clicks</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-4 italic pt-3 border-t border-gray-50">
                Mobile leads at 56% of clicks. Monitor if mobile CTR diverges from desktop — currently in line.
              </p>
            </div>

            {/* Country breakdown */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-700 mb-1">Country Breakdown {snapshot && <span className="font-normal text-orange-400">· live</span>}</h3>
              <p className="text-[11px] text-amber-600 mb-4 bg-amber-50 px-3 py-2 rounded-lg">
                ⚠️ US share is only ~22% of clicks. Kovil AI is US-targeted. Spain + Italy traffic is likely residual spam audience.
              </p>
              <div className="space-y-2.5">
                {liveCountries.map(c => (
                  <div key={c.country} className="flex items-center gap-3">
                    <span className="text-sm">{c.flag}</span>
                    <span className="text-[11px] text-gray-600 w-28">{c.country}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${(c.clicks / maxCountryClicks) * 100}%` }}/>
                    </div>
                    <span className="text-[10px] text-gray-500 w-20 text-right">{c.clicks}c / {c.impressions.toLocaleString()}i</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health sub-scores */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 mb-4">Health Score Breakdown</h3>
            <div className="grid grid-cols-3 gap-5">
              {subScores.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-gray-600 font-medium">{s.label}</span>
                    <span className={`text-[11px] font-bold ${scoreCol(s.score)}`}>{s.score}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full ${scoreBg(s.score)}`} style={{ width: `${s.score}%` }}/>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── KEYWORDS TAB ─────────────────────────────────────────────────────── */}
      {tab === 'keywords' && (
        <div>
          {/* Keyword sub-tabs */}
          <div className="flex gap-1 mb-6 bg-gray-50 rounded-xl p-1 w-fit">
            {([
              { key: 'top',       label: 'Top Performers' },
              { key: 'ctr-gaps',  label: 'CTR Gaps' },
              { key: 'page2',     label: 'Page 2 Keywords' },
              { key: 'zero-click',label: 'Zero-Click' },
              { key: 'brand',     label: 'Brand Split' },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setKwTab(t.key)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${kwTab === t.key ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Top Performers */}
          {kwTab === 'top' && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                <p className="text-[11px] text-gray-500">Top 10 queries by clicks · 28 days · Sorted by impressions to show full opportunity landscape</p>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5">Query</div>
                  <div className="col-span-1 text-right">Clicks</div>
                  <div className="col-span-2 text-right">Impressions</div>
                  <div className="col-span-1 text-right">CTR</div>
                  <div className="col-span-1 text-right">Position</div>
                  <div className="col-span-2 text-right">Type</div>
                </div>
                {(snapshot ? liveKeywords : topQueries).map((q: typeof topQueries[0], i: number) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50">
                    <div className="col-span-5">
                      <p className="text-sm text-gray-800">{q.query}</p>
                      {q.trend === 'rising' && <span className="text-[9px] text-green-600 flex items-center gap-0.5 mt-0.5"><TrendingUp className="h-2.5 w-2.5"/>Rising</span>}
                    </div>
                    <div className="col-span-1 text-right text-sm font-bold text-gray-700">{q.clicks}</div>
                    <div className="col-span-2 text-right text-sm text-gray-500">{q.impressions.toLocaleString()}</div>
                    <div className={`col-span-1 text-right text-sm ${ctrCol(q.ctr)}`}>{q.ctr.toFixed(1)}%</div>
                    <div className="col-span-1 text-right">{posEl(q.position)}</div>
                    <div className="col-span-2 text-right">{tagEl(q.tag)}</div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-orange-50/30 border-t border-orange-100">
                <p className="text-[11px] text-orange-700 font-medium">Agent insight: Your top-performing branded term "kovil ai" has a 31% CTR — healthy. The real opportunity is the automation comparison cluster (power automate vs n8n, n8n vs power automate) with 1,156 combined impressions at position 11 and less than 0.5% CTR. One content fix could unlock 20–40 more clicks per month.</p>
              </div>
            </div>
          )}

          {/* CTR Gaps */}
          {kwTab === 'ctr-gaps' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
                <p className="text-[12px] text-amber-800 font-semibold mb-1">CTR Gap Opportunities — {ctrGaps.length} queries identified</p>
                <p className="text-[11px] text-amber-700">These are queries Google is already showing your site for, but users aren't clicking. Improving titles and meta descriptions here requires no new content — just better copy. Expected combined impact: +50–70 clicks/month.</p>
              </div>
              {ctrGaps.map((g, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-800">"{g.query}"</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{g.page}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-500">{g.impressions.toLocaleString()} impressions · <span className="text-red-500 font-bold">{g.ctr}% CTR</span> · Pos {g.position}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-red-50/50 rounded-xl p-3 border border-red-100">
                      <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Current Title</p>
                      <p className="text-[11px] text-gray-700">{g.currentTitle}</p>
                    </div>
                    <div className="bg-green-50/50 rounded-xl p-3 border border-green-100">
                      <p className="text-[9px] font-bold text-green-600 uppercase mb-1">Suggested Title</p>
                      <p className="text-[11px] text-gray-700">{g.suggestedTitle}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-green-700 font-semibold mt-3">Expected CTR lift: {g.expectedCTRLift}</p>
                </div>
              ))}
            </div>
          )}

          {/* Page 2 Keywords */}
          {kwTab === 'page2' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-5 py-4">
                <p className="text-[12px] text-orange-800 font-semibold mb-1">Page 2 Keywords — {page2Keywords.length} queries in positions 11–20</p>
                <p className="text-[11px] text-orange-700">These are your highest-ROI SEO targets. A jump from position 12 to position 8 can triple clicks with no new content. Each one needs a targeted push: internal links, content update, or schema.</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                  <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <div className="col-span-3">Query</div>
                    <div className="col-span-1 text-right">Position</div>
                    <div className="col-span-2 text-right">Impressions</div>
                    <div className="col-span-3">Page</div>
                    <div className="col-span-3">Recommended Action</div>
                  </div>
                  {page2Keywords.map((k, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-start hover:bg-orange-50/10">
                      <div className="col-span-3 text-sm font-medium text-gray-800">{k.query}</div>
                      <div className="col-span-1 text-right">{posEl(k.position)}</div>
                      <div className="col-span-2 text-right text-sm text-gray-500">{k.impressions.toLocaleString()}</div>
                      <div className="col-span-3 text-[10px] text-gray-400 font-mono">{k.page}</div>
                      <div className="col-span-3 text-[11px] text-gray-500">{k.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Zero-Click */}
          {kwTab === 'zero-click' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
                <p className="text-[12px] text-blue-800 font-semibold mb-1">Zero-Click Queries — {zeroClickQueries.length} queries · {zeroClickQueries.reduce((s, q) => s + q.impressions, 0).toLocaleString()} total impressions</p>
                <p className="text-[11px] text-blue-700">Google is showing your site for these queries but no clicks are coming through. Usually means deep ranking (page 3+) or a featured snippet taking all clicks.</p>
              </div>
              {zeroClickQueries.map((q, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-bold text-gray-800">"{q.query}"</p>
                    <p className="text-[11px] text-gray-500">{q.impressions.toLocaleString()} impressions · Pos {q.position}</p>
                  </div>
                  <p className="text-[11px] text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mb-2">Diagnosis: {q.diagnosis}</p>
                  <p className="text-[11px] text-gray-600">→ {q.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Brand Split */}
          {kwTab === 'brand' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-700 mb-5">Brand vs Non-Brand Traffic</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-green-700">Branded queries</span>
                        <span className="text-[11px] text-green-700 font-bold">{brandSplit.brandedClicks} clicks · {brandSplit.branded}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-3 bg-green-400 rounded-full" style={{ width: `${brandSplit.branded}%` }}/>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-orange-700">Non-branded organic</span>
                        <span className="text-[11px] text-orange-700 font-bold">{brandSplit.nonBrandedClicks} clicks · {brandSplit.nonBranded}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-3 bg-orange-400 rounded-full" style={{ width: `${brandSplit.nonBranded}%` }}/>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-50">
                    <p className="text-[11px] text-gray-500 leading-relaxed">Non-brand traffic at 82% is strong — SEO is working. The SRS target is above 60% non-brand. You're already there. Focus is now on growing the absolute volume of non-brand clicks from 241 to 400+.</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-700 mb-4">Brand Keyword Performance</h3>
                  <div className="space-y-3">
                    {topQueries.filter(q => q.tag === 'branded').map((q, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-[12px] font-medium text-gray-800">{q.query}</p>
                          <p className="text-[10px] text-gray-400">Position {q.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-bold text-gray-700">{q.clicks} clicks</p>
                          <p className={`text-[11px] ${ctrCol(q.ctr)}`}>{q.ctr}% CTR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-4 italic">Brand CTR is healthy (15–31%). Protect brand rankings by ensuring homepage meta tags are compelling.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PAGES TAB ─────────────────────────────────────────────────────────── */}
      {tab === 'pages' && (
        <div className="space-y-6">
          {/* Page performance table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-700">Page Performance Ranking</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">All indexed pages · Last 28 days · Business weight applied to alert sensitivity</p>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="grid grid-cols-12 gap-3 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <div className="col-span-4">Page</div>
                <div className="col-span-1 text-right">Weight</div>
                <div className="col-span-1 text-right">Clicks</div>
                <div className="col-span-2 text-right">Impressions</div>
                <div className="col-span-1 text-right">CTR</div>
                <div className="col-span-1 text-right">Pos</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              {livePages.map((p, i) => (
                <div key={i} className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50/50 ${p.status === 'critical' ? 'bg-red-50/20' : ''}`}>
                  <div className="col-span-4">
                    <a href={`https://kovil.ai${p.page}`} target="_blank" rel="noopener noreferrer"
                      className="text-[12px] text-gray-800 hover:text-orange-500 flex items-center gap-1 transition-colors">
                      <span className="truncate">{p.page}</span>
                      <ExternalLink className="h-3 w-3 opacity-40 shrink-0"/>
                    </a>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${weightBadge(p.weight)}`}>{p.weight}</span>
                  </div>
                  <div className="col-span-1 text-right text-sm font-bold text-gray-700">{p.clicks}</div>
                  <div className="col-span-2 text-right text-sm text-gray-500">{p.impressions === 0 ? '—' : p.impressions.toLocaleString()}</div>
                  <div className={`col-span-1 text-right text-sm ${p.impressions === 0 ? 'text-gray-300' : ctrCol(p.ctr)}`}>{p.impressions === 0 ? '—' : `${p.ctr}%`}</div>
                  <div className="col-span-1 text-right">{posEl(p.position)}</div>
                  <div className="col-span-2 text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(p.status)}`}>
                      {p.status === 'new' ? 'New · Not indexed' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Underperforming pages */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 mb-3">Underperforming Pages — High Impressions, Low Clicks</h3>
            <div className="space-y-3">
              {underperformingPages.map((p, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <a href={`https://kovil.ai${p.page}`} target="_blank" rel="noopener noreferrer"
                      className="text-[12px] font-semibold text-gray-800 hover:text-orange-500 flex items-center gap-1">
                      {p.page} <ExternalLink className="h-3 w-3 opacity-40"/>
                    </a>
                    <span className="text-[11px] text-gray-500">{p.impressions.toLocaleString()} impressions · {p.clicks} clicks</span>
                  </div>
                  <p className="text-[11px] text-red-600 bg-red-50 px-3 py-1.5 rounded-lg mb-2">Issue: {p.issue}</p>
                  <p className="text-[11px] text-gray-600">→ Fix: {p.fix}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spam tracker */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 mb-3">Spam Pages — Legacy /onlines/ URLs Still Indexed</h3>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-red-50/40 border-b border-red-100">
                <p className="text-[12px] text-red-700 font-semibold">30+ /onlines/ spam pages from the previous site are still indexed. GSC removal requests submitted. All return 404 — Google will deindex naturally within 4–8 weeks.</p>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <div className="col-span-6">URL</div>
                  <div className="col-span-2 text-right">Clicks</div>
                  <div className="col-span-2 text-right">Impressions</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>
                {spamUrls.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3 items-center">
                    <div className="col-span-6 text-[11px] text-red-400 font-mono">{s.url}</div>
                    <div className="col-span-2 text-right text-sm text-gray-700">{s.clicks}</div>
                    <div className="col-span-2 text-right text-sm text-gray-500">{s.impressions}</div>
                    <div className="col-span-2 text-right">
                      <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 font-semibold px-2 py-0.5 rounded-full">{s.status}</span>
                    </div>
                  </div>
                ))}
                <div className="px-5 py-3 text-[11px] text-gray-400 italic">
                  + 25 more /onlines/ pages with 0 clicks — all returning 404 and deindexing naturally.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORTS TAB ───────────────────────────────────────────────────────── */}
      {tab === 'reports' && (
        <div className="space-y-6">
          {/* Daily brief */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Daily Brief</span>
                <p className="text-xs text-gray-400 mt-0.5">Generated {LAST_SYNCED}</p>
              </div>
              <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full border border-green-100">AI Generated · High Confidence</span>
            </div>
            <div className="space-y-3 mb-5">
              {dailyBrief.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed">{para}</p>
              ))}
            </div>
          </div>

          {/* Weekly report */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Weekly Intelligence Report</span>
                <p className="text-xs text-gray-400 mt-0.5">Week of Mar 30 – Apr 5, 2026</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                Export PDF
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <h4 className="text-[11px] font-bold text-gray-600 uppercase mb-2">Executive Summary</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Kovil AI has 257 organic clicks over 28 days from 60,064 impressions — a 0.43% CTR that is well below the 3% target. The site is generating strong Google visibility (60K impressions is meaningful for a site this early) but is failing to convert that visibility into clicks, primarily due to one severely underperforming page. The n8n automation article alone accounts for 22% of total impressions but generates less than 1% of clicks. Fixing this article's title is the single highest-leverage action available right now.</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[11px] font-bold text-green-700 uppercase mb-2">Top 3 Winning Queries This Week</h4>
                  <div className="space-y-2">
                    {[
                      { q: 'kovil ai', note: '14 clicks, 31% CTR — brand is strong' },
                      { q: 'ai development life cycle', note: '3 clicks at pos 6.6 — close to top 5' },
                      { q: 'n8n vs zapier vs make', note: '1 click, pos 3.7 — in striking distance' },
                    ].map((w, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0"/>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-700">"{w.q}"</p>
                          <p className="text-[10px] text-gray-400">{w.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-red-700 uppercase mb-2">Top 3 Issues This Week</h4>
                  <div className="space-y-2">
                    {[
                      { q: 'power automate vs n8n', note: '577 impressions, 0.5% CTR — title mismatch' },
                      { q: 'ai lifecycle', note: '962 impressions at pos 25 — no page until now' },
                      { q: 'hire ml engineer', note: '739 impressions, 0 clicks — page 3, content gap' },
                    ].map((w, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0"/>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-700">"{w.q}"</p>
                          <p className="text-[10px] text-gray-400">{w.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-orange-600 uppercase mb-2">Top 3 Priorities for Next Week</h4>
                <div className="space-y-2">
                  {[
                    { p: '1', action: 'Rewrite n8n article title to "Power Automate vs n8n vs Zapier vs Make (2026)" + add H2 comparison section', impact: '+30–50 clicks/mo' },
                    { p: '2', action: 'Add 3 internal links to /engage/managed-ai-engineer from homepage, n8n post, and AI integration post', impact: '+15–25 clicks/mo' },
                    { p: '3', action: 'Confirm /blog/ai-development-lifecycle is indexed — submit to GSC for URL inspection', impact: '+10–20 clicks/mo in 3–4 weeks' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-start gap-3 bg-orange-50/50 rounded-xl px-4 py-3">
                      <span className="text-[11px] font-bold text-orange-500 w-4 shrink-0">{p.p}.</span>
                      <p className="text-[11px] text-gray-700 flex-1">{p.action}</p>
                      <span className="text-[10px] font-semibold text-green-600 whitespace-nowrap">{p.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Benchmark targets */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 mb-4">6-Month Benchmark Targets</h3>
            <div className="divide-y divide-gray-50">
              {[
                { metric: 'Monthly organic clicks', current: '~275/mo (estimated)', target: '+50% from baseline', onTrack: false },
                { metric: 'Average position',       current: '18.6',                target: 'Under 20',           onTrack: true },
                { metric: 'Average CTR',            current: '0.43%',               target: 'Above 3%',           onTrack: false },
                { metric: 'Indexed pages',          current: '~18 pages',           target: '100% published',     onTrack: false },
                { metric: 'Non-brand traffic %',    current: '82%',                 target: 'Above 60%',          onTrack: true },
                { metric: 'Page 1 keyword count',   current: '3 keywords',          target: '15+ keywords',       onTrack: false },
              ].map((b, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 py-3 items-center">
                  <p className="text-[12px] text-gray-700 font-medium">{b.metric}</p>
                  <p className="text-[11px] text-gray-500">{b.current}</p>
                  <p className="text-[11px] text-gray-500">{b.target}</p>
                  <div className="text-right">
                    {b.onTrack
                      ? <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1 justify-end w-fit ml-auto"><CheckCircle className="h-3 w-3"/>On Track</span>
                      : <span className="text-[10px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1 justify-end w-fit ml-auto"><Info className="h-3 w-3"/>Needs Work</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIONS TAB ───────────────────────────────────────────────────────── */}
      {tab === 'actions' && (() => {
        const critStyle: Record<string, { badge: string; dot: string; label: string; ring: string }> = {
          critical: { badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500',    label: 'Critical', ring: 'border-l-4 border-l-red-400' },
          high:     { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', label: 'High',  ring: 'border-l-4 border-l-orange-400' },
          medium:   { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400',  label: 'Medium', ring: 'border-l-4 border-l-amber-300' },
          low:      { badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400',   label: 'Low',    ring: 'border-l-4 border-l-blue-300' },
        }
        const statusStyle: Record<ActionStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
          'todo':        { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'To Do',       icon: <Minus className="h-3 w-3"/> },
          'in-progress': { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'In Progress', icon: <RefreshCw className="h-3 w-3"/> },
          'done':        { bg: 'bg-green-100',   text: 'text-green-700',  label: 'Done',        icon: <CheckCircle className="h-3 w-3"/> },
        }

        const filtered = actionItems.filter(a => {
          if (actionFilter === 'all') return true
          if (actionFilter === 'todo' || actionFilter === 'in-progress' || actionFilter === 'done')
            return actionStates[a.id]?.status === actionFilter
          return a.criticality === actionFilter
        })

        return (
          <div className="space-y-5">

            {/* Score progress bar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-700">Actions Progress — Score Impact Tracker</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Completing all actions could raise the health score from {overallScore} → {Math.min(100, overallScore + scorePotential)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-2xl text-orange-500">{doneCount} / {actionItems.length}</p>
                  <p className="text-[10px] text-gray-400">actions completed</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'To Do',       count: actionItems.length - doneCount - inProgCount, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' },
                  { label: 'In Progress', count: inProgCount,  color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                  { label: 'Done',        count: doneCount,    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                  { label: 'Score gained',count: scoreGained,  color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', suffix: ' pts' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 text-center`}>
                    <p className={`font-display font-bold text-2xl ${s.color}`}>{s.count}{'suffix' in s ? s.suffix : ''}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-orange-400 rounded-full transition-all" style={{ width: `${(doneCount / actionItems.length) * 100}%` }}/>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Filter:</span>
              {(['all', 'critical', 'high', 'medium', 'low', 'todo', 'in-progress', 'done'] as ActionFilter[]).map(f => (
                <button key={f} onClick={() => setActionFilter(f)}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-full border transition-colors capitalize ${actionFilter === f ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
                  {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <span className="text-[10px] text-gray-300 ml-2">{filtered.length} action{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Action list */}
            <div className="space-y-2">
              {filtered.map(action => {
                const cs = critStyle[action.criticality]
                const st = actionStates[action.id] ?? { status: 'todo' as ActionStatus, remarks: '' }
                const ss = statusStyle[st.status]
                const isExpanded = expandedAction === action.id

                return (
                  <div key={action.id} className={`bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${cs.ring}`}>

                    {/* Row header */}
                    <div className="flex items-center gap-4 px-5 py-4">

                      {/* Status toggle */}
                      <div className="relative shrink-0">
                        <select
                          value={st.status}
                          onChange={e => setActionStatus(action.id, e.target.value as ActionStatus)}
                          className={`appearance-none text-[10px] font-bold pl-6 pr-5 py-1.5 rounded-full cursor-pointer focus:outline-none transition-colors ${ss.bg} ${ss.text}`}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <span className={`absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${ss.text}`}>{ss.icon}</span>
                        <ChevronDown className={`absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 pointer-events-none ${ss.text}`}/>
                      </div>

                      {/* Criticality badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cs.badge}`}>{cs.label}</span>

                      {/* Title */}
                      <p className={`text-[12px] font-semibold flex-1 leading-snug ${st.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {action.title}
                      </p>

                      {/* Category */}
                      <span className="text-[10px] text-gray-400 shrink-0 hidden lg:block">{action.category}</span>

                      {/* Score impact */}
                      <span className={`text-[11px] font-bold shrink-0 ${st.status === 'done' ? 'text-green-600' : 'text-orange-500'}`}>
                        {st.status === 'done' ? '✓' : '+'}{action.scoreImpact} pts
                      </span>

                      {/* Page */}
                      {action.page && (
                        <a href={`https://kovil.ai${action.page}`} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="shrink-0 text-gray-300 hover:text-orange-400 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5"/>
                        </a>
                      )}

                      {/* Expand toggle */}
                      <button onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                        className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                      </button>
                    </div>

                    {/* Expanded detail + remarks */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-3 bg-gray-50/30">
                        <p className="text-[11px] text-gray-600 leading-relaxed">{action.detail}</p>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                            Remarks / Dependencies / Notes
                          </label>
                          <textarea
                            value={st.remarks}
                            onChange={e => setActionRemarks(action.id, e.target.value)}
                            placeholder="Add notes, blockers, dependencies, or what was done…"
                            rows={2}
                            className="w-full text-[11px] text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-orange-300 placeholder-gray-300 leading-relaxed"
                          />
                        </div>
                        {action.page && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Affected page:</span>
                            <a href={`https://kovil.ai${action.page}`} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-orange-500 hover:underline font-mono flex items-center gap-1">
                              kovil.ai{action.page} <ExternalLink className="h-2.5 w-2.5"/>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-300">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3"/>
                  <p className="text-sm font-semibold">No actions match this filter</p>
                </div>
              )}
            </div>

          </div>
        )
      })()}

    </div>
  )
}
