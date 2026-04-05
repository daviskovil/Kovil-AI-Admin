export type AgentModule = 'traffic' | 'conversion' | 'scaling'
export type AgentStatus = 'healthy' | 'needs-work' | 'at-risk' | 'critical' | 'not-run'
export type Priority = 'High' | 'Medium' | 'Low'
export type Effort = 'Quick Fix' | 'Medium' | 'Project'

export interface AgentFinding {
  severity: 'critical' | 'warning' | 'info'
  title: string
  whyItMatters: string
  fix: string
  impact: Priority
}

export interface ActionItem {
  issue: string
  whyItMatters: string
  whatToDo: string
  estimatedImpact: string
  effort: Effort
  priority: Priority
  status: 'todo' | 'in_progress' | 'done'
}

export interface Agent {
  id: string
  code: string
  label: string
  module: AgentModule
  schedule: string
  dataSources: string[]
  score: number
  status: AgentStatus
  lastScanned: string | null
  topFinding: string
  subScores: { label: string; score: number }[]
  findings: AgentFinding[]
  actions: ActionItem[]
}

// ─── TRAFFIC INTELLIGENCE — 18 agents + GSC Agent ───────────────────────────

export const gscAgent: Agent = {
  id: 't-gsc', code: 'T-GSC', label: 'GSC Performance Agent', module: 'traffic',
  schedule: 'Daily · 06:00 EST', dataSources: ['Google Search Console'],
  score: 30, status: 'critical', lastScanned: '2026-04-05',
  topFinding: '60K impressions, 0.43% CTR — n8n article has 13,300 impressions at pos 7 with 0.06% CTR',
  subScores: [
    { label: 'Organic CTR',          score: 15 },
    { label: 'Avg Position',         score: 38 },
    { label: 'High-Value Page CTR',  score: 12 },
    { label: 'Quick Win Coverage',   score: 55 },
    { label: 'Spam Deindex Progress',score: 42 },
    { label: 'Redirect Health',      score: 65 },
  ],
  findings: [
    { severity: 'critical', title: 'n8n article: 13,300 impressions at pos 7, CTR 0.06%', whyItMatters: 'At position 7 with this many impressions, even a 1% CTR would be 133 clicks/month — 16x current.', fix: 'Optimise title tag to lead with "Power Automate vs n8n". Add H2 sections for each head-to-head comparison query.', impact: 'High' },
    { severity: 'critical', title: '"ai lifecycle" — 962 impressions, pos 25, no matching page', whyItMatters: 'High search volume keyword with no dedicated content. Old redirect was pointing to wrong page.', fix: 'New blog post /blog/ai-development-lifecycle published 2026-04-05. Monitor weekly.', impact: 'High' },
    { severity: 'warning',  title: '30+ /onlines/ spam pages still indexed by Google', whyItMatters: 'Spam impressions inflate total impression count and dilute domain authority signals.', fix: 'GSC removal requests submitted. Pages return 404 — will deindex naturally within 4–8 weeks.', impact: 'Medium' },
    { severity: 'warning',  title: 'Overall CTR at 0.43% vs 2%+ industry benchmark', whyItMatters: 'Low CTR signals poor title/meta relevance to search intent. Hurts click-through across all pages.', fix: 'Prioritise title tag rewrites for top 5 high-impression pages.', impact: 'High' },
    { severity: 'info',     title: '9 old pages fixed: redirects added for 404s with active impressions', whyItMatters: 'Previously lost 1,800+ impressions/month to broken pages. Now properly redirected.', fix: 'Monitor via GSC over next 4 weeks to confirm Google recrawls and transfers authority.', impact: 'Medium' },
  ],
  actions: [
    { issue: 'n8n article CTR 0.06% on 13K impressions', whyItMatters: 'Biggest single traffic opportunity on the site.', whatToDo: 'Add H2: "Power Automate vs n8n: Head-to-Head". Add comparison table. Ensure title tag starts with primary query.', estimatedImpact: '+100–150 clicks/month if CTR reaches 1%', effort: 'Quick Fix', priority: 'High', status: 'in_progress' },
    { issue: '"ai lifecycle" keyword cluster — 962 impressions at pos 25', whyItMatters: 'High-volume informational keyword with clear content intent.', whatToDo: 'Published /blog/ai-development-lifecycle on 2026-04-05. Monitor GSC weekly for ranking improvements.', estimatedImpact: '+20–40 clicks/month if ranks top 5', effort: 'Medium', priority: 'High', status: 'in_progress' },
    { issue: '30+ spam /onlines/ pages still indexed', whyItMatters: 'Diluting domain authority and impressions data.', whatToDo: 'GSC removal requests submitted. No code action needed — monitor weekly until deindexed.', estimatedImpact: 'Cleaner impression data, improved domain signals', effort: 'Quick Fix', priority: 'Medium', status: 'in_progress' },
  ],
}

export const trafficAgents: Agent[] = [
  {
    id: 't-01', code: 'T-01', label: 'Technical SEO Auditor', module: 'traffic',
    schedule: 'Weekly · Sun 03:00 EST', dataSources: ['Google Search Console', 'PageSpeed Insights'],
    score: 68, status: 'needs-work', lastScanned: '2026-04-01',
    topFinding: '3 pages with missing meta descriptions; mobile LCP failing on /engage',
    subScores: [
      { label: 'Core Web Vitals', score: 55 },
      { label: 'Mobile Usability', score: 80 },
      { label: 'Crawl Errors', score: 90 },
      { label: 'Meta Tags', score: 62 },
      { label: 'Page Speed (Mobile)', score: 58 },
      { label: 'HTTPS & Security', score: 100 },
    ],
    findings: [
      { severity: 'warning', title: 'LCP failing on /engage/managed-ai-builder', whyItMatters: 'LCP >4s means Google penalises this page in mobile rankings.', fix: 'Convert hero image to WebP and defer loading. Target LCP <2.5s.', impact: 'High' },
      { severity: 'warning', title: '3 pages missing meta descriptions', whyItMatters: 'Google auto-generates snippets that may not convert.', fix: 'Add meta descriptions to /engage, /apply, and /case-studies.', impact: 'Medium' },
      { severity: 'info', title: 'Desktop page speed is 91/100', whyItMatters: 'Good — no action needed on desktop.', fix: 'Maintain current desktop performance.', impact: 'Low' },
    ],
    actions: [
      { issue: 'LCP failing on mobile for /engage', whyItMatters: 'Core ranking signal for mobile search.', whatToDo: 'Convert hero image to WebP, add loading="lazy" to below-fold images.', estimatedImpact: '+8-12 ranking positions on mobile', effort: 'Quick Fix', priority: 'High', status: 'todo' },
    ],
  },
  {
    id: 't-02', code: 'T-02', label: 'SERP Rank Tracker', module: 'traffic',
    schedule: 'Daily · 06:00 EST', dataSources: ['Google Search Console'],
    score: 42, status: 'at-risk', lastScanned: '2026-04-03',
    topFinding: '0 of 14 tracked keywords in top 10; avg position 34.7',
    subScores: [
      { label: '% in Top 10', score: 0 },
      { label: '% in Top 3', score: 0 },
      { label: 'Average CTR', score: 18 },
      { label: 'WoW Trend', score: 50 },
    ],
    findings: [
      { severity: 'critical', title: 'No tracked keywords in top 10', whyItMatters: 'Keywords beyond position 10 receive <1% of clicks.', fix: 'Prioritise T-01, T-03, and T-07 recommendations to improve on-page signals.', impact: 'High' },
      { severity: 'warning', title: '"hire AI engineer" at position 34', whyItMatters: 'Primary transactional keyword — needs to break into top 10 for meaningful traffic.', fix: 'Create a dedicated comparison page: Kovil AI vs Toptal.', impact: 'High' },
    ],
    actions: [
      { issue: '"hire AI engineer" stuck at position 34', whyItMatters: 'Highest-intent keyword for core offering.', whatToDo: 'Build a Kovil AI vs Toptal landing page targeting this keyword cluster.', estimatedImpact: '+400-800 monthly visits when in top 5', effort: 'Project', priority: 'High', status: 'todo' },
    ],
  },
  {
    id: 't-03', code: 'T-03', label: 'On-Page SEO Scorer', module: 'traffic',
    schedule: 'Weekly · Sun 04:00 EST', dataSources: ['Live site scraping'],
    score: 71, status: 'needs-work', lastScanned: '2026-03-31',
    topFinding: 'Homepage H1 not keyword-optimised; service pages missing outbound links',
    subScores: [
      { label: 'Title Tags', score: 85 },
      { label: 'Meta Descriptions', score: 62 },
      { label: 'H1/H2 Structure', score: 70 },
      { label: 'Keyword Placement', score: 75 },
      { label: 'Internal Links', score: 68 },
      { label: 'Image Alt Text', score: 55 },
    ],
    findings: [
      { severity: 'warning', title: 'Service pages missing outbound authority links', whyItMatters: 'Outbound links to authoritative sources are an E-E-A-T trust signal.', fix: 'Add 2-3 outbound links per service page to relevant industry sources.', impact: 'Medium' },
      { severity: 'info', title: 'Titles on all pages are within 50-60 characters', whyItMatters: 'Well-optimised — no action needed.', fix: 'Maintain current title tag lengths.', impact: 'Low' },
    ],
    actions: [],
  },
  {
    id: 't-04', code: 'T-04', label: 'Keyword Gap Agent', module: 'traffic',
    schedule: 'Weekly', dataSources: ['Google Search Console', 'AnswerThePublic'],
    score: 38, status: 'critical', lastScanned: '2026-03-28',
    topFinding: '47 near-miss keywords (positions 11–20) with no targeted content',
    subScores: [
      { label: 'Near-miss Keywords Targeted', score: 12 },
      { label: 'New Opportunities Addressed', score: 8 },
    ],
    findings: [
      { severity: 'critical', title: '47 keywords ranking 11-20 with no dedicated content', whyItMatters: 'Moving from position 15 to position 5 can 10x clicks on the same keyword.', fix: 'Create targeted content for the top 10 near-miss keywords.', impact: 'High' },
    ],
    actions: [],
  },
  {
    id: 't-05', code: 'T-05', label: 'Internal Link Optimizer', module: 'traffic',
    schedule: 'Monthly', dataSources: ['Site crawler', 'Google Search Console'],
    score: 55, status: 'needs-work', lastScanned: '2026-04-01',
    topFinding: '4 blog posts are orphan pages — no internal links pointing to them',
    subScores: [
      { label: 'Pages Properly Linked', score: 60 },
      { label: 'No Orphan Pages', score: 40 },
      { label: 'Anchor Text Quality', score: 65 },
    ],
    findings: [
      { severity: 'warning', title: '4 blog posts are orphan pages', whyItMatters: 'Orphan pages receive no PageRank from the rest of the site.', fix: 'Link each orphan post from at least 2 related pages using keyword-rich anchor text.', impact: 'Medium' },
    ],
    actions: [],
  },
  {
    id: 't-06', code: 'T-06', label: 'Backlink Profile Monitor', module: 'traffic',
    schedule: 'Monthly', dataSources: ['Google Search Console Links', 'Ahrefs free'],
    score: 28, status: 'critical', lastScanned: '2026-04-01',
    topFinding: 'Only 3 referring domains detected; no domain authority established',
    subScores: [
      { label: 'Referring Domains', score: 15 },
      { label: 'Backlink Growth', score: 10 },
      { label: 'Toxic Link Absence', score: 100 },
    ],
    findings: [
      { severity: 'critical', title: 'Only 3 referring domains', whyItMatters: 'Domain authority is a primary ranking factor. New sites need 20+ quality domains as a baseline.', fix: 'Prioritise T-16 (Backlink Outreach Finder) recommendations immediately.', impact: 'High' },
    ],
    actions: [],
  },
  {
    id: 't-07', code: 'T-07', label: 'Content Strategy Agent', module: 'traffic',
    schedule: 'Monthly · 1st', dataSources: ['Google Search Console', 'Google Trends', 'AnswerThePublic'],
    score: 60, status: 'needs-work', lastScanned: '2026-04-01',
    topFinding: '2 of 4 recommended posts from March published; April plan ready',
    subScores: [
      { label: 'Plan Execution Rate', score: 50 },
      { label: 'Topical Authority Coverage', score: 62 },
      { label: 'Content Calendar Adherence', score: 68 },
    ],
    findings: [
      { severity: 'warning', title: 'March content plan 50% executed', whyItMatters: 'Consistent publishing velocity compounds SEO gains.', fix: 'Publish 2 remaining March posts before starting April plan.', impact: 'Medium' },
    ],
    actions: [],
  },
  {
    id: 't-08', code: 'T-08', label: 'AEO Agent', module: 'traffic',
    schedule: 'Monthly + on publish', dataSources: ['Manual SERP analysis', 'GSC impressions'],
    score: 55, status: 'needs-work', lastScanned: '2026-04-02',
    topFinding: '5 of 9 pages pass AEO checklist; FAQPage schema missing on service pages',
    subScores: [
      { label: 'AEO Checklist Pass Rate', score: 55 },
      { label: 'FAQ Schema Coverage', score: 44 },
      { label: 'Featured Snippet Eligibility', score: 60 },
    ],
    findings: [
      { severity: 'warning', title: 'Service pages missing FAQPage schema', whyItMatters: 'FAQPage schema enables expandable Q&A in search results — can double CTR.', fix: 'Add FAQPage JSON-LD to all 3 service pages. 3-5 questions per page.', impact: 'High' },
    ],
    actions: [],
  },
  {
    id: 't-09', code: 'T-09', label: 'Blog Quality Reviewer (E-E-A-T)', module: 'traffic',
    schedule: 'Monthly + on publish', dataSources: ['Live content scraping'],
    score: 72, status: 'needs-work', lastScanned: '2026-04-02',
    topFinding: 'Author bios missing from all posts; 2 posts have no external citations',
    subScores: [
      { label: 'Experience / Expertise', score: 65 },
      { label: 'Author Credibility', score: 30 },
      { label: 'Source Citations', score: 75 },
      { label: 'Content Depth', score: 82 },
      { label: 'Freshness', score: 90 },
    ],
    findings: [
      { severity: 'warning', title: 'No author bios on any blog posts', whyItMatters: 'E-E-A-T requires demonstrating author expertise.', fix: 'Add a Davis Rajan author bio block to all posts with credentials and photo.', impact: 'High' },
    ],
    actions: [],
  },
  {
    id: 't-10', code: 'T-10', label: 'Schema Markup Agent', module: 'traffic',
    schedule: 'One-time + on new pages', dataSources: ['Google Rich Results Test', 'Schema.org'],
    score: 66, status: 'needs-work', lastScanned: '2026-04-03',
    topFinding: 'Organization + WebSite schema live; BreadcrumbList missing on all pages',
    subScores: [
      { label: 'Schema Coverage', score: 66 },
      { label: 'Validation Pass Rate', score: 100 },
      { label: 'Rich Result Eligibility', score: 55 },
    ],
    findings: [
      { severity: 'warning', title: 'BreadcrumbList schema missing sitewide', whyItMatters: 'Breadcrumbs appear in search results and improve click-through rates.', fix: 'Add BreadcrumbList JSON-LD to all pages except the homepage.', impact: 'Medium' },
    ],
    actions: [],
  },
  {
    id: 't-11', code: 'T-11', label: 'Content Performance Reviewer', module: 'traffic',
    schedule: 'Monthly', dataSources: ['Google Analytics 4', 'Google Search Console'],
    score: 58, status: 'needs-work', lastScanned: '2026-03-31',
    topFinding: '3 posts showing traffic decline; "software-maintenance-time-bomb" up 40% MoM',
    subScores: [
      { label: 'Content Trending Up', score: 37 },
      { label: 'Decay Addressed', score: 20 },
      { label: 'Repurpose Opportunities', score: 65 },
    ],
    findings: [
      { severity: 'warning', title: '3 posts with declining organic traffic', whyItMatters: 'Content decay compounds — posts that start declining continue declining without intervention.', fix: 'Refresh the 3 declining posts: update stats, add new sections, improve internal links.', impact: 'Medium' },
    ],
    actions: [],
  },
  {
    id: 't-12', code: 'T-12', label: 'Long-tail Keyword Miner', module: 'traffic',
    schedule: 'Monthly', dataSources: ['GSC query data', 'AnswerThePublic'],
    score: 30, status: 'critical', lastScanned: '2026-03-28',
    topFinding: '0% of identified long-tail opportunities targeted with content',
    subScores: [
      { label: 'Opportunities Identified', score: 90 },
      { label: 'Opportunities Targeted', score: 0 },
    ],
    findings: [
      { severity: 'critical', title: 'Long-tail opportunities not acted on', whyItMatters: 'Long-tail keywords convert 3-5x better than broad keywords at a fraction of the competition.', fix: 'Assign top 5 long-tail keywords to upcoming blog posts in April content plan.', impact: 'High' },
    ],
    actions: [],
  },
  {
    id: 't-13', code: 'T-13', label: 'Google Business Profile Optimiser', module: 'traffic',
    schedule: 'Monthly', dataSources: ['Google Business Profile API'],
    score: 45, status: 'at-risk', lastScanned: null,
    topFinding: 'GBP profile not yet fully configured — needs first scan',
    subScores: [{ label: 'Profile Completeness', score: 45 }],
    findings: [
      { severity: 'warning', title: 'GBP profile incomplete', whyItMatters: 'Incomplete profiles rank lower in local and brand searches.', fix: 'Complete business description, add categories, upload logo and cover photo.', impact: 'Low' },
    ],
    actions: [],
  },
  {
    id: 't-14', code: 'T-14', label: 'Competitor Content Gap Agent', module: 'traffic',
    schedule: 'Monthly', dataSources: ['Ubersuggest free', 'Ahrefs free', 'Google search'],
    score: 22, status: 'critical', lastScanned: '2026-03-28',
    topFinding: 'Toptal and Turing rank for 38 keyword clusters Kovil AI has zero content for',
    subScores: [
      { label: 'Gaps Identified', score: 90 },
      { label: 'Gaps Addressed', score: 0 },
    ],
    findings: [
      { severity: 'critical', title: '38 competitor keyword clusters not covered', whyItMatters: 'Competitors are capturing traffic Kovil AI could realistically rank for.', fix: 'Prioritise top 5 gap topics — create one post per topic over next 5 weeks.', impact: 'High' },
    ],
    actions: [],
  },
  {
    id: 't-15', code: 'T-15', label: 'Social Signal Amplifier', module: 'traffic',
    schedule: 'Weekly', dataSources: ['Reddit API', 'Quora', 'LinkedIn'],
    score: 15, status: 'critical', lastScanned: null,
    topFinding: 'No social amplification activity tracked yet',
    subScores: [{ label: 'Referral Traffic from Social', score: 15 }],
    findings: [
      { severity: 'critical', title: 'Zero social referral traffic', whyItMatters: 'Social signals support topical authority and drive direct referral traffic.', fix: 'Answer 2-3 Reddit/Quora questions weekly using existing blog content.', impact: 'Medium' },
    ],
    actions: [],
  },
  {
    id: 't-16', code: 'T-16', label: 'Backlink Outreach Finder', module: 'traffic',
    schedule: 'Weekly', dataSources: ['HARO/Connectively', 'Google search operators'],
    score: 10, status: 'critical', lastScanned: null,
    topFinding: '0 quality backlinks acquired this month — no outreach initiated',
    subScores: [
      { label: 'Links Acquired vs Target', score: 0 },
      { label: 'Opportunities in Pipeline', score: 20 },
    ],
    findings: [
      { severity: 'critical', title: '0 quality backlinks acquired this month', whyItMatters: 'Domain authority without backlinks will not grow.', fix: 'Subscribe to HARO. Respond to 3 AI engineering queries per week.', impact: 'High' },
    ],
    actions: [],
  },
  {
    id: 't-17', code: 'T-17', label: 'Demand Trend Spotter', module: 'traffic',
    schedule: 'Weekly', dataSources: ['Google Trends', 'RSS feeds'],
    score: 50, status: 'needs-work', lastScanned: '2026-04-01',
    topFinding: '"AI agent development" rising 340% in 30 days — no content targeting it yet',
    subScores: [
      { label: 'Trend Response Speed', score: 50 },
      { label: 'Breakout Alerts Actioned', score: 0 },
    ],
    findings: [
      { severity: 'warning', title: '"AI agent development" rising 340% — no content', whyItMatters: 'Early content on a rising trend captures first-mover SERP advantage.', fix: 'Assign a blog post on "AI agent development for business" for this week.', impact: 'High' },
    ],
    actions: [],
  },
  {
    id: 't-18', code: 'T-18', label: 'Sitemap & Indexing Agent', module: 'traffic',
    schedule: 'Daily · 06:30 EST', dataSources: ['Google Search Console', 'XML sitemap'],
    score: 74, status: 'needs-work', lastScanned: '2026-04-03',
    topFinding: '1 blog post not yet indexed; sitemap valid with 18 URLs',
    subScores: [
      { label: 'Sitemap URLs Indexed', score: 85 },
      { label: 'Indexing Error Rate', score: 92 },
      { label: 'Sitemap Validity', score: 100 },
    ],
    findings: [
      { severity: 'warning', title: '"why-ai-projects-fail" not yet indexed', whyItMatters: 'Unindexed pages receive zero organic traffic regardless of content quality.', fix: 'Request indexing via GSC URL Inspection tool. Ensure post is in sitemap.xml.', impact: 'Medium' },
    ],
    actions: [],
  },
]

// ─── CONVERSION INTELLIGENCE — 5 agents ─────────────────────────────────────

export const conversionAgents: Agent[] = [
  {
    id: 'c-01', code: 'C-01', label: 'Visitor Intent Decoder', module: 'conversion',
    schedule: 'Weekly', dataSources: ['GA4', 'Google Search Console'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 3',
    subScores: [{ label: 'Intent Alignment Rate', score: 0 }],
    findings: [], actions: [],
  },
  {
    id: 'c-02', code: 'C-02', label: 'Funnel Friction Detector', module: 'conversion',
    schedule: 'Weekly', dataSources: ['GA4'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 3',
    subScores: [{ label: 'Funnel Conversion Rate', score: 0 }],
    findings: [], actions: [],
  },
  {
    id: 'c-03', code: 'C-03', label: 'Messaging Alignment Agent', module: 'conversion',
    schedule: 'Monthly', dataSources: ['GSC', 'Reddit/Quora', 'GA4'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 3',
    subScores: [{ label: 'Messaging Alignment Score', score: 0 }],
    findings: [], actions: [],
  },
  {
    id: 'c-04', code: 'C-04', label: 'Lead Quality Scorer', module: 'conversion',
    schedule: 'Real-time', dataSources: ['Supabase leads', 'GA4'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 3',
    subScores: [{ label: 'Avg Lead Quality Score', score: 0 }],
    findings: [], actions: [],
  },
  {
    id: 'c-05', code: 'C-05', label: 'Trust Signal Optimiser', module: 'conversion',
    schedule: 'Monthly + on deploy', dataSources: ['Live site scraping', 'GA4'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 3',
    subScores: [{ label: 'Trust Signal Coverage', score: 0 }],
    findings: [], actions: [],
  },
]

// ─── SCALING INTELLIGENCE — 4 agents ────────────────────────────────────────

export const scalingAgents: Agent[] = [
  {
    id: 's-01', code: 'S-01', label: 'Competitor Intelligence Agent', module: 'scaling',
    schedule: 'Monthly', dataSources: ['Ahrefs free', 'Google search', 'Site scraping'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 4',
    subScores: [{ label: 'Competitive Position Score', score: 0 }],
    findings: [], actions: [],
  },
  {
    id: 's-02', code: 'S-02', label: 'Demand Trend Spotter', module: 'scaling',
    schedule: 'Weekly', dataSources: ['Google Trends', 'RSS feeds', 'AnswerThePublic'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 4',
    subScores: [{ label: 'Trend Response Speed', score: 0 }],
    findings: [], actions: [],
  },
  {
    id: 's-03', code: 'S-03', label: 'Channel Expansion Advisor', module: 'scaling',
    schedule: 'Monthly', dataSources: ['GA4', 'LinkedIn Analytics', 'Reddit'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 4',
    subScores: [{ label: 'Channel Diversification', score: 0 }],
    findings: [], actions: [],
  },
  {
    id: 's-04', code: 'S-04', label: 'ROI & Attribution Agent', module: 'scaling',
    schedule: 'Monthly', dataSources: ['GA4', 'Supabase leads', 'Pipeline data'],
    score: 0, status: 'not-run', lastScanned: null,
    topFinding: 'Not yet activated — coming in Phase 4',
    subScores: [{ label: 'Attribution Accuracy', score: 0 }],
    findings: [], actions: [],
  },
]

export const allAgents = [...trafficAgents, ...conversionAgents, ...scalingAgents]

export function getAgent(id: string): Agent | undefined {
  return allAgents.find(a => a.id === id)
}

export function scoreColor(score: number, variant: 'text' | 'bg' | 'ring' = 'text') {
  const map = {
    text: score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : score >= 40 ? 'text-orange-600' : 'text-red-600',
    bg:   score >= 80 ? 'bg-green-500'  : score >= 60 ? 'bg-amber-500'  : score >= 40 ? 'bg-orange-500'  : 'bg-red-500',
    ring: score >= 80 ? 'ring-green-400': score >= 60 ? 'ring-amber-400': score >= 40 ? 'ring-orange-400': 'ring-red-400',
  }
  return map[variant]
}

export function scoreBadge(score: number) {
  if (score >= 80) return 'bg-green-50 text-green-700 ring-1 ring-green-200'
  if (score >= 60) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  if (score >= 40) return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
  return 'bg-red-50 text-red-700 ring-1 ring-red-200'
}

export function scoreLabel(score: number, status: AgentStatus) {
  if (status === 'not-run') return 'Not Run'
  if (score >= 80) return 'Healthy'
  if (score >= 60) return 'Needs Work'
  if (score >= 40) return 'At Risk'
  return 'Critical'
}

export function statusDot(status: AgentStatus) {
  if (status === 'healthy')    return 'bg-green-500'
  if (status === 'needs-work') return 'bg-amber-500'
  if (status === 'at-risk')    return 'bg-orange-500'
  if (status === 'critical')   return 'bg-red-500'
  return 'bg-gray-300'
}
