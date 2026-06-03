import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { packingAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending:'#FF8C00', confirmed:'#4CAF50', cancelled:'#FF4C29' };

const AdminOccasionOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const load = async () => {
    setLoading(true);
    try { const r = await packingAPI.getOrders(); setOrders(r.data.orders || []); }
    catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await packingAPI.updateOrder(id, { status }); toast.success('Updated'); load(); }
    catch { toast.error('Failed'); }
  };

  const displayed = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  return (
    <AdminLayout>
      <div style={{ padding:'28px 24px', maxWidth:960 }}>
        <div style={{ marginBottom:24 }}>
          <h4 style={{ margin:0, fontWeight:800, color:'#1A1A1A', fontFamily:'Poppins,sans-serif', marginBottom:4 }}>📋 Occasion Orders</h4>
          <p style={{ margin:0, color:'#6B7280', fontSize:13, fontFamily:'Poppins,sans-serif' }}>Customer requests for corporate, NRI, and other packings</p>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          {[
            { l:'Total', v:orders.length, c:'#374151', bg:'#F9FAFB' },
            { l:'Pending', v:orders.filter(o=>o.status==='pending').length, c:'#FF8C00', bg:'#FFF8EC' },
            { l:'Confirmed', v:orders.filter(o=>o.status==='confirmed').length, c:'#4CAF50', bg:'#F0FFF4' },
            { l:'Cancelled', v:orders.filter(o=>o.status==='cancelled').length, c:'#FF4C29', bg:'#FFF0EC' },
          ].map(s => (
            <div key={s.l} style={{ background:s.bg, borderRadius:10, padding:'10px 18px', border:'1px solid #F3F4F6', cursor:'pointer' }}
              onClick={() => setFilter(s.l === 'Total' ? 'all' : s.l.toLowerCase())}>
              <div style={{ fontSize:10.5, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.8, marginBottom:2, fontFamily:'Poppins,sans-serif' }}>{s.l}</div>
              <div style={{ fontSize:20, fontWeight:800, color:s.c, fontFamily:'Poppins,sans-serif' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF' }}>Loading…</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 24px', background:'white', borderRadius:16, border:'2px dashed #E5E7EB' }}>
            <div style={{ fontSize:40, marginBottom:12, opacity:0.4 }}>📋</div>
            <div style={{ fontWeight:700, color:'#374151', fontFamily:'Poppins,sans-serif' }}>No orders yet</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {displayed.map(o => (
              <div key={o._id} style={{ background:'white', borderRadius:14, border:'1.5px solid #F3F4F6', padding:'18px 20px', boxShadow:'0 2px 14px rgba(0,0,0,.05)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <div style={{ fontWeight:800, fontSize:15, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{o.name}</div>
                      <span style={{ background: `${STATUS_COLORS[o.status]}18`, color:STATUS_COLORS[o.status], fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:50, border:`1px solid ${STATUS_COLORS[o.status]}33` }}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'4px 16px', fontSize:13, color:'#4B5563', fontFamily:'Poppins,sans-serif' }}>
                      <div>📱 {o.phone}</div>
                      {o.email && <div>✉️ {o.email}</div>}
                      <div>🎯 {o.category}</div>
                      {o.packingName && <div>📦 {o.packingName}</div>}
                      {o.selectedSweets && <div style={{ gridColumn:'1/-1' }}>🍬 {o.selectedSweets}</div>}
                      <div>📦 Qty: {o.quantity}</div>
                      <div>📅 Delivery: {fmt(o.deliveryDate)}</div>
                      {o.notes && <div style={{ gridColumn:'1/-1', color:'#6B7280' }}>📝 {o.notes}</div>}
                      <div style={{ color:'#9CA3AF', fontSize:11 }}>Received: {fmt(o.createdAt)}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    {['pending','confirmed','cancelled'].map(s => (
                      <button key={s} disabled={o.status===s} onClick={() => updateStatus(o._id, s)}
                        style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid', fontSize:12, fontWeight:600, cursor: o.status===s ? 'default' : 'pointer', fontFamily:'Poppins,sans-serif', transition:'all .2s',
                          background: o.status===s ? STATUS_COLORS[s] : 'white',
                          borderColor: STATUS_COLORS[s],
                          color: o.status===s ? 'white' : STATUS_COLORS[s],
                          opacity: o.status===s ? 1 : 0.7,
                        }}>
                        {s.charAt(0).toUpperCase()+s.slice(1)}
                      </button>
                    ))}
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
export default AdminOccasionOrders;
