import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { occasionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTimes } from 'react-icons/fa';

const EMOJIS = ['🎁','💼','✈️','🎂','💍','🎊','🏢','🌸','🥳','💐','🪔','🎆','🎓','🌺','🏖️'];

const AdminOccasions = () => {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [show,    setShow]    = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [form, setForm] = useState({ title:'', description:'', emoji:'🎁', order:0, isActive:true });

  const load = async () => {
    setLoading(true);
    try { const r = await occasionAPI.adminGetAll(); setList(r.data.occasions || []); }
    catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ title:'', description:'', emoji:'🎁', order:0, isActive:true });
    setEditId(null); setImgFile(null); setShow(true);
  };
  const openEdit = o => {
    setForm({ title:o.title, description:o.description||'', emoji:o.emoji||'🎁', order:o.order||0, isActive:o.isActive });
    setEditId(o._id); setImgFile(null); setShow(true);
  };
  const closeForm = () => { setShow(false); setEditId(null); setImgFile(null); };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imgFile) fd.append('image', imgFile);
      editId ? await occasionAPI.update(editId, fd) : await occasionAPI.create(fd);
      toast.success(editId ? 'Updated!' : 'Occasion created!');
      closeForm(); load();
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async id => {
    if (!window.confirm('Delete this occasion and ALL its packages?')) return;
    try { await occasionAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const toggle = async o => {
    try { const fd = new FormData(); fd.append('isActive', !o.isActive); await occasionAPI.update(o._id, fd); load(); }
    catch { toast.error('Failed'); }
  };

  const S = {
    inp: { border:'1.5px solid #E5E7EB', borderRadius:8, padding:'9px 13px', fontSize:13.5, outline:'none', color:'#1A1A1A', fontFamily:'Poppins,sans-serif', width:'100%', background:'white' },
    lbl: { fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:.8, marginBottom:5, display:'block', fontFamily:'Poppins,sans-serif' },
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth:900 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, color:'#1A1A1A', margin:'0 0 4px', fontSize:22 }}>Occasions</h2>
            <p style={{ color:'#9CA3AF', fontSize:13, margin:0 }}>
              Manage homepage occasion cards — fully dynamic, no hardcoding · {list.length} total
            </p>
          </div>
          <button className="btn-primary-admin" onClick={openAdd}><FaPlus size={12}/> Add Occasion</button>
        </div>

        {/* Modal */}
        {show && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeForm()}>
            <div className="modal-box" style={{ maxWidth:520 }}>
              <div className="modal-header">
                <div>
                  <h5 style={{ margin:0, fontWeight:800, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>
                    {editId ? '✏️ Edit Occasion' : '🎁 New Occasion'}
                  </h5>
                  <p style={{ margin:'2px 0 0', fontSize:12, color:'#9CA3AF' }}>Appears as a card on the homepage</p>
                </div>
                <button className="modal-close-btn" onClick={closeForm}><FaTimes size={13}/></button>
              </div>
              <div className="modal-body">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div>
                    <label style={S.lbl}>Title *</label>
                    <input style={S.inp} placeholder="e.g. NRI Packing" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={S.lbl}>Display Order</label>
                    <input style={S.inp} type="number" min="0" value={form.order} onChange={e => setForm(f => ({...f, order:e.target.value}))}/>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={S.lbl}>Description</label>
                  <textarea style={{...S.inp, minHeight:72, resize:'vertical'}} placeholder="Short description for this occasion..." value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))}/>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={S.lbl}>Emoji Icon</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:6 }}>
                    {EMOJIS.map(e => (
                      <button key={e} type="button" onClick={() => setForm(f => ({...f, emoji:e}))}
                        style={{ width:38, height:38, borderRadius:8, border:`2px solid ${form.emoji===e?'#FFD84D':'#E5E7EB'}`, background:form.emoji===e?'#FFFBEB':'white', fontSize:18, cursor:'pointer' }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={S.lbl}>Background Image</label>
                  <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0])} style={{ fontSize:13, color:'#374151', display:'block' }}/>
                  {editId && !imgFile && <p style={{ fontSize:11, color:'#9CA3AF', marginTop:3, marginBottom:0 }}>Leave blank to keep existing image</p>}
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:14, color:'#374151', fontWeight:600 }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive:e.target.checked}))} style={{ width:16, height:16, accentColor:'#FFD84D' }}/>
                  Active (visible on homepage)
                </label>
              </div>
              <div className="modal-footer">
                <button className="btn-ghost-admin" onClick={closeForm}>Cancel</button>
                <button className="btn-primary-admin" onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : (editId ? 'Update' : 'Add Occasion')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}><div className="spinner-border"/></div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <h6>No occasions yet</h6>
            <p>Add occasions — they appear as clickable cards on the homepage</p>
            <button className="btn-primary-admin" onClick={openAdd}><FaPlus size={12}/> Add Occasion</button>
          </div>
        ) : (
          <div className="row g-3">
            {list.map(o => (
              <div key={o._id} className="col-12 col-md-6">
                <div style={{ background:'white', borderRadius:14, border:'1.5px solid #F3F4F6', boxShadow:'0 2px 8px rgba(0,0,0,.05)', overflow:'hidden', opacity:o.isActive?1:.55 }}>
                  <div style={{ display:'flex' }}>
                    <div style={{ width:90, flexShrink:0, background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', minHeight:90 }}>
                      {o.image?.url
                        ? <img src={o.image.url} alt={o.title} style={{ width:'100%', height:90, objectFit:'cover' }}/>
                        : <div style={{ fontSize:'2.5rem' }}>{o.emoji||'🎁'}</div>}
                    </div>
                    <div style={{ flex:1, padding:'14px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15, color:'#1A1A1A', fontFamily:'Poppins,sans-serif', marginBottom:3 }}>{o.emoji} {o.title}</div>
                          {o.description && <div style={{ fontSize:12, color:'#6B7280', lineHeight:1.5 }}>{o.description}</div>}
                          {!o.isActive && <span style={{ background:'#F3F4F6', color:'#9CA3AF', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:50, display:'inline-block', marginTop:4 }}>Hidden</span>}
                        </div>
                        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                          <button className="toggle-btn" onClick={() => toggle(o)} style={{ color:o.isActive?'#4CAF50':'#D1D5DB', fontSize:20 }}>{o.isActive?<FaToggleOn/>:<FaToggleOff/>}</button>
                          <button className="action-btn action-edit" onClick={() => openEdit(o)}><FaEdit size={12}/></button>
                          <button className="action-btn action-delete" onClick={() => remove(o._id)}><FaTrash size={11}/></button>
                        </div>
                      </div>
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
export default AdminOccasions;
