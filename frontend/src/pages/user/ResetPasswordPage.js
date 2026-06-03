import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RULES = [
  { test: p => p.length >= 8,          label: 'At least 8 characters' },
  { test: p => /[A-Z]/.test(p),        label: 'One uppercase letter' },
  { test: p => /[a-z]/.test(p),        label: 'One lowercase letter' },
  { test: p => /[0-9]/.test(p),        label: 'One number' },
  { test: p => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), label: 'One special character' },
];

const ResetPasswordPage = () => {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const allPassed = RULES.every(r => r.test(form.password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Invalid reset link');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!allPassed) return toast.error('Password does not meet requirements');
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password: form.password });
      setDone(true);
      toast.success('Password reset! Please sign in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.'); }
    setLoading(false);
  };

  if (!token) return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: 'white', borderRadius: 20, padding: 40, border: '1px solid #E5E7EB', maxWidth: 400 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#111827', marginBottom: 8 }}>Invalid Reset Link</h3>
        <Link to="/forgot-password"><button className="btn-pakka" style={{ marginTop: 12, padding: '10px 24px' }}>Request New Link</button></Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: done ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#E8001D,#c50018)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px', boxShadow: done ? '0 4px 14px rgba(16,185,129,.3)' : '0 4px 14px rgba(232,0,29,.3)' }}>
              {done ? '✅' : '🔐'}
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', margin: 0 }}>
              {done ? 'Password Reset!' : 'Set New Password'}
            </h2>
            {done && <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: 14, marginTop: 8 }}>Redirecting to sign in…</p>}
          </div>

          {!done && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">New password</label>
                <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required autoComplete="new-password" placeholder="Min. 8 characters" />
                {form.password && (
                  <div style={{ marginTop: 10, padding: '12px 14px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                    {RULES.map((r, i) => (
                      <div key={i} style={{ fontSize: 12, color: r.test(form.password) ? '#10B981' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < RULES.length-1 ? 4 : 0, fontFamily: 'Inter, sans-serif' }}>
                        <span>{r.test(form.password) ? '✓' : '○'}</span> {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="form-label">Confirm new password</label>
                <input type="password" className="form-control" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required autoComplete="new-password" placeholder="Re-enter password" />
                {form.confirmPassword && (
                  <div style={{ fontSize: 12, marginTop: 6, color: form.password === form.confirmPassword ? '#10B981' : '#EF4444', fontFamily: 'Inter, sans-serif' }}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>
              <button type="submit" className="btn-pakka" disabled={loading || !allPassed} style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15, borderRadius: 12, opacity: !allPassed ? .6 : 1 }}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Resetting…</> : 'Reset Password'}
              </button>
            </form>
          )}

          {done && (
            <Link to="/login"><button className="btn-pakka" style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15, borderRadius: 12 }}>Sign In Now</button></Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
