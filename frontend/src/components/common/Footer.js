import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Footer = ({ logo }) => (
  <footer className="footer-pakka">
    <div className="container">
      <div className="row g-5">
        <div className="col-md-4">
          {logo?.url
            ? <img src={logo.url} alt="Pakka Famous" style={{ height: 48, objectFit: 'contain', marginBottom: 16 }} />
            : <div className="footer-brand mb-3">🍬 Pakka Famous</div>
          }
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,.5)', maxWidth: 280, fontFamily: 'Inter, sans-serif' }}>
            Bringing the authentic taste of Andhra Pradesh to every doorstep. GI-tagged sweets, freshly made with love.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {[FaInstagram, FaFacebook, FaWhatsapp, FaEnvelope].map((Icon, i) => (
              <a key={i} href="#" style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'rgba(255,255,255,.07)',
                border: '1px solid rgba(255,255,255,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,.5)',
                fontSize: 15, transition: 'all .2s', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,0,29,.3)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#E8001D'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="col-6 col-md-2">
          <div style={{ fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 18, fontSize: 13, fontFamily: 'Inter, sans-serif', letterSpacing: '.5px', textTransform: 'uppercase' }}>Navigate</div>
          {[['/', 'Home'], ['/products', 'Our Sweets'], ['/story', 'Our Story'], ['/about', 'About Us']].map(([to, label]) => (
            <Link key={to} to={to} className="footer-link">{label}</Link>
          ))}
        </div>

        <div className="col-6 col-md-2">
          <div style={{ fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 18, fontSize: 13, fontFamily: 'Inter, sans-serif', letterSpacing: '.5px', textTransform: 'uppercase' }}>Account</div>
          {[['/login', 'Sign In'], ['/register', 'Register'], ['/orders', 'My Orders'], ['/wishlist', 'Wishlist']].map(([to, label]) => (
            <Link key={to} to={to} className="footer-link">{label}</Link>
          ))}
        </div>

        <div className="col-6 col-md-2">
          <div style={{ fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 18, fontSize: 13, fontFamily: 'Inter, sans-serif', letterSpacing: '.5px', textTransform: 'uppercase' }}>Legal</div>
          {[
            ['/privacy-policy', 'Privacy Policy'],
            ['/terms', 'Terms of Service'],
            ['/cancellation-policy', 'Cancellation & Refund'],
            ['/shipping-policy', 'Shipping Policy'],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="footer-link">{label}</Link>
          ))}
        </div>

        <div className="col-6 col-md-2">
          <div style={{ fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 18, fontSize: 13, fontFamily: 'Inter, sans-serif', letterSpacing: '.5px', textTransform: 'uppercase' }}>Contact</div>
          {[
            ['/help', 'Help & Support'],
            ['/faqs', 'FAQs'],
            ['/feedback', 'Feedback'],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="footer-link">{label}</Link>
          ))}
        </div>

        <div className="col-md-4">
          <div style={{ fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 18, fontSize: 13, fontFamily: 'Inter, sans-serif', letterSpacing: '.5px', textTransform: 'uppercase' }}>Famous Sweets</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Kakinada Kaja', 'Pootharekulu', 'Tirupati Laddu', 'Bandar Laddu', 'Ariselu', 'Gavvalu'].map(s => (
              <Link key={s} to={`/products?search=${s}`} style={{
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 12,
                color: 'rgba(255,255,255,.55)',
                textDecoration: 'none',
                transition: 'all .2s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,0,29,.2)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(232,0,29,.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; }}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span>© {new Date().getFullYear()} Pakka Famous. All rights reserved. Made with ❤️ for Andhra Pradesh</span>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            ['/privacy-policy', 'Privacy'],
            ['/terms', 'Terms'],
            ['/cancellation-policy', 'Refunds'],
            ['/shipping-policy', 'Shipping'],
          ].map(([to, label]) => (
            <Link key={to} to={to} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >{label}</Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
