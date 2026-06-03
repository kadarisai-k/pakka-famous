import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

const STATUS_COLORS = { Ordered:'#1890ff', Preparing:'#fa8c16', Shipped:'#722ed1', Delivered:'#52c41a', Cancelled:'#ff4d4f' };

const StatCard = ({ title, value, icon, color, sub }) => (
  <div style={{ background:'white', borderRadius:16, padding:'22px 24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', transition:'transform .25s, box-shadow .25s', cursor:'default' }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)';}}
    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div>
        <p style={{ color:'#9CA3AF', fontSize:'11px', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'1.2px', fontWeight:700, fontFamily:'Poppins,sans-serif' }}>{title}</p>
        <h3 style={{ fontFamily:'Poppins,sans-serif', fontWeight:800, color:'#1A1A1A', margin:'0 0 4px', fontSize:28 }}>{value}</h3>
        {sub && <small style={{ color:'#9CA3AF', fontSize:'12px' }}>{sub}</small>}
      </div>
      <div style={{ width:50, height:50, borderRadius:14, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>{icon}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      orderAPI.getStats().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [authLoading]);

  if (loading) return <AdminLayout title="📊 Dashboard"><div className="text-center py-5"><div className="spinner-border" style={{ color:'#d4380d' }} /></div></AdminLayout>;
  if (!data) return <AdminLayout><div className="text-center py-5 text-muted">Could not load dashboard data. Check backend connection.</div></AdminLayout>;

  const { stats, ordersByStatus, recentOrders } = data;

  return (
    <AdminLayout title="📊 Dashboard">
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3"><StatCard title="Total Users" value={stats.totalUsers} icon="👤" color="#1890ff" sub="Registered customers" /></div>
        <div className="col-md-6 col-xl-3"><StatCard title="Total Orders" value={stats.totalOrders} icon="🛍️" color="#fa8c16" sub="All time orders" /></div>
        <div className="col-md-6 col-xl-3"><StatCard title="Revenue" value={`₹${stats.totalRevenue?.toLocaleString('en-IN')}`} icon="💰" color="#52c41a" sub="Excluding cancelled" /></div>
        <div className="col-md-6 col-xl-3"><StatCard title="Products" value={stats.totalProducts} icon="🍬" color="#722ed1" sub="Active products" /></div>
      </div>

      <div className="row g-4">
        {/* Orders by Status */}
        <div className="col-lg-5">
          <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', height:'100%' }}>
            <h6 style={{ fontFamily:'Playfair Display', fontWeight:700, marginBottom:'20px' }}>Orders by Status</h6>
            {ordersByStatus.map(item => {
              const color = STATUS_COLORS[item._id] || '#888';
              const pct = stats.totalOrders ? Math.round((item.count / stats.totalOrders) * 100) : 0;
              return (
                <div key={item._id} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize:'13px', fontWeight:600, color }}>{item._id}</span>
                    <span style={{ fontSize:'13px', color:'#888' }}>{item.count} ({pct}%)</span>
                  </div>
                  <div style={{ height:6, borderRadius:3, background:'#f0f0f0', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:3, background:color, width:`${pct}%`, transition:'width 1s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-lg-7">
          <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="d-flex justify-content-between mb-3">
              <h6 style={{ fontFamily:'Playfair Display', fontWeight:700, margin:0 }}>Recent Orders</h6>
              <Link to="/orders" style={{ fontSize:'13px', color:'#d4380d' }}>View all →</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-sm mb-0" style={{ fontSize:'13px' }}>
                <thead style={{ background:'#f9f9f9' }}><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o._id}>
                      <td><Link to={`/admin/orders/${o._id}`} style={{ color:'#d4380d', fontWeight:600 }}>#{o._id.slice(-6).toUpperCase()}</Link></td>
                      <td>{o.user?.name || 'N/A'}</td>
                      <td style={{ fontWeight:700, color:'#d4380d' }}>₹{o.totalAmount}</td>
                      <td><span className="status-badge" style={{ background:`${STATUS_COLORS[o.orderStatus]}20`, color:STATUS_COLORS[o.orderStatus] }}>{o.orderStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
