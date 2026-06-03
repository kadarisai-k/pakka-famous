import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../../services/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/user/ProductCard';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingAll, setAddingAll] = useState(false);
  useWishlist();
  const { addToCart } = useCart();

  const load = () => {
    setLoading(true);
    wishlistAPI.get()
      .then(r => setItems(r.data.wishlist?.items || []))
      .catch(() => toast.error('Could not load wishlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAddAllToCart = async () => {
    if (!items.length) return;
    setAddingAll(true);
    let added = 0;
    let failed = 0;
    for (const item of items) {
      if (!item.product) continue;
      try {
        const p = item.product;
        const defaultWeight = p.weightPrices?.length > 0 ? p.weightPrices[0].weight : undefined;
        await addToCart(p._id, 1, defaultWeight);
        added++;
      } catch {
        failed++;
      }
    }
    setAddingAll(false);
    if (added > 0) toast.success(`${added} item${added > 1 ? 's' : ''} added to cart! 🛒`);
    if (failed > 0) toast.error(`${failed} item${failed > 1 ? 's' : ''} could not be added`);
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color:'#E8001D' }} />
    </div>
  );

  return (
    <div className="container" style={{ background:'#F9FAFB', padding:'36px 16px', minHeight:'70vh' }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <FaHeart size={28} style={{ color:'#E8001D' }} />
        <h2 style={{ fontFamily:'Playfair Display, serif', fontWeight:900, margin:0 }}>My Wishlist</h2>
        <span style={{ background:'#f0f0f0', borderRadius:20, padding:'2px 12px', fontWeight:600, fontSize:14 }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>

        {/* Add All to Cart button */}
        {items.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            disabled={addingAll}
            style={{
              marginLeft:'auto',
              background: addingAll ? '#ccc' : 'linear-gradient(135deg,#E8001D,#c50018)',
              color:'white',
              border:'none',
              borderRadius:50,
              padding:'10px 24px',
              fontWeight:700,
              fontSize:14,
              cursor: addingAll ? 'not-allowed' : 'pointer',
              display:'flex',
              alignItems:'center',
              gap:8,
              boxShadow:'0 4px 14px rgba(232,0,29,0.3)',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { if(!addingAll) e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; }}
          >
            <FaShoppingCart size={15} />
            {addingAll ? 'Adding...' : `Add All ${items.length} to Cart`}
          </button>
        )}
      </div>

      {/* Info banner when items exist */}
      {items.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#fff5f0,#fff0e6)', border:'1.5px solid #ffd6c0', borderRadius:12, padding:'12px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#8b3000' }}>
          <FaShoppingCart size={14} />
          <span>Click <strong>Add All to Cart</strong> to add every item at once, or use individual <strong>Add to Cart</strong> buttons below.</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <div style={{ fontSize:'5rem', marginBottom:16 }}>💔</div>
          <h4 style={{ fontFamily:'Playfair Display, serif' }}>Your wishlist is empty</h4>
          <p className="text-muted">Save your favourite sweets here and order them anytime!</p>
          <Link to="/products" className="btn-brand" style={{ textDecoration:'none', marginTop:16, display:'inline-block' }}>
            Browse Sweets 🍬
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {items.map(item => item.product && (
            <div key={item.product._id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={item.product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
