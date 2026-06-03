import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const STEPS = ['Ordered', 'Preparing', 'Shipped', 'Delivered'];
const STATUS_COLORS = {
  Ordered: '#3B82F6', Preparing: '#F59E0B',
  Shipped: '#8B5CF6', Delivered: '#10B981', Cancelled: '#EF4444',
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order,  setOrder]  = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancellation window state
  const [cancellationAllowed, setCancellationAllowed] = useState(false);
  const [cutoffTime, setCutoffTime]   = useState('23:00');
  const [timeLeft,   setTimeLeft]     = useState('');
  const [cutoffTS,   setCutoffTS]     = useState(null);
  const [todayIST,   setTodayIST]     = useState('');

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason,    setCancelReason]    = useState('');
  const [cancelling,      setCancelling]      = useState(false);

  // Load order
  useEffect(() => {
    orderAPI.getOne(id)
      .then(r => setOrder(r.data.order))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  // Load cancellation window status
  useEffect(() => {
    orderAPI.getCancellationStatus()
      .then(r => {
        setCancellationAllowed(r.data.cancellationAllowed);
        setCutoffTime(r.data.cutoffTime);
        if (r.data.cutoffTimestamp) setCutoffTS(new Date(r.data.cutoffTimestamp));
        if (r.data.todayIST) setTodayIST(r.data.todayIST);
      })
      .catch(() => {});
  }, []);

  // Live countdown to cutoff
  const updateCountdown = useCallback(() => {
    if (!cutoffTS) return;
    const diff = cutoffTS - new Date();
    if (diff <= 0) {
      setCancellationAllowed(false);
      setTimeLeft('Cutoff passed');
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setTimeLeft(`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
  }, [cutoffTS]);

  useEffect(() => {
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [updateCountdown]);

  // Handle cancel
  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await orderAPI.cancelOrder(id, { reason: cancelReason });
      setOrder(res.data.order);
      setShowCancelModal(false);
      setCancellationAllowed(false);
      toast.success('Order cancelled successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      toast.error(msg);
      if (err.response?.data?.code === 'CUTOFF_PASSED') {
        setCancellationAllowed(false);
      }
    }
    setCancelling(false);
  };

  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <div className="spinner-border" style={{ color:'#E8001D' }} />
    </div>
  );

  if (!order) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <h4>Order not found</h4>
      <Link to="/orders"><button className="btn-pakka" style={{ marginTop:12 }}>Back to Orders</button></Link>
    </div>
  );

  const isCancelled  = order.orderStatus === 'Cancelled';
  const isConfirmed  = order.cutoffStatus === 'CONFIRMED';
  // Order must have been placed TODAY (IST) for cancellation to be possible
  const IST_MS      = 5.5 * 60 * 60 * 1000;
  const orderDateIST = order?.createdAt
    ? new Date(new Date(order.createdAt).getTime() + IST_MS).toISOString().slice(0, 10)
    : '';
  const placedToday = todayIST && orderDateIST === todayIST;

  const canCancel    = !isCancelled && !isConfirmed && cancellationAllowed && placedToday &&
                       !['Preparing','Shipped','Delivered'].includes(order.orderStatus);
  const currentStep  = STEPS.indexOf(order.orderStatus);
  const addr         = order.shippingAddress;
  const statusColor  = STATUS_COLORS[order.orderStatus] || '#6B7280';

  return (
    <div style={{ background:'#F9FAFB', minHeight:'80vh', padding:'36px 0' }}>
      <div className="container">

        {/* Back */}
        <Link to="/orders">
          <button style={{ background:'none', border:'1.5px solid #E5E7EB', borderRadius:9,
            padding:'7px 16px', fontSize:13, cursor:'pointer', color:'#374151',
            fontFamily:'Inter, sans-serif', marginBottom:20 }}>
            ← Back to Orders
          </button>
        </Link>

        {/* Title row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:10, marginBottom:24 }}>
          <h2 style={{ fontFamily:'Playfair Display, serif', fontWeight:900, color:'#111827', margin:0 }}>
            Order #{order._id.slice(-8).toUpperCase()}
          </h2>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span className="status-badge" style={{ background:`${statusColor}15`, color:statusColor, fontSize:13 }}>
              ● {order.orderStatus}
            </span>
            {isConfirmed && !isCancelled && (
              <span style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #86efac',
                borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>
                ✅ Confirmed
              </span>
            )}
          </div>
        </div>

        {/* ── Cancellation window banner ───────────────────────── */}
        {!isCancelled && !isConfirmed && (
          <>
            {!placedToday ? (
              // Order from a previous day — no cancellation possible at all
              <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0',
                borderRadius:12, padding:'14px 20px', marginBottom:20,
                display:'flex', alignItems:'center', gap:10 }}>
                <FaClock style={{ color:'#94a3b8', fontSize:16 }} />
                <div style={{ fontSize:14, color:'#64748b', fontWeight:500 }}>
                  This order was placed on a previous day and cannot be cancelled.
                  Only orders placed <strong>today</strong> can be cancelled before {cutoffTime} IST.
                </div>
              </div>
            ) : (
              // Order placed today — show open/closed window
              <div style={{ background: cancellationAllowed ? '#f0fdf4' : '#fff7ed',
                border:`1px solid ${cancellationAllowed ? '#86efac' : '#fed7aa'}`,
                borderRadius:12, padding:'14px 20px', marginBottom:20,
                display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <FaClock style={{ color: cancellationAllowed ? '#16a34a' : '#ea580c', fontSize:16 }} />
                  <div>
                    <div style={{ fontWeight:700, fontSize:14,
                      color: cancellationAllowed ? '#166534' : '#9a3412' }}>
                      {cancellationAllowed
                        ? `Cancellation open — closes at ${cutoffTime} IST today`
                        : `Cancellation closed — cutoff (${cutoffTime} IST) has passed`
                      }
                    </div>
                    {cancellationAllowed && timeLeft && (
                      <div style={{ fontSize:12, color:'#16a34a', fontFamily:'monospace', marginTop:2 }}>
                        ⏱ Time remaining: {timeLeft}
                      </div>
                    )}
                  </div>
                </div>
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    style={{ background:'#EF4444', color:'white', border:'none', borderRadius:9,
                      padding:'8px 20px', fontSize:13, fontWeight:700, cursor:'pointer',
                      fontFamily:'Poppins, sans-serif' }}>
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12,
            padding:'14px 20px', marginBottom:20, color:'#EF4444', fontWeight:600,
            fontSize:14, fontFamily:'Inter, sans-serif' }}>
            <FaTimes className="me-2" />
            Order cancelled
            {order.cancelledAt && ` on ${new Date(order.cancelledAt).toLocaleString('en-IN')}`}
            {order.cancellationReason && ` — "${order.cancellationReason}"`}
          </div>
        )}

        {/* Confirmed banner */}
        {isConfirmed && !isCancelled && (
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:12,
            padding:'14px 20px', marginBottom:20, color:'#166534', fontWeight:600,
            fontSize:14, fontFamily:'Inter, sans-serif' }}>
            ✅ This order is confirmed and has been sent to the shop for preparation.
          </div>
        )}

        {/* Progress stepper */}
        {!isCancelled && (
          <div style={{ background:'white', borderRadius:16, padding:'28px 24px',
            border:'1px solid #E5E7EB', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', marginBottom:20 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'#111827',
              fontFamily:'Inter, sans-serif', marginBottom:24 }}>Order Progress</div>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', position:'relative' }}>
              <div style={{ position:'absolute', top:16, left:'10%', right:'10%',
                height:2, background:'#E5E7EB', zIndex:0 }} />
              <div style={{ position:'absolute', top:16, left:'10%',
                width:`${Math.max(0, (currentStep / (STEPS.length - 1)) * 80)}%`,
                height:2, background:'#E8001D', zIndex:1, transition:'width .4s' }} />
              {STEPS.map((step, i) => {
                const done   = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step} style={{ display:'flex', flexDirection:'column',
                    alignItems:'center', flex:1, zIndex:2 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%',
                      background: done ? '#E8001D' : 'white',
                      border:`2px solid ${done ? '#E8001D' : '#E5E7EB'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color: done ? 'white' : '#9CA3AF', fontSize:13, fontWeight:700,
                      boxShadow: active ? '0 0 0 4px rgba(232,0,29,.15)' : 'none' }}>
                      {done ? <FaCheck size={13} /> : i + 1}
                    </div>
                    <div style={{ marginTop:8, fontSize:12,
                      fontWeight: active ? 700 : 500,
                      color: active ? '#E8001D' : done ? '#111827' : '#9CA3AF',
                      textAlign:'center', fontFamily:'Inter, sans-serif' }}>{step}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-7">
            {/* Items */}
            <div style={{ background:'white', borderRadius:16, padding:24,
              border:'1px solid #E5E7EB', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:15, color:'#111827',
                fontFamily:'Inter, sans-serif', marginBottom:16 }}>🍬 Items Ordered</div>
              {order.items.map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0',
                  borderBottom: i < order.items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:'#FEF3C7',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.4rem', flexShrink:0 }}>🍬</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'#111827',
                      fontFamily:'Inter, sans-serif' }}>{item.name}</div>
                    <div style={{ fontSize:12, color:'#9CA3AF',
                      fontFamily:'Inter, sans-serif' }}>₹{item.price} × {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight:700, color:'#111827',
                    fontFamily:'Inter, sans-serif' }}>₹{item.totalPrice}</div>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            <div style={{ background:'white', borderRadius:16, padding:24,
              border:'1px solid #E5E7EB', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight:700, fontSize:15, color:'#111827',
                fontFamily:'Inter, sans-serif', marginBottom:12 }}>📍 Delivery Address</div>
              <div style={{ fontSize:14, color:'#374151', fontFamily:'Inter, sans-serif', lineHeight:1.8 }}>
                <strong>{addr.name}</strong><br />
                {addr.street}<br />
                {addr.city}, {addr.state} – {addr.pincode}<br />
                📱 {addr.phone}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="col-lg-5">
            <div style={{ background:'white', borderRadius:16, padding:24,
              border:'1px solid #E5E7EB', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight:700, fontSize:15, color:'#111827',
                fontFamily:'Inter, sans-serif', marginBottom:16 }}>💰 Order Summary</div>
              {[
                ['Subtotal', `₹${order.subtotal}`],
                ['Delivery', order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`],
                order.couponDiscount > 0 ? [`Coupon (${order.couponCode})`, `-₹${order.couponDiscount}`] : null,
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between',
                  fontSize:13, color:'#6B7280', fontFamily:'Inter, sans-serif', marginBottom:8 }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <hr />
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800,
                fontSize:16, color:'#111827', fontFamily:'Inter, sans-serif' }}>
                <span>Total</span><span style={{ color:'#E8001D' }}>₹{order.totalAmount}</span>
              </div>
              <div style={{ marginTop:16, padding:'10px 14px', background:'#F9FAFB',
                borderRadius:10, fontSize:12, color:'#6B7280', fontFamily:'Inter, sans-serif' }}>
                <div><strong>Payment:</strong> {order.paymentMethod}</div>
                <div><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString('en-IN')}</div>
                {order.cancelledAt && (
                  <div><strong>Cancelled:</strong> {new Date(order.cancelledAt).toLocaleString('en-IN')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancel Confirmation Modal ──────────────────────────── */}
      {showCancelModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999,
          display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'white', borderRadius:20, padding:32, maxWidth:460,
            width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <h5 style={{ fontFamily:'Playfair Display, serif', fontWeight:900, marginBottom:8 }}>
              Cancel Order?
            </h5>
            <p style={{ color:'#6B7280', fontSize:14, marginBottom:20 }}>
              Are you sure you want to cancel order #{order._id.slice(-8).toUpperCase()}?
              This action cannot be undone.
            </p>

            {/* Countdown in modal */}
            {timeLeft && cancellationAllowed && (
              <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:10,
                padding:'10px 14px', marginBottom:16, fontSize:13, color:'#92400e' }}>
                ⚠️ Cancellation closes in <strong>{timeLeft}</strong> (at {cutoffTime} IST)
              </div>
            )}

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#374151',
                fontFamily:'Inter, sans-serif', display:'block', marginBottom:6 }}>
                Reason (optional)
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Changed my mind, ordered by mistake..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ resize:'none', fontSize:14 }}
              />
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                disabled={cancelling}
                style={{ flex:1, padding:'11px 0', borderRadius:10, border:'1.5px solid #E5E7EB',
                  background:'white', color:'#374151', fontWeight:600, fontSize:14, cursor:'pointer' }}>
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{ flex:1, padding:'11px 0', borderRadius:10, border:'none',
                  background: cancelling ? '#ccc' : '#EF4444', color:'white',
                  fontWeight:700, fontSize:14, cursor: cancelling ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {cancelling
                  ? <><span className="spinner-border spinner-border-sm" /> Cancelling...</>
                  : '✕ Yes, Cancel'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
