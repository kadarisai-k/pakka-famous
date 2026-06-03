import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { specialOfferAPI, productAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTags } from 'react-icons/fa';

const DEFAULT_PERKS = [
  { icon:'🚚', label:'FREE Delivery', desc:'On orders above ₹500', color:'#2EA94B' },
  { icon:'🎁', label:'10% OFF',       desc:'Use code PAKKA10',     color:'#E8001D' },
];

const emptyForm = () => ({
  title:'', subtitle:'', description:'',
  startDate:'', endDate:'',
  couponCode:'', couponPercent:0,
  showPopup:false, popupBgColor:'#E8001D',
  perks: DEFAULT_PERKS,
  featuredProducts:[],
  autoCoupon: true,
});

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
const toInputDT = (d) => d ? new Date(d).toISOString().slice(0,16) : '';

const StatusBadge = ({ offer }) => {
  const now = new Date();
  if (!offer.isActive) return <span style={{ background:'#f5f5f5', color:'#aaa', borderRadius:50, padding:'2px 10px', fontSize:11, fontWeight:700 }}>DISABLED</span>;
  if (now >= new Date(offer.startDate) && now <= new Date(offer.endDate))
    return <span style={{ background:'#f6ffed', color:'#52c41a', border:'1px solid #b7eb8f', borderRadius:50, padding:'2px 10px', fontSize:11, fontWeight:700 }}>🔴 LIVE NOW</span>;
  if (now < new Date(offer.startDate))
    return <span style={{ background:'#fff7e6', color:'#fa8c16', border:'1px solid #ffd591', borderRadius:50, padding:'2px 10px', fontSize:11, fontWeight:700 }}>⏳ UPCOMING</span>;
  return <span style={{ background:'#fff1f0', color:'#ff4d4f', border:'1px solid #ffa39e', borderRadius:50, padding:'2px 10px', fontSize:11, fontWeight:700 }}>✅ ENDED</span>;
};

const AdminSpecialOffers = () => {
  const { loading: authLoading } = useAuth();          // ← wait for auth restore
  const [offers, setOffers]     = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState(emptyForm());
  const [editId, setEditId]     = useState(null);
  const [imgFile, setImgFile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [perkEdit, setPerkEdit] = useState({ icon:'🎁', label:'', desc:'', color:'#E8001D' });

  const load = async () => {
    setLoading(true);
    try {
      const [oRes, pRes] = await Promise.all([
        specialOfferAPI.adminGetAll(),
        productAPI.getAll({ limit: 200 }),
      ]);
      setOffers(oRes.data.offers || []);
      setProducts(pRes.data.products || []);
    } catch (e) {
      toast.error('Could not load offers');
    }
    setLoading(false);
  };

  // Only fetch after auth is restored — prevents 403 race condition
  useEffect(() => { if (!authLoading) load(); }, [authLoading]);

  const openNew  = () => { setForm(emptyForm()); setEditId(null); setImgFile(null); setShowForm(true); };
  const openEdit = (o) => {
    setForm({
      title:o.title, subtitle:o.subtitle||'', description:o.description||'',
      startDate:toInputDT(o.startDate), endDate:toInputDT(o.endDate),
      couponCode:o.couponCode||'', couponPercent:o.couponPercent||0,
      showPopup:o.showPopup||false, popupBgColor:o.popupBgColor||'#E8001D',
      perks:o.perks?.length ? o.perks : DEFAULT_PERKS,
      featuredProducts:(o.featuredProducts||[]).map(p=>p._id||p),
      autoCoupon: true,
    });
    setEditId(o._id); setImgFile(null); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title)     return toast.error('Title required');
    if (!form.startDate) return toast.error('Start date required');
    if (!form.endDate)   return toast.error('End date required');
    if (new Date(form.startDate) >= new Date(form.endDate))
      return toast.error('End date must be after start date');
    if (form.couponCode && !form.couponPercent)
      return toast.error('Enter discount % for the coupon code');

    setSaving(true);
    const fd = new FormData();
    ['title','subtitle','description','startDate','endDate',
     'couponCode','couponPercent','popupBgColor'].forEach(k => fd.append(k, form[k]));
    fd.append('showPopup', form.showPopup);
    fd.append('perks', JSON.stringify(form.perks));
    fd.append('featuredProducts', JSON.stringify(form.featuredProducts));
    if (imgFile) fd.append('bannerImage', imgFile);

    try {
      if (editId) await specialOfferAPI.update(editId, fd);
      else        await specialOfferAPI.create(fd);

      // Auto-create coupon if code provided
      if (form.couponCode && form.couponPercent > 0 && form.autoCoupon) {
        try {
          const couponFd = new FormData();
          couponFd.append('code', form.couponCode.toUpperCase());
          couponFd.append('discountPercentage', form.couponPercent);
          couponFd.append('expiryDate', form.endDate);
          couponFd.append('minOrderAmount', 0);
          await adminAPI.createCoupon({
            code: form.couponCode.toUpperCase(),
            discountPercentage: Number(form.couponPercent),
            expiryDate: form.endDate,
            minOrderAmount: 0,
          });
          toast.success(`Coupon "${form.couponCode.toUpperCase()}" auto-created!`);
        } catch (e) {
          // Coupon might already exist — not a fatal error
          const msg = e.response?.data?.message || '';
          if (msg.includes('duplicate') || msg.includes('exists')) {
            toast('Coupon code already exists — updated offer only', { icon:'ℹ️' });
          }
        }
      }

      toast.success('Offer saved!');
      setShowForm(false); setEditId(null); load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try { await specialOfferAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const toggleActive = async (o) => {
    const fd = new FormData(); fd.append('isActive', !o.isActive);
    try { await specialOfferAPI.update(o._id, fd); load(); }
    catch { toast.error('Failed'); }
  };

  const addPerk = () => {
    if (!perkEdit.label) return toast.error('Perk label required');
    setForm(f => ({ ...f, perks: [...f.perks, { ...perkEdit }] }));
    setPerkEdit({ icon:'🎁', label:'', desc:'', color:'#E8001D' });
  };
  const removePerk   = (i) => setForm(f => ({ ...f, perks: f.perks.filter((_,j)=>j!==i) }));
  const toggleProduct= (id) => setForm(f => ({
    ...f,
    featuredProducts: f.featuredProducts.includes(id)
      ? f.featuredProducts.filter(x=>x!==id)
      : [...f.featuredProducts, id],
  }));

  if (authLoading) return (
    <AdminLayout title="🎯 Special Offers">
      <div className="text-center py-5"><div className="spinner-border" style={{ color:'#fa8c16' }} /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="🎯 Special Offers Manager">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">🎯 Special Offers Manager</h4>
          <p className="text-muted mb-0" style={{ fontSize:13 }}>Offers go live automatically at their start date/time and disappear when they end.</p>
        </div>
        <button className="btn btn-warning fw-bold d-flex align-items-center gap-2" onClick={openNew}>
          <FaPlus /> New Offer
        </button>
      </div>

      {/* How it works */}
      <div style={{ background:'linear-gradient(135deg,#fff7e6,#fffbe6)', border:'1.5px solid #ffd591', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:13 }}>
        <strong>⚡ How it works:</strong> Set start & end dates. Offer auto-appears in "Today's Special" when start time arrives, auto-disappears when it ends. Enable <strong>Popup</strong> to show a banner when users open the site. Add a <strong>coupon code</strong> and it gets created automatically in the Coupons section.
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div style={{ background:'white', border:'1.5px solid #e8e8e8', borderRadius:16, padding:24, marginBottom:24, boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">{editId ? '✏️ Edit Offer' : '➕ New Offer'}</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={()=>setShowForm(false)}>✕ Close</button>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Offer Title *</label>
              <input className="form-control" placeholder="e.g. Ugadi Festival Special" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Subtitle</label>
              <input className="form-control" placeholder="e.g. Exclusive deals this Ugadi!" value={form.subtitle} onChange={e=>setForm(f=>({...f,subtitle:e.target.value}))} />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Description</label>
              <textarea className="form-control" rows={2} placeholder="Brief description..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
            </div>

            {/* Dates */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">🗓️ Start Date & Time *</label>
              <input type="datetime-local" className="form-control" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} />
              <small className="text-muted">Offer goes live automatically at this time</small>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">🗓️ End Date & Time *</label>
              <input type="datetime-local" className="form-control" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} />
              <small className="text-muted">Offer & coupon expire automatically</small>
            </div>

            {/* Coupon */}
            <div className="col-12">
              <div style={{ background:'#f6ffed', border:'1.5px solid #b7eb8f', borderRadius:12, padding:'16px 18px' }}>
                <div className="fw-bold mb-2" style={{ fontSize:14 }}><FaTags className="me-2" style={{ color:'#52c41a' }}/>Coupon Code</div>
                <div className="row g-2 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize:12 }}>Code (leave blank for no coupon)</label>
                    <input className="form-control form-control-sm" placeholder="e.g. UGADI20" value={form.couponCode}
                      onChange={e=>setForm(f=>({...f,couponCode:e.target.value.toUpperCase().replace(/\s/g,'')}))} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize:12 }}>Discount %</label>
                    <input type="number" className="form-control form-control-sm" min={0} max={90} value={form.couponPercent}
                      onChange={e=>setForm(f=>({...f,couponPercent:e.target.value}))} />
                  </div>
                  <div className="col-md-5">
                    <div className="form-check mt-3">
                      <input className="form-check-input" type="checkbox" id="autoCoupon" checked={form.autoCoupon}
                        onChange={e=>setForm(f=>({...f,autoCoupon:e.target.checked}))} />
                      <label className="form-check-label" htmlFor="autoCoupon" style={{ fontSize:13 }}>
                        Auto-create coupon in Coupons section
                      </label>
                    </div>
                  </div>
                </div>
                {form.couponCode && <small style={{ color:'#52c41a', fontWeight:600 }}>✅ Coupon will be auto-created and expire on the offer end date</small>}
              </div>
            </div>

            {/* Banner image */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Banner Image (for popup)</label>
              <input type="file" accept="image/*" className="form-control" onChange={e=>setImgFile(e.target.files[0])} />
            </div>

            {/* Popup settings */}
            <div className="col-md-6">
              <div style={{ background:'#f8f0ff', border:'1.5px solid #d3adf7', borderRadius:12, padding:'14px 16px', height:'100%' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div>
                    <div className="fw-bold" style={{ fontSize:14 }}>🎉 Homepage Popup</div>
                    <div style={{ fontSize:12, color:'#666' }}>Show banner on every page refresh</div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" style={{ width:44, height:22, cursor:'pointer' }}
                      checked={form.showPopup} onChange={e=>setForm(f=>({...f,showPopup:e.target.checked}))} />
                    <label className="form-check-label fw-bold">{form.showPopup?'ON':'OFF'}</label>
                  </div>
                </div>
                {form.showPopup && (
                  <div className="d-flex align-items-center gap-2 mt-2">
                    <label style={{ fontSize:12 }}>BG Color:</label>
                    <input type="color" className="form-control form-control-color" value={form.popupBgColor}
                      onChange={e=>setForm(f=>({...f,popupBgColor:e.target.value}))} style={{ width:44, height:30 }} />
                    <span style={{ fontSize:12, color:'#888' }}>{form.popupBgColor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Perks */}
            <div className="col-12">
              <label className="form-label fw-semibold">🏷️ Offer Perks (highlight cards shown on homepage)</label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {form.perks.map((p,i)=>(
                  <span key={i} style={{ background:`${p.color}15`, border:`1.5px solid ${p.color}44`, borderRadius:10, padding:'4px 12px', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                    {p.icon} <b style={{ color:p.color }}>{p.label}</b> {p.desc && <span style={{ color:'#888' }}>— {p.desc}</span>}
                    <button onClick={()=>removePerk(i)} style={{ background:'none', border:'none', color:'#ff4d4f', cursor:'pointer', padding:0 }}>✕</button>
                  </span>
                ))}
              </div>
              <div className="row g-2 align-items-end">
                <div className="col-auto"><input className="form-control form-control-sm" style={{ width:60 }} placeholder="Icon" value={perkEdit.icon} onChange={e=>setPerkEdit(p=>({...p,icon:e.target.value}))} /></div>
                <div className="col-md-2"><input className="form-control form-control-sm" placeholder="Label *" value={perkEdit.label} onChange={e=>setPerkEdit(p=>({...p,label:e.target.value}))} /></div>
                <div className="col-md-3"><input className="form-control form-control-sm" placeholder="Description" value={perkEdit.desc} onChange={e=>setPerkEdit(p=>({...p,desc:e.target.value}))} /></div>
                <div className="col-auto"><input type="color" className="form-control form-control-color form-control-sm" value={perkEdit.color} onChange={e=>setPerkEdit(p=>({...p,color:e.target.value}))} style={{ width:40, height:32 }} /></div>
                <div className="col-auto"><button className="btn btn-sm btn-outline-success" onClick={addPerk}><FaPlus /> Add</button></div>
              </div>
            </div>

            {/* Featured Products */}
            <div className="col-12">
              <label className="form-label fw-semibold">🍬 Featured Products for this offer <span style={{ fontWeight:400, color:'#888' }}>(leave empty = show Best Selling)</span></label>
              <div style={{ maxHeight:200, overflowY:'auto', border:'1px solid #e8e8e8', borderRadius:10, padding:'8px 12px' }}>
                {products.map(p=>(
                  <div key={p._id} className="form-check">
                    <input className="form-check-input" type="checkbox" id={`op-${p._id}`}
                      checked={form.featuredProducts.includes(p._id)} onChange={()=>toggleProduct(p._id)} />
                    <label className="form-check-label" htmlFor={`op-${p._id}`} style={{ fontSize:13 }}>
                      {p.name} <span className="text-muted">({p.city})</span>
                    </label>
                  </div>
                ))}
              </div>
              {form.featuredProducts.length > 0 && <small className="text-success fw-bold">{form.featuredProducts.length} products selected</small>}
            </div>

            <div className="col-12 d-flex gap-2 mt-2">
              <button className="btn btn-warning fw-bold px-4" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editId ? '💾 Update Offer' : '✅ Create Offer'}
              </button>
              <button className="btn btn-outline-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Offers List ── */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color:'#fa8c16' }} /></div>
      ) : offers.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize:'3rem', marginBottom:12 }}>🎯</div>
          <div className="fw-bold text-muted">No offers yet</div>
          <div className="text-muted small">Click "New Offer" to create your first special offer</div>
        </div>
      ) : (
        <div className="row g-3">
          {offers.map(o=>(
            <div key={o._id} className="col-12">
              <div style={{ background:'white', border:'1.5px solid #f0f0f0', borderRadius:16, padding:'18px 22px', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', opacity:o.isActive?1:0.6 }}>
                <div className="d-flex align-items-start gap-3 flex-wrap">
                  {o.bannerImage?.url && <img src={o.bannerImage.url} alt="" style={{ width:72, height:54, objectFit:'cover', borderRadius:10, flexShrink:0 }} />}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <span className="fw-bold" style={{ fontSize:15 }}>{o.title}</span>
                      <StatusBadge offer={o} />
                      {o.showPopup && <span style={{ background:'#f0f0ff', color:'#7c3aed', border:'1px solid #d3adf7', borderRadius:50, padding:'2px 10px', fontSize:11, fontWeight:700 }}>🎉 POPUP ON</span>}
                      {o.couponCode && <span style={{ background:'#e6fffb', color:'#13c2c2', border:'1px solid #87e8de', borderRadius:50, padding:'2px 10px', fontSize:11, fontWeight:700 }}>🏷️ {o.couponCode}{o.couponPercent>0?` ${o.couponPercent}%`:''}</span>}
                    </div>
                    {o.subtitle && <div style={{ fontSize:13, color:'#666', marginBottom:4 }}>{o.subtitle}</div>}
                    <div style={{ fontSize:12, color:'#aaa' }}>📅 {fmt(o.startDate)} → {fmt(o.endDate)}</div>
                    {o.perks?.length>0 && (
                      <div className="d-flex gap-1 flex-wrap mt-2">
                        {o.perks.map((p,i)=>(
                          <span key={i} style={{ background:`${p.color}15`, color:p.color, border:`1px solid ${p.color}44`, borderRadius:50, padding:'1px 8px', fontSize:11, fontWeight:600 }}>{p.icon} {p.label}</span>
                        ))}
                      </div>
                    )}
                    {o.featuredProducts?.length>0 && <div style={{ fontSize:12, color:'#888', marginTop:4 }}>🍬 {o.featuredProducts.length} featured product{o.featuredProducts.length>1?'s':''}</div>}
                  </div>
                  <div className="d-flex gap-2 align-items-center flex-shrink-0">
                    <button onClick={()=>toggleActive(o)} className="btn btn-sm" style={{ color:o.isActive?'#52c41a':'#aaa', background:'none', border:'1px solid currentColor', borderRadius:8, fontSize:12 }}>
                      {o.isActive ? <FaToggleOn size={14}/> : <FaToggleOff size={14}/>} {o.isActive?'Active':'Off'}
                    </button>
                    <button onClick={()=>openEdit(o)} className="btn btn-sm btn-outline-primary"><FaEdit /></button>
                    <button onClick={()=>handleDelete(o._id)} className="btn btn-sm btn-outline-danger"><FaTrash /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSpecialOffers;
