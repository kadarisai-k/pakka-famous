import React, { useState, useEffect, useRef } from 'react';
import { productAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminSectionPicker = ({ title, emoji, flagField, fetchFn, color = '#FFBE00', description }) => {
  const [sectionItems, setSectionItems] = useState([]);
  const [allProducts,  setAllProducts]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(null);
  const [showPicker,   setShowPicker]   = useState(false);
  const [search,       setSearch]       = useState('');

  // Stable ref so loadData never triggers an infinite loop
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => { fetchFnRef.current = fetchFn; }, [fetchFn]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [secRes, allRes] = await Promise.all([
        fetchFnRef.current(),
        productAPI.getAll({ limit: 200 }),
      ]);
      setSectionItems(secRes.data.products || []);
      setAllProducts(allRes.data.products || []);
    } catch (e) {
      console.error('AdminSectionPicker loadData error:', e);
      toast.error('Failed to load products');
    }
    setLoading(false);
  };

  // Only run once on mount
  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sectionIds = new Set(sectionItems.map(p => p._id));

  const addToSection = async (product) => {
    setSaving(product._id);
    try {
      await productAPI.updateFlags(product._id, { [flagField]: true });
      toast.success(`Added to ${title}! ✅`);
      await loadData();
      // Keep picker open so admin can add more
    } catch (e) {
      console.error(e);
      toast.error('Failed to add — check console');
    }
    setSaving(null);
  };

  const removeFromSection = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from ${title}?`)) return;
    setSaving(product._id);
    try {
      await productAPI.updateFlags(product._id, { [flagField]: false });
      toast.success('Removed');
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to remove');
    }
    setSaving(null);
  };

  const available = allProducts.filter(p =>
    !sectionIds.has(p._id) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.city.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <AdminLayout title={`${emoji} ${title}`}>
      <div className="text-center py-5"><div className="spinner-border" style={{ color }} /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title={`${emoji} ${title}`}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 style={{ fontWeight:800, color:'#1a1a2e', marginBottom:4 }}>{emoji} {title}</h4>
          <p style={{ color:'#888', fontSize:13, marginBottom:0 }}>{description}</p>
        </div>
        <button
          onClick={() => { setShowPicker(true); setSearch(''); }}
          style={{ padding:'10px 22px', borderRadius:50, border:'none', background:color, color:'#1a1a2e', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:`0 4px 14px ${color}66` }}
        >
          <FaPlus size={12}/> Add Sweet
        </button>
      </div>

      {/* Count badge */}
      <div style={{ marginBottom:20 }}>
        <span style={{ background:`${color}22`, color, fontWeight:700, fontSize:13, padding:'4px 14px', borderRadius:50, border:`1px solid ${color}44` }}>
          {sectionItems.length} sweet{sectionItems.length !== 1 ? 's' : ''} in this section
        </span>
      </div>

      {/* Grid */}
      {sectionItems.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', background:'white', borderRadius:16, border:'2px dashed #f0e8d8' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:12 }}>{emoji}</div>
          <p style={{ color:'#aaa', fontSize:15 }}>No sweets in this section yet.</p>
          <button onClick={() => { setShowPicker(true); setSearch(''); }}
            style={{ padding:'10px 28px', borderRadius:50, border:'none', background:color, color:'#1a1a2e', fontWeight:700, cursor:'pointer' }}>
            + Add your first sweet
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:16 }}>
          {sectionItems.map((p, idx) => (
            <div key={p._id} style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', border:`2px solid ${color}33`, position:'relative' }}>
              <div style={{ position:'absolute', top:10, left:10, zIndex:2, background:color, color:'#1a1a2e', fontWeight:800, fontSize:12, width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
                <div style={{ fontSize:12, color:'#aaa' }}>📍 {p.city}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#E8001D', marginTop:6 }}>₹{p.weightPrices?.[0]?.price ?? p.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Picker Modal ── */}
      {showPicker && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)' }} onClick={() => setShowPicker(false)}/>
          <div style={{ position:'relative', background:'white', borderRadius:20, width:'min(640px,95vw)', maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
              <h5 style={{ fontWeight:800, margin:0 }}>Add Sweet to {title}</h5>
              <p style={{ color:'#888', fontSize:13, margin:'6px 0 0' }}>{available.length} product{available.length !== 1 ? 's' : ''} available to add</p>
            </div>
            <div style={{ padding:'14px 24px', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
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
                  {search ? 'No products match your search.' : 'All products are already in this section!'}
                </div>
              ) : available.map(p => (
                <div key={p._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0', borderBottom:'1px solid #f5f5f5' }}>
                  <div style={{ width:52, height:52, borderRadius:12, overflow:'hidden', flexShrink:0, background:'#fff3e0' }}>
                    {p.image?.url ? <img src={p.image.url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>🍬</div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:'#aaa' }}>📍 {p.city} · ₹{p.weightPrices?.[0]?.price ?? p.price}</div>
                  </div>
                  <button onClick={() => addToSection(p)} disabled={saving === p._id}
                    style={{ padding:'8px 18px', borderRadius:50, border:'none', background: saving === p._id ? '#eee' : color, color:'#1a1a2e', fontWeight:700, fontSize:13, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:6 }}>
                    {saving === p._id
                      ? <span className="spinner-border spinner-border-sm" style={{ width:12, height:12 }}/>
                      : <><FaPlus size={10}/> Add</>
                    }
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #f0f0f0', flexShrink:0, display:'flex', justifyContent:'flex-end' }}>
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

export default AdminSectionPicker;
