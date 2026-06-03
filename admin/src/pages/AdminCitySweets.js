import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { citySweetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AP_CITIES = [
  { name:'Kakinada', lat:16.9891, lng:82.2475 },
  { name:'Athreyapuram', lat:16.6800, lng:81.9000 },
  { name:'Machilipatnam', lat:16.1875, lng:81.1389 },
  { name:'Tirupati', lat:13.6288, lng:79.4192 },
  { name:'Vijayawada', lat:16.5062, lng:80.6480 },
  { name:'Rajahmundry', lat:17.0005, lng:81.8040 },
  { name:'Guntur', lat:16.3067, lng:80.4365 },
  { name:'Nellore', lat:14.4426, lng:79.9865 },
  { name:'Vizag', lat:17.6868, lng:83.2185 },
  { name:'Kurnool', lat:15.8281, lng:78.0373 },
  { name:'Ongole', lat:15.5057, lng:80.0499 },
  { name:'Eluru', lat:16.7107, lng:81.0952 },
  { name:'Bandar', lat:16.1875, lng:81.1389 },
  { name:'Hyderabad', lat:17.3850, lng:78.4867 },
];

const EMPTY = { cityName:'', sweetName:'', description:'', lat:'', lng:'' };

/* ── Quick inline city adder ── */
const QuickAddCity = ({ onAdded }) => {
  const [cityName, setCityName]   = useState('');
  const [sweetName, setSweetName] = useState('');
  const [saving, setSaving]       = useState(false);

  const handleAdd = async () => {
    if (!cityName.trim() || !sweetName.trim()) { toast.error('Enter both city name and famous sweet name'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('cityName',  cityName.trim());
      fd.append('sweetName', sweetName.trim());
      fd.append('description', `${cityName} is famous for ${sweetName}`);
      await citySweetAPI.create(fd);
      toast.success(`✅ ${cityName} added! It will now appear in the Products city dropdown.`);
      setCityName(''); setSweetName('');
      onAdded();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add city'); }
    setSaving(false);
  };

  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
      <div style={{ flex:'1 1 200px' }}>
        <label style={{ color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, marginBottom:6, display:'block' }}>City Name *</label>
        <input
          value={cityName} onChange={e => setCityName(e.target.value)}
          placeholder="e.g. Narasapur"
          style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:14, outline:'none' }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
      </div>
      <div style={{ flex:'1 1 200px' }}>
        <label style={{ color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, marginBottom:6, display:'block' }}>Famous Sweet *</label>
        <input
          value={sweetName} onChange={e => setSweetName(e.target.value)}
          placeholder="e.g. Kajjikayalu"
          style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:14, outline:'none' }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
      </div>
      <button onClick={handleAdd} disabled={saving}
        style={{ padding:'10px 24px', borderRadius:10, border:'none', background: saving ? '#555' : 'linear-gradient(135deg,#FFBE00,#ff9900)', color:'#1a1a2e', fontWeight:800, fontSize:14, cursor: saving ? 'not-allowed' : 'pointer', flexShrink:0, height:42 }}>
        {saving ? '...' : '+ Add City'}
      </button>
    </div>
  );
};

const AdminCitySweets = () => {
  const { loading: authLoading } = useAuth();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!authLoading) { fetchItems(); }
  }, [authLoading]);

  const fetchItems = async () => {
    try { const res = await citySweetAPI.adminGetAll(); setItems(res.data.citySweets || []); }
    catch { toast.error('Failed to load city sweets'); }
    setLoading(false);
  };

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setImage(null); setPreview(null); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ cityName:item.cityName, sweetName:item.sweetName, description:item.description||'', lat:item.lat||'', lng:item.lng||'' });
    setImage(null); setPreview(item.image?.url || null); setShowModal(true);
  };

  const handleCitySelect = (e) => {
    const city = AP_CITIES.find(c => c.name === e.target.value);
    if (city) setForm(f => ({ ...f, cityName: city.name, lat: city.lat, lng: city.lng }));
    else setForm(f => ({ ...f, cityName: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this city sweet?')) return;
    try { await citySweetAPI.delete(id); toast.success('Deleted!'); fetchItems(); }
    catch { toast.error('Delete failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      if (editItem) { await citySweetAPI.update(editItem._id, fd); toast.success('Updated! ✅'); }
      else { await citySweetAPI.create(fd); toast.success('City sweet added! ✅'); }
      setShowModal(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  return (
    <AdminLayout title="🗺️ City Sweets">

      {/* ── Quick Add City Banner ── */}
      <div style={{ background:'linear-gradient(135deg,#1a1a2e,#2d3561)', borderRadius:16, padding:'20px 24px', marginBottom:24, border:'1px solid rgba(255,190,0,0.2)' }}>
        <div style={{ color:'#FFBE00', fontWeight:800, fontSize:15, marginBottom:4 }}>➕ Add a New City & Its Famous Sweet</div>
        <div style={{ color:'rgba(255,255,255,0.55)', fontSize:12, marginBottom:14 }}>Once added, this city will appear in the <strong style={{color:'#FFBE00'}}>Products → City</strong> dropdown automatically.</div>
        <QuickAddCity onAdded={fetchItems} />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <p style={{ color:'#888', margin:0, fontSize:14 }}>All city–sweet mappings. Edit or add photos using the full form.</p>
        <button onClick={openAdd} style={{ background:'linear-gradient(135deg,#E8001D,#c50018)', color:'white', border:'none', borderRadius:50, padding:'9px 22px', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
          <FaPlus size={12}/> Full Form
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}><div className="spinner-border" style={{ color:'#E8001D' }} /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#aaa' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>🗺️</div>
          <p>No city sweets added yet. Add the first one!</p>
        </div>
      ) : (
        <div className="row g-3">
          {items.map(item => (
            <div key={item._id} className="col-md-6 col-lg-4">
              <div style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', border:'1px solid #f0e8d8' }}>
                {item.image?.url && <img src={item.image.url} alt={item.sweetName} style={{ width:'100%', height:140, objectFit:'cover' }} />}
                <div style={{ padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, color:'#E8001D', fontSize:12, fontWeight:600, marginBottom:4 }}>
                    <FaMapMarkerAlt size={11}/> {item.cityName}
                  </div>
                  <h6 style={{ fontFamily:'Playfair Display,serif', fontWeight:700, margin:'0 0 6px' }}>{item.sweetName}</h6>
                  {item.description && <p style={{ fontSize:13, color:'#888', margin:'0 0 10px' }}>{item.description}</p>}
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => openEdit(item)} style={{ flex:1, padding:'7px', borderRadius:8, border:'1.5px solid #1890ff', background:'white', color:'#1890ff', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                      <FaEdit size={11}/> Edit
                    </button>
                    <button onClick={() => handleDelete(item._id)} style={{ flex:1, padding:'7px', borderRadius:8, border:'1.5px solid #ff4d4f', background:'white', color:'#ff4d4f', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                      <FaTrash size={11}/> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL — custom overlay, no Bootstrap scrollable ── */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'20px 16px' }}>
          <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:520, boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 16px', borderBottom:'1px solid #f0f0f0' }}>
              <h5 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:19, margin:0, color:'#1a1a2e' }}>
                {editItem ? '✏️ Edit City Sweet' : '➕ Add City Sweet'}
              </h5>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#888', lineHeight:1, padding:4 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>

                <div>
                  <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>City *</label>
                  <select className="form-select" value={form.cityName} onChange={handleCitySelect} required>
                    <option value="">Select a city</option>
                    {AP_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Famous Sweet Name *</label>
                  <input type="text" className="form-control" value={form.sweetName}
                    onChange={e => setForm({...form, sweetName:e.target.value})}
                    required placeholder="e.g. Kakinada Kaja" />
                </div>

                <div>
                  <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Description</label>
                  <textarea className="form-control" rows={2} value={form.description}
                    onChange={e => setForm({...form, description:e.target.value})}
                    placeholder="Short description..." />
                </div>

                <div>
                  <label style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:6 }}>Sweet Image</label>
                  <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                  {preview && (
                    <img src={preview} alt="preview" style={{ width:110, height:80, objectFit:'cover', borderRadius:10, marginTop:10, border:'2px solid #f0e8d8' }} />
                  )}
                </div>

              </div>

              {/* Save button — always visible */}
              <div style={{ padding:'14px 24px 24px', borderTop:'1px solid #f0f0f0', display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding:'10px 22px', borderRadius:50, border:'1.5px solid #ddd', background:'white', color:'#555', fontWeight:600, fontSize:14, cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding:'10px 28px', borderRadius:50, border:'none', background: saving ? '#ccc' : 'linear-gradient(135deg,#E8001D,#c50018)', color:'white', fontWeight:700, fontSize:14, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 14px rgba(232,0,29,0.35)', display:'flex', alignItems:'center', gap:8 }}>
                  {saving ? <><span className="spinner-border spinner-border-sm"/> Saving...</> : editItem ? '✅ Update' : '✅ Save City Sweet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCitySweets;
