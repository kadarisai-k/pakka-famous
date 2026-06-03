import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { FaWhatsapp, FaCheckCircle } from 'react-icons/fa';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { navigate('/'); return; }
    orderAPI.getOne(orderId)
      .then(res => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div className="spinner-border" style={{ color: '#E8001D' }} />
    </div>
  );

  return (
    <div style={{ background: '#F9FAFB', minHeight: '80vh', padding: '48px 0' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7">

            {/* ── Success Banner ── */}
            <div style={{
              background: 'white', borderRadius: 20, padding: '44px 40px',
              border: '1px solid #E5E7EB', boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
              textAlign: 'center', marginBottom: 20,
            }}>
              {/* Animated checkmark */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg,#10B981,#059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, margin: '0 auto 20px',
                boxShadow: '0 6px 24px rgba(16,185,129,.3)',
                animation: 'pop .4s ease',
              }}>✓</div>

              <h2 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, color: '#111827', marginBottom: 8 }}>
                Order Placed Successfully! 🎉
              </h2>
              <p style={{ color: '#6B7280', fontFamily: 'Poppins,sans-serif', fontSize: 15, maxWidth: 400, margin: '0 auto 24px' }}>
                Thank you for shopping with Pakka Famous! Your authentic Andhra sweets are being prepared.
              </p>

              {/* WhatsApp notification notice */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#f0fdf4', border: '1.5px solid #86efac',
                borderRadius: 12, padding: '12px 20px',
              }}>
                <FaWhatsapp style={{ color: '#25D366', fontSize: 22, flexShrink: 0 }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: 13.5, fontFamily: 'Poppins,sans-serif' }}>
                    WhatsApp Confirmation Sent!
                  </div>
                  <div style={{ color: '#15803d', fontSize: 12, fontFamily: 'Poppins,sans-serif' }}>
                    Check your WhatsApp for order details &amp; updates
                  </div>
                </div>
              </div>
            </div>

            {/* ── Order Details ── */}
            {order && (
              <div style={{
                background: 'white', borderRadius: 20, border: '1px solid #E5E7EB',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 20,
              }}>
                {/* Header bar */}
                <div style={{ background: 'linear-gradient(135deg,#E8001D,#c50018)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h6 style={{ color: 'white', fontFamily: 'Poppins,sans-serif', fontWeight: 700, margin: 0, fontSize: 14 }}>
                    Order Confirmation
                  </h6>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'Poppins,sans-serif' }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div style={{ padding: '20px 24px' }}>
                  {/* Summary rows */}
                  {[
                    ['Status',      order.orderStatus],
                    ['Payment',     `${order.paymentMethod} — ${order.paymentStatus}`],
                    ['Total',       `₹${order.totalAmount}`],
                    ['Delivering to', `${order.shippingAddress.name}, ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.pincode}`],
                    ['Mobile',      order.shippingAddress.phone || '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: '1px solid #F3F4F6', marginBottom: 10 }}>
                      <span style={{ width: 120, flexShrink: 0, color: '#9CA3AF', fontSize: 13, fontFamily: 'Poppins,sans-serif' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: label === 'Total' ? '#E8001D' : '#111827', fontSize: 13, fontFamily: 'Poppins,sans-serif' }}>{value}</span>
                    </div>
                  ))}

                  {/* Items */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', fontFamily: 'Poppins,sans-serif', marginBottom: 10 }}>
                      Items Ordered
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13, fontFamily: 'Poppins,sans-serif' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FaCheckCircle style={{ color: '#10B981', fontSize: 13, flexShrink: 0 }} />
                          <span style={{ color: '#374151' }}>{item.name} × {item.quantity}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#111827' }}>₹{item.totalPrice}</span>
                      </div>
                    ))}

                    {/* Totals */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '2px solid #F3F4F6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                        <span>Subtotal</span><span>₹{order.subtotal}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                        <span>Delivery</span>
                        <span style={{ color: order.deliveryCharge === 0 ? '#10B981' : undefined }}>
                          {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                        </span>
                      </div>
                      {order.couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10B981', marginBottom: 4 }}>
                          <span>🎟️ Coupon ({order.couponCode})</span>
                          <span>-₹{order.couponDiscount}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#E8001D', marginTop: 8 }}>
                        <span>Grand Total</span><span>₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Action buttons ── */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/orders">
                <button className="btn-pakka" style={{ padding: '12px 28px', fontSize: 14 }}>
                  View My Orders
                </button>
              </Link>
              <Link to="/products">
                <button className="btn-brand-outline" style={{ padding: '12px 28px', fontSize: 14 }}>
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessPage;
