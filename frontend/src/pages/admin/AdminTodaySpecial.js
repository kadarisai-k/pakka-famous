import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { productAPI, contentAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaTrash, FaSearch, FaTag, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminTodaySpecial = () => {
  const { loading: authLoading } = useAuth();
  const [sectionItems, setSectionItems] = useState([]);
  const [allProducts,  setAllProducts]  = useState([]);
  const [content,      setContent]      = useState({});
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(null);
  const [showPicker,   setShowPicker]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [priceModal,   setPriceModal]   = useState(null); // { product, price }
  const [bannerFile,   setBannerFile]   = useState(null);
  const [bannerPreview,setBannerPreview]= useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState({
    todayOfferTitle: "🎉 Today's Special Offer",
    todayOfferSubtitle: "Grab today's exclusive deals — available for a limited time only!",
    todayOfferCouponCode: '',
    todayOfferCouponPercent: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [secRes, allRes, cRes] = await Promise.all([
        productAPI.getTodaySpecial(),
        productAPI.getAll({ limit: 200 }),
        contentAPI.getHomepage(),
      ]);
      setSectionItems(secRes.data.products || []);
      setAllProducts(allRes.data.products || []);
      const c = cRes.data.content || {};
      setContent(c);
      setSettings({
        todayOfferTitle:          c.todayOfferTitle          || "🎉 Today's Special Offer",
        todayOfferSubtitle:       c.todayOfferSubtitle       || "Grab today's exclusive deals — available for a limited time only!",
        todayOfferCouponCode:     c.todayOfferCouponCode     || '',
        todayOfferCouponPercent:  c.todayOfferCouponPercent  || 0,
      });
    } catch (e) { toast.error("Could not load data"); }
    setLoading(false);
  };

  useEffect(() => { if (!authLoading) loadData(); }, [authLoading]);

  const sectionIds = new Set(sectionItems.map(p => p._id));

  /* ── Add product to Today's Special (with optional custom price) ── */
  // eslint-disable-next-line no-unused-vars
  const addToSection = async (product, customPrice) => {
    setSaving(product._id);
    try {
      await productAPI.updateFlags(product._id, {
        isTodaySpecial: true,
        todaySpecialPrice: customPrice ? Number(customPrice) : 0,
      });
      toast.success(`Added to Today's Special! ✅`);
      setShowPicker(false);
      setPriceModal(null);
      await loadData();
    } catch { toast.error('Failed to add'); }
    setSaving(null);
  };

  const removeFromSection = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from Today's Special?`)) return;
    setSaving(product._id);
    try {
      await productAPI.updateFlags(product._id, { isTodaySpecial: false, todaySpecialPrice: 0 });
      toast.success('Removed');
      await loadData();
    } catch { toast.error('Failed to remove'); }
    setSaving(null);
  };

  const updatePrice = async (product, newPrice) => {
    setSaving(product._id);
    try {
      await productAPI.updateFlags(product._id, { isTodaySpecial: true, todaySpecialPrice: Number(newPrice) || 0 });
      toast.success('Price updated!');
      setPriceModal(null);
      await loadData();
    } catch { toast.error('Failed'); }
    setSaving(null);
  };

  /* ── Save section settings (title, coupon, banner) ── */
  const saveSettings = async () => {
    if (settings.todayOfferCouponCode && !settings.todayOfferCouponPercent) {
      return toast.error('Enter a discount % for the coupon');
    }
    setSavingSettings(true);
    try {
      const fd = new FormData();
      fd.append('todayOfferTitle', settings.todayOfferTitle);
      fd.append('todayOfferSubtitle', settings.todayOfferSubtitle);
      fd.append('todayOfferCouponCode', settings.todayOfferCouponCode.toUpperCase());
      fd.append('todayOfferCouponPercent', settings.todayOfferCouponPercent);
      if (bannerFile) fd.append('todayOfferBannerImage', bannerFile);
      await contentAPI.updateHomepage(fd);

      // Auto-create coupon if code provided
      if (settings.todayOfferCouponCode && settings.todayOfferCouponPercent > 0) {
        // Set expiry to end of today
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        try {
          await adminAPI.createCoupon({
            code:               settings.todayOfferCouponCode.toUpperCase(),
            discountPercentage: Number(settings.todayOfferCouponPercent),
            expiryDate:         todayEnd.toISOString(),
            minOrderAmount:     0,
          });
          toast.success(`Coupon "${settings.todayOfferCouponCode.toUpperCase()}" auto-created in Coupons! 🏷️`);
        } catch (e) {
          const msg = e.response?.data?.message || '';
          if (msg.toLowerCase().includes('exists') || msg.toLowerCase().includes('duplicate')) {
            toast('Coupon code already exists — settings saved', { icon: 'ℹ️' });
          }
        }
      }

      toast.success('Settings saved!');
      setBannerFile(null);
      setBannerPreview(null);
      await loadData();
    } catch (e) { toast.error('Failed to save settings'); }
    setSavingSettings(false);
  };

  const handleBannerFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = ev => setBannerPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const available = allProducts.filter(p =>
    !sectionIds.has(p._id) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.city.toLowerCase().includes(search.toLowerCase()))
  );

  if (authLoading || loading) return (
    <AdminLayout title="🎉 Today's Special">
      <div className="text-center py-5"><div className="spinner-border" style={{ color: '#E8001D' }} /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="🎉 Today's Special Offer">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 style={{ fontWeight:800, color:'#1a1a2e', marginBottom:4 }}>🎉 Today's Special Offer</h4>
          <p style={{ color:'#888', fontSize:13, marginBottom:0 }}>
            Sweets shown in Today's Special section. Set a special price per sweet. Section disappears automatically when empty.
          </p>
        </div>
        <button onClick={() => { setShowPicker(true); setSearch(''); }}
          style={{ padding:'10px 22px', borderRadius:50, border:'none', background:'#E8001D', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
          <FaPlus size={12}/> Add Sweet
        </button>
      </div>

      {/* ── Settings Card ── */}
      <div style={{ background:'white', border:'1.5px solid #f0f0f0', borderRadius:16, padding:20, marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
        <h6 className="fw-bold mb-3">⚙️ Section Settings</h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize:13 }}>Section Title</label>
            <input className="form-control form-control-sm" value={settings.todayOfferTitle}
              onChange={e => setSettings(s => ({...s, todayOfferTitle: e.target.value}))} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize:13 }}>Subtitle</label>
            <input className="form-control form-control-sm" value={settings.todayOfferSubtitle}
              onChange={e => setSettings(s => ({...s, todayOfferSubtitle: e.target.value}))} />
          </div>

          {/* Coupon */}
          <div className="col-12">
            <div style={{ background:'#f6ffed', border:'1.5px solid #b7eb8f', borderRadius:12, padding:'14px 16px' }}>
              <div className="fw-bold mb-2" style={{ fontSize:13 }}><FaTag className="me-2" style={{ color:'#52c41a' }}/>Today's Coupon Code <span style={{ fontWeight:400, color:'#888' }}>(auto-created in Coupons section)</span></div>
              <div className="row g-2">
                <div className="col-md-4">
                  <input className="form-control form-control-sm" placeholder="Coupon code e.g. TODAY20"
                    value={settings.todayOfferCouponCode}
                    onChange={e => setSettings(s => ({...s, todayOfferCouponCode: e.target.value.toUpperCase().replace(/\s/g,'')}))} />
                </div>
                <div className="col-md-3">
                  <input type="number" className="form-control form-control-sm" placeholder="Discount %" min={0} max={90}
                    value={settings.todayOfferCouponPercent}
                    onChange={e => setSettings(s => ({...s, todayOfferCouponPercent: e.target.value}))} />
                </div>
                <div className="col-md-5 d-flex align-items-end">
                  {settings.todayOfferCouponCode && <small style={{ color:'#52c41a', fontWeight:600 }}>✅ Coupon expires end of today automatically</small>}
                </div>
              </div>
            </div>
          </div>

          {/* Banner image */}
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize:13 }}><FaImage className="me-1"/>Section Banner Image <span style={{ fontWeight:400, color:'#888' }}>(optional)</span></label>
            <input type="file" accept="image/*" className="form-control form-control-sm" onChange={handleBannerFile} />
            {(bannerPreview || content.todayOfferBannerImage?.url) && (
              <img src={bannerPreview || content.todayOfferBannerImage?.url} alt="banner preview"
                style={{ marginTop:8, width:'100%', maxHeight:100, objectFit:'cover', borderRadius:10, border:'1.5px solid #e8e8e8' }} />
            )}
          </div>

          <div className="col-12">
            <button className="btn btn-warning fw-bold px-4" onClick={saveSettings} disabled={savingSettings}>
              {savingSettings ? 'Saving...' : '💾 Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Products grid ── */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span style={{ background:'#E8001D22', color:'#E8001D', fontWeight:700, fontSize:13, padding:'4px 14px', borderRadius:50, border:'1px solid #E8001D44' }}>
          {sectionItems.length} sweet{sectionItems.length !== 1 ? 's' : ''} in Today's Special
        </span>
        {sectionItems.length > 0 && <span style={{ fontSize:12, color:'#aaa' }}>Click price to edit • Section shows on homepage when not empty</span>}
      </div>

      {sectionItems.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', background:'white', borderRadius:16, border:'2px dashed #ffb3b3' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:12 }}>🎉</div>
          <p style={{ color:'#aaa', fontSize:15, marginBottom:16 }}>No sweets in Today's Special yet.</p>
          <p style={{ color:'#bbb', fontSize:13, marginBottom:20 }}>This section will <strong>automatically appear</strong> on the homepage when you add sweets here.</p>
          <button onClick={() => { setShowPicker(true); setSearch(''); }}
            style={{ padding:'10px 28px', borderRadius:50, border:'none', background:'#E8001D', color:'white', fontWeight:700, cursor:'pointer' }}>
            + Add your first sweet
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:16 }}>
          {sectionItems.map((p, idx) => {
            const displayPrice = p.todaySpecialPrice > 0 ? p.todaySpecialPrice : (p.weightPrices?.[0]?.price ?? p.price);
            const originalPrice = p.weightPrices?.[0]?.price ?? p.price;
            const hasDiscount = p.todaySpecialPrice > 0 && p.todaySpecialPrice < originalPrice;
            return (
              <div key={p._id} style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', border:'2px solid #E8001D33', position:'relative' }}>
                <div style={{ position:'absolute', top:10, left:10, zIndex:2, background:'#E8001D', color:'white', fontWeight:800, fontSize:12, width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {idx + 1}
                </div>
                <button onClick={() => removeFromSection(p)} disabled={saving === p._id}
                  style={{ position:'absolute', top:10, right:10, zIndex:2, width:28, height:28, borderRadius:'50%', border:'none', background:'rgba(232,0,29,0.85)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {saving === p._id ? <span className="spinner-border spinner-border-sm" style={{ width:12, height:12 }}/> : <FaTrash size={10}/>}
                </button>
                <div style={{ width:'100%', height:140, overflow:'hidden', background:'linear-gradient(135deg,#fff3e0,#ffe0b2)' }}>
                  {p.image?.url
                    ? <img src={p.image.url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem' }}>🍬</div>
                  }
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'#1a1a2e', marginBottom:3 }}>{p.name}</div>
                  <div style={{ fontSize:12, color:'#aaa', marginBottom:6 }}>📍 {p.city}</div>

                  {/* Price — click to edit */}
                  <button onClick={() => setPriceModal({ product: p, price: p.todaySpecialPrice || originalPrice })}
                    style={{ background:'none', border:'1.5px dashed #E8001D', borderRadius:8, padding:'4px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:15, fontWeight:800, color:'#E8001D' }}>₹{displayPrice}</span>
                    {hasDiscount && <span style={{ fontSize:11, color:'#aaa', textDecoration:'line-through' }}>₹{originalPrice}</span>}
                    <span style={{ fontSize:10, color:'#E8001D', opacity:0.7 }}>✏️ edit</span>
                  </button>
                  {p.todaySpecialPrice > 0 && <div style={{ fontSize:10, color:'#52c41a', marginTop:3 }}>Special price set ✅</div>}
                  {!p.todaySpecialPrice && <div style={{ fontSize:10, color:'#aaa', marginTop:3 }}>Using normal price</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Price Edit Modal ── */}
      {priceModal && (
        <div style={{ position:'fixed', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)' }} onClick={() => setPriceModal(null)}/>
          <div style={{ position:'relative', background:'white', borderRadius:20, padding:28, width:'min(400px,95vw)', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
            <h5 style={{ fontWeight:800, marginBottom:4 }}>✏️ Set Today's Special Price</h5>
            <p style={{ color:'#888', fontSize:13, marginBottom:20 }}>{priceModal.product.name}</p>

            <div className="mb-3">
              <label className="form-label fw-semibold">Today's Special Price (₹)</label>
              <input type="number" className="form-control" min={1}
                value={priceModal.price}
                onChange={e => setPriceModal(m => ({...m, price: e.target.value}))}
                placeholder="Enter special price for today" autoFocus />
              <small className="text-muted">Normal price: ₹{priceModal.product.weightPrices?.[0]?.price ?? priceModal.product.price}. Set 0 to use normal price.</small>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-danger fw-bold flex-grow-1"
                onClick={() => updatePrice(priceModal.product, priceModal.price)}
                disabled={saving === priceModal.product._id}>
                {saving === priceModal.product._id ? 'Saving...' : '✅ Set Price'}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setPriceModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Product Picker ── */}
      {showPicker && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)' }} onClick={() => setShowPicker(false)}/>
          <div style={{ position:'relative', background:'white', borderRadius:20, width:'min(640px,95vw)', maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f0f0f0' }}>
              <h5 style={{ fontWeight:800, margin:0 }}>Add Sweet to Today's Special</h5>
              <p style={{ color:'#888', fontSize:13, margin:'6px 0 0' }}>You'll be asked to set a special price after selecting.</p>
            </div>
            <div style={{ padding:'14px 24px', borderBottom:'1px solid #f0f0f0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f7f7f7', borderRadius:50, padding:'8px 16px' }}>
                <FaSearch color="#aaa" size={13}/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or city..."
                  style={{ border:'none', background:'transparent', flex:1, fontSize:14, outline:'none' }} autoFocus />
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 24px' }}>
              {available.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#aaa' }}>
                  {search ? 'No products match your search.' : 'All products are already in Today\'s Special!'}
                </div>
              ) : available.map(p => (
                <div key={p._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0', borderBottom:'1px solid #f5f5f5' }}>
                  <div style={{ width:52, height:52, borderRadius:12, overflow:'hidden', flexShrink:0, background:'#fff3e0' }}>
                    {p.image?.url ? <img src={p.image.url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>🍬</div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:'#aaa' }}>📍 {p.city} · Normal: ₹{p.weightPrices?.[0]?.price ?? p.price}</div>
                  </div>
                  <button onClick={() => { setShowPicker(false); setPriceModal({ product: p, price: p.weightPrices?.[0]?.price ?? p.price }); }}
                    disabled={saving === p._id}
                    style={{ padding:'8px 18px', borderRadius:50, border:'none', background:'#E8001D', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', flexShrink:0 }}>
                    <FaPlus size={10}/> Add
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #f0f0f0', display:'flex', justifyContent:'flex-end' }}>
              <button onClick={() => setShowPicker(false)}
                style={{ padding:'10px 28px', borderRadius:50, border:'1.5px solid #ddd', background:'white', fontWeight:700, cursor:'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTodaySpecial;
