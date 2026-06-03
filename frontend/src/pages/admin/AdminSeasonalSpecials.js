import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { seasonalAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATS = ['Corporate Gifting','NRI Packing','Birthday','Wedding','Festival','Other'];
const empty = { title:'', description:'', category:'Festival', order:0 };

const AdminSeasonalSpecials = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    seasonalAPI.adminGetAll().then(r => setItems(r.data.specials || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required');
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k, v));
    if (imgFile) fd.append('image', imgFile);
    try {
      if (editId) await seasonalAPI.update(editId, fd);
      else await seasonalAPI.create(fd);
      toast.success('Saved!');
      setForm(empty); setEditId(null); setImgFile(null); load();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    await seasonalAPI.delete(id); toast.success('Deleted'); load();
  };

  const EMOJIS = { 'Corporate Gifting':'💼', 'NRI Packing':'✈️', 'Birthday':'🎂', 'Wedding':'💍', 'Festival':'🎊', 'Other':'🎁' };

  return (
    <AdminLayout>
      <h4 className="fw-bold mb-4">🎁 Special Occasions & Corporate Orders</h4>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="admin-card">
            <h6 className="fw-bold mb-3">{editId ? 'Edit' : '+ New'} Occasion</h6>
            <div className="mb-2"><label style={{ fontSize:12 }} className="form-label">Title</label><input className="form-control form-control-sm" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
            <div className="mb-2"><label style={{ fontSize:12 }} className="form-label">Description</label><textarea className="form-control form-control-sm" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
            <div className="mb-2">
              <label style={{ fontSize:12 }} className="form-label">Category</label>
              <select className="form-select form-select-sm" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-3"><label style={{ fontSize:12 }} className="form-label">Image</label><input type="file" accept="image/*" className="form-control form-control-sm" onChange={e=>setImgFile(e.target.files[0])} /></div>
            <div className="d-flex gap-2">
              <button className="btn btn-warning fw-bold flex-grow-1" onClick={handleSave} disabled={saving}>{saving?'Saving...':editId?'Update':'Create'}</button>
              {editId && <button className="btn btn-outline-secondary btn-sm" onClick={()=>{setForm(empty);setEditId(null);}}>Cancel</button>}
            </div>
          </div>
        </div>
        <div className="col-md-8">
          {loading ? <div className="text-center"><div className="spinner-border text-warning" /></div> :
            <div className="row g-3">
              {items.map(item => (
                <div key={item._id} className="col-sm-6">
                  <div className="admin-card">
                    <div className="d-flex gap-3 align-items-start">
                      {item.image?.url ? <img src={item.image.url} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:10 }} /> : <div style={{ width:64, height:64, background:'#f0f0f0', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem' }}>{EMOJIS[item.category]}</div>}
                      <div className="flex-grow-1">
                        <div className="fw-bold" style={{ fontSize:14 }}>{item.title}</div>
                        <div className="text-muted" style={{ fontSize:12 }}>{EMOJIS[item.category]} {item.category}</div>
                        <div style={{ fontSize:12, color:'#888', marginTop:4 }}>{item.description}</div>
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={()=>{setEditId(item._id);setForm({title:item.title,description:item.description,category:item.category,order:item.order||0});}}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(item._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSeasonalSpecials;
