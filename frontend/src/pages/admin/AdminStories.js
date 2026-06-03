import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storyAPI } from '../../services/api';
import toast from 'react-hot-toast';

const empty = { title:'', city:'', history:'', description:'', order:0 };

const AdminStories = () => {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    storyAPI.adminGetAll().then(r => setStories(r.data.stories || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (!form.title || !form.city) return toast.error('Title and city required');
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k, v));
    if (imgFile) fd.append('image', imgFile);
    try {
      if (editId) await storyAPI.update(editId, fd);
      else await storyAPI.create(fd);
      toast.success(editId ? 'Updated!' : 'Created!');
      setForm(empty); setEditId(null); setImgFile(null); load();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story?')) return;
    await storyAPI.delete(id); toast.success('Deleted'); load();
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setForm({ title:s.title, city:s.city, history:s.history, description:s.description, order:s.order||0 });
    window.scrollTo(0, 0);
  };

  return (
    <AdminLayout>
      <h4 className="fw-bold mb-4">📖 Our Story — Manage Stories</h4>
      <div className="row g-4">
        <div className="col-md-5">
          <div className="admin-card">
            <h6 className="fw-bold mb-3">{editId ? '✏️ Edit Story' : '+ New Story'}</h6>
            {['title','city','order'].map(f => (
              <div className="mb-2" key={f}>
                <label className="form-label text-capitalize" style={{ fontSize:12 }}>{f}</label>
                <input type={f==='order'?'number':'text'} className="form-control form-control-sm" value={form[f]||''} onChange={e => setForm(p=>({...p,[f]:e.target.value}))} />
              </div>
            ))}
            {['history','description'].map(f => (
              <div className="mb-2" key={f}>
                <label className="form-label text-capitalize" style={{ fontSize:12 }}>{f}</label>
                <textarea className="form-control form-control-sm" rows={3} value={form[f]||''} onChange={e => setForm(p=>({...p,[f]:e.target.value}))} />
              </div>
            ))}
            <div className="mb-3">
              <label className="form-label" style={{ fontSize:12 }}>Image</label>
              <input type="file" accept="image/*" className="form-control form-control-sm" onChange={e => setImgFile(e.target.files[0])} />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-warning fw-bold flex-grow-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              {editId && <button className="btn btn-outline-secondary" onClick={() => { setForm(empty); setEditId(null); }}>Cancel</button>}
            </div>
          </div>
        </div>
        <div className="col-md-7">
          {loading ? <div className="text-center"><div className="spinner-border text-warning" /></div> : stories.map(s => (
            <div key={s._id} className="admin-card mb-3">
              <div className="d-flex gap-3 align-items-start">
                {s.image?.url && <img src={s.image.url} alt={s.title} style={{ width:80, height:60, objectFit:'cover', borderRadius:8 }} />}
                <div className="flex-grow-1">
                  <div className="fw-bold">{s.title}</div>
                  <div className="text-muted" style={{ fontSize:13 }}>📍 {s.city} · Order: {s.order}</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:4 }}>{s.history?.substring(0,120)}...</div>
                </div>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStories;
