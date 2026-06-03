import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { FaBoxOpen } from 'react-icons/fa';

const STATUS_COLORS = { Ordered:'#3B82F6', Preparing:'#F59E0B', Shipped:'#8B5CF6', Delivered:'#10B981', Cancelled:'#EF4444' };

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders().then(r => setOrders(r.data.orders)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner-border" /></div>;

  return (
    <div style={{ background: '#F9FAFB', minHeight: '80vh', padding: '36px 0' }}>
      <div className="container">
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', marginBottom: 24 }}>My Orders</h2>
        {orders.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', textAlign: 'center', padding: '60px 20px' }}>
            <FaBoxOpen size={52} style={{ color: '#D1D5DB', marginBottom: 16 }} />
            <h4 style={{ fontFamily: 'Playfair Display, serif', color: '#111827', marginBottom: 8 }}>No orders yet</h4>
            <p style={{ color: '#6B7280', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>Explore our sweets and place your first order!</p>
            <Link to="/products"><button className="btn-pakka" style={{ padding: '11px 28px' }}>Shop Now</button></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => {
              const statusColor = STATUS_COLORS[order.orderStatus] || '#6B7280';
              return (
                <div key={order._id} style={{ background: 'white', borderRadius: 14, padding: '20px 24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow .2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span style={{ marginLeft: 12, color: '#9CA3AF', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                      </span>
                    </div>
                    <span className="status-badge" style={{ background: `${statusColor}15`, color: statusColor }}>● {order.orderStatus}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {order.items.slice(0,3).map((item, i) => (
                      <span key={i} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                        🍬 {item.name} ×{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center', fontFamily: 'Inter, sans-serif' }}>+{order.items.length - 3} more</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: '#E8001D', fontWeight: 800, fontSize: 16, fontFamily: 'Inter, sans-serif' }}>₹{order.totalAmount}</span>
                      <span style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>{order.paymentMethod}</span>
                    </div>
                    <Link to={`/orders/${order._id}`}><button className="btn-brand-outline" style={{ padding: '7px 16px', fontSize: 12 }}>View Details →</button></Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default OrdersPage;
