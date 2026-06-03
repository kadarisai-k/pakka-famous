import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash, FaTruck, FaSave, FaWhatsapp, FaClock } from 'react-icons/fa';

const AdminSettings = () => {
  const { user } = useAuth();

  // ── Password state ─────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading,       setPwLoading]       = useState(false);
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);

  // ── Delivery settings state ────────────────────────────────────
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [deliveryCharge,        setDeliveryCharge]        = useState('');
  const [settingsLoading,       setSettingsLoading]       = useState(true);
  const [settingsSaving,        setSettingsSaving]        = useState(false);

  // ── Daily summary state ────────────────────────────────────────
  const [cutoffTime,    setCutoffTime]    = useState('23:00');
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(true);
  const [summarySaving,       setSummarySaving]       = useState(false);
  const [testSending,         setTestSending]         = useState(false);

  // ── Load all settings on mount ─────────────────────────────────
  useEffect(() => {
    adminAPI.getSettings()
      .then(res => {
        const s = res.data.settings;
        setFreeDeliveryThreshold(s.freeDeliveryThreshold);
        setDeliveryCharge(s.deliveryCharge);
        setCutoffTime(s.cutoffTime || '23:00');
        setDailySummaryEnabled(s.dailySummaryEnabled !== false);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setSettingsLoading(false));
  }, []);

  // ── Save delivery settings ─────────────────────────────────────
  const handleSaveDelivery = async (e) => {
    e.preventDefault();
    const threshold = Number(freeDeliveryThreshold);
    const charge    = Number(deliveryCharge);
    if (isNaN(threshold) || threshold < 0) { toast.error('Enter a valid free delivery threshold'); return; }
    if (isNaN(charge)    || charge < 0)    { toast.error('Enter a valid delivery charge amount'); return; }
    setSettingsSaving(true);
    try {
      const res = await adminAPI.updateSettings({ freeDeliveryThreshold: threshold, deliveryCharge: charge });
      setFreeDeliveryThreshold(res.data.settings.freeDeliveryThreshold);
      setDeliveryCharge(res.data.settings.deliveryCharge);
      toast.success('Delivery settings saved! 🚚');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    }
    setSettingsSaving(false);
  };

  // ── Save daily summary settings ────────────────────────────────
  const handleSaveSummary = async (e) => {
    e.preventDefault();
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(cutoffTime)) {
      toast.error('Please enter a valid time in HH:MM format (e.g. 23:00)');
      return;
    }
    setSummarySaving(true);
    try {
      const res = await adminAPI.updateSettings({
        cutoffTime,
        dailySummaryEnabled,
      });
      setCutoffTime(res.data.settings.cutoffTime);
      setDailySummaryEnabled(res.data.settings.dailySummaryEnabled);
      toast.success(`Cutoff & summary time set to ${cutoffTime} IST ✅`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save summary settings');
    }
    setSummarySaving(false);
  };

  // ── Send test summary now ──────────────────────────────────────
  const handleTestSummary = async () => {
    setTestSending(true);
    try {
      await adminAPI.triggerSummaryNow();
      toast.success('Test summary sent to all shops! Check WhatsApp 📲');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test summary');
    }
    setTestSending(false);
  };

  // ── Change password ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match!'); return; }
    if (newPassword.length < 6)         { toast.error('New password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await adminAPI.changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success('Password changed successfully! 🔒');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
    setPwLoading(false);
  };

  const strengthLevel  = newPassword.length >= 12 ? 3 : newPassword.length >= 8 ? 2 : newPassword.length >= 6 ? 1 : 0;
  const strengthColors = ['#ff4d4f', '#ff4d4f', '#fa8c16', '#52c41a'];
  const strengthLabels = ['', '⚠️ Weak', '👍 Medium', '💪 Strong'];

  // Format 24h time to 12h for display
  const formatTime12h = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  return (
    <AdminLayout title="⚙️ Settings">
      <div className="row justify-content-center">
        <div className="col-lg-7">

          {/* Admin Profile Card */}
          <div style={{ background:'white', borderRadius:16, padding:24, marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 style={{ fontFamily:'Playfair Display', fontWeight:700, marginBottom:16 }}>👤 Admin Profile</h6>
            <div className="d-flex align-items-center gap-3">
              <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#1a1a2e,#16213e)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fa8c16', fontWeight:700, fontSize:'1.4rem' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:16 }}>{user?.name}</div>
                <div style={{ color:'#888', fontSize:13 }}>{user?.email}</div>
                <span className="badge" style={{ background:'#1a1a2e', color:'#fa8c16', fontSize:11 }}>ADMIN</span>
              </div>
            </div>
          </div>

          {/* 🚚 Delivery Settings */}
          <div style={{ background:'white', borderRadius:16, padding:28, marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#0050b3,#1677ff)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
                <FaTruck />
              </div>
              <div>
                <h6 style={{ fontFamily:'Playfair Display', fontWeight:700, margin:0 }}>Delivery Settings</h6>
                <small className="text-muted">Control free delivery threshold &amp; delivery charge</small>
              </div>
            </div>
            <hr />
            {settingsLoading ? (
              <div className="text-center py-4"><div className="spinner-border spinner-border-sm" /></div>
            ) : (
              <form onSubmit={handleSaveDelivery}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Free Delivery Above (₹)</label>
                    <div className="input-group">
                      <span className="input-group-text fw-bold">₹</span>
                      <input type="number" className="form-control" value={freeDeliveryThreshold}
                        onChange={e => setFreeDeliveryThreshold(e.target.value)} min="0" step="1" placeholder="e.g. 500" required />
                    </div>
                    <div className="form-text">Orders at or above this get free delivery</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Delivery Charge (₹)</label>
                    <div className="input-group">
                      <span className="input-group-text fw-bold">₹</span>
                      <input type="number" className="form-control" value={deliveryCharge}
                        onChange={e => setDeliveryCharge(e.target.value)} min="0" step="1" placeholder="e.g. 50" required />
                    </div>
                    <div className="form-text">Charged when order is below the threshold</div>
                  </div>
                </div>
                {freeDeliveryThreshold !== '' && deliveryCharge !== '' && (
                  <div style={{ background:'#f0f7ff', border:'1px solid #bae0ff', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                    <div style={{ fontSize:13, color:'#0958d9', lineHeight:1.6 }}>
                      <strong>📋 Current Rule:</strong><br />
                      • Orders <strong>below ₹{freeDeliveryThreshold}</strong> → delivery charge of <strong>₹{deliveryCharge}</strong><br />
                      • Orders <strong>₹{freeDeliveryThreshold} or more</strong> → 🎉 <strong>FREE delivery</strong>
                    </div>
                  </div>
                )}
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={settingsSaving}>
                  {settingsSaving ? <><span className="spinner-border spinner-border-sm" /> Saving...</> : <><FaSave /> Save Delivery Settings</>}
                </button>
              </form>
            )}
          </div>

          {/* 📲 Daily WhatsApp Summary Settings */}
          <div style={{ background:'white', borderRadius:16, padding:28, marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#25D366,#128C7E)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
                <FaWhatsapp />
              </div>
              <div>
                <h6 style={{ fontFamily:'Playfair Display', fontWeight:700, margin:0 }}>Daily Shop Summary – WhatsApp</h6>
                <small className="text-muted">Orders can be cancelled BEFORE this time. At this time: orders are confirmed + summaries sent to shops</small>
              </div>
            </div>
            <hr />

            {settingsLoading ? (
              <div className="text-center py-4"><div className="spinner-border spinner-border-sm" /></div>
            ) : (
              <form onSubmit={handleSaveSummary}>

                {/* Enable / Disable toggle */}
                <div className="mb-4">
                  <label className="form-label fw-semibold d-block">Summary Status</label>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'10px 18px',
                      borderRadius:10, border:`2px solid ${dailySummaryEnabled ? '#25D366' : '#ddd'}`,
                      background:dailySummaryEnabled ? '#f0fff4' : '#fafafa', transition:'all 0.2s' }}>
                      <input type="radio" name="summaryEnabled" checked={dailySummaryEnabled === true}
                        onChange={() => setDailySummaryEnabled(true)} style={{ accentColor:'#25D366' }} />
                      <span style={{ fontWeight:600, color: dailySummaryEnabled ? '#166534' : '#555' }}>✅ Enabled</span>
                    </label>
                    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'10px 18px',
                      borderRadius:10, border:`2px solid ${!dailySummaryEnabled ? '#ff4d4f' : '#ddd'}`,
                      background:!dailySummaryEnabled ? '#fff1f0' : '#fafafa', transition:'all 0.2s' }}>
                      <input type="radio" name="summaryEnabled" checked={dailySummaryEnabled === false}
                        onChange={() => setDailySummaryEnabled(false)} style={{ accentColor:'#ff4d4f' }} />
                      <span style={{ fontWeight:600, color: !dailySummaryEnabled ? '#cf1322' : '#555' }}>❌ Disabled</span>
                    </label>
                  </div>
                </div>

                {/* Time picker */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <FaClock className="me-2" style={{ color:'#fa8c16' }} />
                    Daily Cutoff & Summary Time (IST)
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="time"
                      className="form-control"
                      style={{ maxWidth:160, fontSize:18, fontWeight:700, padding:'10px 14px' }}
                      value={cutoffTime}
                      onChange={e => setCutoffTime(e.target.value)}
                      required={dailySummaryEnabled}
                    />
                    {cutoffTime && (
                      <div style={{ padding:'8px 16px', background:'#fff7e6', border:'1px solid #ffd591',
                        borderRadius:10, fontSize:13, color:'#874d00', fontWeight:600 }}>
                        🕐 {formatTime12h(cutoffTime)} IST every day
                      </div>
                    )}
                  </div>
                  <div className="form-text">
                    Before this time: customers can cancel orders. At this time: orders lock + shops get WhatsApp summary. Recommended: 23:00
                  </div>
                </div>

                {/* Info box */}
                <div style={{ background:'#f0fff4', border:'1px solid #86efac', borderRadius:10,
                  padding:'12px 16px', marginBottom:20, fontSize:13, color:'#166534', lineHeight:1.7 }}>
                  <strong>📋 What shops receive:</strong><br />
                  Each shop gets a WhatsApp showing only their products — customer names, quantities, and totals for the day.
                  Shops without a WhatsApp number set in Products won't receive anything.
                </div>

                <div className="d-flex gap-3 flex-wrap">
                  <button type="submit" className="btn btn-success d-flex align-items-center gap-2" disabled={summarySaving}>
                    {summarySaving
                      ? <><span className="spinner-border spinner-border-sm" /> Saving...</>
                      : <><FaSave /> Save Summary Settings</>
                    }
                  </button>
                  <button type="button"
                    className="btn btn-outline-success d-flex align-items-center gap-2"
                    onClick={handleTestSummary}
                    disabled={testSending}
                    title="Send today's summary to all shops right now (for testing)"
                  >
                    {testSending
                      ? <><span className="spinner-border spinner-border-sm" /> Sending...</>
                      : <><FaWhatsapp /> Send Test Summary Now</>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 🔒 Change Password */}
          <div style={{ background:'white', borderRadius:16, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#d4380d,#fa8c16)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
                <FaLock />
              </div>
              <div>
                <h6 style={{ fontFamily:'Playfair Display', fontWeight:700, margin:0 }}>Change Password</h6>
                <small className="text-muted">Keep your account secure</small>
              </div>
            </div>
            <hr />
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Current Password</label>
                <div className="input-group">
                  <input type={showCurrent ? 'text' : 'password'} className="form-control"
                    placeholder="Enter current password" value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCurrent(v => !v)}>
                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <div className="input-group">
                  <input type={showNew ? 'text' : 'password'} className="form-control"
                    placeholder="Enter new password" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNew(v => !v)}>
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="mt-2">
                    <div style={{ height:4, borderRadius:2, background:'#f0f0f0', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:2, width:`${(strengthLevel/3)*100}%`, background:strengthColors[strengthLevel], transition:'all 0.3s' }} />
                    </div>
                    <small style={{ color:'#888' }}>Strength: {strengthLabels[strengthLevel]}</small>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Confirm New Password</label>
                <div className="input-group">
                  <input type={showConfirm ? 'text' : 'password'} className="form-control"
                    placeholder="Confirm new password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <small style={{ color:'#ff4d4f' }}>⚠️ Passwords do not match</small>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <small style={{ color:'#52c41a' }}>✓ Passwords match</small>
                )}
              </div>
              <button type="submit" className="btn btn-pakka w-100 py-2" disabled={pwLoading}>
                {pwLoading ? <><span className="spinner-border spinner-border-sm me-2" />Changing...</> : '🔒 Change Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
