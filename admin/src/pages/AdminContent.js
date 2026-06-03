import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { contentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = [
  { id:'hero',      label:'🎯 Hero Section' },
  { id:'announcement', label:'📢 Announcement' },
  { id:'sections',  label:'📝 Section Texts' },
  { id:'offers',    label:'🎉 Special Offers' },
  { id:'shops',     label:'🏪 Shop Images' },
  { id:'logo',      label:'🏷️ Logo' },
];

const Field = ({ label, field, type='text', rows, content, setContent }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6, color:'#444' }}>{label}</label>
    {rows
      ? <textarea className="form-control" rows={rows} value={content[field]||''} onChange={e => setContent(p => ({...p,[field]:e.target.value}))} />
      : <input type={type} className="form-control" value={content[field]||''} onChange={e => setContent(p => ({...p,[field]:e.target.value}))} />
    }
  </div>
);

const AdminContent = () => {
  const { loading: authLoading } = useAuth();
  const [content, setContent]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState('hero');
  const [heroFile, setHeroFile]     = useState(null);
  const [logoFile, setLogoFile]     = useState(null);
  const [shopImgFile, setShopImgFile] = useState(null);
  const [shopImgData, setShopImgData] = useState({ shopName:'', city:'', description:'' });
  const [addingShop, setAddingShop] = useState(false);
  const [newOffer, setNewOffer] = useState({ title:'', description:'', icon:'🎁', color:'#E8001D' });

  useEffect(() => {
    contentAPI.getHomepage()
      .then(r => setContent(r.data.content || {}))
      .catch(() => toast.error('Failed to load content'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    const fields = ['heroTitle','heroSubtitle','heroButtonText','heroOverlay','featuredTitle','featuredSubtitle','bestSellingTitle','bestSellingSubtitle','seasonalTitle','seasonalSubtitle','whyChooseTitle','offerBannerText','offerBannerSubtext','announcementText','todayOfferTitle','todayOfferSubtitle','upcomingOffersTitle','upcomingOffersSubtitle'];
    fields.forEach(f => { if (content[f] !== undefined) fd.append(f, content[f]); });
    if (heroFile) fd.append('heroImage', heroFile);
    if (logoFile) fd.append('logo', logoFile);
    try {
      const r = await contentAPI.updateHomepage(fd);
      setContent(r.data.content);
      setHeroFile(null); setLogoFile(null);
      toast.success('Saved! ✅');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleAddShopImage = async () => {
    if (!shopImgFile) return toast.error('Please select an image first');
    if (!shopImgData.shopName) return toast.error('Please enter the shop name');
    setAddingShop(true);
    const fd = new FormData();
    fd.append('image', shopImgFile);
    fd.append('shopName', shopImgData.shopName);
    fd.append('city', shopImgData.city);
    fd.append('description', shopImgData.description || '');
    try {
      const r = await contentAPI.addShopImage(fd);
      setContent(r.data.content);
      setShopImgFile(null);
      setShopImgData({ shopName:'', city:'', description:'' });
      toast.success('Shop image added! ✅');
    } catch { toast.error('Failed to add shop image'); }
    setAddingShop(false);
  };

  const handleRemoveShopImage = async (publicId) => {
    if (!window.confirm('Remove this shop image?')) return;
    try {
      const r = await contentAPI.removeShopImage(publicId);
      setContent(r.data.content);
      toast.success('Removed');
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <AdminLayout><div className="text-center py-5"><div className="spinner-border text-warning" /></div></AdminLayout>;

  return (
    <AdminLayout title="🖼️ Homepage Content">

      {/* Tab bar */}
      <div style={{ display:'flex', gap:6, marginBottom:28, flexWrap:'wrap', borderBottom:'2px solid #f0f0f0', paddingBottom:0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding:'10px 20px', borderRadius:'12px 12px 0 0',
              border: 'none',
              background: activeTab===tab.id ? 'white' : 'transparent',
              color: activeTab===tab.id ? '#E8001D' : '#666',
              fontWeight: activeTab===tab.id ? 700 : 500,
              fontSize: 14, cursor:'pointer',
              borderBottom: activeTab===tab.id ? '2px solid #E8001D' : '2px solid transparent',
              marginBottom: -2, transition:'all 0.2s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Hero ── */}
      {activeTab === 'hero' && (
        <div style={{ background:'white', borderRadius:16, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', maxWidth:700 }}>
          <h6 style={{ fontWeight:800, fontSize:16, marginBottom:20, color:'#1a1a2e' }}>🎯 Hero Section Settings</h6>

          <Field label="Hero Title" field="heroTitle" content={content} setContent={setContent} />
          <Field label="Hero Subtitle" field="heroSubtitle" rows={3} content={content} setContent={setContent} />
          <Field label="Button Text" field="heroButtonText" content={content} setContent={setContent} />

          <div style={{ marginBottom:16 }}>
            <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6, color:'#444' }}>
              Dark Overlay Intensity — {Math.round((content.heroOverlay||0.35)*100)}%
            </label>
            <input type="range" className="form-range" min="0" max="0.8" step="0.05"
              value={content.heroOverlay||0.35}
              onChange={e => setContent(p => ({...p, heroOverlay: parseFloat(e.target.value)}))} />
            <small style={{ color:'#888', fontSize:12 }}>Lower = brighter image · Higher = more text contrast</small>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6, color:'#444' }}>Hero Background Image</label>
            {content.heroImage?.url && (
              <img src={content.heroImage.url} alt="hero" style={{ width:'100%', height:160, objectFit:'cover', borderRadius:12, marginBottom:10, border:'2px solid #f0e8d8' }} />
            )}
            <input type="file" accept="image/*" className="form-control" onChange={e => setHeroFile(e.target.files[0])} />
            {heroFile && <small style={{ color:'#2EA94B', fontWeight:600, fontSize:12, marginTop:4, display:'block' }}>✅ New image selected: {heroFile.name}</small>}
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ padding:'11px 30px', borderRadius:50, border:'none', background: saving?'#ccc':'linear-gradient(135deg,#E8001D,#c50018)', color:'white', fontWeight:700, fontSize:14, cursor: saving?'not-allowed':'pointer', boxShadow: saving?'none':'0 4px 14px rgba(232,0,29,0.3)', display:'flex', alignItems:'center', gap:8 }}>
            {saving ? <><span className="spinner-border spinner-border-sm"/> Saving...</> : '💾 Save Hero Settings'}
          </button>
        </div>
      )}

      {/* ── TAB: Announcement ── */}
      {activeTab === 'announcement' && (
        <div style={{ background:'white', borderRadius:16, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', maxWidth:700 }}>
          <h6 style={{ fontWeight:800, fontSize:16, marginBottom:8, color:'#1a1a2e' }}>📢 Top Announcement Ribbon</h6>
          <p style={{ color:'#888', fontSize:13, marginBottom:20 }}>This text appears in the red banner at the very top of every page.</p>
          <div style={{ background:'linear-gradient(90deg,#E8001D,#c50018)', borderRadius:10, padding:'10px 18px', marginBottom:20, color:'white', fontSize:13, fontWeight:600 }}>
            Preview: {content.announcementText || '🎁 Free delivery on orders above ₹500 | Use code PAKKA10 for 10% off'}
          </div>
          <Field label="Announcement Text" field="announcementText" content={content} setContent={setContent} />
          <small style={{ color:'#888', fontSize:12, display:'block', marginBottom:20 }}>Tip: Use | to separate multiple messages. Example: 🎁 Free delivery ₹500+ | Use PAKKA10 for 10% off</small>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:'11px 30px', borderRadius:50, border:'none', background: saving?'#ccc':'linear-gradient(135deg,#E8001D,#c50018)', color:'white', fontWeight:700, fontSize:14, cursor: saving?'not-allowed':'pointer', boxShadow:'0 4px 14px rgba(232,0,29,0.3)', display:'flex', alignItems:'center', gap:8 }}>
            {saving ? <><span className="spinner-border spinner-border-sm"/> Saving...</> : '💾 Save Announcement'}
          </button>
        </div>
      )}

      {/* ── TAB: Special Offers ── */}
      {activeTab === 'offers' && (
        <div style={{ maxWidth:760 }}>

          {/* Today's Special Offer */}
          <div style={{ background:'white', borderRadius:16, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:24 }}>
            <h6 style={{ fontWeight:800, fontSize:16, marginBottom:6, color:'#1a1a2e' }}>🎉 Today's Special Offer — Section Heading</h6>
            <p style={{ color:'#888', fontSize:13, marginBottom:18 }}>This controls the title and subtitle shown above today's featured deals on the homepage.</p>
            <Field label="Section Title" field="todayOfferTitle" content={content} setContent={setContent} />
            <Field label="Section Subtitle" field="todayOfferSubtitle" content={content} setContent={setContent} />
            <small style={{ color:'#888', fontSize:12, display:'block', marginBottom:16 }}>The actual products shown here come from <strong>Best Selling</strong> products you manage in the Products section.</small>
            <button onClick={handleSave} disabled={saving}
              style={{ padding:'9px 24px', borderRadius:50, border:'none', background: saving?'#ccc':'linear-gradient(135deg,#E8001D,#c50018)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 3px 10px rgba(232,0,29,0.25)' }}>
              {saving ? 'Saving...' : '💾 Save'}
            </button>
          </div>

          {/* Upcoming Special Offers */}
          <div style={{ background:'white', borderRadius:16, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 style={{ fontWeight:800, fontSize:16, marginBottom:6, color:'#1a1a2e' }}>📅 Upcoming Special Offers</h6>
            <p style={{ color:'#888', fontSize:13, marginBottom:20 }}>Add teaser cards for upcoming offers. These appear as "Coming Soon" cards.</p>

            <Field label="Section Title" field="upcomingOffersTitle" content={content} setContent={setContent} />
            <Field label="Section Subtitle" field="upcomingOffersSubtitle" content={content} setContent={setContent} />

            {/* Existing offer cards */}
            {(content.upcomingOffers||[]).length > 0 && (
              <div className="row g-2 mb-4">
                {(content.upcomingOffers||[]).map((offer, i) => (
                  <div key={i} className="col-md-4">
                    <div style={{ border:`2px solid ${offer.color||'#E8001D'}33`, borderRadius:12, padding:'14px 16px', position:'relative', background:'#fdf8f0' }}>
                      <div style={{ fontSize:'1.6rem', marginBottom:6 }}>{offer.icon}</div>
                      <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>{offer.title}</div>
                      <div style={{ fontSize:12, color:'#888' }}>{offer.description}</div>
                      <button onClick={() => {
                        const updated = (content.upcomingOffers||[]).filter((_,idx) => idx !== i);
                        setContent(p => ({...p, upcomingOffers: updated}));
                      }} style={{ position:'absolute', top:8, right:8, background:'#E8001D', border:'none', borderRadius:'50%', width:22, height:22, color:'white', fontSize:13, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new offer card */}
            <div style={{ background:'#fdf8f0', borderRadius:12, padding:18, border:'1.5px dashed #f0c070', marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'#1a1a2e' }}>➕ Add Upcoming Offer Card</div>
              <div className="row g-2">
                <div className="col-md-4">
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Title *</label>
                  <input className="form-control form-control-sm" placeholder="e.g. Festival Special" value={newOffer.title} onChange={e=>setNewOffer(p=>({...p,title:e.target.value}))} />
                </div>
                <div className="col-md-4">
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Description</label>
                  <input className="form-control form-control-sm" placeholder="Short description" value={newOffer.description} onChange={e=>setNewOffer(p=>({...p,description:e.target.value}))} />
                </div>
                <div className="col-md-2">
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Icon (emoji)</label>
                  <input className="form-control form-control-sm" placeholder="🎁" value={newOffer.icon} onChange={e=>setNewOffer(p=>({...p,icon:e.target.value}))} />
                </div>
                <div className="col-md-2">
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Color</label>
                  <input type="color" className="form-control form-control-sm" value={newOffer.color} onChange={e=>setNewOffer(p=>({...p,color:e.target.value}))} style={{ height:34, padding:2 }} />
                </div>
                <div className="col-12 mt-1">
                  <button onClick={() => {
                    if (!newOffer.title) return toast.error('Title required');
                    setContent(p => ({...p, upcomingOffers: [...(p.upcomingOffers||[]), {...newOffer}]}));
                    setNewOffer({ title:'', description:'', icon:'🎁', color:'#E8001D' });
                  }} style={{ padding:'7px 20px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#2EA94B,#1e8a3a)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    + Add Card
                  </button>
                </div>
              </div>
            </div>

            <button onClick={async () => {
              setSaving(true);
              const fd = new FormData();
              fd.append('upcomingOffersTitle', content.upcomingOffersTitle||'');
              fd.append('upcomingOffersSubtitle', content.upcomingOffersSubtitle||'');
              fd.append('upcomingOffers', JSON.stringify(content.upcomingOffers||[]));
              fd.append('todayOfferTitle', content.todayOfferTitle||'');
              fd.append('todayOfferSubtitle', content.todayOfferSubtitle||'');
              try {
                const r = await contentAPI.updateHomepage(fd);
                setContent(r.data.content);
                toast.success('Saved! ✅');
              } catch { toast.error('Failed to save'); }
              setSaving(false);
            }} disabled={saving}
              style={{ padding:'11px 30px', borderRadius:50, border:'none', background: saving?'#ccc':'linear-gradient(135deg,#E8001D,#c50018)', color:'white', fontWeight:700, fontSize:14, cursor: saving?'not-allowed':'pointer', boxShadow:'0 4px 14px rgba(232,0,29,0.3)', display:'flex', alignItems:'center', gap:8 }}>
              {saving ? <><span className="spinner-border spinner-border-sm"/> Saving...</> : '💾 Save Upcoming Offers'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Section Texts ── */}
      {activeTab === 'sections' && (
        <div style={{ background:'white', borderRadius:16, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', maxWidth:700 }}>
          <h6 style={{ fontWeight:800, fontSize:16, marginBottom:20, color:'#1a1a2e' }}>📝 Homepage Section Titles & Subtitles</h6>

          <div style={{ padding:'16px 18px', background:'#fdf8f0', borderRadius:12, marginBottom:20, borderLeft:'4px solid #FFBE00' }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>⭐ Featured / Best Selling</div>
            <Field label="Best Selling Title" field="bestSellingTitle" content={content} setContent={setContent} />
            <Field label="Best Selling Subtitle" field="bestSellingSubtitle" content={content} setContent={setContent} />
          </div>

          <div style={{ padding:'16px 18px', background:'#fff0f0', borderRadius:12, marginBottom:20, borderLeft:'4px solid #E8001D' }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>🎁 Occasions Section</div>
            <Field label="Occasions Title" field="seasonalTitle" content={content} setContent={setContent} />
            <Field label="Occasions Subtitle" field="seasonalSubtitle" content={content} setContent={setContent} />
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ padding:'11px 30px', borderRadius:50, border:'none', background: saving?'#ccc':'linear-gradient(135deg,#E8001D,#c50018)', color:'white', fontWeight:700, fontSize:14, cursor: saving?'not-allowed':'pointer', boxShadow:'0 4px 14px rgba(232,0,29,0.3)', display:'flex', alignItems:'center', gap:8 }}>
            {saving ? <><span className="spinner-border spinner-border-sm"/> Saving...</> : '💾 Save Section Texts'}
          </button>
        </div>
      )}

      {/* ── TAB: Shop Images ── */}
      {activeTab === 'shops' && (
        <div style={{ maxWidth:800 }}>
          <div style={{ background:'white', borderRadius:16, padding:24, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:24 }}>
            <h6 style={{ fontWeight:800, fontSize:16, marginBottom:6, color:'#1a1a2e' }}>🏪 Original Sweet Shops Gallery</h6>
            <p style={{ color:'#888', fontSize:13, marginBottom:20 }}>These appear in the right half of the Featured section on the homepage. Upload images of the original shops.</p>

            {/* Existing images */}
            {(content.shopImages||[]).length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#aaa', background:'#fdf8f0', borderRadius:12, marginBottom:20 }}>
                <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🏪</div>
                <div>No shop images yet. Add the first one below.</div>
              </div>
            ) : (
              <div className="row g-3 mb-4">
                {(content.shopImages||[]).map((img, i) => (
                  <div key={i} className="col-6 col-md-4" style={{ position:'relative' }}>
                    <div style={{ borderRadius:12, overflow:'hidden', border:'2px solid #f0e8d8' }}>
                      <img src={img.url} alt={img.shopName} style={{ width:'100%', height:130, objectFit:'cover' }} />
                      <div style={{ padding:'8px 10px', background:'white' }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{img.shopName}</div>
                        <div style={{ fontSize:12, color:'#888' }}>📍 {img.city}</div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveShopImage(img.publicId)}
                      style={{ position:'absolute', top:6, right:6, background:'#E8001D', border:'none', borderRadius:'50%', width:26, height:26, color:'white', fontWeight:900, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new shop image */}
            <div style={{ background:'#fdf8f0', borderRadius:12, padding:18, border:'1.5px dashed #f0c070' }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'#1a1a2e' }}>➕ Add New Shop Image</div>
              <div className="row g-2 align-items-end">
                <div className="col-md-3">
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Shop Image *</label>
                  <input type="file" accept="image/*" className="form-control form-control-sm"
                    onChange={e => setShopImgFile(e.target.files[0])} />
                  {shopImgFile && <small style={{ color:'#2EA94B', fontSize:11, marginTop:3, display:'block' }}>✅ {shopImgFile.name}</small>}
                </div>
                <div className="col-md-3">
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Shop Name *</label>
                  <input type="text" className="form-control form-control-sm" placeholder="e.g. Kakinada Kaja Shop"
                    value={shopImgData.shopName} onChange={e => setShopImgData(p => ({...p, shopName:e.target.value}))} />
                </div>
                <div className="col-md-2">
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>City</label>
                  <input type="text" className="form-control form-control-sm" placeholder="Kakinada"
                    value={shopImgData.city} onChange={e => setShopImgData(p => ({...p, city:e.target.value}))} />
                </div>
                <div className="col-md-3">
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Description</label>
                  <input type="text" className="form-control form-control-sm" placeholder="Short shop description"
                    value={shopImgData.description} onChange={e => setShopImgData(p => ({...p, description:e.target.value}))} />
                </div>
                <div className="col-md-1">
                  <button onClick={handleAddShopImage} disabled={addingShop}
                    style={{ width:'100%', padding:'7px 0', borderRadius:8, border:'none', background: addingShop?'#ccc':'linear-gradient(135deg,#2EA94B,#1e8a3a)', color:'white', fontWeight:700, fontSize:13, cursor: addingShop?'not-allowed':'pointer' }}>
                    {addingShop ? '...' : '+ Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Logo ── */}
      {activeTab === 'logo' && (
        <div style={{ background:'white', borderRadius:16, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', maxWidth:500 }}>
          <h6 style={{ fontWeight:800, fontSize:16, marginBottom:20, color:'#1a1a2e' }}>🏷️ Website Logo</h6>

          {content.logo?.url ? (
            <div style={{ background:'#1a1a2e', borderRadius:12, padding:'20px 24px', marginBottom:20, display:'inline-block' }}>
              <img src={content.logo.url} alt="logo" style={{ height:64, objectFit:'contain', display:'block' }} />
            </div>
          ) : (
            <div style={{ background:'#fdf8f0', borderRadius:12, padding:'28px', textAlign:'center', marginBottom:20, border:'1.5px dashed #f0c070' }}>
              <div style={{ fontSize:'2rem', marginBottom:8 }}>🏷️</div>
              <div style={{ color:'#aaa', fontSize:14 }}>No logo uploaded yet</div>
            </div>
          )}

          <div style={{ marginBottom:20 }}>
            <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:8, color:'#444' }}>Upload New Logo</label>
            <input type="file" accept="image/*" className="form-control" onChange={e => setLogoFile(e.target.files[0])} />
            {logoFile && <small style={{ color:'#2EA94B', fontWeight:600, fontSize:12, marginTop:4, display:'block' }}>✅ Selected: {logoFile.name}</small>}
            <small style={{ color:'#888', fontSize:12, marginTop:4, display:'block' }}>PNG with transparent background recommended for best results</small>
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ padding:'11px 30px', borderRadius:50, border:'none', background: saving?'#ccc':'linear-gradient(135deg,#E8001D,#c50018)', color:'white', fontWeight:700, fontSize:14, cursor: saving?'not-allowed':'pointer', boxShadow:'0 4px 14px rgba(232,0,29,0.3)', display:'flex', alignItems:'center', gap:8 }}>
            {saving ? <><span className="spinner-border spinner-border-sm"/> Saving...</> : '💾 Save Logo'}
          </button>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminContent;
