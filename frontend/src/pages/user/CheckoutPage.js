import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, couponAPI, paymentAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaTag, FaCheck, FaTimes, FaWhatsapp, FaTruck, FaQrcode, FaMobileAlt } from 'react-icons/fa';

const CheckoutPage = () => {
  const { cart, cartLoading, clearCart } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const orderPlaced = useRef(false);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    name:    user?.name             || '',
    phone:   user?.phone            || '',
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || '',
    state:   user?.address?.state   || 'Andhra Pradesh',
    pincode: user?.address?.pincode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [couponInput,   setCouponInput]   = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // ── Delivery settings from backend ────────────────────────────────
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(500);
  const [deliveryChargeAmt, setDeliveryChargeAmt]         = useState(50);

  useEffect(() => {
    orderAPI.getDeliverySettings()
      .then(res => {
        setFreeDeliveryThreshold(res.data.freeDeliveryThreshold);
        setDeliveryChargeAmt(res.data.deliveryCharge);
      })
      .catch(() => {}); // use defaults on error
  }, []);

  // ── Wait for cart to finish loading, THEN check if empty ──────────────────
  useEffect(() => {
    if (!orderPlaced.current && !cartLoading && (!cart || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  // Show spinner while cart is loading
  if (cartLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border" style={{ color: '#E8001D' }} />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) return null;

  const subtotal       = cart.totalAmount || 0;
  const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeAmt;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal     = subtotal + deliveryCharge - couponDiscount;

  const amountNeededForFreeDelivery = freeDeliveryThreshold - subtotal;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate({ code: couponInput.trim(), cartTotal: subtotal });
      setAppliedCoupon(res.data.coupon);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponInput(''); };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const phoneClean = address.phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);

    try {
      if (paymentMethod === 'Online') {
        // ── Step 1: Create Razorpay order on backend ───────────────
        const orderRes = await paymentAPI.createOrder({ couponCode: appliedCoupon?.code || '' });
        const { razorpayOrderId, amountPaise, currency, keyId } = orderRes.data;

        // ── Step 2: Open Razorpay popup ────────────────────────────
        const options = {
          key:      keyId,
          amount:   amountPaise,
          currency,
          name:     'Pakka Famous',
          description: 'Order Payment',
          order_id: razorpayOrderId,
          prefill: {
            name:    address.name,
            contact: address.phone,
            email:   user?.email || '',
          },
          theme: { color: '#E8001D' },

          // ── Step 3: On success — verify + place order ──────────
          handler: async (response) => {
            try {
              const placeRes = await paymentAPI.verifyAndPlace({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                shippingAddress: address,
                couponCode: appliedCoupon?.code || '',
              });
              orderPlaced.current = true;
              clearCart();
              toast.success('Payment successful! Order placed 🎉');
              navigate(`/orders/success/${placeRes.data.order._id}`);
            } catch (err) {
              toast.error(err.response?.data?.message || 'Order placement failed after payment. Please contact support.');
              setLoading(false);
            }
          },

          // ── On popup close / failure ───────────────────────────
          modal: {
            ondismiss: () => {
              toast('Payment cancelled. Your cart is safe.', { icon: 'ℹ️' });
              paymentAPI.failed({ razorpayOrderId }).catch(() => {});
              setLoading(false);
            },
          },
        };

        // Load Razorpay script dynamically if not already loaded
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Razorpay'));
            document.body.appendChild(script);
          });
        }

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          toast.error(`Payment failed: ${response.error.description}`);
          paymentAPI.failed({ razorpayOrderId, error: response.error }).catch(() => {});
          setLoading(false);
        });
        rzp.open();

      } else {
        // ── Cash on Delivery — unchanged ──────────────────────────
        const res = await orderAPI.place({
          shippingAddress: address,
          paymentMethod,
          couponCode: appliedCoupon?.code || '',
        });
        orderPlaced.current = true;
        navigate(`/orders/success/${res.data.order._id}`);
        clearCart();
        toast.success('Order placed! 🎉 WhatsApp confirmation coming shortly.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#F9FAFB', minHeight: '80vh', padding: '30px 0' }}>
      <div className="container">
        <h2 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginBottom: '24px' }}>📦 Checkout</h2>

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-4">
            <div className="col-lg-7">

              {/* Delivery Address */}
              <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
                <h5 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginBottom: '20px' }}>🏠 Delivery Address</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name *</label>
                    <input type="text" className="form-control" value={address.name}
                      onChange={e => setAddress({...address, name: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      WhatsApp / Mobile *
                      <span style={{ fontSize: 11, color: '#25D366', marginLeft: 6, fontWeight: 600 }}>
                        <FaWhatsapp style={{ marginRight: 2 }} />for order updates
                      </span>
                    </label>
                    <input type="tel" className="form-control" value={address.phone}
                      onChange={e => setAddress({...address, phone: e.target.value})}
                      required maxLength={13} placeholder="10-digit mobile number" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Street Address *</label>
                    <input type="text" className="form-control" value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">City *</label>
                    <input type="text" className="form-control" value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">State *</label>
                    <input type="text" className="form-control" value={address.state}
                      onChange={e => setAddress({...address, state: e.target.value})} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Pincode *</label>
                    <input type="text" className="form-control" value={address.pincode}
                      onChange={e => setAddress({...address, pincode: e.target.value})}
                      required maxLength={6} />
                  </div>
                </div>
                <div style={{ marginTop: 16, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FaWhatsapp style={{ color: '#25D366', fontSize: 20, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#166534', fontFamily: 'Poppins,sans-serif' }}>
                    Order confirmation will be sent to your WhatsApp number above
                  </span>
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
                <h5 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginBottom: '16px' }}>🎟️ Coupon Code</h5>
                {appliedCoupon ? (
                  <div className="d-flex align-items-center justify-content-between p-3 rounded-3"
                    style={{ background: '#f6ffed', border: '2px solid #52c41a' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <FaCheck />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#52c41a' }}>{appliedCoupon.code}</div>
                        <div style={{ fontSize: '13px', color: '#555' }}>You save ₹{appliedCoupon.discountAmount} ({appliedCoupon.discountPercentage}% off)</div>
                      </div>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="btn btn-sm btn-outline-danger"><FaTimes /></button>
                  </div>
                ) : (
                  <div className="input-group">
                    <span className="input-group-text"><FaTag style={{ color: '#d4380d' }} /></span>
                    <input type="text" className="form-control text-uppercase"
                      placeholder="Enter coupon code (e.g. PAKKA10)"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())} />
                    <button type="button" className="btn btn-pakka px-4" onClick={handleApplyCoupon} disabled={couponLoading}>
                      {couponLoading ? <span className="spinner-border spinner-border-sm" /> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3 p-4 shadow-sm">
                <h5 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginBottom: '16px' }}>💳 Payment Method</h5>
                <div className="row g-3">

                  {/* Cash on Delivery */}
                  <div className="col-md-6">
                    <div onClick={() => setPaymentMethod('COD')} style={{
                      border: `2px solid ${paymentMethod === 'COD' ? '#E8001D' : '#ddd'}`,
                      borderRadius: '12px', padding: '16px', cursor: 'pointer',
                      background: paymentMethod === 'COD' ? '#fff0f0' : 'white', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>💵 Cash on Delivery</div>
                      <div style={{ fontSize: 12, color: '#888' }}>Pay when your order arrives</div>
                      {paymentMethod === 'COD' && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#E8001D', fontWeight: 600 }}>✔ Selected</div>
                      )}
                    </div>
                  </div>

                  {/* Razorpay / UPI */}
                  <div className="col-md-6">
                    <div onClick={() => setPaymentMethod('Online')} style={{
                      border: `2px solid ${paymentMethod === 'Online' ? '#072654' : '#ddd'}`,
                      borderRadius: '12px', padding: '16px', cursor: 'pointer',
                      background: paymentMethod === 'Online' ? '#eef2ff' : 'white', transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                        <FaQrcode style={{ color: '#072654', fontSize: 15 }} />
                        <span style={{ fontWeight: 600 }}>UPI / Razorpay</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FaMobileAlt style={{ color: '#aaa', fontSize: 11 }} />
                        <span style={{ fontSize: 12, color: '#888' }}>GPay, PhonePe, Paytm, Cards</span>
                      </div>
                      {paymentMethod === 'Online' && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#072654', fontWeight: 600 }}>✔ Secure popup — stay on this page</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Razorpay info banner */}
                {paymentMethod === 'Online' && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <FaQrcode style={{ color: '#072654', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: '#1e3a5f', fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Secure payment via Razorpay</strong><br />
                      A secure popup opens on this page. Pay using GPay, PhonePe, Paytm, any UPI, debit/credit card, or net banking. You never leave this site.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-5">
              <div className="cart-summary">
                <h5 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginBottom: '16px' }}>📋 Order Summary</h5>
                {cart.items.map(item => item.product && (
                  <div key={item._id} className="d-flex justify-content-between py-2"
                    style={{ borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between mt-3 text-muted"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="d-flex justify-content-between text-muted">
                  <span>Delivery</span>
                  <span style={{ color: deliveryCharge === 0 ? '#52c41a' : 'inherit' }}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>

                {/* Free delivery progress */}
                {deliveryCharge > 0 && amountNeededForFreeDelivery > 0 && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#874d00', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaTruck />
                      Add ₹{amountNeededForFreeDelivery.toFixed(0)} more for FREE delivery
                    </div>
                    <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#fa8c16', borderRadius: 2, width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="d-flex justify-content-between" style={{ color: '#52c41a', fontWeight: 600 }}>
                    <span>🎟️ Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount.toFixed(0)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong style={{ fontSize: '1.1rem' }}>Total Amount</strong>
                  <strong style={{ fontSize: '1.3rem', color: '#E8001D' }}>₹{grandTotal.toFixed(0)}</strong>
                </div>
                <button type="submit" className="btn w-100 py-3" disabled={loading} style={{
                  fontSize: '16px', fontWeight: 700, borderRadius: 12,
                  background: paymentMethod === 'Online' ? '#072654' : '#E8001D',
                  color: 'white', border: 'none',
                }}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />{paymentMethod === 'Online' ? 'Opening Razorpay…' : 'Placing Order…'}</>
                    : paymentMethod === 'Online'
                      ? `🔒 Pay ₹${grandTotal.toFixed(0)} via Razorpay`
                      : `🛍️ Place Order — ₹${grandTotal.toFixed(0)}`
                  }
                </button>
                <div className="text-center mt-3 mb-0" style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <FaWhatsapp style={{ color: '#25D366', fontSize: 14 }} />
                  Confirmation sent via WhatsApp &amp; Email
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
