import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, setCsrfToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.adminLogin(form);
      const { user, token, csrfToken } = res.data;
      if (csrfToken) setCsrfToken(csrfToken);
      login(user, token);
      toast.success('Welcome, Admin! 🛡️');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🛡️</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, color: '#1a1a2e' }}>Admin Login</h2>
          <p className="text-muted">Access the Pakka Famous admin panel</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Admin Email</label>
            <input type="email" className="form-control py-2" placeholder="Enter admin email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              required autoComplete="email" />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" className="form-control py-2" placeholder="Enter admin password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn w-100 py-2 mb-3" disabled={loading}
            style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', color: 'white', borderRadius: '8px', fontWeight: 600 }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Logging In...</> : '🛡️ Admin Login'}
          </button>
        </form>
        <p className="text-center text-muted mb-0">
          <Link to="/login" style={{ color: '#d4380d', fontSize: '13px' }}>← Back to User Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
