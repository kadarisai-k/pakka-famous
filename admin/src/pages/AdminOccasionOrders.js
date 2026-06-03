import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { packingAPI } from '../services/api';
import toast from 'react-hot-toast';

const SC = { pending:'#FF8C00', confirmed:'#4CAF50', cancelled:'#FF4C29' };

const AdminOccasionOrders = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await packingAPI.getOrders(); setOrders(r.data.orders||[]); }
    catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const updateStatus = async (id,status) => {
    try { await packingAPI.updateOrder(id,{status}); toast.success('Updated'); load(); }
    catch { toast.error('Failed'); }
  };

  const displayed = filter==='all' ? orders : orders.filter(o=>o.status===filter);
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
  const fmtTime = d => d ? new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';

  return (
    <AdminLayout>
      <div style={{ maxWidth:1000 }}>
        <div style={{ marginBottom:28 }}>
          <h2 style={{ fontFamily:'Poppins,sans-serif',fontWeight:800,color:'#1A1A1A',margin:'0 0 4px',fontSize:22 }}>Occasion Orders</h2>
          <p style={{ color:'#9CA3AF',fontSize:13,margin:0 }}>Customer packaging requests with full details</p>
        </div>

        {/* Stats */}
        <div style={{ display:'flex',gap:12,marginBottom:24,flexWrap:'wrap' }}>
          {[
            {l:'All',c:'#374151',bg:'#F9FAFB',k:'all',v:orders.length},
            {l:'Pending',c:'#FF8C00',bg:'#FFF8EC',k:'pending',v:orders.filter(o=>o.status==='pending').length},
            {l:'Confirmed',c:'#4CAF50',bg:'#F0FFF4',k:'confirmed',v:orders.filter(o=>o.status==='confirmed').length},
            {l:'Cancelled',c:'#FF4C29',bg:'#FFF0EC',k:'cancelled',v:orders.filter(o=>o.status==='cancelled').length},
          ].map(s=>(
            <div key={s.k} onClick={()=>setFilter(s.k)}
              style={{ background:filter===s.k?s.c:s.bg,borderRadius:12,padding:'12px 22px',cursor:'pointer',border:`2px solid ${filter===s.k?s.c:'transparent'}`,transition:'all .2s',minWidth:110 }}>
              <div style={{ fontSize:10,fontWeight:700,color:filter===s.k?'rgba(255,255,255,0.7)':'#9CA3AF',textTransform:'uppercase',letterSpacing:0.8,marginBottom:4,fontFamily:'Poppins,sans-serif' }}>{s.l}</div>
              <div style={{ fontSize:22,fontWeight:800,color:filter===s.k?'white':s.c,fontFamily:'Poppins,sans-serif' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center',padding:'60px 0' }}><div className="spinner-border"/></div>
        ) : displayed.length===0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><h6>No orders yet</h6><p>Occasion orders submitted by customers will appear here</p></div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {displayed.map(o=>(
              <div key={o._id} style={{ background:'white',borderRadius:16,border:'1.5px solid #F3F4F6',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',overflow:'hidden' }}>
                {/* Header row */}
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 22px',flexWrap:'wrap',gap:12,cursor:'pointer',borderBottom:expanded===o._id?'1.5px solid #F3F4F6':'none' }}
                  onClick={()=>setExpanded(expanded===o._id?null:o._id)}>
                  <div style={{ display:'flex',alignItems:'center',gap:14,flex:1,minWidth:200 }}>
                    <div>
                      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:3 }}>
                        <span style={{ fontWeight:800,fontSize:15,color:'#1A1A1A',fontFamily:'Poppins,sans-serif' }}>{o.name}</span>
                        <span style={{ background:`${SC[o.status]}18`,color:SC[o.status],fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:50,border:`1px solid ${SC[o.status]}33` }}>
                          {o.status.charAt(0).toUpperCase()+o.status.slice(1)}
                        </span>
                        {o.packingName && <span style={{ background:'#FFFBEB',color:'#8B6800',fontSize:11,fontWeight:600,padding:'2px 9px',borderRadius:50,border:'1px solid rgba(255,216,77,.4)' }}>{o.packingName}</span>}
                      </div>
                      <div style={{ fontSize:13,color:'#6B7280',fontFamily:'Poppins,sans-serif' }}>
                        📱 {o.phone} &nbsp;·&nbsp; 🎯 {o.category} &nbsp;·&nbsp; 📅 Delivery: {fmt(o.deliveryDate)} &nbsp;·&nbsp; 🕐 {fmtTime(o.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
                    {o.totalPrice>0 && <span style={{ fontSize:16,fontWeight:800,color:'#FF4C29',fontFamily:'Poppins,sans-serif' }}>₹{o.totalPrice.toLocaleString('en-IN')}</span>}
                    <span style={{ fontSize:18,color:'#9CA3AF',transition:'transform .2s',transform:expanded===o._id?'rotate(180deg)':'rotate(0)' }}>⌄</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded===o._id && (
                  <div style={{ padding:'18px 22px',background:'#FAFAFA',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20 }}>
                    {/* Contact */}
                    <div>
                      <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:0.8,marginBottom:10,fontFamily:'Poppins,sans-serif' }}>Contact</div>
                      <div style={{ fontSize:13.5,color:'#1A1A1A',fontFamily:'Poppins,sans-serif',lineHeight:1.9 }}>
                        <div>👤 {o.name}</div>
                        <div>📱 {o.phone}</div>
                        {o.email && <div>✉️ {o.email}</div>}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:0.8,marginBottom:10,fontFamily:'Poppins,sans-serif' }}>Delivery Address</div>
                      {o.deliveryAddress?.street ? (
                        <div style={{ fontSize:13.5,color:'#1A1A1A',fontFamily:'Poppins,sans-serif',lineHeight:1.75 }}>
                          <div>📍 {o.deliveryAddress.street}</div>
                          <div>{o.deliveryAddress.city}{o.deliveryAddress.state?`, ${o.deliveryAddress.state}`:''}</div>
                          {o.deliveryAddress.pincode && <div>📮 {o.deliveryAddress.pincode}</div>}
                        </div>
                      ) : <div style={{ fontSize:13,color:'#9CA3AF',fontStyle:'italic' }}>No address provided</div>}
                    </div>

                    {/* Order Details */}
                    <div>
                      <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:0.8,marginBottom:10,fontFamily:'Poppins,sans-serif' }}>Order Details</div>
                      <div style={{ fontSize:13.5,color:'#1A1A1A',fontFamily:'Poppins,sans-serif',lineHeight:1.75 }}>
                        <div>📦 {o.packingName||'—'}</div>
                        <div>🎯 {o.category}</div>
                        <div>⚖️ {o.quantity} kg</div>
                        {o.totalPrice>0 && <div style={{ fontWeight:700,color:'#FF4C29' }}>💰 ₹{o.totalPrice.toLocaleString('en-IN')}</div>}
                        <div>📅 Deliver by: <strong>{fmt(o.deliveryDate)}</strong></div>
                      </div>
                    </div>

                    {/* Sweets & Notes */}
                    <div>
                      <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:0.8,marginBottom:10,fontFamily:'Poppins,sans-serif' }}>Sweets & Notes</div>
                      {o.selectedSweets && (
                        <div style={{ fontSize:13,color:'#374151',marginBottom:8,fontFamily:'Poppins,sans-serif',lineHeight:1.6 }}>
                          🍬 {o.selectedSweets}
                        </div>
                      )}
                      {o.notes && <div style={{ fontSize:12.5,color:'#6B7280',fontStyle:'italic',fontFamily:'Poppins,sans-serif' }}>"{o.notes}"</div>}
                    </div>
                  </div>
                )}

                {/* Status buttons */}
                <div style={{ display:'flex',gap:8,padding:'12px 22px',borderTop:'1px solid #F3F4F6',background:'white',flexWrap:'wrap' }}>
                  <span style={{ fontSize:12,color:'#9CA3AF',fontWeight:600,alignSelf:'center',marginRight:4,fontFamily:'Poppins,sans-serif' }}>Update Status:</span>
                  {['pending','confirmed','cancelled'].map(s=>(
                    <button key={s} disabled={o.status===s} onClick={()=>updateStatus(o._id,s)}
                      style={{ padding:'6px 16px',borderRadius:8,border:`1.5px solid ${SC[s]}`,fontSize:12,fontWeight:600,cursor:o.status===s?'default':'pointer',fontFamily:'Poppins,sans-serif',transition:'all .18s',background:o.status===s?SC[s]:'white',color:o.status===s?'white':SC[s],opacity:o.status===s?1:0.75 }}>
                      {s.charAt(0).toUpperCase()+s.slice(1)}
                    </button>
                  ))}
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
