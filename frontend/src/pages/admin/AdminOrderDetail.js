import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Ordered', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS = {
  Ordered: '#1890ff', Preparing: '#fa8c16', Shipped: '#722ed1', Delivered: '#52c41a', Cancelled: '#ff4d4f'
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.getOne(id);
      setOrder(res.data.order);
      setStatus(res.data.order.orderStatus);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await orderAPI.updateStatus(id, { status, note });
      setOrder(res.data.order);
      setNote('');
      toast.success('Order status updated!');
    } catch (e) { toast.error('Update failed'); }
    setUpdating(false);
  };

  if (loading) return <AdminLayout title="Order Detail"><div className="text-center py-5"><div className="spinner-border" style={{ color: '#d4380d' }} /></div></AdminLayout>;
  if (!order) return <AdminLayout title="Order Detail"><h5>Order not found</h5></AdminLayout>;

  const statusColor = STATUS_COLORS[order.orderStatus] || '#888';

  return (
    <AdminLayout title={`Order #${id.slice(-8).toUpperCase()}`}>
      <Link to="/admin/orders" className="btn btn-sm btn-outline-secondary mb-4">Back to Orders</Link>
      <div className="row g-4">
        <div className="col-lg-8">
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
            <h6 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginBottom: '16px' }}>Order Items</h6>
            {order.items.map((item, i) => (
              <div key={i} className="d-flex gap-3 align-items-center py-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <div className="flex-grow-1"><div style={{ fontWeight: 600 }}>{item.name}</div><div style={{ color: '#888', fontSize: '13px' }}>Qty: {item.quantity} x Rs.{item.price}</div></div>
                <div style={{ fontWeight: 700, color: '#d4380d' }}>Rs.{item.price * item.quantity}</div>
              </div>
            ))}
            <div className="d-flex justify-content-between mt-3"><strong>Total</strong><strong style={{ color: '#d4380d' }}>Rs.{order.totalAmount}</strong></div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginBottom: '16px' }}>Customer and Delivery</h6>
            <div className="row">
              <div className="col-md-6">
                <p style={{ color: '#555' }}>{order.user?.name}<br/>{order.user?.email}<br/>{order.user?.phone}</p>
              </div>
              <div className="col-md-6">
                <p style={{ color: '#555' }}>
                  {order.shippingAddress.name}<br/>
                  {order.shippingAddress.street}, {order.shippingAddress.city}<br/>
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}<br/>
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <h6 style={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>Current Status</h6>
            <span className="status-badge" style={{ background: statusColor + '20', color: statusColor, fontSize: '14px', padding: '6px 16px' }}>{order.orderStatus}</span>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginBottom: '16px' }}>Update Status</h6>
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-3">
                <label className="form-label fw-semibold">New Status</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Note (Optional)</label>
                <textarea className="form-control" rows={2} value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-pakka w-100" disabled={updating}>
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
