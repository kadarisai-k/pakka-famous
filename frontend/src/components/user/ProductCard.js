import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const hasWeights = product.weightPrices?.length > 0;
  const [selectedWeight, setSelectedWeight] = useState(hasWeights ? product.weightPrices[0] : null);
  const [adding, setAdding] = useState(false);

  const isTodaySpecial = product.isTodaySpecial && product.todaySpecialPrice > 0;
  const todaySpecialPrice = isTodaySpecial ? product.todaySpecialPrice : null;
  const displayPrice = todaySpecialPrice
    ? todaySpecialPrice
    : hasWeights ? (selectedWeight?.price || product.weightPrices[0]?.price) : (product.discountedPrice || product.price);
  const normalPrice = hasWeights ? (selectedWeight?.price || product.weightPrices[0]?.price) : (product.discountedPrice || product.price);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product._id, 1, selectedWeight?.weight);
      toast.success('Added to cart!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not add to cart'); }
    finally { setAdding(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    const added = await toggleWishlist(product._id);
    if (added === true) toast.success('Added to wishlist ❤️');
    else if (added === false) toast.success('Removed from wishlist');
  };

  const wishlisted = isWishlisted(product._id);
  const displayName = product.city && product.name?.toLowerCase().startsWith(product.city.toLowerCase())
    ? product.name.substring(product.city.length).trim()
    : product.name;

  return (
    <div className="product-card">
      {/* Image */}
      <Link to={`/products/${product._id}`} style={{ display: 'block', position: 'relative', overflow: 'hidden' }}>
        <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
          {product.image?.url
            ? <img loading="lazy" src={product.image.url} alt={product.name} className="product-card-img" />
            : <div className="product-card-img placeholder-sweet" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🍬</div>
          }
          {product.discount > 0 && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: '#E8001D', color: 'white', borderRadius: 999, padding: '2px 9px', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
              {product.discount}% OFF
            </div>
          )}

        </div>
      </Link>

      {/* Body */}
      <div className="product-card-body">
        <span className="product-city-tag">📍 {product.city}</span>
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
          <p className="product-name">{displayName}</p>
        </Link>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
          <span className="product-price">₹{isTodaySpecial ? todaySpecialPrice : (hasWeights ? (selectedWeight?.price || product.weightPrices[0].price) : displayPrice)}</span>
          {(selectedWeight?.weight || product.weightPrices?.[0]?.weight) && (
            <span className="product-price-weight">/ {selectedWeight?.weight || product.weightPrices[0].weight}</span>
          )}
          {isTodaySpecial && normalPrice !== todaySpecialPrice && (
            <span style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through', fontFamily: 'Inter, sans-serif' }}>₹{normalPrice}</span>
          )}
        </div>

        {/* Weight selector */}
        {hasWeights && product.weightPrices.length > 1 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {product.weightPrices.slice(0, 3).map(wp => (
              <button key={wp.weight} className={`weight-btn${selectedWeight?.weight === wp.weight ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); setSelectedWeight(wp); }}>
                {wp.weight}
              </button>
            ))}
          </div>
        )}

        {/* Rating */}
        {product.rating?.average > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, fontSize: 12 }}>
            <FaStar style={{ color: '#F59E0B' }} />
            <span style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>{product.rating.average.toFixed(1)} ({product.rating.count})</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button className="btn-pakka" style={{ flex: 1, padding: '8px 10px', fontSize: 12, borderRadius: 9, justifyContent: 'center' }}
            onClick={handleAddToCart} disabled={adding}>
            <FaShoppingCart size={12} /> {adding ? '...' : 'Add to Cart'}
          </button>
          <button className={`wishlist-btn${wishlisted ? ' active' : ''}`} onClick={handleWishlist} title={wishlisted ? 'Remove' : 'Wishlist'}>
            <FaHeart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
