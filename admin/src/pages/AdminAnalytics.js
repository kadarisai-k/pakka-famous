import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { orderAPI } from '../services/api';

const COLORS = { orders:'#3B82F6', revenue:'#4CAF50', users:'#FFD84D', occasions:'#7C3AED' };

const StatCard = ({ title, value, icon, color, sub, trend }) => (
  <div style={{ background:'white',borderRadius:16,padding:'22px 24px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid rgba(0,0,0,0.04)' }}>
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
      <div>
        <p style={{ color:'#9CA3AF',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.2px',margin:'0 0 6px',fontFamily:'Poppins,sans-serif' }}>{title}</p>
        <h3 style={{ fontFamily:'Poppins,sans-serif',fontWeight:800,color:'#1A1A1A',margin:'0 0 4px',fontSize:28 }}>{value}</h3>
        {sub && <span style={{ fontSize:12,color:'#9CA3AF' }}>{sub}</span>}
      </div>
      <div style={{ width:50,height:50,borderRadius:14,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>{icon}</div>
    </div>
  </div>
);

// Inline SVG bar chart
const BarChart = ({ data, color = '#3B82F6', height = 120 }) => {
  if (!data?.length) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:13 }}>No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height, padding:'0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
          <div style={{ width:'100%', borderRadius:'4px 4px 0 0', background: color, height:`${(d.value/max)*85}%`, minHeight: d.value > 0 ? 4 : 0, transition:'height .4s ease', opacity: 0.85 }} title={`${d.label}: ${d.value}`} />
          <span style={{ fontSize:9, color:'#9CA3AF', transform:'rotate(-35deg)', transformOrigin:'center', whiteSpace:'nowrap', overflow:'hidden', maxWidth:28, display:'block' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// Line chart (SVG)
const LineChart = ({ data, color = '#3B82F6', height = 130 }) => {
  if (!data?.length) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:13 }}>No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 100 / (data.length - 1 || 1);
  const pts = data.map((d, i) => `${i * w},${100 - (d.value / max) * 90}`).join(' ');
  const fillPts = `0,100 ${pts} ${(data.length - 1) * w},100`;
  return (
    <div style={{ height }}>
      <svg viewBox={`0 0 100 100`} style={{ width:'100%', height:'100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill="url(#lineGrad)" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => (
          <circle key={i} cx={i * w} cy={100 - (d.value / max) * 90} r="3" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  );
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAnalytics()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Analytics">
      <div style={{ textAlign:'center', padding:'80px 0' }}>
        <div className="spinner-border" />
      </div>
    </AdminLayout>
  );

  if (!data) return (
    <AdminLayout title="Analytics">
      <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
        <p>Could not load analytics. Check your backend connection.</p>
      </div>
    </AdminLayout>
  );

  const { stats, orderTimeSeries = [], topProducts = [] } = data;

  // Prepare time-series for charts
  const last14 = [...Array(14)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split('T')[0];
    const found = orderTimeSeries.find(o => o._id === key);
    return { label: d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' }), value: found?.count || 0, revenue: found?.revenue || 0 };
  });

  return (
    <AdminLayout title="Analytics">
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, color:'#1A1A1A', margin:'0 0 4px', fontSize:22 }}>Analytics Dashboard</h2>
        <p style={{ color:'#9CA3AF', fontSize:13, margin:0 }}>Business performance overview</p>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard title="Total Revenue" value={`₹${(stats.totalRevenue||0).toLocaleString('en-IN')}`} icon="💰" color={COLORS.revenue} sub="Excl. cancelled orders" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard title="Total Orders" value={stats.totalOrders||0} icon="🛍️" color={COLORS.orders} sub={`${stats.ordersLast30||0} this month`} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard title="Total Users" value={stats.totalUsers||0} icon="👤" color={COLORS.users} sub="Registered customers" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard title="Occasion Orders" value={stats.occasionOrdersCount||0} icon="🎁" color={COLORS.occasions} sub="Corporate & NRI orders" />
        </div>
      </div>

      {/* Charts row */}
      <div className="row g-3 mb-3">
        {/* Orders over time */}
        <div className="col-12 col-lg-7">
          <div style={{ background:'white', borderRadius:16, padding:'22px 24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <h6 style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, color:'#1A1A1A', margin:0 }}>Orders — Last 14 Days</h6>
                <span style={{ fontSize:12, color:'#9CA3AF' }}>Daily order volume</span>
              </div>
              <span style={{ background:'#EFF6FF', color:'#3B82F6', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:50 }}>📈 Live</span>
            </div>
            <BarChart data={last14} color="#3B82F6" height={140} />
          </div>
        </div>

        {/* Revenue trend */}
        <div className="col-12 col-lg-5">
          <div style={{ background:'white', borderRadius:16, padding:'22px 24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
            <h6 style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, color:'#1A1A1A', marginBottom:4 }}>Revenue Trend</h6>
            <span style={{ fontSize:12, color:'#9CA3AF' }}>Last 14 days (₹)</span>
            <div style={{ marginTop:16 }}>
              <LineChart data={last14.map(d => ({ ...d, value: d.revenue }))} color="#4CAF50" height={140} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="row g-3">
        {/* Top products */}
        <div className="col-12 col-lg-6">
          <div style={{ background:'white', borderRadius:16, padding:'22px 24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
            <h6 style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, color:'#1A1A1A', marginBottom:18 }}>🏆 Top Selling Products</h6>
            {topProducts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', color:'#9CA3AF', fontSize:13 }}>No sales data yet</div>
            ) : (
              topProducts.map((p, i) => {
                const maxSold = topProducts[0]?.totalSold || 1;
                const pct = Math.round((p.totalSold / maxSold) * 100);
                return (
                  <div key={i} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#1A1A1A' }}>
                        <span style={{ display:'inline-block', width:22, height:22, background: i < 3 ? ['#FFD700','#C0C0C0','#CD7F32'][i] : '#E5E7EB', borderRadius:'50%', textAlign:'center', lineHeight:'22px', fontSize:11, fontWeight:800, marginRight:8 }}>{i+1}</span>
                        {p.name || 'Unknown'}
                      </span>
                      <span style={{ fontSize:12, color:'#6B7280' }}>{p.totalSold} sold · ₹{(p.revenue||0).toLocaleString()}</span>
                    </div>
                    <div style={{ height:6, background:'#F3F4F6', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#FFD84D,#FF4C29)', borderRadius:3, transition:'width .6s' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="col-12 col-lg-6">
          <div style={{ background:'white', borderRadius:16, padding:'22px 24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', height:'100%' }}>
            <h6 style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, color:'#1A1A1A', marginBottom:18 }}>📌 Quick Stats</h6>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'Active Products', value: stats.totalProducts || 0, icon:'🍬', color:'#FF4C29' },
                { label:'7-Day Revenue',   value: `₹${(stats.revenueLast7||0).toLocaleString('en-IN')}`, icon:'💵', color:'#4CAF50' },
                { label:'This Month',      value: stats.ordersLast30 || 0, icon:'📅', color:'#3B82F6' },
                { label:'Occasion Orders', value: stats.occasionOrdersCount || 0, icon:'🎁', color:'#7C3AED' },
              ].map(s => (
                <div key={s.label} style={{ background:'#F9FAFB', borderRadius:12, padding:'16px 14px', border:'1px solid #F3F4F6' }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:'Poppins,sans-serif', marginBottom:2 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#9CA3AF', fontWeight:600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
