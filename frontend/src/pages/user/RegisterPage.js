import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, setCsrfToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { user, token, csrfToken } = res.data;
      if (csrfToken) setCsrfToken(csrfToken);
      login(user, token);
      toast.success('Account created! Welcome 🍬');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#E8001D,#c50018)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px', boxShadow: '0 4px 14px rgba(232,0,29,.3)' }}>🍬</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', margin: 0 }}>Create account</h2>
            <p style={{ color: '#6B7280', fontSize: 14, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>Join Pakka Famous today</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Full name</label>
                <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required placeholder="Your name" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} required maxLength={10} placeholder="10-digit number" />
              </div>
              <div className="col-12">
                <label className="form-label">Email address</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required placeholder="you@example.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required minLength={6} placeholder="Min. 6 characters" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Confirm password</label>
                <input type="password" className="form-control" value={form.confirmPassword} onChange={e => setForm({...form,confirmPassword:e.target.value})} required placeholder="Re-enter password" />
              </div>
            </div>
            <button type="submit" className="btn-pakka" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15, borderRadius: 12, marginTop: 24 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating account…</> : 'Create Account'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={{ color: '#E8001D' }}>Terms of Service</Link>{' '}and{' '}
              <Link to="/privacy-policy" style={{ color: '#E8001D' }}>Privacy Policy</Link>
            </p>
          </form>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            Already have an account?{' '}<Link to="/login" style={{ color: '#E8001D', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
