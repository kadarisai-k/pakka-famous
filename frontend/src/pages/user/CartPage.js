import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaTruck } from 'react-icons/fa';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(500);
  const [deliveryChargeAmt, setDeliveryChargeAmt]         = useState(50);

  useEffect(() => {
    orderAPI.getDeliverySettings()
      .then(res => {
        setFreeDeliveryThreshold(res.data.freeDeliveryThreshold);
        setDeliveryChargeAmt(res.data.deliveryCharge);
      })
      .catch(() => {});
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner-border" /></div>;

  const subtotal = cart?.totalAmount || 0;
  const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeAmt;
  const total = subtotal + deliveryCharge;
  const items = cart?.items || [];
  const amountNeeded = freeDeliveryThreshold - subtotal;

  if (items.length === 0) return (
    <div style={{ background: '#F9FAFB', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <FaShoppingBag size={32} style={{ color: '#D1D5DB' }} />
        </div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#111827', marginBottom: 8 }}>Your cart is empty</h3>
        <p style={{ color: '#6B7280', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>Add some delicious Andhra sweets!</p>
        <Link to="/products"><button className="btn-pakka" style={{ padding: '12px 28px' }}>Browse Sweets</button></Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#F9FAFB', minHeight: '80vh', padding: '32px 0' }}>
      <div className="container">
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', marginBottom: 24 }}>
          Shopping Cart <span style={{ fontSize: 16, fontFamily: 'Inter, sans-serif', color: '#6B7280', fontWeight: 400 }}>({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </h2>

        <div className="row g-4">
          <div className="col-lg-8">
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              {items.map((item, idx) => item.product && (
                <CartRow key={`${item.product._id}-${item.selectedWeight || ''}`} item={item}
                  onUpdateQty={qty => updateQuantity(item.product._id, qty, item.selectedWeight)}
                  onRemove={() => removeFromCart(item.product._id, item.selectedWeight)}
                  isLast={idx === items.length - 1}
                />
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="cart-summary">
              <h5 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#111827', marginBottom: 20 }}>Order Summary</h5>
              {items.map(item => item.product && (
                <div key={`${item.product._id}-${item.selectedWeight}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
                  <span style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product.name}{item.selectedWeight ? ` (${item.selectedWeight})` : ''} ×{item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <hr style={{ borderColor: '#F3F4F6', margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 14, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                <span>Delivery</span>
                <span style={{ color: deliveryCharge === 0 ? '#16A34A' : '#374151', fontWeight: deliveryCharge === 0 ? 600 : 400 }}>
                  {deliveryCharge === 0 ? '🎉 FREE' : `₹${deliveryChargeAmt}`}
                </span>
              </div>
              {deliveryCharge > 0 && amountNeeded > 0 && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontSize: 12, color: '#C2410C', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <FaTruck />
                    Add ₹{amountNeeded.toFixed(0)} more for FREE delivery!
                  </div>
                  <div style={{ height: 4, background: '#FED7AA', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#EA580C', borderRadius: 2, width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              <hr style={{ borderColor: '#F3F4F6', margin: '0 0 14px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', fontFamily: 'Inter, sans-serif' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: '#E8001D', fontFamily: 'Inter, sans-serif' }}>₹{total.toFixed(0)}</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn-pakka" style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15, borderRadius: 12 }}>
                Proceed to Checkout →
              </button>
              <Link to="/products">
                <button style={{ width: '100%', marginTop: 10, background: 'none', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: 10, fontSize: 13, color: '#6B7280', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#E8001D'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                >Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartRow = ({ item, onUpdateQty, onRemove, isLast }) => {
  const p = item.product;
  const baseWeight = item.selectedWeight || p.weight || '';
  const lineTotal = item.price * item.quantity;
  return (
    <div style={{ padding: '18px 20px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <img loading="lazy" src={p.image?.url || ''} alt={p.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flexShrink: 0, background: '#F9FAFB' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 14, fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>{p.city}{baseWeight ? ` · ${baseWeight}` : ''}</div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => onUpdateQty(item.quantity - 1)} className="qty-btn"><FaMinus size={9} /></button>
              <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#111827' }}>{item.quantity}</span>
              <button onClick={() => onUpdateQty(item.quantity + 1)} className="qty-btn"><FaPlus size={9} /></button>
            </div>
            <span style={{ color: '#E8001D', fontWeight: 800, fontSize: 15, fontFamily: 'Inter, sans-serif' }}>₹{lineTotal.toFixed(0)}</span>
          </div>
        </div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4, transition: 'color .2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#E8001D'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
        ><FaTrash size={13} /></button>
      </div>
    </div>
  );
};

export default CartPage;
