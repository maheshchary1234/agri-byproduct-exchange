import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function HomePage({ onGetStarted, onNavigateToMarketplace, onOpenAICalculator }) {
  const { t } = useTranslation();
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    subject: 'Industrial Biomass Sourcing',
    message: ''
  });
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryForm({ name: '', email: '', subject: 'Industrial Biomass Sourcing', message: '' });
    }, 4000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-wrapper">
      {/* =========================================================================
          HERO SECTION (Section 3: Full-width with dark-green gradient background)
          ========================================================================= */}
      <section className="hero-section-full">
        <div className="hero-content-box">
          <div className="hero-pill-badge">
            <span>🌾</span>
            <span>{t('home.hero_badge')}</span>
          </div>

          <h1 className="hero-title-main">
            {t('home.hero_title')}
          </h1>

          <p className="hero-subtitle-text">
            {t('home.hero_subtitle')}
          </p>

          <div className="hero-cta-group">
            <button 
              type="button" 
              className="btn-hero-primary"
              onClick={onGetStarted || onNavigateToMarketplace}
            >
              {t('home.btn_get_started')} →
            </button>
            <button 
              type="button" 
              className="btn-hero-secondary"
              onClick={() => scrollToSection('platform-features')}
            >
              {t('home.btn_learn_more')}
            </button>
          </div>

          {/* Key Metrics Row */}
          <div className="hero-stats-row">
            <div>
              <div className="hero-stat-number">14,250+</div>
              <div className="hero-stat-label">{t('home.stat_biomass')} (MT)</div>
            </div>
            <div>
              <div className="hero-stat-number">₹3.8 Cr+</div>
              <div className="hero-stat-label">{t('home.stat_payouts')}</div>
            </div>
            <div>
              <div className="hero-stat-number">97.6%</div>
              <div className="hero-stat-label">{t('home.stat_accuracy')}</div>
            </div>
            <div>
              <div className="hero-stat-number">19,200 MT</div>
              <div className="hero-stat-label">CO₂ Open Burning Avoided</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PLATFORM INTRODUCTION & WHY AGRICONNECT AI
          ========================================================================= */}
      <section className="home-section-container" id="platform-intro">
        <div className="section-header-centered">
          <span className="section-pill-tag">{t('home.intro_badge')}</span>
          <h2 className="section-title-large">{t('home.intro_title')}</h2>
          <p className="section-subtitle-muted">{t('home.intro_desc')}</p>
        </div>

        {/* 6 Core Feature Cards */}
        <div className="features-grid-3" id="platform-features">
          <div className="feature-box-card">
            <div className="feature-icon-bubble">⚡</div>
            <h3 className="feature-box-title">{t('home.feat1_title')}</h3>
            <p className="feature-box-desc">{t('home.feat1_desc')}</p>
          </div>

          <div className="feature-box-card">
            <div className="feature-icon-bubble">🏭</div>
            <h3 className="feature-box-title">{t('home.feat2_title')}</h3>
            <p className="feature-box-desc">{t('home.feat2_desc')}</p>
          </div>

          <div className="feature-box-card">
            <div className="feature-icon-bubble">🔒</div>
            <h3 className="feature-box-title">{t('home.feat3_title')}</h3>
            <p className="feature-box-desc">{t('home.feat3_desc')}</p>
          </div>

          <div className="feature-box-card">
            <div className="feature-icon-bubble">📜</div>
            <h3 className="feature-box-title">{t('home.feat4_title')}</h3>
            <p className="feature-box-desc">{t('home.feat4_desc')}</p>
          </div>

          <div className="feature-box-card">
            <div className="feature-icon-bubble">🧬</div>
            <h3 className="feature-box-title">{t('home.feat5_title')}</h3>
            <p className="feature-box-desc">{t('home.feat5_desc')}</p>
          </div>

          <div className="feature-box-card">
            <div className="feature-icon-bubble">🌱</div>
            <h3 className="feature-box-title">{t('home.feat6_title')}</h3>
            <p className="feature-box-desc">{t('home.feat6_desc')}</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BENEFITS FOR FARMERS & INDUSTRIAL BUYERS
          ========================================================================= */}
      <section className="home-section-container" style={{ paddingTop: '0' }} id="benefits">
        <div className="section-header-centered">
          <span className="section-pill-tag">ECOSYSTEM IMPACT</span>
          <h2 className="section-title-large">{t('home.benefits_title')}</h2>
        </div>

        <div className="dual-benefits-grid">
          {/* Farmers Column */}
          <div className="benefit-column-card">
            <div className="benefit-column-header">
              <span style={{ fontSize: '1.75rem' }}>🌾</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--green-900)' }}>{t('home.farmers_title')}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Producers, FPOs, and Farmer Collectives</span>
              </div>
            </div>

            <div className="benefit-item-row">
              <div className="check-green-icon">✓</div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)' }}>{t('home.farmer_b1')}</p>
            </div>
            <div className="benefit-item-row">
              <div className="check-green-icon">✓</div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)' }}>{t('home.farmer_b2')}</p>
            </div>
            <div className="benefit-item-row">
              <div className="check-green-icon">✓</div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)' }}>{t('home.farmer_b3')}</p>
            </div>
            <div className="benefit-item-row">
              <div className="check-green-icon">✓</div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)' }}>{t('home.farmer_b4')}</p>
            </div>

            <div style={{ marginTop: '1.75rem' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={onGetStarted}
              >
                Access Farmer Hub & Listings →
              </button>
            </div>
          </div>

          {/* Buyers Column */}
          <div className="benefit-column-card">
            <div className="benefit-column-header">
              <span style={{ fontSize: '1.75rem' }}>🏭</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--green-900)' }}>{t('home.buyers_title')}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Power Plants, 2G Ethanol & Pulp Mills</span>
              </div>
            </div>

            <div className="benefit-item-row">
              <div className="check-green-icon">✓</div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)' }}>{t('home.buyer_b1')}</p>
            </div>
            <div className="benefit-item-row">
              <div className="check-green-icon">✓</div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)' }}>{t('home.buyer_b2')}</p>
            </div>
            <div className="benefit-item-row">
              <div className="check-green-icon">✓</div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)' }}>{t('home.buyer_b3')}</p>
            </div>
            <div className="benefit-item-row">
              <div className="check-green-icon">✓</div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-body)' }}>{t('home.buyer_b4')}</p>
            </div>

            <div style={{ marginTop: '1.75rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ width: '100%', borderColor: 'var(--green-600)', color: 'var(--green-800)' }}
                onClick={onNavigateToMarketplace}
              >
                Browse Biomass Marketplace →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ABOUT SECTION
          ========================================================================= */}
      <section className="home-section-container" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', margin: '0 auto 4rem', border: '1px solid var(--border-subtle)' }} id="about">
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <span className="section-pill-tag">ABOUT US</span>
          <h2 className="section-title-large">{t('home.about_title')}</h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-body)', marginTop: '1rem' }}>
            {t('home.about_desc')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2.5rem', textAlign: 'left' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--green-600)' }}>
              <strong style={{ display: 'block', color: 'var(--green-900)', fontSize: '0.95rem' }}>AI Machine Learning</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Python XGBoost regressor trained on 7,500+ agricultural commodity transactions.</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #0284c7' }}>
              <strong style={{ display: 'block', color: '#0369a1', fontSize: '0.95rem' }}>Escrow Architecture</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Funds locked at purchase order and released immediately upon verified truck delivery.</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #d97706' }}>
              <strong style={{ display: 'block', color: '#b45309', fontSize: '0.95rem' }}>Circular Sustainability</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Every metric ton of rice straw traded offsets 1.35 MT CO₂ equivalent emissions.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          GET IN TOUCH / CONTACT SECTION
          ========================================================================= */}
      <section className="contact-section-wrapper" id="contact">
        <div className="contact-layout-grid">
          <div>
            <span className="section-pill-tag">SUPPORT & ADVISORY</span>
            <h2 style={{ fontSize: '2rem', color: 'var(--green-900)', marginBottom: '1rem' }}>
              {t('home.contact_title')}
            </h2>
            <p style={{ color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '2rem' }}>
              {t('home.contact_subtitle')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--green-100)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  📞
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('home.contact_call')}</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>+91 1800 425 2474 (Toll-Free Kisan Line)</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--green-100)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  ✉️
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('home.contact_email')}</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>support@agriconnect.ai</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--green-100)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  📍
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('home.contact_office')}</div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Agritech Innovation Center, Sector 62, Noida, NCR, India</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="white-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--green-900)', marginBottom: '1.25rem' }}>
              {t('home.contact_form_title')}
            </h3>

            {inquirySubmitted ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-200)' }}>
                <span style={{ fontSize: '2rem' }}>✅</span>
                <h4 style={{ color: 'var(--green-900)', marginTop: '0.5rem' }}>Inquiry Submitted Successfully!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  An agricultural advisory officer will connect with you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit}>
                <div className="form-group-custom">
                  <label className="form-label-custom">{t('home.contact_name')}</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control-custom"
                    placeholder="e.g. Ramesh Patil / BioEnergy Ltd."
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">{t('home.contact_email_field')}</label>
                  <input 
                    type="email" 
                    required 
                    className="form-control-custom"
                    placeholder="name@company.com"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">{t('home.contact_subject')}</label>
                  <select 
                    className="form-control-custom"
                    value={inquiryForm.subject}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                  >
                    <option value="Industrial Biomass Sourcing">Industrial Biomass Sourcing (Bulk Feedstock)</option>
                    <option value="Farmer Cooperative Onboarding">Farmer Cooperative / FPO Registration</option>
                    <option value="Government Scheme Advisory">Government Scheme & Subsidy Consultation</option>
                    <option value="XGBoost API Integration">Machine Learning API Integration</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">{t('home.contact_msg')}</label>
                  <textarea 
                    rows="3" 
                    required 
                    className="form-control-custom"
                    placeholder="Enter tonnages, crop residue species, delivery destination, or questions..."
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  {t('home.btn_send_inquiry')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          GLOBAL FOOTER
          ========================================================================= */}
      <footer className="footer-global">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div className="brand-icon-box" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>🌾</div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>AgriConnect AI</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: '1.6', maxWidth: '320px' }}>
              India’s intelligent agricultural residue exchange platform connecting farmers with clean industrial consumers to eliminate stubble burning and empower rural prosperity.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.92rem', marginBottom: '0.75rem' }}>Quick Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('platform-intro')}>About Platform</span>
              <span style={{ cursor: 'pointer' }} onClick={onNavigateToMarketplace}>Biomass Marketplace</span>
              <span style={{ cursor: 'pointer' }} onClick={onOpenAICalculator}>XGBoost AI Engine</span>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('benefits')}>Ecosystem Benefits</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.92rem', marginBottom: '0.75rem' }}>Residue Commodities</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem' }}>
              <span>Paddy Rice Straw (CBG/Ethanol)</span>
              <span>Wheat Straw & Stubble</span>
              <span>Sugarcane Bagasse</span>
              <span>Cotton Stalks & Briquettes</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.92rem', marginBottom: '0.75rem' }}>National Compliance</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem' }}>
              <span>Ministry of New & Renewable Energy</span>
              <span>Commission for Air Quality Management</span>
              <span>SATAT CBG Procurement Guideline</span>
              <span>Verified ESG Carbon Offset</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '1.5rem auto 0', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          © 2026 AgriConnect AI. {t('home.footer_rights')}
        </div>
      </footer>
    </div>
  );
}
