import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { packingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const CATEGORIES = ['Corporate Gifting','NRI Packing','Birthday','Wedding','Festival','Other'];
const emptyForm = () => ({ name:'', description:'', price:0, category:'Corporate Gifting', order:0, isActive:true });

const AdminPackings = () => {
  const [list, setList]         = useState([]);
  const [form, setForm]         = useState(emptyForm());
  const [editId, setEditId]     = useState(null);
  const [imgFile, setImgFile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  const load = async () => {
    setLoading(true);
    try { const r = await packingAPI.adminGetAll(); setList(r.data.packings || []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(emptyForm()); setEditId(null); setImgFile(null); setShowForm(true); };
  const openEdit = p => { setForm({ name:p.name, description:p.description||'', price:p.price||0, category:p.category, order:p.order||0, isActive:p.isActive }); setEditId(p._id); setImgFile(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm()); setImgFile(null); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (imgFile) fd.append('image', imgFile);
      editId ? await packingAPI.update(editId, fd) : await packingAPI.create(fd);
      toast.success(editId ? 'Updated!' : 'Created!');
      closeForm(); load();
    } catch(e) { toast.error(e?.response?.data?.message||'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this packing?')) return;
    try { await packingAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const toggleActive = async p => {
    try { const fd = new FormData(); fd.append('isActive', !p.isActive); await packingAPI.update(p._id, fd); load(); }
    catch { toast.error('Update failed'); }
  };

  const f = field => ({ value:form[field], onChange:e => setForm(p=>({...p,[field]:e.target.value})) });
  const inp = { width:'100%', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'10px 14px', fontSize:14, outline:'none', color:'#1A1A1A', fontFamily:'Poppins,sans-serif' };
  const lbl = { fontSize:11.5, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:1, marginBottom:5, display:'block', fontFamily:'Poppins,sans-serif' };

  const displayed = filterCat === 'All' ? list : list.filter(p => p.category === filterCat);

  return (
    <AdminLayout>
      <div style={{ padding:'28px 24px', maxWidth:960 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#FFD84D,#FF4C29)', display:'flex', alignItems:'center', justifyContent:'center', color:'#1A1A1A', fontSize:16 }}><FaBoxOpen /></div>
              <h4 style={{ margin:0, fontWeight:800, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>Packing Products</h4>
            </div>
            <p style={{ margin:0, color:'#6B7280', fontSize:13, fontFamily:'Poppins,sans-serif' }}>
              Manage packings for occasions · {list.length} total
            </p>
          </div>
          <button onClick={openAdd} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)', color:'#1A1A1A', border:'none', borderRadius:10, padding:'10px 22px', fontWeight:700, fontSize:14, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Poppins,sans-serif', boxShadow:'0 4px 16px rgba(255,216,77,.4)' }}>
            <FaPlus size={12}/> Add Packing
          </button>
        </div>

        {/* Category filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ padding:'6px 14px', borderRadius:50, border:'1.5px solid', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins,sans-serif', transition:'all .2s',
                background: filterCat===c ? '#FFD84D' : 'white',
                borderColor: filterCat===c ? '#F5C800' : '#E5E7EB',
                color: filterCat===c ? '#1A1A1A' : '#6B7280',
              }}>
              {c} {c !== 'All' && `(${list.filter(p => p.category === c).length})`}
            </button>
          ))}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.22)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
                <h5 style={{ margin:0, fontWeight:800, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{editId ? '✏️ Edit Packing' : '📦 New Packing'}</h5>
                <button onClick={closeForm} style={{ background:'#F3F4F6', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, color:'#6B7280' }}>✕</button>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Packing Name *</label>
                <input style={inp} placeholder="e.g. Premium Corporate Box" {...f('name')} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Description</label>
                <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} placeholder="Describe what's included..." {...f('description')} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Category</label>
                  <select style={inp} value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Price (₹, 0 = free)</label>
                  <input style={inp} type="number" min="0" {...f('price')} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Display Order</label>
                  <input style={inp} type="number" min="0" {...f('order')} />
                </div>
                <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:14, fontWeight:600, color:'#374151' }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p=>({...p,isActive:e.target.checked}))} style={{ width:16, height:16, accentColor:'#FFD84D' }} />
                    Active / Visible
                  </label>
                </div>
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={lbl}>Packing Image</label>
                <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0])} style={{ fontSize:13, color:'#374151', display:'block' }} />
                {editId && !imgFile && <p style={{ fontSize:11.5, color:'#9CA3AF', marginTop:4, marginBottom:0 }}>Leave blank to keep existing image</p>}
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button onClick={closeForm} style={{ background:'#F9FAFB', color:'#374151', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'10px 20px', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'Poppins,sans-serif' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)', color:'#1A1A1A', border:'none', borderRadius:10, padding:'10px 24px', fontWeight:700, fontSize:14, cursor:'pointer', opacity:saving?0.7:1, display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Poppins,sans-serif' }}>
                  {saving?'⏳ Saving…':(editId?'✅ Update':'➕ Add')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF', fontFamily:'Poppins,sans-serif' }}>Loading…</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign:'center', padding:'56px 24px', background:'#fff', borderRadius:16, border:'2px dashed #E5E7EB' }}>
            <div style={{ fontSize:48, marginBottom:14, opacity:0.4 }}>📦</div>
            <div style={{ fontWeight:700, color:'#374151', fontSize:16, marginBottom:8, fontFamily:'Poppins,sans-serif' }}>No packings yet</div>
            <div style={{ color:'#9CA3AF', fontSize:13, marginBottom:24 }}>Add your first packing product for customers to order</div>
            <button onClick={openAdd} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)', color:'#1A1A1A', border:'none', borderRadius:10, padding:'10px 22px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'Poppins,sans-serif' }}><FaPlus size={12} style={{ marginRight:6 }}/>Add First Packing</button>
          </div>
        ) : (
          <div className="row g-3">
            {displayed.map(p => (
              <div key={p._id} className="col-12 col-md-6">
                <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid #F3F4F6', boxShadow:'0 2px 14px rgba(0,0,0,.06)', overflow:'hidden', opacity:p.isActive?1:0.55, transition:'opacity .2s' }}>
                  <div style={{ display:'flex', gap:0 }}>
                    {/* Image */}
                    <div style={{ width:100, flexShrink:0, background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {p.image?.url
                        ? <img src={p.image.url} alt={p.name} style={{ width:'100%', height:100, objectFit:'contain' }} />
                        : <div style={{ fontSize:'2.5rem', opacity:0.4 }}>📦</div>}
                    </div>
                    {/* Content */}
                    <div style={{ flex:1, padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14.5, color:'#1A1A1A', fontFamily:'Poppins,sans-serif', marginBottom:3 }}>{p.name}</div>
                          <span style={{ background:'#FFFBEB', color:'#8B6800', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:50, border:'1px solid rgba(255,216,77,.4)', fontFamily:'Poppins,sans-serif' }}>{p.category}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                          <button onClick={() => toggleActive(p)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:p.isActive?'#4CAF50':'#D1D5DB' }}>{p.isActive?<FaToggleOn/>:<FaToggleOff/>}</button>
                          <button onClick={() => openEdit(p)} style={{ background:'#FFFBEB', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#8B6800', display:'flex', alignItems:'center', justifyContent:'center' }}><FaEdit size={13}/></button>
                          <button onClick={() => handleDelete(p._id)} style={{ background:'#FFF0EC', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#FF4C29', display:'flex', alignItems:'center', justifyContent:'center' }}><FaTrash size={12}/></button>
                        </div>
                      </div>
                      {p.description && <div style={{ fontSize:12, color:'#6B7280', marginTop:6, lineHeight:1.5 }}>{p.description}</div>}
                      {p.price > 0 && <div style={{ fontSize:15, fontWeight:800, color:'#FF4C29', marginTop:6, fontFamily:'Poppins,sans-serif' }}>₹{p.price}</div>}
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
