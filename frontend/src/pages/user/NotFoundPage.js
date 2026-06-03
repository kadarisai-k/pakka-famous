import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F9FAFB', padding: '40px 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>

        {/* Big sweet emoji as illustration */}
        <div style={{
          fontSize: 80, marginBottom: 8,
          animation: 'bob 3s ease-in-out infinite',
        }}>🍬</div>

        {/* 404 number */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 96, fontWeight: 900, lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: '3px #FFD84D',
          marginBottom: 8,
          letterSpacing: '-4px',
        }}>404</div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 14,
        }}>
          Sweet not found!
        </h1>

        <p style={{
          color: '#6B7280', fontSize: 15, lineHeight: 1.7,
          fontFamily: 'Poppins, sans-serif', marginBottom: 36,
        }}>
          Looks like this page wandered off to Andhra Pradesh and didn't come back.
          Let's get you back to the good stuff.
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 28px', borderRadius: 999,
              border: '2px solid #1A1A1A', background: 'transparent',
              color: '#1A1A1A', fontWeight: 600, fontSize: 14,
              fontFamily: 'Poppins, sans-serif', cursor: 'pointer',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1A1A1A'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1A1A1A'; }}
          >
            ← Go Back
          </button>

          <Link
            to="/"
            style={{
              padding: '12px 28px', borderRadius: 999,
              background: 'linear-gradient(135deg, #FF4C29, #c5380f)',
              color: '#fff', fontWeight: 600, fontSize: 14,
              fontFamily: 'Poppins, sans-serif', textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(255,76,41,0.3)',
              transition: 'transform .2s',
              display: 'inline-block',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Back to Home
          </Link>

          <Link
            to="/products"
            style={{
              padding: '12px 28px', borderRadius: 999,
              background: '#FFF8E1', border: '2px solid #FFD84D',
              color: '#7c6500', fontWeight: 600, fontSize: 14,
              fontFamily: 'Poppins, sans-serif', textDecoration: 'none',
              transition: 'all .2s',
              display: 'inline-block',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFD84D'; e.currentTarget.style.color = '#1A1A1A'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFF8E1'; e.currentTarget.style.color = '#7c6500'; }}
          >
            Browse Sweets 🍮
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 14, fontFamily: 'Poppins, sans-serif' }}>
            Popular destinations
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              ['/products', 'Our Sweets'],
              ['/occasions', 'Occasions'],
              ['/orders', 'My Orders'],
              ['/help', 'Help & Support'],
            ].map(([to, label]) => (
              <Link key={to} to={to} style={{
                fontSize: 13, color: '#FF4C29', fontFamily: 'Poppins, sans-serif',
                textDecoration: 'none', fontWeight: 500,
                padding: '5px 14px', borderRadius: 999,
                border: '1px solid rgba(255,76,41,0.25)',
                background: 'rgba(255,76,41,0.04)',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,76,41,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,76,41,0.04)'; }}
              >{label}</Link>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
