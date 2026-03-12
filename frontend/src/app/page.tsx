"use client";
import React, { useState } from 'react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Booking confirmed! (Frontend mock)");
  };

  return (
    <>
      <a href="#main-content" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden', zIndex: 9999, background: 'var(--accent)', color: 'var(--ink)', padding: '8px 16px', borderRadius: '4px', fontWeight: 700 }}>
        Skip to main content
      </a>

      <nav role="navigation" aria-label="Primary navigation">
        <a href="/" className="logo" aria-label="LernenAI — Home">
          <div className="logo-dot" aria-hidden="true"></div>
          LernenAI
        </a>
        <ul className="nav-links" role="list">
          <li><a href="#services">SEO &amp; ASO Services</a></li>
          <li><a href="#process">How It Works</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#proof">Results</a></li>
          <li><a href="#book" className="nav-cta" aria-label="Book a free SEO audit call">Book Free Audit</a></li>
        </ul>
      </nav>

      <main id="main-content" role="main">
        <section className="hero" id="home" aria-labelledby="hero-heading">
          <div className="hero-bg-circle c1" aria-hidden="true"></div>
          <div className="hero-bg-circle c2" aria-hidden="true"></div>
          <div className="hero-tag" aria-label="Category">AI-Powered SEO &amp; ASO Agency</div>
          <h1 className="hero-headline" id="hero-heading">Rank higher.<br /><em>Grow faster.</em><br />With AI.</h1>
          <p className="hero-sub">LernenAI is an AI-powered <strong>SEO and App Store Optimization (ASO)</strong> consulting agency. We help websites and mobile apps dominate organic search rankings — sustainably and at scale.</p>
          <div className="hero-cta-row">
            <a href="#book" className="btn-primary" aria-label="Book a free AI-powered SEO audit">
              Book a Free AI Audit
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#services" className="btn-ghost" aria-label="View SEO and ASO services">
              View our services
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <div className="hero-stats" role="list" aria-label="Key performance statistics">
            <div className="stat-item" role="listitem"><div className="stat-num">4.8<span>×</span></div><div className="stat-label">Avg. organic traffic increase</div></div>
            <div className="stat-item" role="listitem"><div className="stat-num">93<span>%</span></div><div className="stat-label">App store ranking improvement</div></div>
            <div className="stat-item" role="listitem"><div className="stat-num">200<span>+</span></div><div className="stat-label">Brands scaled organically</div></div>
            <div className="stat-item" role="listitem"><div className="stat-num">14<span>d</span></div><div className="stat-label">Avg. time to first results</div></div>
          </div>
        </section>

        <div className="seo-signals-bar" role="complementary" aria-label="Trust signals">
          <div className="signal-item"><span className="signal-icon">🔒</span> No lock-in contracts</div>
          <div className="signal-item"><span className="signal-icon">⭐</span> 4.9/5 avg. client rating</div>
          <div className="signal-item"><span className="signal-icon">📊</span> Monthly performance reports</div>
          <div className="signal-item"><span className="signal-icon">🤖</span> Proprietary AI audit engine</div>
          <div className="signal-item"><span className="signal-icon">🌍</span> Serving clients in 30+ countries</div>
        </div>

        <div className="marquee-section" aria-hidden="true">
          <div className="marquee-track" id="marquee">
            <span className="marquee-item highlight">SEO Intelligence</span><span className="marquee-item">✦</span>
            <span className="marquee-item">Keyword Research</span><span className="marquee-item">✦</span>
            <span className="marquee-item highlight">ASO Optimization</span><span className="marquee-item">✦</span>
            <span className="marquee-item">Content Strategy</span><span className="marquee-item">✦</span>
            <span className="marquee-item highlight">AI-Driven Insights</span><span className="marquee-item">✦</span>
            <span className="marquee-item">App Store Rankings</span><span className="marquee-item">✦</span>
            <span className="marquee-item highlight">Competitor Analysis</span><span className="marquee-item">✦</span>
            <span className="marquee-item">Backlink Audits</span><span className="marquee-item">✦</span>
          </div>
        </div>

        <section id="services" aria-labelledby="services-heading">
          <div className="section-label">What We Do</div>
          <h2 className="section-title" id="services-heading">Intelligence-driven<br />SEO &amp; ASO strategies</h2>
          <p className="section-sub">From technical SEO to App Store Optimization — our AI surfaces ranking opportunities your competitors haven't discovered yet.</p>
          <div className="services-grid" role="list">
            <article className="service-card" role="listitem">
              <div className="service-icon">🔍</div><h3 className="service-name">SEO Intelligence</h3>
              <p className="service-desc">AI-powered keyword discovery, content gap analysis, and technical audits that unlock hidden organic traffic channels at scale.</p>
              <div className="service-tag">→ For Websites &amp; Content</div>
            </article>
            <article className="service-card" role="listitem">
              <div className="service-icon">📱</div><h3 className="service-name">App Store Optimization (ASO)</h3>
              <p className="service-desc">App store algorithm mastery for iOS and Google Play — title, subtitle, keyword fields, screenshots, and review strategy to maximize organic installs.</p>
              <div className="service-tag">→ For iOS &amp; Android Apps</div>
            </article>
            <article className="service-card" role="listitem">
              <div className="service-icon">✍️</div><h3 className="service-name">AI Content Engine</h3>
              <p className="service-desc">Scalable content creation powered by large language models — optimized for E-E-A-T, search intent, and conversion at every funnel stage.</p>
              <div className="service-tag">→ Content at Scale</div>
            </article>
            <article className="service-card" role="listitem">
              <div className="service-icon">📊</div><h3 className="service-name">Competitor Intelligence</h3>
              <p className="service-desc">Deep AI analysis of competitor keyword strategies, backlink profiles, and content matrices — transformed into your actionable playbook.</p>
              <div className="service-tag">→ Outmaneuver Rivals</div>
            </article>
          </div>
        </section>

        <section id="process" aria-labelledby="process-heading">
          <div className="section-label">Our Process</div>
          <h2 className="section-title" id="process-heading">From audit to<br />page one in weeks</h2>
          <div className="process-grid">
            <ol className="process-steps" aria-label="Our four-step SEO and ASO process">
              <li className="process-step"><div className="step-num">01</div><div className="step-content"><h3 className="step-title">AI-Powered Discovery Audit</h3><p className="step-desc">We run your site or app through our proprietary AI audit engine — surfacing keyword gaps, technical issues, and competitor weaknesses within 48 hours.</p></div></li>
              <li className="process-step"><div className="step-num">02</div><div className="step-content"><h3 className="step-title">Custom Strategy Buildout</h3><p className="step-desc">Our specialists translate AI insights into a prioritized roadmap — quick wins first, then long-term compounding growth strategies.</p></div></li>
              <li className="process-step"><div className="step-num">03</div><div className="step-content"><h3 className="step-title">Execution &amp; Optimization</h3><p className="step-desc">We implement on-page, off-page, and technical changes — with continuous AI monitoring and weekly performance reporting.</p></div></li>
              <li className="process-step"><div className="step-num">04</div><div className="step-content"><h3 className="step-title">Scale &amp; Compound</h3><p className="step-desc">Once rankings move, we double down — systematically expanding your organic footprint and compounding growth month over month.</p></div></li>
            </ol>
            <div className="process-visual" aria-label="Organic traffic growth chart" role="img">
              <div className="visual-badge">LIVE RESULTS</div>
              <div className="chart-container">
                <div className="visual-title">Organic Traffic Growth</div>
                <div className="chart-row"><span className="chart-label">Jan</span><div className="chart-bar-bg"><div className="chart-bar-fill" style={{ width: '22%', background: 'var(--accent-secondary)' }}></div></div><span className="chart-val">+22%</span></div>
                <div className="chart-row"><span className="chart-label">Feb</span><div className="chart-bar-bg"><div className="chart-bar-fill" style={{ width: '38%', background: 'var(--accent-secondary)' }}></div></div><span className="chart-val">+38%</span></div>
                <div className="chart-row"><span className="chart-label">Mar</span><div className="chart-bar-bg"><div className="chart-bar-fill" style={{ width: '55%', background: 'var(--accent-secondary)' }}></div></div><span className="chart-val">+55%</span></div>
                <div className="chart-row"><span className="chart-label">Apr</span><div className="chart-bar-bg"><div className="chart-bar-fill" style={{ width: '72%', background: 'var(--accent)' }}></div></div><span className="chart-val">+72%</span></div>
                <div className="chart-row"><span className="chart-label">May</span><div className="chart-bar-bg"><div className="chart-bar-fill" style={{ width: '88%', background: 'var(--accent)' }}></div></div><span className="chart-val">+88%</span></div>
                <div className="chart-row"><span className="chart-label">Jun</span><div className="chart-bar-bg"><div className="chart-bar-fill" style={{ width: '100%', background: 'var(--success)' }}></div></div><span className="chart-val">+4.8×</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-heading">
          <div className="section-label">FAQ</div>
          <h2 className="section-title" id="faq-heading">Frequently asked<br />questions</h2>
          <p className="section-sub">Everything you need to know about working with LernenAI — from timelines to techniques.</p>
          <div className="faq-list" role="list">
            {[
              { q: "How long does it take to see SEO results?", a: "Most clients see measurable ranking improvements within 14–30 days for technical quick wins. Significant organic traffic growth typically appears within 60–90 days." },
              { q: "What is App Store Optimization (ASO)?", a: "ASO is the process of optimizing a mobile app's listing to rank higher in search results, maximizing organic installs without paid advertising." },
              { q: "Do you offer a free AI audit?", a: "Yes — we run a full AI-powered SEO or ASO audit before your free 30-minute strategy call at zero cost and with no obligation." },
              { q: "Do you sign long-term contracts?", a: "No. We work month-to-month. We believe in earning your retention through measurable results." }
            ].map((faq, idx) => (
              <div className={`faq-item ${activeFaq === idx ? 'active' : ''}`} role="listitem" key={idx}>
                <button className="faq-q" aria-expanded={activeFaq === idx} onClick={() => toggleFaq(idx)}>
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-a" role="region">
                  <p className="faq-a-inner">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="book" aria-labelledby="book-heading">
          <div className="section-label">Schedule a Call</div>
          <h2 className="section-title" id="book-heading">Book your free<br />AI audit session</h2>
          <div className="booking-wrapper">
            <div className="booking-info">
              <div classclassName="booking-perks">
                <div className="perk-item"><div className="perk-icon">🎯</div><div><h3 className="perk-title">Free AI Keyword Gap Report</h3><p className="perk-desc">Receive real SEO or ASO data before your call.</p></div></div>
                <div className="perk-item"><div className="perk-icon">⏱️</div><div><h3 className="perk-title">30-Minute Deep Dive</h3><p className="perk-desc">Focused session with a senior SEO or ASO specialist.</p></div></div>
                <div className="perk-item"><div className="perk-icon">📋</div><div><h3 className="perk-title">Custom Action Plan</h3><p className="perk-desc">Walk away with immediately actionable recommendations.</p></div></div>
              </div>
            </div>

            <div className="calendar-card">
              <form className="booking-form" onSubmit={handleBooking}>
                <div className="form-row">
                  <input type="text" className="form-input" placeholder="First name" required />
                  <input type="text" className="form-input" placeholder="Last name" />
                </div>
                <input type="email" className="form-input" placeholder="Work email" required />
                <input type="url" className="form-input" placeholder="Website or App Store URL" />
                <button type="submit" className="confirm-btn">
                  Confirm Booking →
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-top">
          <div><div className="footer-logo">LernenAI</div><p className="footer-tagline">AI-powered SEO &amp; ASO consulting.</p></div>
          <div className="footer-links">
            <div className="footer-col"><div className="footer-col-title">Services</div><ul><li><a href="#services">SEO Intelligence</a></li><li><a href="#services">ASO Optimization</a></li><li><a href="#services">Technical SEO</a></li></ul></div>
            <div className="footer-col"><div className="footer-col-title">Company</div><ul><li><a href="#process">How It Works</a></li><li><a href="#faq">FAQ</a></li><li><a href="#book">Book a Call</a></li></ul></div>
          </div>
        </div>
        <div className="footer-bottom"><p className="copyright">© 2026 LernenAI. All rights reserved.</p></div>
      </footer>
    </>
  );
}
