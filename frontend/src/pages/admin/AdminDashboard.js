import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const STATUS_COLORS = { Ordered:'#1890ff', Preparing:'#fa8c16', Shipped:'#722ed1', Delivered:'#52c41a', Cancelled:'#ff4d4f' };

const StatCard = ({ title, value, icon, color, sub }) => (
  <div style={{ background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <p style={{ color:'#888', fontSize:'13px', margin:0, textTransform:'uppercase', letterSpacing:'1px' }}>{title}</p>
        <h3 style={{ fontFamily:'Playfair Display', fontWeight:700, color:'#1a1a2e', margin:'6px 0 4px' }}>{value}</h3>
        {sub && <small style={{ color:'#aaa', fontSize:'12px' }}>{sub}</small>}
      </div>
      <div style={{ width:48, height:48, borderRadius:'12px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', color }}>{icon}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getStats().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

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
              <Link to="/admin/orders" style={{ fontSize:'13px', color:'#d4380d' }}>View all →</Link>
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
