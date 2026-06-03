import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await authAPI.forgotPassword({ email }); } catch {}
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: submitted ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#E8001D,#c50018)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 16px', boxShadow: submitted ? '0 4px 14px rgba(16,185,129,.3)' : '0 4px 14px rgba(232,0,29,.3)' }}>
            {submitted ? '📧' : '🔐'}
          </div>

          {submitted ? (
            <>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', margin: '0 0 10px' }}>Check your email</h2>
              <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                If <strong style={{ color: '#111827' }}>{email}</strong> is registered, you'll receive a reset link shortly. The link expires in <strong style={{ color: '#111827' }}>15 minutes</strong>.
              </p>
              <Link to="/login"><button className="btn-pakka" style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 14, borderRadius: 12 }}>Back to Sign In</button></Link>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>Forgot password?</h2>
              <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: 14, marginBottom: 28 }}>Enter your email and we'll send a reset link</p>
              <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">Email address</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" />
                </div>
                <button type="submit" className="btn-pakka" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 14, borderRadius: 12 }}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : 'Send Reset Link'}
                </button>
              </form>
              <div style={{ marginTop: 20, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                <Link to="/login" style={{ color: '#6B7280' }}>← Back to Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
