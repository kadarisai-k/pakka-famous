import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, setCsrfToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { user, token, csrfToken } = res.data;
      if (csrfToken) setCsrfToken(csrfToken);
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#E8001D,#c50018)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px', boxShadow: '0 4px 14px rgba(232,0,29,.3)' }}>🍬</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', margin: 0 }}>Welcome back</h2>
            <p style={{ color: '#6B7280', fontSize: 14, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>Sign in to your Pakka Famous account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Email address</label>
              <input type="email" className="form-control" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email"
                placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required
                placeholder="••••••••" />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#E8001D', fontFamily: 'Inter, sans-serif' }}>Forgot password?</Link>
              </div>
            </div>
            <button type="submit" className="btn-pakka" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, borderRadius: 12 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#E8001D', fontWeight: 600 }}>Create one</Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Link to="/admin/login" style={{ color: '#9CA3AF', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>Admin login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
