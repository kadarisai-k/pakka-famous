import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTicketAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EMPTY = { code: '', discountPercentage: '', expiryDate: '', minOrderAmount: 0, usageLimit: '', active: true };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try { const res = await adminAPI.getCoupons(); setCoupons(res.data.coupons); }
    catch (e) { toast.error('Failed to load coupons'); }
    setLoading(false);
  };

  const openAdd = () => { setEditCoupon(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => {
    setEditCoupon(c);
    setForm({ code: c.code, discountPercentage: c.discountPercentage, expiryDate: c.expiryDate.slice(0, 10), minOrderAmount: c.minOrderAmount, usageLimit: c.usageLimit || '', active: c.active });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await adminAPI.deleteCoupon(id); toast.success('Deleted!'); fetchCoupons(); }
    catch (e) { toast.error('Delete failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, discountPercentage: Number(form.discountPercentage), minOrderAmount: Number(form.minOrderAmount), usageLimit: form.usageLimit ? Number(form.usageLimit) : null };
      if (editCoupon) { await adminAPI.updateCoupon(editCoupon._id, payload); toast.success('Updated!'); }
      else { await adminAPI.createCoupon(payload); toast.success('Coupon created!'); }
      setShowModal(false); fetchCoupons();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <AdminLayout title="🎟️ Coupons Management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0">Manage discount coupons for checkout</p>
        <button className="btn btn-pakka" onClick={openAdd}><FaPlus className="me-2" />Add Coupon</button>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: '#d4380d' }} /></div>
      ) : (
        <div className="row g-3">
          {coupons.length === 0 ? (
            <div className="col-12 text-center py-5">
              <FaTicketAlt style={{ fontSize: '3rem', color: '#ddd' }} />
              <p className="text-muted mt-2">No coupons yet. Create your first coupon!</p>
            </div>
          ) : coupons.map(c => {
            const expired = isExpired(c.expiryDate);
            const statusColor = !c.active ? '#888' : expired ? '#ff4d4f' : '#52c41a';
            const statusLabel = !c.active ? 'Inactive' : expired ? 'Expired' : 'Active';
            return (
              <div key={c._id} className="col-md-6 col-lg-4">
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `2px dashed ${statusColor}30`, position: 'relative' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div style={{ background: 'linear-gradient(135deg,#d4380d,#fa8c16)', color: 'white', fontWeight: 700, fontSize: '18px', padding: '6px 16px', borderRadius: '8px', letterSpacing: '2px' }}>
                      {c.code}
                    </div>
                    <span style={{ background: statusColor + '20', color: statusColor, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{statusLabel}</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d4380d', margin: '8px 0' }}>{c.discountPercentage}% OFF</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    <div>📅 Expires: {new Date(c.expiryDate).toLocaleDateString('en-IN')}</div>
                    {c.minOrderAmount > 0 && <div>🛒 Min order: ₹{c.minOrderAmount}</div>}
                    <div>🔢 Used: {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ' (unlimited)'}</div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button onClick={() => openEdit(c)} className="btn btn-sm btn-outline-primary flex-fill"><FaEdit /> Edit</button>
                    <button onClick={() => handleDelete(c._id)} className="btn btn-sm btn-outline-danger flex-fill"><FaTrash /> Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontFamily: 'Playfair Display' }}>{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Coupon Code *</label>
                      <input type="text" className="form-control text-uppercase" value={form.code}
                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. PAKKA10" required disabled={!!editCoupon} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Discount % *</label>
                      <input type="number" className="form-control" value={form.discountPercentage}
                        onChange={e => setForm({ ...form, discountPercentage: e.target.value })}
                        min="1" max="90" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Expiry Date *</label>
                      <input type="date" className="form-control" value={form.expiryDate}
                        onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Min Order (₹)</label>
                      <input type="number" className="form-control" value={form.minOrderAmount}
                        onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} min="0" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Usage Limit</label>
                      <input type="number" className="form-control" value={form.usageLimit}
                        onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                        placeholder="Leave empty = unlimited" min="1" />
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="active"
                          checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                        <label className="form-check-label" htmlFor="active">Active</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-pakka" disabled={saving}>
                    {saving ? 'Saving...' : editCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCoupons;
