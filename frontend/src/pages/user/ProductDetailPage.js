import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FaStar, FaMapMarkerAlt, FaShoppingCart, FaMinus, FaPlus, FaArrowLeft, FaWeight } from 'react-icons/fa';

const PLACEHOLDER = 'https://via.placeholder.com/600x400/fff3e0/d4380d?text=🍬+Sweet';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isLoggedIn, isAdmin } = useAuth();

  useEffect(() => { fetchProduct(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try { const res = await productAPI.getOne(id); setProduct(res.data.product); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#E8001D' }} /></div>;
  if (!product) return <div className="text-center py-5"><h4>Product not found</h4><Link to="/products" className="btn btn-pakka mt-3">Back</Link></div>;

  const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);
  const maxQty = product.availableQty || 99;

  const handleAddToCart = () => {
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    addToCart(product._id, quantity);
  };

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '30px 0' }}>
      <div className="container">
        <Link to="/products" className="btn btn-outline-secondary btn-sm mb-4"><FaArrowLeft className="me-1" />Back to Products</Link>
        <div className="bg-white rounded-3 shadow-sm overflow-hidden">
          <div className="row g-0">
            <div className="col-md-5">
              <img loading="lazy" src={product.image?.url || PLACEHOLDER} alt={product.name} className="w-100"
                style={{ height: '420px', objectFit: 'cover' }}
                onError={e => { e.target.src = PLACEHOLDER; }} />
            </div>
            <div className="col-md-7 p-4 p-md-5">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="product-city-badge"><FaMapMarkerAlt className="me-1" size={10} />{product.city}</span>
                <span className="badge" style={{ background: '#f0f0f0', color: '#555', fontSize: '11px' }}>{product.category}</span>
                {product.isFeatured && <span className="badge" style={{ background: '#722ed1', color: 'white', fontSize: '11px' }}>⭐ Featured</span>}
                {product.isSeasonalCollection && <span className="badge" style={{ background: '#fa8c16', color: 'white', fontSize: '11px' }}>🎉 {product.seasonalTag}</span>}
              </div>

              <h1 style={{ fontFamily: 'Playfair Display', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>{product.name}</h1>

              <div className="d-flex align-items-center gap-2 mb-3">
                <div>{[...Array(5)].map((_, i) => <FaStar key={i} style={{ color: i < Math.round(product.rating?.average || 4.5) ? '#faad14' : '#ddd', fontSize: '16px' }} />)}</div>
                <span style={{ color: '#666', fontSize: '14px' }}>{product.rating?.average?.toFixed(1) || '4.5'} ({product.rating?.count || 0} reviews)</span>
              </div>

              {/* Price + Weight display */}
              <div className="mb-3">
                <div className="d-flex align-items-baseline gap-2 flex-wrap">
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: '#E8001D' }}>₹{discountedPrice.toFixed(0)}</span>
                  {product.weight && (
                    <span style={{ fontSize: '1.1rem', color: '#666', fontWeight: 500 }}>/ {product.weight}</span>
                  )}
                  {product.discount > 0 && (
                    <span className="text-muted text-decoration-line-through" style={{ fontSize: '1.1rem' }}>₹{product.price}</span>
                  )}
                  {product.discount > 0 && (
                    <span className="badge" style={{ background: '#52c41a', color: 'white' }}>{product.discount}% OFF</span>
                  )}
                </div>
                {product.weight && (
                  <div style={{ marginTop: '6px', padding: '6px 12px', background: '#fff0f0', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#E8001D', fontWeight: 600 }}>
                    <FaWeight size={12} /> Pack size: {product.weight}
                  </div>
                )}
              </div>

              <p style={{ color: '#555', lineHeight: 1.8, marginBottom: '24px', fontSize: '15px' }}>{product.description}</p>

              {product.availableQty !== null && product.availableQty !== undefined && (
                <div className="mb-3" style={{ fontSize: '14px', color: '#888' }}>📦 {product.availableQty} packs available</div>
              )}

              {!isAdmin && (
                <div className="d-flex gap-3 align-items-center flex-wrap">
                  <div className="d-flex align-items-center border rounded-3 overflow-hidden">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="btn btn-light px-3 py-2" style={{ borderRadius: 0 }}><FaMinus size={12} /></button>
                    <span className="px-4 py-2 fw-bold" style={{ minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} className="btn btn-light px-3 py-2" style={{ borderRadius: 0 }}><FaPlus size={12} /></button>
                  </div>
                  <button onClick={handleAddToCart} className="btn btn-pakka btn-lg px-4">
                    <FaShoppingCart className="me-2" />Add to Cart — ₹{(discountedPrice * quantity).toFixed(0)}
                    {product.weight && ` (${quantity} × ${product.weight})`}
                  </button>
                </div>
              )}

              <div className="mt-4 p-3 rounded-2" style={{ background: '#fff0f0', border: '1px solid #fcc', fontSize: '13px' }}>
                <strong>📦 Delivery:</strong> Free above ₹500 &nbsp;|&nbsp; <strong>🚚 ETA:</strong> 3–5 business days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
