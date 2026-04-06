-- ============================================================
-- GSC Agent — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- GSC Snapshots: one row per sync
CREATE TABLE gsc_snapshots (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  synced_at        TIMESTAMPTZ DEFAULT NOW(),
  date_range_start DATE NOT NULL,
  date_range_end   DATE NOT NULL,
  overview         JSONB NOT NULL,  -- { clicks, impressions, ctr, avgPosition }
  by_query         JSONB,           -- [{ query, clicks, impressions, ctr, position }]
  by_page          JSONB,           -- [{ page, clicks, impressions, ctr, position }]
  by_country       JSONB,           -- [{ country, clicks, impressions, ctr, position }]
  by_device        JSONB,           -- [{ device, clicks, impressions, ctr, position }]
  by_date          JSONB            -- [{ date, clicks, impressions, ctr, position }]
);

CREATE INDEX idx_gsc_snapshots_synced_at ON gsc_snapshots(synced_at DESC);

ALTER TABLE gsc_snapshots ENABLE ROW LEVEL SECURITY;
-- Backend uses service role key — bypasses RLS

-- GSC Action States: persisted status + remarks per action item
CREATE TABLE gsc_action_states (
  id          TEXT PRIMARY KEY,  -- a1, a2, ... a12
  status      TEXT NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in-progress', 'done')),
  remarks     TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gsc_action_states ENABLE ROW LEVEL SECURITY;

-- Seed initial action states (matches the current GSC agent action items)
INSERT INTO gsc_action_states (id, status, remarks) VALUES
  ('a1',  'done', 'Done Apr 5 — title updated to "Power Automate vs n8n vs Zapier vs Make: The 2026 Automation Tool Comparison" in posts.ts'),
  ('a2',  'done', 'Done Apr 6 — Added dedicated H2 "Power Automate vs n8n: Head-to-Head Comparison" + 8-row HTML comparison table to /blog/n8n-vs-zapier-vs-power-automate in posts.ts. Targets the 577+579 impression queries directly.'),
  ('a3',  'done', 'Done — GSC Removals confirmed "Temporarily removed" status as of 3 Apr 2026 for both /onlines/ prefix removal and /blogs/ old URL path. Pages return 404 so permanent deindex will follow naturally.'),
  ('a4',  'done', 'Done Apr 6 — Internal links to /engage/managed-ai-engineer confirmed in: ai-development-lifecycle, what-is-ai-integration (new H2 section + closing CTA), n8n article. Three high-authority posts link with target anchor text.'),
  ('a5',  'done', 'Done Apr 6 — Post published. URL submitted in GSC → "Indexing requested". Monitor weekly.'),
  ('a6',  'done', 'Done Apr 6 — New H2 section added to /blog/what-is-ai-integration with 2 internal links to /blog/ai-development-lifecycle.'),
  ('a7',  'done', 'Done Apr 6 — New AI lifecycle section added to /blog/what-is-ai-integration with links.'),
  ('a8',  'done', 'Done Apr 6 — FAQ schema fixed: moved from client component body to Next.js server component (page.tsx). Eliminates the "Duplicate field FAQPage" GSC error. Also added FAQPage schema to /frequently-asked-questions page. GSC should re-validate within 2–4 weeks.'),
  ('a9',  'done', 'Done Apr 6 — Added /blog/ai-development-lifecycle to sitemap.xml and updated /blog/what-is-ai-integration lastmod to 2026-04-06 to signal fresh content.'),
  ('a10', 'todo', 'Waiting on spam deindex (est. May–Jun 2026). US share currently 22%. Review at next GSC sync.'),
  ('a11', 'todo', 'Metadata already targets "hire AI engineer startup" keyword. Body content needs a dedicated section. Dependency: content review of ManagedAIEngineerPage.tsx + copywriting.'),
  ('a12', 'done', 'Confirmed Apr 6 — All 3 service pages already have strong, custom meta descriptions. No action needed.')
ON CONFLICT (id) DO NOTHING;
