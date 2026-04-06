import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, ExternalLink, X, CheckCircle2, Circle,
  Search, RefreshCw, ChevronRight, AlertTriangle, TrendingUp
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActionItem {
  id: string
  category: 'SEO' | 'AEO' | 'GEO'
  text: string
  impact: 'High' | 'Medium' | 'Low'
  done: boolean
}

interface BlogEntry {
  slug: string
  title: string
  seo: number
  aeo: number
  geo: number
  actions: ActionItem[]
}

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 80) return 'text-green-600'
  if (s >= 60) return 'text-amber-600'
  if (s >= 40) return 'text-orange-500'
  return 'text-red-500'
}
function scoreBg(s: number) {
  if (s >= 80) return 'bg-green-500'
  if (s >= 60) return 'bg-amber-400'
  if (s >= 40) return 'bg-orange-400'
  return 'bg-red-500'
}
function scoreBadgeCls(s: number) {
  if (s >= 80) return 'bg-green-50 text-green-700 ring-1 ring-green-200'
  if (s >= 60) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  if (s >= 40) return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
  return 'bg-red-50 text-red-700 ring-1 ring-red-200'
}
function impactBadge(impact: ActionItem['impact']) {
  if (impact === 'High')   return 'bg-red-50 text-red-600 ring-1 ring-red-200'
  if (impact === 'Medium') return 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
  return 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
}
function catBadge(cat: ActionItem['category']) {
  if (cat === 'SEO') return 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
  if (cat === 'AEO') return 'bg-purple-50 text-purple-600 ring-1 ring-purple-200'
  return 'bg-teal-50 text-teal-600 ring-1 ring-teal-200'
}

function avg3(b: BlogEntry) {
  return Math.round((b.seo + b.aeo + b.geo) / 3)
}
function blogStatus(b: BlogEntry) {
  return b.seo >= 80 && b.aeo >= 80 && b.geo >= 80 ? 'Optimised' : 'Pending'
}

// ─── Blog data ───────────────────────────────────────────────────────────────

const INITIAL_BLOGS: BlogEntry[] = [
  {
    slug: 'why-ai-projects-fail',
    title: 'Why 80% of AI Projects Fail in Production',
    seo: 82, aeo: 85, geo: 76,
    actions: [
      { id: 'w1', category: 'SEO', text: 'Add 2–3 more internal links to service pages (/engage/managed-ai-builder, /engage/outcome-based-project)', impact: 'High', done: false },
      { id: 'w2', category: 'SEO', text: 'Shorten title tag to under 65 characters for full SERP display', impact: 'Medium', done: false },
      { id: 'w3', category: 'SEO', text: 'Add image alt text with keyword "AI production failure" to hero image', impact: 'Medium', done: false },
      { id: 'w4', category: 'AEO', text: 'Add a "What is AI project failure?" question to the FAQ section', impact: 'High', done: false },
      { id: 'w5', category: 'AEO', text: 'Rewrite H2 "What Does It Mean..." as a direct question ending with "?"', impact: 'Low', done: false },
      { id: 'w6', category: 'GEO', text: 'Add a definitional paragraph: "AI project failure is defined as..." in the intro', impact: 'High', done: false },
      { id: 'w7', category: 'GEO', text: 'Add source attribution to the Gartner 85% and McKinsey 80% statistics', impact: 'High', done: false },
      { id: 'w8', category: 'GEO', text: 'Add a summary table: Failure Mode | Root Cause | Fix — for AI chunking', impact: 'Medium', done: false },
    ],
  },
  {
    slug: 'ai-agents-vs-chatbots',
    title: 'AI Agents vs AI Chatbots: What\'s the Difference?',
    seo: 84, aeo: 88, geo: 82,
    actions: [
      { id: 'a1', category: 'SEO', text: 'Add a "related articles" internal link block at the end pointing to the AI Lifecycle and RAG posts', impact: 'High', done: false },
      { id: 'a2', category: 'SEO', text: 'Compress hero image (blog-ai-agents-vs-chatbots.jpg) to under 150 KB for faster LCP', impact: 'Medium', done: false },
      { id: 'a3', category: 'AEO', text: 'Add a 5th FAQ: "Can AI agents replace human workers?" — high search volume question', impact: 'High', done: false },
      { id: 'a4', category: 'AEO', text: 'Add a comparison table (Chatbot vs Agent: Feature | Chatbot | Agent) for snippet capture', impact: 'High', done: false },
      { id: 'a5', category: 'GEO', text: 'Add a "Key Takeaway" summary box at the end — AI answer engines frequently cite summary blocks', impact: 'Medium', done: false },
      { id: 'a6', category: 'GEO', text: 'Mention specific LLM providers (OpenAI GPT-4o, Anthropic Claude) with version numbers for factual grounding', impact: 'Low', done: false },
    ],
  },
  {
    slug: 'ai-development-lifecycle',
    title: 'The AI Development Lifecycle: A Complete Guide',
    seo: 86, aeo: 87, geo: 83,
    actions: [
      { id: 'l1', category: 'SEO', text: 'Add a breadcrumb schema (already in BlogPostPage — verify it renders correctly in Search Console)', impact: 'Medium', done: false },
      { id: 'l2', category: 'SEO', text: 'Interlink to why-ai-projects-fail post in Phase 1 section for topical authority', impact: 'High', done: false },
      { id: 'l3', category: 'AEO', text: 'Add FAQ: "What is the difference between AI SDLC and traditional SDLC?" — very common query', impact: 'High', done: false },
      { id: 'l4', category: 'AEO', text: 'Reformat Phase list as a numbered HTML ol with anchor IDs — improves step snippet eligibility', impact: 'Medium', done: false },
      { id: 'l5', category: 'GEO', text: 'Add industry-specific examples for each phase (e.g., Phase 2 data prep example in fintech)', impact: 'High', done: false },
      { id: 'l6', category: 'GEO', text: 'Add a "Tools used at each phase" column — AI engines frequently cite tool lists', impact: 'Medium', done: false },
    ],
  },
  {
    slug: 'n8n-vs-zapier-vs-power-automate',
    title: 'n8n vs Zapier vs Power Automate (2026)',
    seo: 74, aeo: 70, geo: 78,
    actions: [
      { id: 'n1', category: 'SEO', text: 'Update publish date / add "Updated April 2026" to title — freshness signal for competitive keywords', impact: 'High', done: false },
      { id: 'n2', category: 'SEO', text: 'Add meta description (excerpt) of exactly 150–155 characters with primary keyword', impact: 'High', done: false },
      { id: 'n3', category: 'SEO', text: 'Add internal links to /engage/managed-ai-builder and /engage/outcome-based-project pages', impact: 'High', done: false },
      { id: 'n4', category: 'AEO', text: 'Add a FAQ section (min 4 questions) — currently missing, major AEO gap', impact: 'High', done: false },
      { id: 'n5', category: 'AEO', text: 'Add "Which is better for enterprise: n8n or Power Automate?" as an H2 — high-intent question', impact: 'High', done: false },
      { id: 'n6', category: 'AEO', text: 'Add a pricing comparison table (free tier, paid tier, enterprise) for featured snippet capture', impact: 'High', done: false },
      { id: 'n7', category: 'GEO', text: 'Add a "Quick verdict" summary box at top — AI engines cite comparison verdicts frequently', impact: 'Medium', done: false },
      { id: 'n8', category: 'GEO', text: 'Add specific use case examples per tool: "Use n8n when...", "Use Zapier when..."', impact: 'Medium', done: false },
    ],
  },
  {
    slug: 'what-is-ai-integration',
    title: 'What Is AI Integration? A Business Guide',
    seo: 70, aeo: 73, geo: 68,
    actions: [
      { id: 'i1', category: 'SEO', text: 'Add hero image — currently missing, -15 SEO points', impact: 'High', done: false },
      { id: 'i2', category: 'SEO', text: 'Expand word count to 1,500+ words — currently too short for competitive keyword', impact: 'High', done: false },
      { id: 'i3', category: 'SEO', text: 'Add 3 internal links to relevant service and blog pages', impact: 'High', done: false },
      { id: 'i4', category: 'AEO', text: 'Add FAQ section with 4+ questions including "How much does AI integration cost?"', impact: 'High', done: false },
      { id: 'i5', category: 'AEO', text: 'Add "What Is AI Integration?" as H1 and keep current title for meta only', impact: 'Medium', done: false },
      { id: 'i6', category: 'GEO', text: 'Add a definition block: "AI integration is the process of..." in the first paragraph', impact: 'High', done: false },
      { id: 'i7', category: 'GEO', text: 'Add 3 real-world industry examples (healthcare, fintech, logistics) with specifics', impact: 'Medium', done: false },
      { id: 'i8', category: 'GEO', text: 'Add statistics: "Companies that implement AI integration see X% reduction in..." with source', impact: 'Medium', done: false },
    ],
  },
  {
    slug: 'build-mvp-4-weeks',
    title: 'How to Build an MVP in 4 Weeks',
    seo: 68, aeo: 65, geo: 67,
    actions: [
      { id: 'b1', category: 'SEO', text: 'Add hero image — currently missing', impact: 'High', done: false },
      { id: 'b2', category: 'SEO', text: 'Update title to include year: "How to Build an MVP in 4 Weeks (2026 Playbook)"', impact: 'High', done: false },
      { id: 'b3', category: 'SEO', text: 'Expand to 1,800+ words — short content underperforms for competitive "build MVP" queries', impact: 'High', done: false },
      { id: 'b4', category: 'SEO', text: 'Add internal links to Outcome-Based Project and App Rescue pages', impact: 'High', done: false },
      { id: 'b5', category: 'AEO', text: 'Add FAQ section: "How much does it cost to build an MVP?", "What stack for MVP?", etc.', impact: 'High', done: false },
      { id: 'b6', category: 'AEO', text: 'Structure as numbered steps (Step 1: Week 1...) — eligibility for "how to" rich snippets', impact: 'High', done: false },
      { id: 'b7', category: 'GEO', text: 'Add a week-by-week timeline table for AI answer engine citation', impact: 'Medium', done: false },
      { id: 'b8', category: 'GEO', text: 'Add real MVP example from Kovil case studies with outcome metrics', impact: 'High', done: false },
    ],
  },
  {
    slug: 'software-maintenance-time-bomb',
    title: 'The Software Maintenance Time Bomb',
    seo: 71, aeo: 66, geo: 69,
    actions: [
      { id: 's1', category: 'SEO', text: 'Rewrite title to include primary keyword: "Software Maintenance Costs: The Hidden Time Bomb (2026)"', impact: 'High', done: false },
      { id: 's2', category: 'SEO', text: 'Add 3 internal links — currently no outbound internal links found', impact: 'High', done: false },
      { id: 's3', category: 'SEO', text: 'Compress hero image for faster LCP', impact: 'Medium', done: false },
      { id: 's4', category: 'AEO', text: 'Add FAQ section with "What is technical debt?", "How to reduce software maintenance costs?" etc.', impact: 'High', done: false },
      { id: 's5', category: 'AEO', text: 'Add "Warning Signs" H2 section with bulleted checklist — PAA snippet target', impact: 'Medium', done: false },
      { id: 's6', category: 'GEO', text: 'Add quantified cost statistics: "Legacy software maintenance costs X% of IT budget on average"', impact: 'High', done: false },
      { id: 's7', category: 'GEO', text: 'Add a before/after case study table showing maintenance cost reduction', impact: 'Medium', done: false },
    ],
  },
  {
    slug: 'real-cost-building-mvp-2026',
    title: 'The Real Cost of Building an MVP in 2026',
    seo: 73, aeo: 65, geo: 71,
    actions: [
      { id: 'r1', category: 'SEO', text: 'Add H2 subheadings for each cost category — currently flat structure', impact: 'High', done: false },
      { id: 'r2', category: 'SEO', text: 'Add internal link to build-mvp-4-weeks post (topical cluster)', impact: 'High', done: false },
      { id: 'r3', category: 'SEO', text: 'Add schema markup for pricing (if cost ranges are listed as tables)', impact: 'Medium', done: false },
      { id: 'r4', category: 'AEO', text: 'Add FAQ section including "What is the average MVP development cost in 2026?"', impact: 'High', done: false },
      { id: 'r5', category: 'AEO', text: 'Add a "Cost Calculator" or decision tree H2 — high engagement, often cited by AI engines', impact: 'Medium', done: false },
      { id: 'r6', category: 'GEO', text: 'Add a cost breakdown table: Component | Low | Mid | High — perfect format for AI citation', impact: 'High', done: false },
      { id: 'r7', category: 'GEO', text: 'Cite specific sources or surveys for cost data points to improve factual grounding', impact: 'High', done: false },
    ],
  },
  {
    slug: 'llm-chatbot-for-business',
    title: 'LLM Chatbot for Business: A Practical Guide',
    seo: 74, aeo: 70, geo: 69,
    actions: [
      { id: 'c1', category: 'SEO', text: 'Update title to include year: "LLM Chatbot for Business: 2026 Implementation Guide"', impact: 'Medium', done: false },
      { id: 'c2', category: 'SEO', text: 'Add internal links to ai-agents-vs-chatbots and ai-development-lifecycle posts', impact: 'High', done: false },
      { id: 'c3', category: 'SEO', text: 'Expand excerpt to exactly 155 characters with primary keyword in first 20 words', impact: 'Medium', done: false },
      { id: 'c4', category: 'AEO', text: 'Add FAQ: "How much does a business LLM chatbot cost to build?" — extremely high search volume', impact: 'High', done: false },
      { id: 'c5', category: 'AEO', text: 'Add "Best LLM for business chatbots" H2 section comparing GPT-4o, Claude, Gemini', impact: 'High', done: false },
      { id: 'c6', category: 'GEO', text: 'Add a "Quick Comparison" table: LLM Model | Speed | Cost | Best For — AI engines love this format', impact: 'High', done: false },
      { id: 'c7', category: 'GEO', text: 'Add a real Kovil client chatbot example with measurable outcome (ticket deflection %, response time)', impact: 'High', done: false },
    ],
  },
  {
    slug: 'ai-automation-nyc-ad-marketing-agencies',
    title: 'AI Automation for NYC Ad & Marketing Agencies',
    seo: 69, aeo: 62, geo: 65,
    actions: [
      { id: 'm1', category: 'SEO', text: 'Add "NYC" and "2026" to meta description for local + freshness signals', impact: 'High', done: false },
      { id: 'm2', category: 'SEO', text: 'Add LocalBusiness schema markup (targeting NYC agencies)', impact: 'High', done: false },
      { id: 'm3', category: 'SEO', text: 'Add 4 internal links to relevant service pages and case studies', impact: 'High', done: false },
      { id: 'm4', category: 'SEO', text: 'Expand content to 1,800+ words — local SEO content needs depth to outrank directory pages', impact: 'High', done: false },
      { id: 'm5', category: 'AEO', text: 'Add FAQ section: "What AI tools do NYC agencies use?", "Cost of AI automation for agencies?" etc.', impact: 'High', done: false },
      { id: 'm6', category: 'AEO', text: 'Add "Use Cases for NYC Ad Agencies" H2 with specific numbered list', impact: 'High', done: false },
      { id: 'm7', category: 'GEO', text: 'Add specific NYC agency examples and industries (fashion, finance, media) for contextual grounding', impact: 'High', done: false },
      { id: 'm8', category: 'GEO', text: 'Add ROI statistics specific to marketing AI automation: "Agencies using AI see X% reduction in creative production time"', impact: 'Medium', done: false },
    ],
  },
]

// ─── Score URL tab component ──────────────────────────────────────────────────

function ScoreUrlTab({ blogs }: { blogs: BlogEntry[] }) {
  const [url, setUrl]         = useState('')
  const [result, setResult]   = useState<BlogEntry | null>(null)
  const [notFound, setNotFound] = useState(false)

  function score() {
    const slug = url.trim().replace(/\/$/, '').split('/').pop() ?? ''
    const match = blogs.find(b => b.slug === slug || url.includes(b.slug))
    if (match) { setResult(match); setNotFound(false) }
    else        { setResult(null);  setNotFound(true)  }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-6">
        Paste any blog URL from kovil.ai to instantly retrieve its SEO, AEO, and GEO scores with a full action plan.
      </p>

      {/* Input */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="https://kovil.ai/blog/ai-agents-vs-chatbots"
            value={url}
            onChange={e => { setUrl(e.target.value); setResult(null); setNotFound(false) }}
            onKeyDown={e => e.key === 'Enter' && score()}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-gray-300"
          />
        </div>
        <button
          onClick={score}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <TrendingUp className="h-4 w-4" /> Score It
        </button>
      </div>

      {/* Not found */}
      {notFound && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          No matching blog found. Make sure the URL is a kovil.ai blog post.
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <p className="text-xs text-gray-400 mb-1">kovil.ai/blog/{result.slug}</p>
            <h3 className="font-semibold text-gray-900">{result.title}</h3>
          </div>

          {/* Score tiles */}
          <div className="grid grid-cols-3 divide-x divide-gray-50 border-b border-gray-50">
            {([['SEO', result.seo], ['AEO', result.aeo], ['GEO', result.geo]] as [string, number][]).map(([label, score]) => (
              <div key={label} className="p-6 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-4xl font-bold ${scoreColor(score)}`}>{score}</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-1.5 rounded-full ${scoreBg(score)}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              {result.actions.length} Actions Required
            </p>
            <div className="space-y-2">
              {result.actions.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${catBadge(a.category)}`}>
                    {a.category}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${impactBadge(a.impact)}`}>
                    {a.impact}
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Actions modal ────────────────────────────────────────────────────────────

function ActionsModal({
  blog,
  onClose,
  onToggle,
}: {
  blog: BlogEntry
  onClose: () => void
  onToggle: (blogSlug: string, actionId: string) => void
}) {
  const [filter, setFilter] = useState<'All' | 'SEO' | 'AEO' | 'GEO'>('All')
  const shown = filter === 'All' ? blog.actions : blog.actions.filter(a => a.category === filter)
  const done  = blog.actions.filter(a => a.done).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">
              Action Plan
            </p>
            <h2 className="font-semibold text-gray-900 leading-snug text-sm max-w-md">
              {blog.title}
            </h2>
            <p className="text-xs text-gray-400 mt-1.5">
              {done} of {blog.actions.length} actions completed
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors ml-4 shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Score pills */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 shrink-0">
          {([['SEO', blog.seo], ['AEO', blog.aeo], ['GEO', blog.geo]] as [string, number][]).map(([l, s]) => (
            <div key={l} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${scoreBadgeCls(s)}`}>
              {l} <span>{s}</span>
            </div>
          ))}
          <div className="ml-auto flex gap-1">
            {(['All', 'SEO', 'AEO', 'GEO'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                  filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 shrink-0">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-orange-400 rounded-full transition-all"
              style={{ width: `${(done / blog.actions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions list */}
        <div className="overflow-y-auto flex-1 px-6 pb-6">
          <div className="space-y-2">
            {shown.map(action => (
              <button
                key={action.id}
                onClick={() => onToggle(blog.slug, action.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  action.done
                    ? 'bg-green-50/60 border-green-100 opacity-70'
                    : 'bg-gray-50 border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {action.done
                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                    : <Circle className="h-4 w-4 text-gray-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${catBadge(action.category)}`}>
                      {action.category}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${impactBadge(action.impact)}`}>
                      {action.impact} impact
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${action.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {action.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-50 shrink-0 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Click any action to mark it complete
          </p>
          <a
            href={`https://kovil.ai/blog/${blog.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-orange-500 font-semibold hover:underline"
          >
            View live post <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlogOptimizerPage() {
  const [blogs, setBlogs]           = useState<BlogEntry[]>(INITIAL_BLOGS)
  const [tab, setTab]               = useState<'blogs' | 'score-url'>('blogs')
  const [selected, setSelected]     = useState<BlogEntry | null>(null)
  const [rescoring, setRescoring]   = useState(false)

  const overallScore = Math.round(
    blogs.reduce((sum, b) => sum + avg3(b), 0) / blogs.length
  )

  // Toggle a single action done/undone
  function toggleAction(blogSlug: string, actionId: string) {
    setBlogs(prev =>
      prev.map(b =>
        b.slug === blogSlug
          ? { ...b, actions: b.actions.map(a => a.id === actionId ? { ...a, done: !a.done } : a) }
          : b
      )
    )
    // Keep modal in sync
    setSelected(prev =>
      prev?.slug === blogSlug
        ? { ...prev, actions: prev.actions.map(a => a.id === actionId ? { ...a, done: !a.done } : a) }
        : prev
    )
  }

  function handleRescore() {
    setRescoring(true)
    setTimeout(() => setRescoring(false), 1800)
  }

  const tabs = [
    { key: 'blogs',     label: 'All Blogs' },
    { key: 'score-url', label: 'Score a URL' },
  ] as const

  const scoreLabel = overallScore >= 80 ? 'Healthy' : overallScore >= 60 ? 'Needs Work' : overallScore >= 40 ? 'At Risk' : 'Critical'

  return (
    <div className="p-8">

      {/* Back */}
      <Link to="/traffic" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 transition-colors mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Traffic Intelligence
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">T-BLOG-OPT</span>
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">· Flagship</span>
          </div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">Blog Optimizer Agent</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Scores every kovil.ai blog post across SEO, AEO, and GEO dimensions. Surfaces specific actions to push every post above 80.
          </p>
        </div>

        {/* Score ring + rescore */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke={overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#f59e0b' : overallScore >= 40 ? '#f97316' : '#ef4444'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(overallScore / 100) * 201} 201`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</span>
                <span className="text-[9px] text-gray-400">{scoreLabel}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Avg across {blogs.length} blogs</p>
          </div>
          <button
            onClick={handleRescore}
            disabled={rescoring}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${rescoring ? 'animate-spin' : ''}`} />
            {rescoring ? 'Rescoring…' : 'Rescore All'}
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Optimised', sublabel: 'All scores ≥ 80', count: blogs.filter(b => blogStatus(b) === 'Optimised').length, color: 'text-green-600', dot: 'bg-green-400' },
          { label: 'Pending',   sublabel: 'Any score < 80',  count: blogs.filter(b => blogStatus(b) === 'Pending').length,   color: 'text-amber-600', dot: 'bg-amber-400' },
          { label: 'Avg SEO',   sublabel: 'across all posts', count: Math.round(blogs.reduce((s, b) => s + b.seo, 0) / blogs.length), color: scoreColor(Math.round(blogs.reduce((s, b) => s + b.seo, 0) / blogs.length)), dot: 'bg-blue-400' },
          { label: 'Avg AEO',   sublabel: 'across all posts', count: Math.round(blogs.reduce((s, b) => s + b.aeo, 0) / blogs.length), color: scoreColor(Math.round(blogs.reduce((s, b) => s + b.aeo, 0) / blogs.length)), dot: 'bg-purple-400' },
        ].map(t => (
          <div key={t.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className={`w-2.5 h-2.5 rounded-full ${t.dot} mb-3`} />
            <p className={`font-bold text-4xl ${t.color}`}>{t.count}</p>
            <p className="text-sm text-gray-500 mt-1">{t.label} <span className="text-gray-400 text-xs">({t.sublabel})</span></p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-xs font-semibold transition-colors ${
              tab === t.key
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── All Blogs tab ── */}
      {tab === 'blogs' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/70 border-b border-gray-100">
            <div className="col-span-4">Blog Post</div>
            <div className="col-span-1 text-center">SEO</div>
            <div className="col-span-1 text-center">AEO</div>
            <div className="col-span-1 text-center">GEO</div>
            <div className="col-span-1 text-center">Avg</div>
            <div className="col-span-2 text-center">Actions</div>
            <div className="col-span-2 text-center">Status</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {blogs.map(blog => {
              const pending    = blog.actions.filter(a => !a.done).length
              const status     = blogStatus(blog)
              const avgScore   = avg3(blog)

              return (
                <div
                  key={blog.slug}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/40 transition-colors"
                >
                  {/* Blog URL */}
                  <div className="col-span-4">
                    <p className="text-xs font-semibold text-gray-800 leading-snug mb-0.5 line-clamp-1">
                      {blog.title}
                    </p>
                    <a
                      href={`https://kovil.ai/blog/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-orange-500 hover:underline"
                    >
                      /blog/{blog.slug} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>

                  {/* SEO */}
                  <div className="col-span-1 text-center">
                    <span className={`text-sm font-bold ${scoreColor(blog.seo)}`}>{blog.seo}</span>
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-1 rounded-full ${scoreBg(blog.seo)}`} style={{ width: `${blog.seo}%` }} />
                    </div>
                  </div>

                  {/* AEO */}
                  <div className="col-span-1 text-center">
                    <span className={`text-sm font-bold ${scoreColor(blog.aeo)}`}>{blog.aeo}</span>
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-1 rounded-full ${scoreBg(blog.aeo)}`} style={{ width: `${blog.aeo}%` }} />
                    </div>
                  </div>

                  {/* GEO */}
                  <div className="col-span-1 text-center">
                    <span className={`text-sm font-bold ${scoreColor(blog.geo)}`}>{blog.geo}</span>
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-1 rounded-full ${scoreBg(blog.geo)}`} style={{ width: `${blog.geo}%` }} />
                    </div>
                  </div>

                  {/* Avg */}
                  <div className="col-span-1 text-center">
                    <span className={`text-sm font-bold ${scoreColor(avgScore)}`}>{avgScore}</span>
                  </div>

                  {/* Actions button */}
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => setSelected(blog)}
                      className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors"
                    >
                      {pending > 0
                        ? <><AlertTriangle className="h-3 w-3" /> {pending} needed</>
                        : <><CheckCircle2 className="h-3 w-3 text-green-500" /> Done</>
                      }
                      <ChevronRight className="h-3 w-3 ml-0.5" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      status === 'Optimised'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Score a URL tab ── */}
      {tab === 'score-url' && (
        <ScoreUrlTab blogs={blogs} />
      )}

      {/* Actions modal */}
      {selected && (
        <ActionsModal
          blog={selected}
          onClose={() => setSelected(null)}
          onToggle={toggleAction}
        />
      )}
    </div>
  )
}
