import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: '',
  });
  const [formReady, setFormReady] = useState(false);
  const [saving, setSaving] = useState(false);

  // Populate form once user is available
  useEffect(() => {
    if (user) {
      setForm({
        name:    user.name             || '',
        phone:   user.phone            || '',
        street:  user.address?.street  || '',
        city:    user.address?.city    || '',
        state:   user.address?.state   || '',
        pincode: user.address?.pincode || '',
      });
      setFormReady(true);
    }
  }, [user]);

  // Show spinner while auth is loading
  if (authLoading || !formReady) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border" style={{ color: '#E8001D' }} />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name:    form.name,
        phone:   form.phone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
      });
      updateUser(res.data.user);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div style={{ background: '#F9FAFB', minHeight: '80vh', padding: '36px 0' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#E8001D,#c50018)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 22,
                boxShadow: '0 4px 14px rgba(232,0,29,.3)', flexShrink: 0,
              }}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h4 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', margin: 0 }}>
                  {user.name}
                </h4>
                <div style={{ fontSize: 13, color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                  {user.email}
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div style={{
              background: 'white', borderRadius: 16, padding: '28px',
              border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16,
            }}>
              <h5 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#111827', marginBottom: 22 }}>
                ✏️ Edit Profile
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name *</label>
                    <input
                      type="text" className="form-control" required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone / WhatsApp</label>
                    <input
                      type="tel" className="form-control" placeholder="10-digit mobile"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Street Address</label>
                    <input
                      type="text" className="form-control" placeholder="House no, Street, Area"
                      value={form.street}
                      onChange={e => setForm({ ...form, street: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">City</label>
                    <input
                      type="text" className="form-control"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">State</label>
                    <input
                      type="text" className="form-control"
                      value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Pincode</label>
                    <input
                      type="text" className="form-control" maxLength={6}
                      value={form.pincode}
                      onChange={e => setForm({ ...form, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    marginTop: 24, width: '100%', padding: '12px 0', fontSize: 15,
                    borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    background: saving ? '#ccc' : 'linear-gradient(135deg,#E8001D,#c50018)',
                    color: 'white', fontWeight: 700, fontFamily: 'Poppins, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {saving
                    ? <><span className="spinner-border spinner-border-sm" /> Saving…</>
                    : '✅ Save Changes'
                  }
                </button>
              </form>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link to="/orders">
                <button style={{
                  padding: '10px 28px', borderRadius: 10, border: '2px solid #E8001D',
                  background: 'white', color: '#E8001D', fontWeight: 700,
                  fontFamily: 'Poppins, sans-serif', cursor: 'pointer', fontSize: 14,
                }}>
                  📦 View My Orders →
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
