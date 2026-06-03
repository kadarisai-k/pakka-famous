import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaEnvelope, FaBox, FaUndo, FaTruck, FaLock, FaUser, FaCreditCard } from 'react-icons/fa';

const topics = [
  { icon: <FaBox />, title: 'Orders', desc: 'Track, manage or view your order history', link: '/orders', color: '#FFD84D' },
  { icon: <FaUndo />, title: 'Returns & Refunds', desc: 'Understand our cancellation and refund process', link: '/cancellation-policy', color: '#FF4C29' },
  { icon: <FaTruck />, title: 'Shipping', desc: 'Delivery timelines, charges and tracking info', link: '/shipping-policy', color: '#4CAF50' },
  { icon: <FaUser />, title: 'My Account', desc: 'Manage profile, password and preferences', link: '/profile', color: '#7C3AED' },
  { icon: <FaCreditCard />, title: 'Payments', desc: 'Payment methods, failed payments and billing', link: '/faqs#payments', color: '#0EA5E9' },
  { icon: <FaLock />, title: 'Privacy & Legal', desc: 'Data usage, terms and privacy policy', link: '/privacy-policy', color: '#F59E0B' },
];

const HelpPage = () => (
  <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
    {/* Hero */}
    <div style={{
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%)',
      padding: '64px 0 48px', textAlign: 'center', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,216,77,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,76,41,0.08) 0%, transparent 50%)',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(255,216,77,0.15)',
          border: '1px solid rgba(255,216,77,0.3)', borderRadius: 999,
          padding: '6px 18px', fontSize: 12, fontWeight: 600,
          color: '#FFD84D', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20
        }}>Support</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: 40, fontWeight: 900, marginBottom: 14 }}>
          How can we help you?
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontFamily: 'Poppins, sans-serif', maxWidth: 480, margin: '0 auto 32px' }}>
          Browse topics below or reach out to us directly — we're always happy to help.
        </p>
        {/* Quick contact buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#25D366', color: '#fff', borderRadius: 999,
            padding: '11px 24px', fontWeight: 600, fontSize: 14,
            textDecoration: 'none', fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 4px 14px rgba(37,211,102,0.35)', transition: 'transform .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <FaWhatsapp size={18} /> Chat on WhatsApp
          </a>
          <a href="mailto:support@pakkafamous.com" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 999,
            padding: '11px 24px', fontWeight: 600, fontSize: 14,
            textDecoration: 'none', fontFamily: 'Poppins, sans-serif',
            border: '1px solid rgba(255,255,255,0.2)', transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            <FaEnvelope size={16} /> Email Us
          </a>
        </div>
      </div>
    </div>

    <div className="container" style={{ maxWidth: 900, padding: '56px 24px' }}>

      {/* Topic Cards */}
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 28, textAlign: 'center', color: '#1A1A1A' }}>
        Browse Help Topics
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 56 }}>
        {topics.map(({ icon, title, desc, link, color }) => (
          <Link to={link} key={title} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff', borderRadius: 14, padding: '24px',
              border: '1px solid #E5E7EB', transition: 'all .2s', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = color; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}18`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, marginBottom: 14,
              }}>{icon}</div>
              <div style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Poppins, sans-serif', fontSize: 15 }}>{title}</div>
              <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Contact Details */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1A1A1A' }}>
          Still need help?
        </h2>
        <p style={{ color: '#6B7280', marginBottom: 28, fontSize: 14 }}>Our support team is available Monday–Saturday, 9 AM – 7 PM IST.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { icon: <FaWhatsapp size={22} />, label: 'WhatsApp', value: '+91 99999 99999', href: 'https://wa.me/919999999999', color: '#25D366' },
            { icon: <FaEnvelope size={20} />, label: 'Email', value: 'support@pakkafamous.com', href: 'mailto:support@pakkafamous.com', color: '#FF4C29' },
          ].map(({ icon, label, value, href, color }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: '#F9FAFB', borderRadius: 12, padding: '18px 20px',
              border: '1px solid #E5E7EB', textDecoration: 'none', transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
            >
              <div style={{ color, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', fontFamily: 'Poppins, sans-serif' }}>{label}</div>
                <div style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 600, fontFamily: 'Poppins, sans-serif', marginTop: 2 }}>{value}</div>
              </div>
            </a>
          ))}
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
          You can also <Link to="/feedback" style={{ color: '#FF4C29' }}>leave feedback</Link> or check our <Link to="/faqs" style={{ color: '#FF4C29' }}>FAQs</Link> for quick answers.
        </p>
      </div>
    </div>
  </div>
);

export default HelpPage;
