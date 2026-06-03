import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { packingAPI, occasionAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTimes } from 'react-icons/fa';

const AdminPackings = () => {
  const [list,      setList]      = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [show,      setShow]      = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [imgFile,   setImgFile]   = useState(null);
  const [filterOcc, setFilterOcc] = useState('all');
  const [form, setForm] = useState({ occasionId:'', name:'', description:'', price:0, totalQuantity:0, order:0, isActive:true, sweets:[] });
  const [selProd, setSelProd] = useState('');
  const [selQty,  setSelQty]  = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const [pR, oR, prR] = await Promise.all([
        packingAPI.adminGetAll(),
        occasionAPI.adminGetAll(),
        productAPI.getAll({ limit:200 }),
      ]);
      setList(pR.data.packings || []);
      setOccasions(oR.data.occasions || []);
      setProducts(prR.data.products || []);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ occasionId:occasions[0]?._id||'', name:'', description:'', price:0, totalQuantity:0, order:0, isActive:true, sweets:[] });
    setEditId(null); setImgFile(null); setSelProd(''); setSelQty(1); setShow(true);
  };
  const openEdit = p => {
    const oid = typeof p.occasionId === 'object' ? p.occasionId?._id : p.occasionId;
    setForm({ occasionId:oid||'', name:p.name, description:p.description||'', price:p.price||0, totalQuantity:p.totalQuantity||0, order:p.order||0, isActive:p.isActive, sweets:p.sweets||[] });
    setEditId(p._id); setImgFile(null); setSelProd(''); setSelQty(1); setShow(true);
  };
  const closeForm = () => { setShow(false); setEditId(null); setImgFile(null); };

  const addSweet = () => {
    if (!selProd) return;
    const prod = products.find(p => p._id === selProd);
    if (!prod) return;
    if (form.sweets.find(s => s.productId === selProd)) { toast.error('Already added'); return; }
    const pricePerKg = prod.weightPrices?.[0]?.price || prod.price || 0;
    setForm(f => ({ ...f, sweets:[...f.sweets, { productId:prod._id, name:prod.name, quantity:selQty, unit:'kg', pricePerKg }] }));
    setSelProd(''); setSelQty(1);
  };
  const removeSweet = i => setForm(f => ({ ...f, sweets:f.sweets.filter((_,idx)=>idx!==i) }));
  const updateQty   = (i,v) => setForm(f => ({ ...f, sweets:f.sweets.map((s,idx)=>idx===i?{...s,quantity:parseFloat(v)||1}:s) }));
  const autoPrice = form.sweets.reduce((s,x) => s + (x.pricePerKg||0)*x.quantity, 0);

  const save = async () => {
    if (!form.name.trim() || !form.occasionId) { toast.error('Name and occasion required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('occasionId', form.occasionId);
      ['name','description','order','isActive'].forEach(k => fd.append(k, form[k]));
      fd.append('price', form.price > 0 ? form.price : autoPrice);
      fd.append('totalQuantity', form.totalQuantity);
      fd.append('sweets', JSON.stringify(form.sweets));
      if (imgFile) fd.append('image', imgFile);
      editId ? await packingAPI.update(editId,fd) : await packingAPI.create(fd);
      toast.success(editId ? 'Updated!' : 'Package created!');
      closeForm(); load();
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async id => {
    if (!window.confirm('Delete this package?')) return;
    try { await packingAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };
  const toggle = async p => {
    try { const fd = new FormData(); fd.append('isActive', !p.isActive); await packingAPI.update(p._id,fd); load(); }
    catch { toast.error('Failed'); }
  };

  const displayed = filterOcc === 'all' ? list : list.filter(p => {
    const oid = typeof p.occasionId === 'object' ? p.occasionId?._id : p.occasionId;
    return oid === filterOcc;
  });

  const S = {
    inp: { border:'1.5px solid #E5E7EB', borderRadius:8, padding:'9px 13px', fontSize:13.5, outline:'none', color:'#1A1A1A', fontFamily:'Poppins,sans-serif', width:'100%', background:'white' },
    lbl: { fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:.8, marginBottom:5, display:'block', fontFamily:'Poppins,sans-serif' },
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth:960 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, color:'#1A1A1A', margin:'0 0 4px', fontSize:22 }}>Packages</h2>
            <p style={{ color:'#9CA3AF', fontSize:13, margin:0 }}>Packages linked to occasions · {list.length} total</p>
          </div>
          <button className="btn-primary-admin" onClick={openAdd} disabled={occasions.length===0}>
            <FaPlus size={12}/> Add Package
          </button>
        </div>

        {occasions.length === 0 && !loading && (
          <div style={{ background:'#FFF8EC', borderRadius:12, padding:'14px 18px', border:'1px solid rgba(255,216,77,.5)', marginBottom:20, fontFamily:'Poppins,sans-serif', fontSize:13 }}>
            ⚠️ <strong>No occasions found.</strong> Go to <a href="/occasions" style={{ color:'#FF4C29', fontWeight:700 }}>Occasions</a> and create at least one before adding packages.
          </div>
        )}

        {/* Occasion filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
          <button onClick={() => setFilterOcc('all')} style={{ padding:'6px 14px', borderRadius:50, border:'1.5px solid', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins,sans-serif', background:filterOcc==='all'?'#FFD84D':'white', borderColor:filterOcc==='all'?'#F5C800':'#E5E7EB', color:filterOcc==='all'?'#1A1A1A':'#6B7280' }}>
            All ({list.length})
          </button>
          {occasions.map(o => {
            const cnt = list.filter(p => (typeof p.occasionId==='object'?p.occasionId?._id:p.occasionId) === o._id).length;
            return (
              <button key={o._id} onClick={() => setFilterOcc(o._id)} style={{ padding:'6px 14px', borderRadius:50, border:'1.5px solid', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins,sans-serif', background:filterOcc===o._id?'#FFD84D':'white', borderColor:filterOcc===o._id?'#F5C800':'#E5E7EB', color:filterOcc===o._id?'#1A1A1A':'#6B7280' }}>
                {o.emoji} {o.title} ({cnt})
              </button>
            );
          })}
        </div>

        {/* Modal */}
        {show && (
          <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&closeForm()}>
            <div className="modal-box" style={{ maxWidth:620 }}>
              <div className="modal-header">
                <div>
                  <h5 style={{ margin:0, fontWeight:800, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{editId?'✏️ Edit Package':'📦 New Package'}</h5>
                  <p style={{ margin:'2px 0 0', fontSize:12, color:'#9CA3AF' }}>Link this package to an occasion</p>
                </div>
                <button className="modal-close-btn" onClick={closeForm}><FaTimes size={13}/></button>
              </div>
              <div className="modal-body">
                {/* Row 1: Occasion + Name */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={S.lbl}>Occasion *</label>
                    <select style={S.inp} value={form.occasionId} onChange={e => setForm(f=>({...f,occasionId:e.target.value}))}>
                      <option value="">— Select occasion —</option>
                      {occasions.map(o => <option key={o._id} value={o._id}>{o.emoji} {o.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.lbl}>Package Name *</label>
                    <input style={S.inp} placeholder="e.g. Premium Mix Box" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom:14 }}>
                  <label style={S.lbl}>Description</label>
                  <textarea style={{...S.inp,minHeight:68,resize:'vertical'}} placeholder="What's included..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
                </div>

                {/* Sweets builder */}
                <div style={{ background:'#F9FAFB', borderRadius:12, padding:'14px 16px', border:'1.5px solid #F3F4F6', marginBottom:14 }}>
                  <label style={{...S.lbl, marginBottom:10}}>🍬 Select Sweets</label>

                  {form.sweets.map((s,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'white', borderRadius:8, marginBottom:6, border:'1px solid #E5E7EB' }}>
                      <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#1A1A1A' }}>🍬 {s.name}</span>
                      <input type="number" min=".25" step=".25" value={s.quantity} onChange={e=>updateQty(i,e.target.value)}
                        style={{ width:60, border:'1.5px solid #E5E7EB', borderRadius:6, padding:'5px 8px', fontSize:13, textAlign:'center', fontFamily:'Poppins,sans-serif', outline:'none' }}/>
                      <span style={{ fontSize:11, color:'#9CA3AF' }}>kg</span>
                      <span style={{ fontSize:12, fontWeight:700, color:'#4CAF50', minWidth:54, textAlign:'right' }}>₹{((s.pricePerKg||0)*s.quantity).toFixed(0)}</span>
                      <button onClick={()=>removeSweet(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#FF4C29', fontSize:16 }}>✕</button>
                    </div>
                  ))}

                  {form.sweets.length > 0 && (
                    <div style={{ textAlign:'right', fontWeight:700, fontSize:13, color:'#1A1A1A', padding:'4px 12px' }}>
                      Auto Price: <span style={{ color:'#FF4C29' }}>₹{autoPrice.toFixed(0)}</span>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap', alignItems:'center' }}>
                    <select value={selProd} onChange={e=>setSelProd(e.target.value)} style={{ flex:2, minWidth:160, ...S.inp }}>
                      <option value="">— Choose sweet —</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.weightPrices?.[0]?.price||p.price||0}/kg</option>)}
                    </select>
                    <input type="number" min=".25" step=".25" value={selQty} onChange={e=>setSelQty(parseFloat(e.target.value)||1)} style={{ width:70, ...S.inp }}/>
                    <span style={{ fontSize:11, color:'#9CA3AF', fontWeight:600, whiteSpace:'nowrap' }}>kg</span>
                    <button type="button" onClick={addSweet} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)', color:'#1A1A1A', border:'none', borderRadius:8, padding:'9px 14px', fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>+ Add</button>
                  </div>
                </div>

                {/* Price / qty / order */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <label style={S.lbl}>Total Weight (kg)</label>
                    <input style={S.inp} type="number" min="0" step=".5" value={form.totalQuantity} onChange={e=>setForm(f=>({...f,totalQuantity:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={S.lbl}>Override Price (₹)</label>
                    <input style={S.inp} type="number" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder={autoPrice>0?`Auto: ₹${autoPrice.toFixed(0)}`:'0 = auto'}/>
                    <p style={{ fontSize:10, color:'#9CA3AF', marginTop:2, marginBottom:0 }}>0 = use auto-calculated</p>
                  </div>
                  <div>
                    <label style={S.lbl}>Display Order</label>
                    <input style={S.inp} type="number" min="0" value={form.order} onChange={e=>setForm(f=>({...f,order:e.target.value}))}/>
                  </div>
                </div>

                {/* Image */}
                <div style={{ marginBottom:14 }}>
                  <label style={S.lbl}>Package Image</label>
                  <input type="file" accept="image/*" onChange={e=>setImgFile(e.target.files[0])} style={{ fontSize:13, color:'#374151', display:'block' }}/>
                  {editId && !imgFile && <p style={{ fontSize:11, color:'#9CA3AF', marginTop:3, marginBottom:0 }}>Leave blank to keep existing image</p>}
                </div>

                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:14, color:'#374151', fontWeight:600 }}>
                  <input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} style={{ width:16, height:16, accentColor:'#FFD84D' }}/>
                  Active (visible to customers)
                </label>
              </div>
              <div className="modal-footer">
                <button className="btn-ghost-admin" onClick={closeForm}>Cancel</button>
                <button className="btn-primary-admin" onClick={save} disabled={saving}>{saving?'Saving…':(editId?'Update Package':'Add Package')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Package list */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}><div className="spinner-border"/></div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h6>No packages</h6>
            <p>{occasions.length === 0 ? 'Create an occasion first, then add packages' : 'Add packages linked to occasions'}</p>
            {occasions.length > 0 && <button className="btn-primary-admin" onClick={openAdd}><FaPlus size={12}/> Add Package</button>}
          </div>
        ) : (
          <div className="row g-3">
            {displayed.map(p => (
              <div key={p._id} className="col-12 col-md-6">
                <div style={{ background:'white', borderRadius:14, border:'1.5px solid #F3F4F6', boxShadow:'0 2px 8px rgba(0,0,0,.05)', overflow:'hidden', opacity:p.isActive?1:.55 }}>
                  <div style={{ display:'flex' }}>
                    <div style={{ width:90, flexShrink:0, background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', minHeight:90 }}>
                      {p.image?.url ? <img src={p.image.url} alt={p.name} style={{ width:'100%', height:90, objectFit:'contain' }}/> : <div style={{ fontSize:'2.5rem', opacity:.3 }}>📦</div>}
                    </div>
                    <div style={{ flex:1, padding:'12px 14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14, color:'#1A1A1A', fontFamily:'Poppins,sans-serif', marginBottom:3 }}>{p.name}</div>
                          <span style={{ background:'#FFFBEB', color:'#8B6800', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:50, border:'1px solid rgba(255,216,77,.4)' }}>
                            {p.occasionTitle || 'Unknown occasion'}
                          </span>
                        </div>
                        <div style={{ display:'flex', gap:3, flexShrink:0 }}>
                          <button className="toggle-btn" onClick={()=>toggle(p)} style={{ color:p.isActive?'#4CAF50':'#D1D5DB', fontSize:20 }}>{p.isActive?<FaToggleOn/>:<FaToggleOff/>}</button>
                          <button className="action-btn action-edit" onClick={()=>openEdit(p)}><FaEdit size={12}/></button>
                          <button className="action-btn action-delete" onClick={()=>remove(p._id)}><FaTrash size={11}/></button>
                        </div>
                      </div>
                      {p.sweets?.length > 0 && (
                        <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:3 }}>
                          {p.sweets.slice(0,3).map((s,i) => <span key={i} style={{ background:'#F9FAFB', color:'#374151', fontSize:10, padding:'2px 7px', borderRadius:50, border:'1px solid #E5E7EB' }}>🍬 {s.name}×{s.quantity}kg</span>)}
                          {p.sweets.length > 3 && <span style={{ fontSize:10, color:'#9CA3AF' }}>+{p.sweets.length-3}</span>}
                        </div>
                      )}
                      {p.price > 0 && <div style={{ fontSize:15, fontWeight:800, color:'#FF4C29', marginTop:5 }}>₹{p.price}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default AdminPackings;
