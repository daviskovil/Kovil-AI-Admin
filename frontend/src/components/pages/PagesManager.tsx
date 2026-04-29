"use client";

import { useState, useRef, useEffect } from "react";

// ─── Categories config ─────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  "Main",
  "Blog",
  "Case Study",
  "Agentforce",
  "Hire",
  "Engage",
  "Workflows",
  "Tools",
  "Landing",
  "Misc",
  "Apply page",
];

const CATEGORY_COLORS: Record<string, [string, string]> = {
  Main:           ["#EEF2FF", "#3730A3"],
  Blog:           ["#F0FDF4", "#166534"],
  "Case Study":   ["#FFF7ED", "#9A3412"],
  Agentforce:     ["#FDF4FF", "#6B21A8"],
  Hire:           ["#F0F9FF", "#075985"],
  Engage:         ["#ECFDF5", "#065F46"],
  Workflows:      ["#FFFBEB", "#92400E"],
  Tools:          ["#FEFCE8", "#854D0E"],
  Landing:        ["#FFF1F2", "#9F1239"],
  Misc:           ["#F9FAFB", "#374151"],
  "Apply page":   ["#F5F3FF", "#5B21B6"],
};
const DEFAULT_CAT_COLOR: [string, string] = ["#F3F4F6", "#1F2937"];

// ─── All real website pages ────────────────────────────────────────────────
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
  // ── Main ──────────────────────────────────────────────────────────────────
  { id:1,  title:"Home",                          slug:"",                                                                          category:"Main",        status:"Published", updated:"2026-04-20", seo:88, geo:74, aeo:70 },
  { id:2,  title:"About",                         slug:"about",                                                                     category:"Main",        status:"Published", updated:"2026-04-10", seo:82, geo:68, aeo:63 },
  { id:3,  title:"How It Works",                  slug:"how-it-works",                                                              category:"Main",        status:"Published", updated:"2026-03-28", seo:79, geo:64, aeo:59 },
  { id:4,  title:"Contact",                       slug:"contact",                                                                   category:"Main",        status:"Published", updated:"2026-04-01", seo:75, geo:62, aeo:57 },
  { id:5,  title:"Book a Call",                   slug:"book-a-call",                                                               category:"Main",        status:"Published", updated:"2026-04-05", seo:71, geo:58, aeo:52 },
  { id:6,  title:"FAQ",                           slug:"frequently-asked-questions",                                                category:"Main",        status:"Published", updated:"2026-03-15", seo:77, geo:65, aeo:60 },

  // ── Misc ──────────────────────────────────────────────────────────────────
  { id:7,  title:"Terms of Service",              slug:"terms",                                                                     category:"Misc",        status:"Published", updated:"2026-01-10", seo:42, geo:28, aeo:22 },
  { id:8,  title:"Privacy Policy",                slug:"privacy",                                                                   category:"Misc",        status:"Published", updated:"2026-01-10", seo:44, geo:30, aeo:24 },

  // ── Apply ─────────────────────────────────────────────────────────────────
  { id:9,  title:"Apply as AI Engineer",          slug:"apply",                                                                     category:"Apply page",  status:"Published", updated:"2026-02-20", seo:68, geo:52, aeo:46 },
  { id:10, title:"Apply as IT Recruiter",         slug:"apply-as-it-recruiter",                                                     category:"Apply page",  status:"Published", updated:"2026-02-20", seo:55, geo:42, aeo:36 },

  // ── Blog ──────────────────────────────────────────────────────────────────
  { id:11, title:"Blog Index",                    slug:"blog",                                                                      category:"Blog",        status:"Published", updated:"2026-04-25", seo:84, geo:70, aeo:65 },
  { id:12, title:"RAG vs Fine-Tuning",            slug:"blog/rag-vs-fine-tuning",                                                   category:"Blog",        status:"Published", updated:"2026-04-22", seo:91, geo:83, aeo:77 },
  { id:13, title:"AI Agents vs Chatbots",         slug:"blog/ai-agents-vs-chatbots",                                                category:"Blog",        status:"Published", updated:"2026-04-18", seo:89, geo:81, aeo:75 },
  { id:14, title:"AI Development Lifecycle",      slug:"blog/ai-development-lifecycle",                                             category:"Blog",        status:"Published", updated:"2026-04-15", seo:87, geo:78, aeo:72 },
  { id:15, title:"AI Automation NYC Agencies",    slug:"blog/ai-automation-nyc-ad-marketing-agencies",                             category:"Blog",        status:"Published", updated:"2026-04-12", seo:76, geo:65, aeo:59 },
  { id:16, title:"What is AI Integration",        slug:"blog/what-is-ai-integration",                                               category:"Blog",        status:"Published", updated:"2026-04-08", seo:85, geo:76, aeo:70 },
  { id:17, title:"Build MVP in 4 Weeks",          slug:"blog/build-mvp-4-weeks",                                                    category:"Blog",        status:"Published", updated:"2026-04-05", seo:83, geo:74, aeo:68 },
  { id:18, title:"Hidden Cost of Unmaintained SW",slug:"blog/software-maintenance-time-bomb",                                       category:"Blog",        status:"Published", updated:"2026-03-30", seo:78, geo:67, aeo:61 },
  { id:19, title:"n8n vs Zapier vs Make",         slug:"blog/n8n-vs-zapier-vs-power-automate",                                      category:"Blog",        status:"Published", updated:"2026-03-25", seo:88, geo:80, aeo:74 },
  { id:20, title:"Real Cost of MVP 2026",         slug:"blog/real-cost-building-mvp-2026",                                          category:"Blog",        status:"Published", updated:"2026-03-20", seo:82, geo:72, aeo:66 },
  { id:21, title:"LLM Chatbot for Business",      slug:"blog/llm-chatbot-for-business",                                             category:"Blog",        status:"Published", updated:"2026-03-15", seo:80, geo:70, aeo:64 },
  { id:22, title:"Why AI Projects Fail",          slug:"blog/why-ai-projects-fail",                                                 category:"Blog",        status:"Published", updated:"2026-03-10", seo:90, geo:82, aeo:76 },
  { id:23, title:"GPT-4o vs Claude vs Gemini",    slug:"blog/gpt-4o-vs-claude-vs-gemini",                                           category:"Blog",        status:"Published", updated:"2026-03-05", seo:86, geo:78, aeo:72 },
  { id:24, title:"How Much Does AI Cost in 2026", slug:"blog/how-much-does-an-ai-project-cost",                                     category:"Blog",        status:"Published", updated:"2026-02-28", seo:84, geo:76, aeo:70 },
  { id:25, title:"What is a Vector Database",     slug:"blog/what-is-a-vector-database",                                            category:"Blog",        status:"Published", updated:"2026-02-20", seo:81, geo:72, aeo:66 },
  { id:26, title:"How to Write an AI Brief",      slug:"blog/how-to-write-an-ai-project-brief",                                     category:"Blog",        status:"Published", updated:"2026-02-15", seo:79, geo:70, aeo:64 },

  // ── Case Studies ──────────────────────────────────────────────────────────
  { id:27, title:"Case Studies Index",            slug:"case-studies",                                                              category:"Case Study",  status:"Published", updated:"2026-04-20", seo:80, geo:68, aeo:63 },
  { id:28, title:"Mortgage Document Platform",    slug:"case-studies/secondary-mortgage-document-platform",                        category:"Case Study",  status:"Published", updated:"2026-04-10", seo:74, geo:63, aeo:57 },
  { id:29, title:"Lending Platform AI Automation",slug:"case-studies/lending-platform-ai-automation",                              category:"Case Study",  status:"Published", updated:"2026-04-08", seo:72, geo:61, aeo:55 },
  { id:30, title:"FinTech Payment Dashboard",     slug:"case-studies/fintech-payment-dashboard",                                    category:"Case Study",  status:"Published", updated:"2026-04-05", seo:70, geo:59, aeo:53 },
  { id:31, title:"SaaS Workflow Automation",      slug:"case-studies/saas-workflow-automation",                                     category:"Case Study",  status:"Published", updated:"2026-04-01", seo:76, geo:65, aeo:59 },
  { id:32, title:"E-Commerce Platform Uptime",    slug:"case-studies/ecommerce-maintenance",                                        category:"Case Study",  status:"Published", updated:"2026-03-28", seo:68, geo:57, aeo:51 },
  { id:33, title:"HealthTech Patient Intake AI",  slug:"case-studies/healthcare-ai-integration",                                    category:"Case Study",  status:"Published", updated:"2026-03-25", seo:73, geo:62, aeo:56 },
  { id:34, title:"Logistics MVP Sprint",          slug:"case-studies/logistics-mvp-sprint",                                         category:"Case Study",  status:"Published", updated:"2026-03-20", seo:71, geo:60, aeo:54 },
  { id:35, title:"LegalTech Zero Downtime",       slug:"case-studies/legal-tech-maintenance",                                       category:"Case Study",  status:"Published", updated:"2026-03-15", seo:67, geo:56, aeo:50 },
  { id:36, title:"Retail AI Chatbot",             slug:"case-studies/retail-chatbot",                                               category:"Case Study",  status:"Published", updated:"2026-03-10", seo:78, geo:66, aeo:60 },
  { id:37, title:"PropTech Valuation Dashboard",  slug:"case-studies/proptech-sprint",                                              category:"Case Study",  status:"Published", updated:"2026-03-05", seo:65, geo:54, aeo:48 },
  { id:38, title:"EdTech Platform Performance",   slug:"case-studies/edtech-platform",                                              category:"Case Study",  status:"Published", updated:"2026-02-28", seo:63, geo:52, aeo:46 },

  // ── Agentforce ────────────────────────────────────────────────────────────
  { id:39, title:"Agentforce Hub",                slug:"agentforce",                                                                category:"Agentforce",  status:"Published", updated:"2026-04-25", seo:86, geo:78, aeo:72 },
  { id:40, title:"SDR Agent",                     slug:"agentforce/sales-cloud/sdr-agent",                                          category:"Agentforce",  status:"Published", updated:"2026-04-22", seo:82, geo:74, aeo:68 },
  { id:41, title:"Pipeline Health Monitor",       slug:"agentforce/sales-cloud/pipeline-health-monitor",                           category:"Agentforce",  status:"Published", updated:"2026-04-20", seo:79, geo:71, aeo:65 },
  { id:42, title:"Quote & Proposal Agent",        slug:"agentforce/sales-cloud/quote-proposal-agent",                              category:"Agentforce",  status:"Published", updated:"2026-04-18", seo:77, geo:69, aeo:63 },
  { id:43, title:"Autonomous Case Resolution",    slug:"agentforce/service-cloud/autonomous-case-resolution",                      category:"Agentforce",  status:"Published", updated:"2026-04-15", seo:80, geo:72, aeo:66 },
  { id:44, title:"Intelligent Escalation",        slug:"agentforce/service-cloud/intelligent-escalation",                          category:"Agentforce",  status:"Published", updated:"2026-04-12", seo:76, geo:68, aeo:62 },
  { id:45, title:"Knowledge Base Agent",          slug:"agentforce/service-cloud/knowledge-base-agent",                            category:"Agentforce",  status:"Published", updated:"2026-04-10", seo:74, geo:66, aeo:60 },
  { id:46, title:"Campaign Execution Agent",      slug:"agentforce/marketing-cloud/campaign-execution-agent",                      category:"Agentforce",  status:"Published", updated:"2026-04-08", seo:72, geo:64, aeo:58 },
  { id:47, title:"Lead Nurture Agent",            slug:"agentforce/marketing-cloud/lead-nurture-agent",                            category:"Agentforce",  status:"Published", updated:"2026-04-05", seo:70, geo:62, aeo:56 },
  { id:48, title:"Event & Webinar Agent",         slug:"agentforce/marketing-cloud/event-webinar-agent",                           category:"Agentforce",  status:"Published", updated:"2026-04-01", seo:68, geo:60, aeo:54 },
  { id:49, title:"HR Onboarding Agent",           slug:"agentforce/internal-operations/hr-onboarding-agent",                       category:"Agentforce",  status:"Published", updated:"2026-03-28", seo:71, geo:63, aeo:57 },
  { id:50, title:"Finance Approval Agent",        slug:"agentforce/internal-operations/finance-approval-agent",                    category:"Agentforce",  status:"Published", updated:"2026-03-25", seo:69, geo:61, aeo:55 },
  { id:51, title:"IT Helpdesk Agent",             slug:"agentforce/internal-operations/it-helpdesk-agent",                         category:"Agentforce",  status:"Published", updated:"2026-03-22", seo:67, geo:59, aeo:53 },
  { id:52, title:"Agent Design & Configuration",  slug:"agentforce/services/agent-design-configuration",                           category:"Agentforce",  status:"Published", updated:"2026-03-20", seo:73, geo:65, aeo:59 },
  { id:53, title:"Agentforce Rescue & Optimisation",slug:"agentforce/services/agentforce-rescue-optimisation",                     category:"Agentforce",  status:"Published", updated:"2026-03-18", seo:75, geo:67, aeo:61 },
  { id:54, title:"Agentforce Strategy & Readiness",slug:"agentforce/services/agentforce-strategy-readiness",                       category:"Agentforce",  status:"Published", updated:"2026-03-15", seo:77, geo:69, aeo:63 },
  { id:55, title:"MuleSoft & Data Cloud Integration",slug:"agentforce/services/mulesoft-data-cloud-integration",                   category:"Agentforce",  status:"Published", updated:"2026-03-12", seo:70, geo:62, aeo:56 },
  { id:56, title:"Sales Cloud Agent Deployment",  slug:"agentforce/services/sales-cloud-agent-deployment",                         category:"Agentforce",  status:"Published", updated:"2026-03-10", seo:72, geo:64, aeo:58 },
  { id:57, title:"Service Cloud Agent Deployment",slug:"agentforce/services/service-cloud-agent-deployment",                       category:"Agentforce",  status:"Published", updated:"2026-03-08", seo:71, geo:63, aeo:57 },
  { id:58, title:"Scope Your First Agent (Playbook)",slug:"agentforce/playbook/scope-your-first-agentforce-agent",                 category:"Agentforce",  status:"Published", updated:"2026-03-05", seo:83, geo:75, aeo:69 },
  { id:59, title:"Atlas Reasoning Engine Explained",slug:"agentforce/playbook/atlas-reasoning-engine-explained",                   category:"Agentforce",  status:"Published", updated:"2026-03-01", seo:85, geo:77, aeo:71 },
  { id:60, title:"FS Service Cloud Build (Playbook)",slug:"agentforce/playbook/financial-services-service-cloud-build",            category:"Agentforce",  status:"Published", updated:"2026-02-25", seo:81, geo:73, aeo:67 },

  // ── Hire ──────────────────────────────────────────────────────────────────
  { id:61, title:"Hire Hub",                      slug:"hire",                                                                      category:"Hire",        status:"Published", updated:"2026-04-15", seo:84, geo:73, aeo:67 },
  { id:62, title:"Hire LLM Engineers",            slug:"hire/llm-engineers",                                                        category:"Hire",        status:"Published", updated:"2026-04-12", seo:81, geo:71, aeo:65 },
  { id:63, title:"Hire NLP Engineers",            slug:"hire/nlp-engineers",                                                        category:"Hire",        status:"Published", updated:"2026-04-10", seo:79, geo:69, aeo:63 },
  { id:64, title:"Hire Computer Vision Engineers",slug:"hire/computer-vision-engineers",                                            category:"Hire",        status:"Published", updated:"2026-04-08", seo:77, geo:67, aeo:61 },
  { id:65, title:"Hire ML Engineers",             slug:"hire/machine-learning-engineers",                                           category:"Hire",        status:"Published", updated:"2026-04-05", seo:80, geo:70, aeo:64 },
  { id:66, title:"Hire Data Engineers",           slug:"hire/data-engineers",                                                       category:"Hire",        status:"Published", updated:"2026-04-01", seo:76, geo:66, aeo:60 },
  { id:67, title:"Hire CrewAI Developers",        slug:"hire/crewai-developers",                                                    category:"Hire",        status:"Published", updated:"2026-03-28", seo:74, geo:64, aeo:58 },
  { id:68, title:"Hire LangGraph Engineers",      slug:"hire/langgraph-engineers",                                                  category:"Hire",        status:"Published", updated:"2026-03-25", seo:72, geo:62, aeo:56 },
  { id:69, title:"Hire AutoGen Developers",       slug:"hire/autogen-developers",                                                   category:"Hire",        status:"Published", updated:"2026-03-22", seo:70, geo:60, aeo:54 },
  { id:70, title:"Hire n8n Automation Experts",   slug:"hire/n8n-automation-experts",                                               category:"Hire",        status:"Published", updated:"2026-03-20", seo:73, geo:63, aeo:57 },

  // ── Engage ────────────────────────────────────────────────────────────────
  { id:71, title:"Managed AI Engineer",           slug:"engage/managed-ai-engineer",                                                category:"Engage",      status:"Published", updated:"2026-04-18", seo:83, geo:72, aeo:66 },
  { id:72, title:"Outcome-Based Project",         slug:"engage/outcome-based-project",                                              category:"Engage",      status:"Published", updated:"2026-04-15", seo:80, geo:69, aeo:63 },
  { id:73, title:"App Rescue",                    slug:"engage/app-rescue",                                                         category:"Engage",      status:"Published", updated:"2026-04-12", seo:78, geo:67, aeo:61 },
  { id:74, title:"Engage — Computer Vision Eng",  slug:"engage/computer-vision-engineers",                                          category:"Engage",      status:"Published", updated:"2026-04-08", seo:70, geo:60, aeo:54 },
  { id:75, title:"Engage — ML Engineers",         slug:"engage/machine-learning-engineers",                                         category:"Engage",      status:"Published", updated:"2026-04-05", seo:71, geo:61, aeo:55 },

  // ── Tools ─────────────────────────────────────────────────────────────────
  { id:76, title:"Tools Hub",                     slug:"tools",                                                                     category:"Tools",       status:"Published", updated:"2026-04-10", seo:74, geo:63, aeo:57 },
  { id:77, title:"AI Project Estimator",          slug:"tools/ai-project-estimator",                                                category:"Tools",       status:"Published", updated:"2026-04-08", seo:79, geo:68, aeo:62 },
  { id:78, title:"AI Readiness Assessment",       slug:"tools/ai-readiness-ad-marketing-agencies",                                  category:"Tools",       status:"Published", updated:"2026-04-05", seo:72, geo:61, aeo:55 },

  // ── Landing ───────────────────────────────────────────────────────────────
  { id:79, title:"Ad & Marketing Agencies",       slug:"ad-marketing-agencies",                                                     category:"Landing",     status:"Published", updated:"2026-04-20", seo:81, geo:70, aeo:64 },
  { id:80, title:"AI Readiness (Standalone)",     slug:"ai-readiness-ad-marketing-agencies",                                        category:"Landing",     status:"Published", updated:"2026-04-15", seo:75, geo:64, aeo:58 },
  { id:81, title:"AI Project Estimator (Standalone)",slug:"ai-project-estimator",                                                   category:"Landing",     status:"Published", updated:"2026-04-12", seo:77, geo:66, aeo:60 },

  // ── Workflows ─────────────────────────────────────────────────────────────
  { id:82, title:"AI Workflow Library",           slug:"ai-workflow-automation-library",                                            category:"Workflows",   status:"Published", updated:"2026-04-22", seo:82, geo:71, aeo:65 },
  { id:83, title:"Campaign Performance Reporting",slug:"ai-workflow-automation-library/campaign-performance-reporting",             category:"Workflows",   status:"Published", updated:"2026-04-18", seo:76, geo:65, aeo:59 },
  { id:84, title:"AI Creative Brief Generator",   slug:"ai-workflow-automation-library/ai-creative-brief-generator",               category:"Workflows",   status:"Published", updated:"2026-04-15", seo:74, geo:63, aeo:57 },
  { id:85, title:"Client Onboarding Automation",  slug:"ai-workflow-automation-library/new-client-onboarding-automation",          category:"Workflows",   status:"Published", updated:"2026-04-12", seo:72, geo:61, aeo:55 },
  { id:86, title:"Automated AM Briefs & Reporting",slug:"ai-workflow-automation-library/automated-am-briefs-client-reporting",     category:"Workflows",   status:"Published", updated:"2026-04-10", seo:70, geo:59, aeo:53 },
  { id:87, title:"Multi-Channel Inbound Dispatch",slug:"ai-workflow-automation-library/multi-channel-inbound-dispatching",         category:"Workflows",   status:"Published", updated:"2026-04-08", seo:68, geo:57, aeo:51 },
  { id:88, title:"White-Label Voice AI Agents",   slug:"ai-workflow-automation-library/white-label-voice-ai-agents",               category:"Workflows",   status:"Published", updated:"2026-04-05", seo:73, geo:62, aeo:56 },
  { id:89, title:"CRM Ops Layer",                 slug:"ai-workflow-automation-library/crm-ops-layer",                             category:"Workflows",   status:"Published", updated:"2026-04-01", seo:67, geo:56, aeo:50 },
  { id:90, title:"SEO Foundation & Backlink Syndication",slug:"ai-workflow-automation-library/automated-seo-foundation-backlink-syndication", category:"Workflows", status:"Published", updated:"2026-03-28", seo:75, geo:64, aeo:58 },
  { id:91, title:"Smart Bidding & Media Buying",  slug:"ai-workflow-automation-library/smart-bidding-algorithmic-media-buying",    category:"Workflows",   status:"Published", updated:"2026-03-25", seo:69, geo:58, aeo:52 },
  { id:92, title:"SERP-First Content Generation", slug:"ai-workflow-automation-library/deep-serp-first-hybrid-content-generation", category:"Workflows",   status:"Published", updated:"2026-03-22", seo:78, geo:67, aeo:61 },
  { id:93, title:"ComfyUI & Runway Video Pipelines",slug:"ai-workflow-automation-library/comfyui-runway-commercial-video-pipelines",category:"Workflows",  status:"Published", updated:"2026-03-18", seo:65, geo:54, aeo:48 },
  { id:94, title:"Social Intelligence & Subreddit Scraping",slug:"ai-workflow-automation-library/social-intelligence-subreddit-scraping", category:"Workflows", status:"Published", updated:"2026-03-15", seo:66, geo:55, aeo:49 },
  { id:95, title:"No-API Browser Automation",     slug:"ai-workflow-automation-library/browser-based-no-api-automation-legacy-enterprise", category:"Workflows", status:"Published", updated:"2026-03-12", seo:64, geo:53, aeo:47 },
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
  const map: Record<string, { bg: string; color: string }> = {
    Published: { bg:"#DCFCE7", color:"#166534" },
    Draft:     { bg:"#F3F4F6", color:"#6B7280" },
    Archived:  { bg:"#FEE2E2", color:"#991B1B" },
  };
  const s = map[status] || map.Draft;
  return (
    <span style={{ background:s.bg, color:s.color, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, letterSpacing:"0.02em", whiteSpace:"nowrap" }}>
      {status}
    </span>
  );
}

// ─── Category badge with inline dropdown ───────────────────────────────────
function CategoryBadge({ value, categories, onChange }: {
  value: string;
  categories: string[];
  onChange: (cat: string, isNew?: boolean) => void;
}) {
  const [open, setOpen]     = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState("");
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [bg, text] = CATEGORY_COLORS[value] || DEFAULT_CAT_COLOR;

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setAdding(false); setNewCat(""); }
    }
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);

  function handleAdd() {
    const t = newCat.trim();
    if (!t) return;
    onChange(t, true);
    setAdding(false); setNewCat(""); setOpen(false);
  }

  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      <button onClick={() => setOpen(v => !v)} title="Click to change category"
        style={{ background:bg, color:text, border:`1px solid ${open ? ACCENT : "transparent"}`, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, transition:"border-color 0.15s" }}>
        {value}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:50, background:"#fff", border:"1px solid #E5E7EB", borderRadius:6, boxShadow:"0 4px 16px rgba(0,0,0,0.10)", minWidth:160, overflow:"hidden", maxHeight:280, overflowY:"auto" }}>
          {categories.map(cat => {
            const [cbg, ctxt] = CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;
            const active = cat === value;
            return (
              <button key={cat} onClick={() => { onChange(cat); setOpen(false); }}
                style={{ display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left", padding:"7px 12px", background: active ? "#F9FAFB" : "transparent", border:"none", cursor:"pointer", fontSize:12, color:"#111827", fontWeight: active ? 600 : 400 }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ color:ctxt, background:cbg, borderRadius:3, padding:"1px 6px", fontSize:11, fontWeight:600 }}>{cat}</span>
                {active && <svg style={{ marginLeft:"auto" }} width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
            );
          })}
          <div style={{ borderTop:"1px solid #F3F4F6", padding:"6px 8px" }}>
            {!adding ? (
              <button onClick={() => setAdding(true)}
                style={{ display:"flex", alignItems:"center", gap:6, width:"100%", textAlign:"left", background:"transparent", border:"none", cursor:"pointer", fontSize:11.5, color:ACCENT, fontWeight:600, padding:"3px 4px", borderRadius:4 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FFF7F4"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round"/></svg>
                Add category
              </button>
            ) : (
              <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                <input ref={inputRef} value={newCat} onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewCat(""); } }}
                  placeholder="Category name…"
                  style={{ flex:1, fontSize:12, padding:"4px 8px", border:"1px solid #E5E7EB", borderRadius:4, outline:"none", color:"#111827" }}
                  onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = ACCENT}
                  onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"}
                />
                <button onClick={handleAdd}
                  style={{ background:ACCENT, color:"#fff", border:"none", borderRadius:4, padding:"4px 8px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                  Add
                </button>
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
  function Btn({ title, onClick, children }: { title: string; onClick?: () => void; children: React.ReactNode }) {
    const [hov, setHov] = useState(false);
    return (
      <button title={title} onClick={e => { e.stopPropagation(); onClick?.(); }}
        style={{ background: hov ? "#F3F4F6" : "transparent", border:"none", cursor:"pointer", padding:5, borderRadius:5, display:"flex", alignItems:"center", color: hov ? "#111827" : "#6B7280", transition:"background 0.1s, color 0.1s" }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        {children}
      </button>
    );
  }
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2 }}>
      <Btn title="Edit page">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </Btn>
      <Btn title="View live" onClick={() => window.open(`/${slug}`, "_blank")}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H2v10h10V9M8 2h4v4M6 8l5.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </Btn>
      <Btn title="Duplicate" onClick={onDuplicate}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="5" y="5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><path d="M9 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      </Btn>
      <Btn title="Archive" onClick={onArchive}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1.5" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M2 4.5v7a1 1 0 001 1h8a1 1 0 001-1v-7M5.5 7h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
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
    setPages(prev => prev.map(p => p.id === id ? { ...p, category:cat } : p));
  }
  function bulkSetStatus(status: Page["status"]) {
    setPages(prev => prev.map(p => selected.has(p.id) ? { ...p, status } : p));
    setSelected(new Set());
  }
  function bulkSetCategory(cat: string, isNew = false) {
    if (isNew && !categories.includes(cat)) setCategories(prev => [...prev, cat]);
    setPages(prev => prev.map(p => selected.has(p.id) ? { ...p, category:cat } : p));
    setSelected(new Set()); setBulkCatOpen(false);
  }
  function duplicatePage(id: number) {
    const src = pages.find(p => p.id === id);
    if (!src) return;
    const newId = Math.max(...pages.map(p => p.id)) + 1;
    setPages(prev => [...prev, { ...src, id:newId, title:`${src.title} (Copy)`, slug:src.slug ? `${src.slug}-copy` : "copy", status:"Draft", updated:new Date().toISOString().slice(0,10) }]);
  }
  function archivePage(id: number) {
    setPages(prev => prev.map(p => p.id === id ? { ...p, status:"Archived" } : p));
  }

  const allChecked  = filtered.length > 0 && selected.size === filtered.length;
  const someChecked = selected.size > 0 && selected.size < filtered.length;

  const tabs = [
    { key:"All",       count: pages.length },
    { key:"Published", count: pages.filter(p=>p.status==="Published").length },
    { key:"Drafts",    count: pages.filter(p=>p.status==="Draft").length },
    { key:"Archived",  count: pages.filter(p=>p.status==="Archived").length },
  ];

  return (
    <div style={{ fontFamily:"ui-sans-serif,system-ui,sans-serif", color:"#111827", padding:"32px 40px" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0, color:"#0A0A0A", letterSpacing:"-0.02em" }}>Pages</h1>
          <p style={{ fontSize:13, color:"#6B7280", margin:"4px 0 0" }}>Manage all website pages, statuses and SEO scores</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", border:"1px solid #E5E2D9", borderRadius:10, padding:"10px 18px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages…"
            style={{ width:"100%", boxSizing:"border-box" as const, padding:"8px 10px 8px 32px", border:"1px solid #E5E2D9", borderRadius:7, fontSize:13, color:"#111827", background:"#fff", outline:"none" }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = ACCENT}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E5E2D9"}
          />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ padding:"8px 12px", border:"1px solid #E5E2D9", borderRadius:7, fontSize:13, background:"#fff", color:"#374151", outline:"none", cursor:"pointer" }}>
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button style={{ marginLeft:"auto", background:ACCENT, color:"#fff", border:"none", borderRadius:7, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
          New Page
        </button>
      </div>

      {/* Status tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:16, borderBottom:"1px solid #E5E2D9" }}>
        {tabs.map(t => {
          const active = statusTab === t.key;
          return (
            <button key={t.key} onClick={() => setStatusTab(t.key)} style={{ background:"transparent", border:"none", cursor:"pointer", padding:"8px 14px", fontSize:13, fontWeight: active ? 600 : 400, color: active ? ACCENT : "#6B7280", borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent", marginBottom:-1, display:"flex", alignItems:"center", gap:6 }}>
              {t.key}
              <span style={{ background: active ? `${ACCENT}18` : "#F3F4F6", color: active ? ACCENT : "#6B7280", borderRadius:99, padding:"1px 6px", fontSize:11, fontWeight:600 }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:`1px solid ${ACCENT}44`, borderRadius:8, padding:"10px 16px", marginBottom:12, boxShadow:`0 2px 8px ${ACCENT}18`, animation:"slideDown 0.15s ease" }}>
          <span style={{ fontSize:12, fontWeight:600, color:ACCENT, marginRight:4 }}>{selected.size} selected</span>
          <div style={{ width:1, height:20, background:"#E5E2D9", margin:"0 4px" }} />
          {(["Published","Draft","Archived"] as Page["status"][]).map(s => (
            <button key={s} onClick={() => bulkSetStatus(s)}
              style={{ background:"#F9FAFB", border:"1px solid #E5E2D9", borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", color:"#374151" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F3F4F6"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
            >
              {s === "Draft" ? "Set to Draft" : s === "Archived" ? "Archive" : "Publish"}
            </button>
          ))}
          <div ref={bulkCatRef} style={{ position:"relative" }}>
            <button onClick={() => setBulkCatOpen(v => !v)}
              style={{ background: bulkCatOpen ? `${ACCENT}12` : "#F9FAFB", border:`1px solid ${bulkCatOpen ? ACCENT : "#E5E2D9"}`, borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", color: bulkCatOpen ? ACCENT : "#374151", display:"flex", alignItems:"center", gap:5 }}>
              Change Category
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {bulkCatOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:50, background:"#fff", border:"1px solid #E5E7EB", borderRadius:6, boxShadow:"0 4px 16px rgba(0,0,0,0.10)", minWidth:160, overflow:"hidden", maxHeight:240, overflowY:"auto" }}>
                {categories.map(cat => {
                  const [cbg, ctxt] = CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;
                  return (
                    <button key={cat} onClick={() => bulkSetCategory(cat)}
                      style={{ display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left", padding:"7px 12px", background:"transparent", border:"none", cursor:"pointer", fontSize:12, color:"#111827" }}
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
          <button onClick={() => setSelected(new Set())} style={{ marginLeft:"auto", background:"transparent", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:13, fontWeight:600, padding:"4px 8px", borderRadius:4 }}>✕ Clear</button>
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
                <input type="checkbox" checked={allChecked} ref={el => { if (el) el.indeterminate = someChecked; }} onChange={toggleAll}
                  style={{ cursor:"pointer", accentColor:ACCENT, width:14, height:14 }} />
              </th>
              {COLS.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  style={{ padding:"11px 12px", textAlign:"left", fontSize:11.5, fontWeight:600, color: sortCol === col.key ? ACCENT : "#6B7280", letterSpacing:"0.04em", textTransform:"uppercase", cursor:"pointer", userSelect:"none", whiteSpace:"nowrap" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                    {col.label}
                    <SortIcon dir={sortCol === col.key ? sortDir : null} />
                  </span>
                </th>
              ))}
              <th style={{ padding:"11px 16px 11px 0", textAlign:"right", fontSize:11.5, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.04em", textTransform:"uppercase" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={COLS.length + 2} style={{ padding:"48px 0", textAlign:"center", color:"#9CA3AF", fontSize:13 }}>No pages match your filters.</td></tr>
            )}
            {filtered.map((page, idx) => {
              const isSelected = selected.has(page.id);
              const isHovered  = hoveredRow === page.id;
              return (
                <tr key={page.id}
                  onMouseEnter={() => setHoveredRow(page.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ background: isSelected ? `${ACCENT}08` : isHovered ? "#FAFAF9" : "#fff", borderBottom: idx < filtered.length - 1 ? "1px solid #F3F4F6" : "none", transition:"background 0.1s" }}
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
                  <td style={{ padding:"12px" }}><StatusBadge status={page.status} /></td>
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

      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
