import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout'
import { testimonialAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaQuoteLeft, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const emptyForm = () => ({ name:'', review:'', rating:5, designation:'', isActive:true, order:0 });

const StarPicker = ({ value, onChange }) => (
  <div style={{ display:'flex', gap:6 }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        style={{ background:'none', border:'none', padding:0, cursor:'pointer', fontSize:26,
          color: n<=value ? '#FFD84D' : '#D1D5DB', transition:'color .15s, transform .15s' }}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>★</button>
    ))}
  </div>
);
const Stars = ({ n }) => <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color:i<=n?'#FFD84D':'#D1D5DB', fontSize:13 }}>★</span>)}</span>;

const AdminTestimonials = () => {
  const [list, setList]         = useState([]);
  const [form, setForm]         = useState(emptyForm());
  const [editId, setEditId]     = useState(null);
  const [imgFile, setImgFile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await testimonialAPI.adminGetAll(); setList(r.data.testimonials || []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(emptyForm()); setEditId(null); setImgFile(null); setShowForm(true); };
  const openEdit = t => { setForm({ name:t.name,review:t.review,rating:t.rating,designation:t.designation||'',isActive:t.isActive,order:t.order||0 }); setEditId(t._id); setImgFile(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm()); setImgFile(null); };

  const handleSave = async () => {
    if (!form.name.trim()||!form.review.trim()) { toast.error('Name and review required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (imgFile) fd.append('profileImage', imgFile);
      editId ? await testimonialAPI.update(editId, fd) : await testimonialAPI.create(fd);
      toast.success(editId ? 'Updated!' : 'Added!');
      closeForm(); load();
    } catch(e) { toast.error(e?.response?.data?.message||'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this testimonial?')) return;
    try { await testimonialAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const toggleActive = async t => {
    try { const fd = new FormData(); fd.append('isActive', !t.isActive); await testimonialAPI.update(t._id, fd); load(); }
    catch { toast.error('Update failed'); }
  };

  const f = field => ({ value:form[field], onChange:e => setForm(p=>({...p,[field]:e.target.value})) });
  const inp  = { width:'100%', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'10px 14px', fontSize:14, outline:'none', color:'#1A1A1A', fontFamily:'Poppins,sans-serif' };
  const lbl  = { fontSize:11.5, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:1, marginBottom:5, display:'block', fontFamily:'Poppins,sans-serif' };

  return (
    <AdminLayout>
      <div style={{ padding:'28px 24px', maxWidth:920 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#FFD84D,#FF4C29)', display:'flex', alignItems:'center', justifyContent:'center', color:'#1A1A1A', fontSize:15 }}><FaQuoteLeft /></div>
              <h4 style={{ margin:0, fontWeight:800, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>Testimonials</h4>
            </div>
            <p style={{ margin:0, color:'#6B7280', fontSize:13, fontFamily:'Poppins,sans-serif' }}>Manage customer reviews · {list.filter(t=>t.isActive).length} visible on homepage</p>
          </div>
          <button onClick={openAdd} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)', color:'#1A1A1A', border:'none', borderRadius:10, padding:'10px 22px', fontWeight:700, fontSize:14, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Poppins,sans-serif', boxShadow:'0 4px 16px rgba(255,216,77,.4)' }}>
            <FaPlus size={12}/> Add Testimonial
          </button>
        </div>

        {/* Stats */}
        {list.length>0 && (
          <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
            {[{l:'Total',v:list.length,c:'#374151',bg:'#F9FAFB'},{l:'Visible',v:list.filter(t=>t.isActive).length,c:'#4CAF50',bg:'#F0FFF4'},{l:'Hidden',v:list.filter(t=>!t.isActive).length,c:'#9CA3AF',bg:'#F9FAFB'},{l:'Avg ★',v:(list.reduce((a,t)=>a+t.rating,0)/list.length).toFixed(1),c:'#FF4C29',bg:'#FFF0EC'}].map(s=>(
              <div key={s.l} style={{ background:s.bg, borderRadius:10, padding:'10px 18px', border:'1px solid #F3F4F6' }}>
                <div style={{ fontSize:10.5, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.8, marginBottom:2, fontFamily:'Poppins,sans-serif' }}>{s.l}</div>
                <div style={{ fontSize:20, fontWeight:800, color:s.c, fontFamily:'Poppins,sans-serif' }}>{s.v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.22)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
                <h5 style={{ margin:0, fontWeight:800, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{editId ? '✏️ Edit Testimonial' : '✨ New Testimonial'}</h5>
                <button onClick={closeForm} style={{ background:'#F3F4F6', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, color:'#6B7280' }}>✕</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div><label style={lbl}>Customer Name *</label><input style={inp} placeholder="e.g. Priya Sharma" {...f('name')} /></div>
                <div><label style={lbl}>Location / Title</label><input style={inp} placeholder="e.g. From Vijayawada" {...f('designation')} /></div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Review *</label>
                <textarea style={{ ...inp, minHeight:88, resize:'vertical' }} placeholder="What did they say?" {...f('review')} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div><label style={lbl}>Rating</label><StarPicker value={form.rating} onChange={v=>setForm(p=>({...p,rating:v}))} /></div>
                <div><label style={lbl}>Order (0 = first)</label><input style={inp} type="number" min="0" {...f('order')} /></div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Profile Photo (optional)</label>
                <input type="file" accept="image/*" onChange={e=>setImgFile(e.target.files[0])} style={{ fontSize:13, color:'#374151', display:'block' }} />
                {editId&&!imgFile&&<p style={{ fontSize:11.5, color:'#9CA3AF', marginTop:4, marginBottom:0 }}>Leave blank to keep existing photo</p>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, padding:'10px 14px', background:'#FFFBEB', borderRadius:10 }}>
                <input type="checkbox" id="isActiveChk" checked={form.isActive} onChange={e=>setForm(p=>({...p,isActive:e.target.checked}))} style={{ width:16, height:16, cursor:'pointer', accentColor:'#FFD84D' }} />
                <label htmlFor="isActiveChk" style={{ fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer', margin:0, fontFamily:'Poppins,sans-serif' }}>Show on homepage</label>
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
        ) : list.length===0 ? (
          <div style={{ textAlign:'center', padding:'56px 24px', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px rgba(0,0,0,.06)', border:'1.5px solid #F3F4F6' }}>
            <div style={{ fontSize:48, marginBottom:14, opacity:0.4 }}>💬</div>
            <div style={{ fontWeight:700, color:'#374151', fontSize:16, marginBottom:8, fontFamily:'Poppins,sans-serif' }}>No testimonials yet</div>
            <div style={{ color:'#9CA3AF', fontSize:13, marginBottom:24 }}>Add your first customer review to display on the homepage</div>
            <button onClick={openAdd} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)', color:'#1A1A1A', border:'none', borderRadius:10, padding:'10px 22px', fontWeight:700, fontSize:14, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Poppins,sans-serif' }}><FaPlus size={12}/> Add First Testimonial</button>
          </div>
        ) : list.map(t => (
          <div key={t._id} style={{ background:'#fff', borderRadius:14, boxShadow:'0 2px 14px rgba(0,0,0,.06)', border:'1.5px solid #F3F4F6', padding:'18px 20px', marginBottom:12, display:'flex', gap:14, alignItems:'flex-start', opacity:t.isActive?1:0.55, transition:'opacity .2s' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,#FFD84D,#FF4C29)', display:'flex', alignItems:'center', justifyContent:'center', color:'#1A1A1A', fontWeight:800, fontSize:18, fontFamily:'Poppins,sans-serif' }}>
              {t.profileImage?.url ? <img src={t.profileImage.url} alt={t.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : t.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:2 }}>
                <span style={{ fontWeight:700, fontSize:14.5, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{t.name}</span>
                {t.designation&&<span style={{ fontSize:12, color:'#9CA3AF' }}>· {t.designation}</span>}
                <Stars n={t.rating} />
                {!t.isActive&&<span style={{ background:'#F3F4F6', color:'#9CA3AF', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:50, textTransform:'uppercase' }}>Hidden</span>}
              </div>
              <p style={{ margin:'4px 0 0', fontSize:13.5, color:'#4B5563', lineHeight:1.6, fontStyle:'italic' }}>"{t.review}"</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              <button onClick={()=>toggleActive(t)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:t.isActive?'#4CAF50':'#D1D5DB', padding:4, transition:'color .2s' }}>{t.isActive?<FaToggleOn/>:<FaToggleOff/>}</button>
              <button onClick={()=>openEdit(t)} style={{ background:'#FFFBEB', border:'none', borderRadius:8, width:34, height:34, cursor:'pointer', color:'#8B6800', display:'flex', alignItems:'center', justifyContent:'center' }}><FaEdit size={13}/></button>
              <button onClick={()=>handleDelete(t._id)} style={{ background:'#FFF0EC', border:'none', borderRadius:8, width:34, height:34, cursor:'pointer', color:'#FF4C29', display:'flex', alignItems:'center', justifyContent:'center' }}><FaTrash size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};
export default AdminTestimonials;
