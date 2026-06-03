import React, { useState, useEffect } from 'react';
import { productAPI, citySweetAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Laddu','Kaja','Pootharekulu','Halwa','Burfi','Murukku','Payasam',
  'Pickle','Pappad','Chutney','Mixture','Chakralu','Gavvalu','Bobbatlu',
  'Pala Kova','Ariselu','Jilebi','Mysore Pak','Kheer','Other'
];
const SEASONAL_TAGS = ['','Festival Special','Wedding Specials','Diwali Sweets','Sankranti Specials'];
const WEIGHT_OPTIONS = ['','100g','200g','250g','500g','750g','1kg','1.5kg','2kg'];

const EMPTY = {
  name:'', city:'', description:'', price:'', discount:0, weight:'',
  availableQty:'', category:'', isFeatured:false, isTopSeller:false,
  isBestSelling:false, isSeasonalCollection:false, seasonalTag:'',
  shopWhatsapp:'', shopName:'',
};

const AdminProducts = () => {
  const [products, setProducts]   = useState([]);
  const [cities,   setCities]     = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form,   setForm]   = useState(EMPTY);
  const [image,  setImage]  = useState(null);
  const [hoverImage,   setHoverImage]   = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProducts(); fetchCities(); }, []);

  const fetchCities = async () => {
    try {
      const res = await citySweetAPI.adminGetAll();
      const list = res.data.citySweets || res.data || [];
      setCities([...new Set(list.map(c => c.cityName).filter(Boolean))].sort());
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll({ limit: 100 });
      setProducts(res.data.products);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  };

  const openAdd = () => {
    setEditProduct(null); setForm(EMPTY);
    setImage(null); setHoverImage(null); setPreview(null); setHoverPreview(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, city: p.city, description: p.description,
      price: p.price, discount: p.discount||0, weight: p.weight||'',
      availableQty: p.availableQty||'', category: p.category||'',
      isFeatured: p.isFeatured||false, isTopSeller: p.isTopSeller||false,
      isBestSelling: p.isBestSelling||false,
      isSeasonalCollection: p.isSeasonalCollection||false,
      seasonalTag: p.seasonalTag||'',
      shopWhatsapp: p.shopWhatsapp||'',
      shopName: p.shopName||'',
    });
    setImage(null); setHoverImage(null);
    setPreview(p.image?.url||null); setHoverPreview(p.hoverImage?.url||null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productAPI.delete(id); toast.success('Deleted!'); fetchProducts(); }
    catch { toast.error('Delete failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (image)      fd.append('image', image);
      if (hoverImage) fd.append('hoverImage', hoverImage);
      if (editProduct) { await productAPI.update(editProduct._id, fd); toast.success('Updated!'); }
      else             { await productAPI.create(fd);                  toast.success('Product created!'); }
      setShowModal(false); fetchProducts();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="📦 Products Management">

      {/* Top bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="input-group" style={{ maxWidth: 300 }}>
          <span className="input-group-text"><FaSearch /></span>
          <input className="form-control" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-pakka" onClick={openAdd}>
          <FaPlus className="me-2" />Add Product
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: '#d4380d' }} /></div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
              <thead style={{ background: '#f5f5f5' }}>
                <tr>
                  <th>Product</th><th>City</th><th>Price</th><th>Weight</th>
                  <th>Shop WhatsApp</th><th>Tags</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={p.image?.url || 'https://via.placeholder.com/40?text=🍬'}
                          alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>Sales: {p.salesCount || 0}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="product-city-badge">{p.city}</span></td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#d4380d' }}>
                        ₹{p.price}{p.weight && <span style={{ color: '#888', fontWeight: 400 }}> / {p.weight}</span>}
                      </div>
                      {p.discount > 0 && <div style={{ fontSize: 11, color: '#52c41a' }}>{p.discount}% off</div>}
                    </td>
                    <td>{p.weight || <span className="text-muted">—</span>}</td>
                    <td>
                      {p.shopWhatsapp ? (
                        <div style={{ fontSize: 11 }}>
                          <div style={{ fontWeight: 600, color: '#25D366' }}>✅ {p.shopName || 'Set'}</div>
                          <div style={{ color: '#888' }}>{p.shopWhatsapp}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#bbb' }}>Not set</span>
                      )}
                    </td>
                    <td>
                      {p.isFeatured        && <span className="badge me-1" style={{ background: '#FFBE00', color: '#1a1a2e', fontSize: 10 }}>⭐ Featured</span>}
                      {p.isTopSeller       && <span className="badge me-1" style={{ background: '#E8001D', fontSize: 10 }}>🔥 Top Seller</span>}
                      {p.isBestSelling     && <span className="badge me-1" style={{ background: '#2EA94B', fontSize: 10 }}>🏆 Best</span>}
                      {p.isSeasonalCollection && <span className="badge" style={{ background: '#722ed1', fontSize: 10 }}>🎉 {p.seasonalTag || 'Seasonal'}</span>}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(p)}><FaEdit /></button>
                        <button className="btn btn-sm btn-outline-danger"  onClick={() => handleDelete(p._id)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          overflowY: 'auto', padding: '20px 16px' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 700,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: 40 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
              <h5 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 20, margin: 0 }}>
                {editProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h5>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: '20px 24px' }}>
                <div className="row g-3">

                  {/* Name */}
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Product Name *</label>
                    <input type="text" className="form-control" required
                      placeholder="e.g. Kakinada Kaja"
                      value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>

                  {/* City */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">City *</label>
                    {cities.length > 0 ? (
                      <>
                        <select className="form-select"
                          value={cities.includes(form.city) ? form.city : (form.city ? '__custom__' : '')}
                          onChange={e => e.target.value === '__custom__'
                            ? setForm({...form, city: ''})
                            : setForm({...form, city: e.target.value})}
                          required={!form.city}>
                          <option value="">Select City</option>
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="__custom__">+ Type a city...</option>
                        </select>
                        {!cities.includes(form.city) && (
                          <input className="form-control mt-2" placeholder="Type city name..."
                            value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                        )}
                      </>
                    ) : (
                      <input className="form-control" placeholder="e.g. Kakinada" required
                        value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Description *</label>
                    <textarea className="form-control" rows={3} required
                      placeholder="Describe this sweet..."
                      value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                  </div>

                  {/* Price / Discount / Weight / Qty */}
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Price (₹) *</label>
                    <input type="number" className="form-control" min="1" required placeholder="350"
                      value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Discount (%)</label>
                    <input type="number" className="form-control" min="0" max="90" placeholder="0"
                      value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Weight</label>
                    <select className="form-select" value={form.weight}
                      onChange={e => setForm({...form, weight: e.target.value})}>
                      {WEIGHT_OPTIONS.map(w => <option key={w} value={w}>{w || 'Not specified'}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Available Qty</label>
                    <input type="number" className="form-control" min="0" placeholder="Unlimited"
                      value={form.availableQty} onChange={e => setForm({...form, availableQty: e.target.value})} />
                  </div>

                  {/* Category / Seasonal Tag */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select className="form-select" value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="">— Not specified —</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Seasonal Tag</label>
                    <select className="form-select" value={form.seasonalTag}
                      onChange={e => setForm({...form, seasonalTag: e.target.value})}>
                      {SEASONAL_TAGS.map(t => <option key={t} value={t}>{t || 'None'}</option>)}
                    </select>
                  </div>

                  {/* Images */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Main Image</label>
                    <input type="file" className="form-control" accept="image/*"
                      onChange={e => { const f = e.target.files[0]; if(f){setImage(f);setPreview(URL.createObjectURL(f));} }} />
                    {preview && <img src={preview} alt="preview"
                      style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, marginTop: 6, border: '2px solid #f0e8d8' }} />}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Hover Image</label>
                    <input type="file" className="form-control" accept="image/*"
                      onChange={e => { const f = e.target.files[0]; if(f){setHoverImage(f);setHoverPreview(URL.createObjectURL(f));} }} />
                    {hoverPreview && <img src={hoverPreview} alt="hover"
                      style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, marginTop: 6, border: '2px solid #FFBE00' }} />}
                  </div>

                  {/* Seasonal Collection checkbox */}
                  <div className="col-12">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      padding: '10px 16px', borderRadius: 10, width: 'fit-content',
                      background: form.isSeasonalCollection ? '#f9f0ff' : '#fafafa',
                      border: `2px solid ${form.isSeasonalCollection ? '#722ed1' : '#eee'}`,
                      transition: 'all 0.2s' }}>
                      <input type="checkbox" checked={form.isSeasonalCollection}
                        onChange={e => setForm({...form, isSeasonalCollection: e.target.checked})}
                        style={{ width: 16, height: 16, accentColor: '#722ed1' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>🎉 Seasonal Collection</div>
                        <div style={{ fontSize: 11, color: '#888' }}>Show in Special Occasions section</div>
                      </div>
                    </label>
                  </div>

                  {/* ══ Sweet Shop WhatsApp Alert ══════════════════════════════ */}
                  <div className="col-12">
                    <div style={{ padding: '16px 18px', background: '#f0fff4', borderRadius: 12,
                      border: '2px solid #86efac' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#166534', marginBottom: 14,
                        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span>📲</span>
                        Sweet Shop WhatsApp Alert
                        <span style={{ fontSize: 11, fontWeight: 400, color: '#15803d',
                          background: '#dcfce7', padding: '2px 10px', borderRadius: 20 }}>
                          Shop is notified on every order
                        </span>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                            📱 Shop WhatsApp Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="+91 98765 43210"
                            value={form.shopWhatsapp}
                            onChange={e => setForm({...form, shopWhatsapp: e.target.value})}
                            style={{ borderColor: '#86efac', borderWidth: 1.5 }}
                          />
                          <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                            Include country code — e.g. +91XXXXXXXXXX
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                            🏪 Shop Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Mukkanti Sweets Rajam"
                            value={form.shopName}
                            onChange={e => setForm({...form, shopName: e.target.value})}
                            style={{ borderColor: '#86efac', borderWidth: 1.5 }}
                          />
                          <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>
                            Shown in the WhatsApp message sent to shop
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ══ End Sweet Shop WhatsApp ═══════════════════════════════ */}

                </div>
              </div>

              {/* Save / Cancel buttons */}
              <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #f0f0f0',
                display: 'flex', gap: 10, justifyContent: 'flex-end',
                background: 'white', borderRadius: '0 0 20px 20px' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '10px 24px', borderRadius: 50, border: '1.5px solid #ddd',
                    background: 'white', color: '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '10px 32px', borderRadius: 50, border: 'none',
                    background: saving ? '#ccc' : 'linear-gradient(135deg,#E8001D,#c50018)',
                    color: 'white', fontWeight: 700, fontSize: 15,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: saving ? 'none' : '0 4px 14px rgba(232,0,29,0.35)',
                    display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm" /> Saving...</>
                    : editProduct ? '✅ Update Product' : '✅ Save Product'
                  }
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
