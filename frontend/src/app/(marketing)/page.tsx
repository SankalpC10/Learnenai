"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { toast } from "sonner";

const stats = [
  { value: "4.8×", label: "Avg. organic traffic increase" },
  { value: "93%", label: "App store ranking improvement" },
  { value: "200+", label: "Brands scaled organically" },
  { value: "14d", label: "Avg. time to first results" },
];

const services = [
  { icon: "🔍", name: "SEO Intelligence", desc: "AI-powered keyword discovery, content gap analysis, and technical audits that unlock hidden organic traffic channels at scale.", tag: "→ For Websites & Content" },
  { icon: "📱", name: "App Store Optimization", desc: "App store algorithm mastery for iOS and Google Play — title, subtitle, keyword fields, screenshots, and review strategy.", tag: "→ For iOS & Android Apps" },
  { icon: "✍️", name: "AI Content Engine", desc: "Scalable content creation powered by large language models — optimized for E-E-A-T, search intent, and conversion.", tag: "→ Content at Scale" },
  { icon: "📊", name: "Competitor Intelligence", desc: "Deep AI analysis of competitor keyword strategies, backlink profiles, and content matrices.", tag: "→ Outmaneuver Rivals" },
];

const steps = [
  { num: "01", title: "AI-Powered Discovery Audit", desc: "We run your site or app through our AI audit engine — surfacing keyword gaps, technical issues, and competitor weaknesses within 48 hours." },
  { num: "02", title: "Custom Strategy Buildout", desc: "Our specialists translate AI insights into a prioritized roadmap — quick wins first, then long-term compounding growth." },
  { num: "03", title: "Execution & Optimization", desc: "We implement on-page, off-page, and technical changes — with continuous AI monitoring and weekly reporting." },
  { num: "04", title: "Scale & Compound", desc: "Once rankings move, we double down — systematically expanding your organic footprint month over month." },
];

const faqs = [
  { q: "How long does it take to see SEO results?", a: "Most clients see measurable ranking improvements within 14–30 days for technical quick wins. Significant organic traffic growth typically appears within 60–90 days." },
  { q: "What is App Store Optimization (ASO)?", a: "ASO is the process of optimizing a mobile app's listing to rank higher in search results, maximizing organic installs without paid advertising." },
  { q: "Do you offer a free AI audit?", a: "Yes — we run a full AI-powered SEO or ASO audit before your free 30-minute strategy call at zero cost and with no obligation." },
  { q: "Do you sign long-term contracts?", a: "No. We work month-to-month. We believe in earning your retention through measurable results." },
];

const chartData = [
  { month: "Jan", pct: 22 }, { month: "Feb", pct: 38 }, { month: "Mar", pct: 55 },
  { month: "Apr", pct: 72 }, { month: "May", pct: 88 }, { month: "Jun", pct: 100 },
];

export default function MarketingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Booking request submitted! We'll be in touch shortly.");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-bg/80 border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent-glow)]" />
            <span className="font-display text-xl font-bold text-text-primary">LernenAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Services</a>
            <a href="#process" className="text-sm text-text-secondary hover:text-text-primary transition-colors">How It Works</a>
            <a href="#faq" className="text-sm text-text-secondary hover:text-text-primary transition-colors">FAQ</a>
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Login</Link>
            <ThemeToggle compact />
            <a href="#book" className="px-4 py-2 bg-accent text-black text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors shadow-[0_0_20px_var(--color-accent-glow)]">
              Book Free Audit
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-secondary/5 blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-widest text-accent border border-accent/20 rounded-full bg-accent/5">
              AI-Powered SEO & ASO Agency
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Rank higher.<br /><em className="text-accent not-italic">Grow faster.</em><br />With AI.
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              LernenAI is an AI-powered <strong className="text-text-primary">SEO and App Store Optimization</strong> consulting agency. We help websites and mobile apps dominate organic search rankings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#book" className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-all shadow-[0_0_30px_var(--color-accent-glow)]">
                Book a Free AI Audit <ArrowRight size={16} />
              </a>
              <a href="#services" className="inline-flex items-center gap-2 px-8 py-3.5 border border-card-border text-text-secondary rounded-lg hover:bg-input-bg hover:text-text-primary transition-all">
                View our services <ChevronDown size={16} />
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-display font-bold text-accent">{s.value}</div>
                <div className="text-xs text-text-secondary mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust bar */}
        <div className="border-y border-card-border py-4 overflow-hidden">
          <div className="flex gap-12 justify-center flex-wrap px-6 text-sm text-text-secondary">
            <span>🔒 No lock-in contracts</span>
            <span>⭐ 4.9/5 avg. client rating</span>
            <span>📊 Monthly performance reports</span>
            <span>🤖 Proprietary AI engine</span>
            <span>🌍 Clients in 30+ countries</span>
          </div>
        </div>

        {/* Services */}
        <section id="services" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">What We Do</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4">Intelligence-driven<br />SEO & ASO strategies</h2>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto">From technical SEO to App Store Optimization — our AI surfaces ranking opportunities your competitors miss.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s) => (
              <div key={s.name} className="group bg-card-bg border border-card-border rounded-2xl p-8 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(71,200,255,0.05)] transition-all duration-300">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{s.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{s.desc}</p>
                <span className="text-xs font-medium text-accent">{s.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section id="process" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Our Process</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4">From audit to<br />page one in weeks</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ol className="space-y-8">
              {steps.map((s) => (
                <li key={s.num} className="flex gap-6 group">
                  <span className="text-4xl font-display font-bold text-accent/20 group-hover:text-accent transition-colors shrink-0">{s.num}</span>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            {/* Chart visual */}
            <div className="bg-card-bg border border-card-border rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold">Organic Traffic Growth</span>
                <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">LIVE RESULTS</span>
              </div>
              <div className="space-y-3">
                {chartData.map((d) => (
                  <div key={d.month} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-8">{d.month}</span>
                    <div className="flex-1 h-6 bg-input-bg rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${d.pct}%`,
                          background: d.pct >= 90 ? "var(--color-success)" : d.pct >= 60 ? "var(--color-accent)" : "var(--color-accent-secondary)",
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-12 text-right">{d.pct === 100 ? "+4.8×" : `+${d.pct}%`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4">Frequently asked<br />questions</h2>
          </div>
          <div className="space-y-3" role="list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card-bg border border-card-border rounded-xl overflow-hidden" role="listitem">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={activeFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <span className="text-sm font-semibold pr-4">{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp size={18} className="text-accent shrink-0" /> : <ChevronDown size={18} className="text-text-secondary shrink-0" />}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-0" id={`faq-answer-${idx}`} role="region" aria-labelledby={`faq-question-${idx}`}>
                    <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Booking */}
        <section id="book" className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Schedule a Call</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4">Book your free<br />AI audit session</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { icon: "🎯", title: "Free AI Keyword Gap Report", desc: "Receive real SEO or ASO data before your call." },
                { icon: "⏱️", title: "30-Minute Deep Dive", desc: "Focused session with a senior specialist." },
                { icon: "📋", title: "Custom Action Plan", desc: "Walk away with immediately actionable recommendations." },
              ].map((perk) => (
                <div key={perk.title} className="flex gap-4 items-start">
                  <span className="text-2xl">{perk.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold mb-0.5">{perk.title}</h3>
                    <p className="text-sm text-text-secondary">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleBooking} className="bg-card-bg border border-card-border rounded-2xl p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First name" required className="px-4 py-3 bg-input-bg border border-card-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent" />
                <input type="text" placeholder="Last name" className="px-4 py-3 bg-input-bg border border-card-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent" />
              </div>
              <input type="email" placeholder="Work email" required className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent" />
              <input type="url" placeholder="Website or App Store URL" className="w-full px-4 py-3 bg-input-bg border border-card-border rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent" />
              <button type="submit" className="w-full py-3.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-all shadow-[0_0_20px_var(--color-accent-glow)]">
                Confirm Booking →
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-display text-lg font-bold">LernenAI</span>
              </div>
              <p className="text-sm text-text-secondary">AI-powered SEO & ASO consulting.</p>
            </div>
            <div className="flex gap-16">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">Services</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#services" className="text-text-secondary hover:text-text-primary transition-colors">SEO Intelligence</a></li>
                  <li><a href="#services" className="text-text-secondary hover:text-text-primary transition-colors">ASO Optimization</a></li>
                  <li><a href="#services" className="text-text-secondary hover:text-text-primary transition-colors">Technical SEO</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#process" className="text-text-secondary hover:text-text-primary transition-colors">How It Works</a></li>
                  <li><a href="#faq" className="text-text-secondary hover:text-text-primary transition-colors">FAQ</a></li>
                  <li><a href="#book" className="text-text-secondary hover:text-text-primary transition-colors">Book a Call</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-card-border py-6">
          <p className="text-center text-xs text-text-secondary">© 2026 LernenAI. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
