import React from 'react';

const STATS = [['10,000+','Happy Customers'],['50+','Authentic Sweets'],['12','AP Cities'],['100%','Fresh Made']];

const AboutPage = () => (
  <div style={{ background: '#F9FAFB' }}>
    {/* Hero */}
    <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '72px 0', textAlign: 'center' }}>
      <div className="container">
        <span className="section-badge">Our Mission</span>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: '#111827', marginTop: 8 }}>About Pakka Famous</h1>
        <p style={{ color: '#6B7280', maxWidth: 520, margin: '14px auto 0', fontSize: 16, fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}>
          Bringing the authentic taste of Andhra Pradesh to every doorstep
        </p>
      </div>
    </div>

    <div className="container" style={{ padding: '72px 16px' }}>
      <div className="row g-5 align-items-center mb-5">
        <div className="col-md-6">
          <span className="section-label">Who We Are</span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', margin: '10px 0 8px', fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>
            Preserving Andhra Pradesh's Sweet Heritage
          </h2>
          <div className="section-divider" />
          <p style={{ lineHeight: 1.85, color: '#4B5563', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
            Pakka Famous was born from a simple dream — to make the world-famous sweets of Andhra Pradesh accessible to everyone, everywhere. From the GI-tagged Kakinada Kaja to the sacred Tirupati Laddu, we source directly from the original sweet makers who have kept these recipes alive for generations.
          </p>
          <p style={{ lineHeight: 1.85, color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>
            Every order is a celebration of culture, tradition, and the inimitable flavours of Andhra's legendary sweet craft.
          </p>
        </div>
        <div className="col-md-6">
          <div style={{ background: 'white', borderRadius: 20, padding: 36, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '5rem', textAlign: 'center', marginBottom: 24 }}>🍬</div>
            <div className="row g-3">
              {STATS.map(([num, label]) => (
                <div key={label} className="col-6" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#E8001D', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', fontSize: 'clamp(1.5rem,3vw,2rem)' }}>Why We're Different</h2>
        </div>
        <div className="row g-4">
          {[
            { icon: '🌿', title: 'Authentic Recipes', desc: 'Sourced directly from traditional sweet makers with generations of expertise.' },
            { icon: '✨', title: 'No Preservatives', desc: 'Made fresh to order. Pure ingredients, no shortcuts.' },
            { icon: '📍', title: 'Famous Origins', desc: 'Straight from Kakinada, Tirupati, Bandar and more iconic cities.' },
            { icon: '🚚', title: 'Pan-India Delivery', desc: 'Delivered carefully in 3–5 business days to your doorstep.' },
          ].map((v, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div style={{ background: 'white', borderRadius: 14, padding: '24px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', textAlign: 'center', height: '100%', transition: 'transform .25s, box-shadow .25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: 15, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>{v.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AboutPage;
