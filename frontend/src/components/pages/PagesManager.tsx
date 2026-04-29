"use client";

import { useState, useRef, useEffect } from "react";

// ─── Categories config ─────────────────────────────────────────────────────
// Add new categories here or via the inline dropdown "+ Add category" option.
const DEFAULT_CATEGORIES = [
  "Main",
  "Blog",
  "Case Study",
  "Agentforce",
  "Workflows",
  "Tools",
  "Misc",
  "Apply page",
];

// Per-category muted badge colors  [bg, text]
const CATEGORY_COLORS: Record<string, [string, string]> = {
  Main:           ["#EEF2FF", "#3730A3"],
  Blog:           ["#F0FDF4", "#166534"],
  "Case Study":   ["#FFF7ED", "#9A3412"],
  Agentforce:     ["#FDF4FF", "#6B21A8"],
  Workflows:      ["#F0F9FF", "#075985"],
  Tools:          ["#FEFCE8", "#854D0E"],
  Misc:           ["#F9FAFB", "#374151"],
  "Apply page":   ["#FFF1F2", "#9F1239"],
};
const DEFAULT_CAT_COLOR: [string, string] = ["#F3F4F6", "#1F2937"];

// ─── Mock data ─────────────────────────────────────────────────────────────
interface Page {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: "Published" | "Draft" | "Archived";
  updated: string;
  seo: number;
  geo: number;
  aeo: number;
}

const MOCK_PAGES: Page[] = [
  { id:1,  title:"Home",                    slug:"",                                         category:"Main",        status:"Published", updated:"2026-04-29", seo:88, geo:72, aeo:65 },
  { id:2,  title:"About",                   slug:"about",                                    category:"Main",        status:"Published", updated:"2026-04-22", seo:76, geo:68, aeo:71 },
  { id:3,  title:"Services",                slug:"services",                                 category:"Main",        status:"Published", updated:"2026-04-20", seo:54, geo:45, aeo:38 },
  { id:4,  title:"Pricing",                 slug:"pricing",                                  category:"Main",        status:"Draft",     updated:"2026-04-18", seo:40, geo:30, aeo:22 },
  { id:5,  title:"Contact",                 slug:"contact",                                  category:"Main",        status:"Published", updated:"2026-04-15", seo:82, geo:74, aeo:69 },
  { id:6,  title:"AI Strategy 2025",        slug:"blog/ai-strategy-2025",                   category:"Blog",        status:"Published", updated:"2026-04-25", seo:91, geo:85, aeo:78 },
  { id:7,  title:"Agentforce Deep Dive",    slug:"blog/agentforce-deep-dive",               category:"Blog",        status:"Published", updated:"2026-04-19", seo:63, geo:55, aeo:48 },
  { id:8,  title:"ROI of AI Agents",        slug:"blog/roi-ai-agents",                      category:"Blog",        status:"Draft",     updated:"2026-04-10", seo:28, geo:20, aeo:15 },
  { id:9,  title:"Retail Automation",       slug:"case-studies/retail-automation",          category:"Case Study",  status:"Published", updated:"2026-04-12", seo:79, geo:70, aeo:66 },
  { id:10, title:"FS Compliance AI",        slug:"case-studies/fs-compliance",              category:"Case Study",  status:"Draft",     updated:"2026-03-28", seo:35, geo:28, aeo:18 },
  { id:11, title:"What is Agentforce?",     slug:"agentforce/overview",                     category:"Agentforce",  status:"Published", updated:"2026-04-21", seo:85, geo:80, aeo:74 },
  { id:12, title:"Agentforce Pricing",      slug:"agentforce/pricing",                      category:"Agentforce",  status:"Published", updated:"2026-04-16", seo:58, geo:50, aeo:44 },
  { id:13, title:"Lead Routing Workflow",   slug:"workflows/lead-routing",                  category:"Workflows",   status:"Published", updated:"2026-04-14", seo:72, geo:66, aeo:60 },
  { id:14, title:"Privacy Policy",          slug:"privacy",                                 category:"Misc",        status:"Published", updated:"2026-01-10", seo:45, geo:30, aeo:25 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const ACCENT = "#E8590A";

function scoreColor(n: number) {
  if (n > 70) return "#16A34A";
  if (n >= 40) return "#D97706";
  return "#DC2626";
}

function ScoreDot({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:11, fontWeight:600, color:"#374151" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block", flexShrink:0 }} />
      <span style={{ color }}>{value}</span>
      <span style={{ color:"#9CA3AF", fontWeight:400, fontSize:10 }}>{label}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    Published: { bg:"#DCFCE7", color:"#166534", label:"Published" },
    Draft:     { bg:"#F3F4F6", color:"#6B7280", label:"Draft" },
    Archived:  { bg:"#FEE2E2", color:"#991B1B", label:"Archived" },
  };
  const s = map[status] || map.Draft;
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius:4, padding:"2px 8px",
      fontSize:11, fontWeight:600, letterSpacing:"0.02em", whiteSpace:"nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ─── Category badge with inline dropdown ───────────────────────────────────
function CategoryBadge({
  value, categories, onChange
}: {
  value: string;
  categories: string[];
  onChange: (cat: string, isNew?: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [bg, text] = CATEGORY_COLORS[value] || DEFAULT_CAT_COLOR;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setAdding(false); setNewCat("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  function handleAdd() {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    onChange(trimmed, true);
    setAdding(false); setNewCat(""); setOpen(false);
  }

  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Click to change category"
        style={{
          background: bg, color: text,
          border: `1px solid ${open ? ACCENT : "transparent"}`,
          borderRadius:4, padding:"2px 8px",
          fontSize:11, fontWeight:600, cursor:"pointer",
          display:"inline-flex", alignItems:"center", gap:4,
          transition:"border-color 0.15s",
        }}
      >
        {value}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:50,
          background:"#fff", border:"1px solid #E5E7EB",
          borderRadius:6, boxShadow:"0 4px 16px rgba(0,0,0,0.10)",
          minWidth:160, overflow:"hidden",
        }}>
          {categories.map(cat => {
            const [cbg, ctxt] = CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;
            const active = cat === value;
            return (
              <button
                key={cat}
                onClick={() => { onChange(cat); setOpen(false); }}
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  width:"100%", textAlign:"left",
                  padding:"7px 12px", background: active ? "#F9FAFB" : "transparent",
                  border:"none", cursor:"pointer", fontSize:12,
                  color:"#111827", fontWeight: active ? 600 : 400,
                  transition:"background 0.1s",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ width:8, height:8, borderRadius:2, background:cbg, border:`1px solid ${ctxt}22`, flexShrink:0 }} />
                <span style={{ color:ctxt, background:cbg, borderRadius:3, padding:"1px 6px", fontSize:11, fontWeight:600 }}>{cat}</span>
                {active && (
                  <svg style={{ marginLeft:"auto" }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}

          <div style={{ borderTop:"1px solid #F3F4F6", padding:"6px 8px" }}>
            {!adding ? (
              <button
                onClick={() => setAdding(true)}
                style={{
                  display:"flex", alignItems:"center", gap:6,
                  width:"100%", textAlign:"left",
                  background:"transparent", border:"none",
                  cursor:"pointer", fontSize:11.5, color:ACCENT,
                  fontWeight:600, padding:"3px 4px", borderRadius:4,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FFF7F4"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M2 6h8" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Add category
              </button>
            ) : (
              <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                <input
                  ref={inputRef}
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") { setAdding(false); setNewCat(""); }
                  }}
                  placeholder="Category name…"
                  style={{
                    flex:1, fontSize:12, padding:"4px 8px",
                    border:"1px solid #E5E7EB", borderRadius:4,
                    outline:"none", color:"#111827",
                  }}
                  onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = ACCENT}
                  onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"}
                />
                <button
                  onClick={handleAdd}
                  style={{
                    background:ACCENT, color:"#fff", border:"none",
                    borderRadius:4, padding:"4px 8px", fontSize:11,
                    fontWeight:700, cursor:"pointer",
                  }}
                >Add</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sort icon ─────────────────────────────────────────────────────────────
function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  if (!dir) return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ opacity:0.3 }}>
      <path d="M5 1v10M1 4l4-3 4 3M1 8l4 3 4-3" stroke="#6B7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      {dir === "asc"
        ? <path d="M5 9V1M1 4l4-3 4 3" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M5 1v8M1 6l4 3 4-3" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  );
}

// ─── Row action icons ───────────────────────────────────────────────────────
function RowActions({ slug, onDuplicate, onArchive }: { slug: string; onDuplicate: () => void; onArchive: () => void }) {
  const base: React.CSSProperties = {
    background:"transparent", border:"none", cursor:"pointer",
    padding:5, borderRadius:5, display:"flex", alignItems:"center",
    color:"#6B7280", transition:"background 0.1s, color 0.1s",
  };

  function Btn({ title, onClick, children }: { title: string; onClick?: () => void; children: React.ReactNode }) {
    const [hov, setHov] = useState(false);
    return (
      <button
        title={title}
        onClick={e => { e.stopPropagation(); onClick?.(); }}
        style={{ ...base, ...(hov ? { background:"#F3F4F6", color:"#111827" } : {}) }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {children}
      </button>
    );
  }

  const href = slug ? `/${slug}` : "/";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:2 }}>
      <Btn title="Edit page">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Btn>
      <Btn title="View live" onClick={() => window.open(href, "_blank")}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2H2v10h10V9M8 2h4v4M6 8l5.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Btn>
      <Btn title="Duplicate" onClick={onDuplicate}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="5" y="5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M9 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </Btn>
      <Btn title="Archive" onClick={onArchive}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1.5" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M2 4.5v7a1 1 0 001 1h8a1 1 0 001-1v-7M5.5 7h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </Btn>
    </div>
  );
}

// ─── Column definition ──────────────────────────────────────────────────────
type SortKey = "title" | "category" | "status" | "updated" | "seo";

const COLS: { key: SortKey; label: string; width: string }[] = [
  { key:"title",    label:"Page Title",       width:"28%" },
  { key:"category", label:"Category",         width:"13%" },
  { key:"status",   label:"Status",           width:"10%" },
  { key:"updated",  label:"Last Updated",     width:"12%" },
  { key:"seo",      label:"SEO / GEO / AEO",  width:"18%" },
];

// ─── Main component ─────────────────────────────────────────────────────────
export default function PagesManager() {
  const [pages, setPages]             = useState<Page[]>(MOCK_PAGES);
  const [categories, setCategories]   = useState<string[]>(DEFAULT_CATEGORIES);
  const [search, setSearch]           = useState("");
  const [statusTab, setStatusTab]     = useState("All");
  const [catFilter, setCatFilter]     = useState("All");
  const [sortCol, setSortCol]         = useState<SortKey>("updated");
  const [sortDir, setSortDir]         = useState<"asc"|"desc">("desc");
  const [selected, setSelected]       = useState<Set<number>>(new Set());
  const [hoveredRow, setHoveredRow]   = useState<number | null>(null);
  const [bulkCatOpen, setBulkCatOpen] = useState(false);
  const bulkCatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (bulkCatRef.current && !bulkCatRef.current.contains(e.target as Node)) setBulkCatOpen(false);
    }
    if (bulkCatOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [bulkCatOpen]);

  const publishedCount = pages.filter(p => p.status === "Published").length;

  const filtered = pages
    .filter(p => {
      const q = search.toLowerCase();
      if (q && !p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      if (statusTab === "Drafts"    && p.status !== "Draft")     return false;
      if (statusTab === "Published" && p.status !== "Published")  return false;
      if (statusTab === "Archived"  && p.status !== "Archived")   return false;
      if (catFilter !== "All" && p.category !== catFilter)        return false;
      return true;
    })
    .sort((a, b) => {
      let av: string | number = a[sortCol] as string | number;
      let bv: string | number = b[sortCol] as string | number;
      if (sortCol === "seo") { av = Number(av); bv = Number(bv); }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  function toggleSort(col: SortKey) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  function toggleRow(id: number) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  }

  function updateCategory(id: number, cat: string, isNew = false) {
    if (isNew && !categories.includes(cat)) setCategories(prev => [...prev, cat]);
    setPages(prev => prev.map(p => p.id === id ? { ...p, category: cat } : p));
  }

  function bulkSetStatus(status: Page["status"]) {
    setPages(prev => prev.map(p => selected.has(p.id) ? { ...p, status } : p));
    setSelected(new Set());
  }

  function bulkSetCategory(cat: string, isNew = false) {
    if (isNew && !categories.includes(cat)) setCategories(prev => [...prev, cat]);
    setPages(prev => prev.map(p => selected.has(p.id) ? { ...p, category: cat } : p));
    setSelected(new Set());
    setBulkCatOpen(false);
  }

  function duplicatePage(id: number) {
    const src = pages.find(p => p.id === id);
    if (!src) return;
    const newId = Math.max(...pages.map(p => p.id)) + 1;
    const dup: Page = { ...src, id: newId, title: `${src.title} (Copy)`, slug: src.slug ? `${src.slug}-copy` : "copy", status:"Draft", updated: new Date().toISOString().slice(0,10) };
    setPages(prev => [...prev, dup]);
  }

  function archivePage(id: number) {
    setPages(prev => prev.map(p => p.id === id ? { ...p, status:"Archived" } : p));
  }

  const allChecked  = filtered.length > 0 && selected.size === filtered.length;
  const someChecked = selected.size > 0 && selected.size < filtered.length;

  const tabs = [
    { key:"All",       label:"All",       count: pages.length },
    { key:"Published", label:"Published", count: pages.filter(p=>p.status==="Published").length },
    { key:"Drafts",    label:"Drafts",    count: pages.filter(p=>p.status==="Draft").length },
    { key:"Archived",  label:"Archived",  count: pages.filter(p=>p.status==="Archived").length },
  ];

  return (
    <div style={{ fontFamily:"ui-sans-serif,system-ui,sans-serif", color:"#111827", padding:"32px 40px" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0, color:"#0A0A0A", letterSpacing:"-0.02em" }}>Pages</h1>
          <p style={{ fontSize:13, color:"#6B7280", margin:"4px 0 0" }}>Manage all website pages, statuses and SEO scores</p>
        </div>

        {/* Page count pill */}
        <div style={{
          display:"flex", alignItems:"center", gap:10,
          background:"#fff", border:"1px solid #E5E2D9",
          borderRadius:10, padding:"10px 18px",
          boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:26, fontWeight:800, color:ACCENT, lineHeight:1 }}>{pages.length}</div>
            <div style={{ fontSize:11, color:"#6B7280", fontWeight:500, marginTop:2 }}>Total pages</div>
          </div>
          <div style={{ width:1, height:32, background:"#E5E2D9" }} />
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:26, fontWeight:800, color:"#16A34A", lineHeight:1 }}>{publishedCount}</div>
            <div style={{ fontSize:11, color:"#6B7280", fontWeight:500, marginTop:2 }}>Published</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:"1 1 200px", maxWidth:320 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#9CA3AF" }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pages…"
            style={{
              width:"100%", boxSizing:"border-box" as const,
              padding:"8px 10px 8px 32px",
              border:"1px solid #E5E2D9", borderRadius:7,
              fontSize:13, color:"#111827", background:"#fff",
              outline:"none", transition:"border-color 0.15s",
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = ACCENT}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E5E2D9"}
          />
        </div>

        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{
            padding:"8px 12px", border:"1px solid #E5E2D9",
            borderRadius:7, fontSize:13, background:"#fff",
            color:"#374151", outline:"none", cursor:"pointer",
          }}
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button style={{
          marginLeft:"auto",
          background:ACCENT, color:"#fff",
          border:"none", borderRadius:7,
          padding:"8px 16px", fontSize:13, fontWeight:600,
          cursor:"pointer", display:"flex", alignItems:"center", gap:6,
          whiteSpace:"nowrap",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New Page
        </button>
      </div>

      {/* Status tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:16, borderBottom:"1px solid #E5E2D9" }}>
        {tabs.map(t => {
          const active = statusTab === t.key;
          return (
            <button key={t.key} onClick={() => setStatusTab(t.key)} style={{
              background:"transparent", border:"none", cursor:"pointer",
              padding:"8px 14px", fontSize:13, fontWeight: active ? 600 : 400,
              color: active ? ACCENT : "#6B7280",
              borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent",
              marginBottom:-1,
              display:"flex", alignItems:"center", gap:6,
              transition:"color 0.15s",
            }}>
              {t.label}
              <span style={{
                background: active ? `${ACCENT}18` : "#F3F4F6",
                color: active ? ACCENT : "#6B7280",
                borderRadius:99, padding:"1px 6px", fontSize:11, fontWeight:600,
              }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:"#fff", border:`1px solid ${ACCENT}44`,
          borderRadius:8, padding:"10px 16px", marginBottom:12,
          boxShadow:`0 2px 8px ${ACCENT}18`,
          animation:"slideDown 0.15s ease",
        }}>
          <span style={{ fontSize:12, fontWeight:600, color:ACCENT, marginRight:4 }}>
            {selected.size} selected
          </span>
          <div style={{ width:1, height:20, background:"#E5E2D9", margin:"0 4px" }} />

          {([
            { label:"Publish",      action: () => bulkSetStatus("Published") },
            { label:"Set to Draft", action: () => bulkSetStatus("Draft") },
            { label:"Archive",      action: () => bulkSetStatus("Archived") },
          ] as const).map(btn => (
            <button key={btn.label} onClick={btn.action} style={{
              background:"#F9FAFB", border:"1px solid #E5E2D9",
              borderRadius:6, padding:"5px 12px", fontSize:12,
              fontWeight:600, cursor:"pointer", color:"#374151",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F3F4F6"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
            >{btn.label}</button>
          ))}

          <div ref={bulkCatRef} style={{ position:"relative" }}>
            <button onClick={() => setBulkCatOpen(v => !v)} style={{
              background: bulkCatOpen ? `${ACCENT}12` : "#F9FAFB",
              border:`1px solid ${bulkCatOpen ? ACCENT : "#E5E2D9"}`,
              borderRadius:6, padding:"5px 12px", fontSize:12,
              fontWeight:600, cursor:"pointer", color: bulkCatOpen ? ACCENT : "#374151",
              display:"flex", alignItems:"center", gap:5,
            }}>
              Change Category
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {bulkCatOpen && (
              <div style={{
                position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:50,
                background:"#fff", border:"1px solid #E5E7EB",
                borderRadius:6, boxShadow:"0 4px 16px rgba(0,0,0,0.10)",
                minWidth:160, overflow:"hidden",
              }}>
                {categories.map(cat => {
                  const [cbg, ctxt] = CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;
                  return (
                    <button key={cat} onClick={() => bulkSetCategory(cat)} style={{
                      display:"flex", alignItems:"center", gap:8,
                      width:"100%", textAlign:"left",
                      padding:"7px 12px", background:"transparent",
                      border:"none", cursor:"pointer", fontSize:12, color:"#111827",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <span style={{ color:ctxt, background:cbg, borderRadius:3, padding:"1px 6px", fontSize:11, fontWeight:600 }}>{cat}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => setSelected(new Set())} style={{
            marginLeft:"auto", background:"transparent", border:"none",
            cursor:"pointer", color:"#9CA3AF", fontSize:13, fontWeight:600,
            padding:"4px 8px", borderRadius:4,
          }}>✕ Clear</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background:"#fff", border:"1px solid #E5E2D9", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
          <colgroup>
            <col style={{ width:40 }} />
            {COLS.map(c => <col key={c.key} style={{ width:c.width }} />)}
            <col style={{ width:120 }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom:"1px solid #E5E2D9", background:"#FAFAF9" }}>
              <th style={{ padding:"11px 0 11px 16px", textAlign:"left" }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => { if (el) el.indeterminate = someChecked; }}
                  onChange={toggleAll}
                  style={{ cursor:"pointer", accentColor:ACCENT, width:14, height:14 }}
                />
              </th>
              {COLS.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)} style={{
                  padding:"11px 12px", textAlign:"left",
                  fontSize:11.5, fontWeight:600,
                  color: sortCol === col.key ? ACCENT : "#6B7280",
                  letterSpacing:"0.04em", textTransform:"uppercase",
                  cursor:"pointer", userSelect:"none", whiteSpace:"nowrap",
                  transition:"color 0.15s",
                }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                    {col.label}
                    <SortIcon dir={sortCol === col.key ? sortDir : null} />
                  </span>
                </th>
              ))}
              <th style={{ padding:"11px 16px 11px 0", textAlign:"right", fontSize:11.5, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.04em", textTransform:"uppercase" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLS.length + 2} style={{ padding:"48px 0", textAlign:"center", color:"#9CA3AF", fontSize:13 }}>
                  No pages match your filters.
                </td>
              </tr>
            )}
            {filtered.map((page, idx) => {
              const isSelected = selected.has(page.id);
              const isHovered  = hoveredRow === page.id;
              const rowBg = isSelected ? `${ACCENT}08` : isHovered ? "#FAFAF9" : "#fff";

              return (
                <tr key={page.id}
                  onMouseEnter={() => setHoveredRow(page.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ background:rowBg, borderBottom: idx < filtered.length - 1 ? "1px solid #F3F4F6" : "none", transition:"background 0.1s" }}
                >
                  <td style={{ padding:"12px 0 12px 16px" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleRow(page.id)}
                      style={{ cursor:"pointer", accentColor:ACCENT, width:14, height:14 }} />
                  </td>
                  <td style={{ padding:"12px" }}>
                    <div style={{ fontWeight:600, fontSize:13.5, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{page.title}</div>
                    <div style={{ fontFamily:"ui-monospace,monospace", fontSize:11, color:"#9CA3AF", marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>/{page.slug}</div>
                  </td>
                  <td style={{ padding:"12px" }}>
                    <CategoryBadge value={page.category} categories={categories} onChange={(cat, isNew) => updateCategory(page.id, cat, isNew)} />
                  </td>
                  <td style={{ padding:"12px" }}>
                    <StatusBadge status={page.status} />
                  </td>
                  <td style={{ padding:"12px", fontSize:12.5, color:"#6B7280" }}>{page.updated}</td>
                  <td style={{ padding:"12px" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                      <ScoreDot label="SEO" value={page.seo} />
                      <ScoreDot label="GEO" value={page.geo} />
                      <ScoreDot label="AEO" value={page.aeo} />
                    </div>
                  </td>
                  <td style={{ padding:"12px 16px 12px 0", textAlign:"right" }}>
                    <div style={{ opacity: isHovered || isSelected ? 1 : 0, transition:"opacity 0.15s", display:"flex", justifyContent:"flex-end" }}>
                      <RowActions slug={page.slug} onDuplicate={() => duplicatePage(page.id)} onArchive={() => archivePage(page.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div style={{ borderTop:"1px solid #F3F4F6", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, color:"#9CA3AF" }}>
            <span>Showing <strong style={{ color:"#374151" }}>{filtered.length}</strong> of <strong style={{ color:"#374151" }}>{pages.length}</strong> pages</span>
            {selected.size > 0 && <span style={{ color:ACCENT, fontWeight:600 }}>{selected.size} row{selected.size !== 1 ? "s" : ""} selected</span>}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
