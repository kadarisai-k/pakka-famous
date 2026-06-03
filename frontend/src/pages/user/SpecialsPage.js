import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { specialsAPI } from '../../services/api';

const TAG_META = {
  trending:   { label: 'Trending 🔥',   bg: '#FF4C29', color: '#fff' },
  festival:   { label: 'Festival 🎉',   bg: '#7C3AED', color: '#fff' },
  seasonal:   { label: 'Seasonal 🌿',   bg: '#16A34A', color: '#fff' },
  new:        { label: 'New ✨',         bg: '#0EA5E9', color: '#fff' },
  bestseller: { label: 'Best Seller ⭐', bg: '#F59E0B', color: '#fff' },
};

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23F3F4F6' width='400' height='300'/%3E%3Ctext fill='%23D1D5DB' x='50%25' y='50%25' font-size='48' text-anchor='middle' dy='.35em'%3E🛒%3C/text%3E%3C/svg%3E";

function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(product.image?.url || PLACEHOLDER);
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      transition: 'transform .2s, box-shadow .2s',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.13)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      {/* Tags */}
      {product.tags?.length > 0 && (
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexWrap: 'wrap', gap: 4, zIndex: 2 }}>
          {product.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: TAG_META[tag]?.bg || '#6B7280', color: TAG_META[tag]?.color || '#fff',
              letterSpacing: 0.3,
            }}>{TAG_META[tag]?.label || tag}</span>
          ))}
        </div>
      )}

      {/* Availability badge */}
      {!product.isAvailable && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.45)', borderRadius: 16, zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, background: 'rgba(0,0,0,0.6)', padding: '6px 14px', borderRadius: 20 }}>
            Out of Stock
          </span>
        </div>
      )}

      {/* Image */}
      <div style={{ height: 180, overflow: 'hidden', background: '#F9FAFB' }}>
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          onError={() => setImgSrc(PLACEHOLDER)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.3, fontFamily: 'Playfair Display, serif' }}>
          {product.name}
        </h4>
        {product.famousLocation && (
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📍</span> {product.famousLocation}
          </p>
        )}
        {product.description && (
          <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.description}
          </p>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#E8001D' }}>₹{product.price}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: product.isAvailable ? '#DCFCE7' : '#FEE2E2',
            color: product.isAvailable ? '#16A34A' : '#DC2626',
          }}>
            {product.isAvailable ? '✓ In Stock' : '✗ Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, isActive, onSelect }) {
  return (
    <button
      onClick={() => onSelect(category.slug)}
      style={{
        background: isActive ? '#E8001D' : '#fff',
        color: isActive ? '#fff' : '#374151',
        border: `2px solid ${isActive ? '#E8001D' : '#E5E7EB'}`,
        borderRadius: 40, padding: '8px 18px', fontWeight: 600,
        fontSize: 13, cursor: 'pointer', transition: 'all .2s',
        whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      {category.image?.url && (
        <img src={category.image.url} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
      )}
      {category.name}
    </button>
  );
}

export default function SpecialsPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts]   = useState([]);
  const [activeSlug, setActiveSlug] = useState(categorySlug || 'all');
  const [activeTag, setActiveTag] = useState('');
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [prodLoading, setProdLoading] = useState(false);
  const searchTimer = useRef(null);

  const LIMIT = 24;

  // Load categories once
  useEffect(() => {
    specialsAPI.getCategories()
      .then(r => setCategories(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Sync URL param → active slug
  useEffect(() => {
    setActiveSlug(categorySlug || 'all');
    setPage(1);
  }, [categorySlug]);

  // Load products whenever filters change
  const loadProducts = useCallback(() => {
    setProdLoading(true);
    const params = { page, limit: LIMIT };
    if (activeSlug && activeSlug !== 'all') params.category = activeSlug;
    if (activeTag) params.tag = activeTag;
    if (search) params.search = search;

    specialsAPI.getProducts(params)
      .then(r => { setProducts(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setProdLoading(false));
  }, [activeSlug, activeTag, search, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleCategorySelect = (slug) => {
    setPage(1);
    setActiveTag('');
    if (slug === 'all') navigate('/specials');
    else navigate(`/specials/${slug}`);
  };

  const handleSearch = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  };

  const activeCat = categories.find(c => c.slug === activeSlug);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <div className="spinner-border" style={{ color: '#E8001D' }} />
    </div>
  );

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FF4C29 0%, #E8001D 50%, #C00016 100%)',
        color: '#fff', padding: '48px 20px 40px', textAlign: 'center',
      }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: 0 }}>
          🌟 Specials
        </h1>
        <p style={{ fontSize: 16, opacity: 0.9, margin: '10px 0 0', fontWeight: 400 }}>
          Authentic flavours from across Andhra Pradesh &amp; Telangana
        </p>

        {/* Search */}
        <div style={{ maxWidth: 480, margin: '24px auto 0', position: 'relative' }}>
          <input
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search products, locations..."
            style={{
              width: '100%', padding: '14px 48px 14px 18px', borderRadius: 40,
              border: 'none', fontSize: 15, outline: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          />
          <span style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>

        {/* Category Pills */}
        <div style={{ padding: '20px 0 10px', overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
          <CategorySection
            category={{ name: 'All Specials', slug: 'all' }}
            isActive={activeSlug === 'all'}
            onSelect={handleCategorySelect}
          />
          {categories.map(cat => (
            <CategorySection
              key={cat._id}
              category={cat}
              isActive={activeSlug === cat.slug}
              onSelect={handleCategorySelect}
            />
          ))}
        </div>

        {/* Tag filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 0 16px' }}>
          <button
            onClick={() => { setActiveTag(''); setPage(1); }}
            style={{
              background: !activeTag ? '#111' : '#fff', color: !activeTag ? '#fff' : '#374151',
              border: `1.5px solid ${!activeTag ? '#111' : '#D1D5DB'}`,
              borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >All</button>
          {Object.entries(TAG_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => { setActiveTag(key); setPage(1); }}
              style={{
                background: activeTag === key ? meta.bg : '#fff',
                color: activeTag === key ? meta.color : '#374151',
                border: `1.5px solid ${activeTag === key ? meta.bg : '#D1D5DB'}`,
                borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >{meta.label}</button>
          ))}
        </div>

        {/* Section heading */}
        {activeCat && (
          <div style={{ padding: '8px 0 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            {activeCat.image?.url && (
              <img src={activeCat.image.url} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }} />
            )}
            <div>
              <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 800, color: '#111' }}>{activeCat.name}</h2>
              {activeCat.description && <p style={{ margin: 0, color: '#6B7280', fontSize: 13 }}>{activeCat.description}</p>}
            </div>
          </div>
        )}

        {/* Results count */}
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: '0 0 16px' }}>
          {prodLoading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
        </p>

        {/* Products Grid */}
        {prodLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner-border" style={{ color: '#E8001D' }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64 }}>🛒</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#374151' }}>No products found</h3>
            <p style={{ color: '#9CA3AF' }}>
              {search ? 'Try a different search term.' : 'Check back soon — new items are added regularly!'}
            </p>
            {search && (
              <button onClick={() => { setSearchInput(''); handleSearch(''); }}
                style={{ background: '#E8001D', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 20, paddingBottom: 40,
          }}>
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && !prodLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '20px 0 48px' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{ background: page === 1 ? '#F3F4F6' : '#E8001D', color: page === 1 ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >← Prev</button>
            <span style={{ padding: '8px 16px', fontWeight: 600, color: '#374151' }}>
              Page {page} of {Math.ceil(total / LIMIT)}
            </span>
            <button
              disabled={page >= Math.ceil(total / LIMIT)}
              onClick={() => setPage(p => p + 1)}
              style={{ background: page >= Math.ceil(total / LIMIT) ? '#F3F4F6' : '#E8001D', color: page >= Math.ceil(total / LIMIT) ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: page >= Math.ceil(total / LIMIT) ? 'not-allowed' : 'pointer' }}
            >Next →</button>
          </div>
        )}

        {/* Empty state when no categories */}
        {categories.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64 }}>🌟</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif' }}>Coming Soon!</h3>
            <p style={{ color: '#9CA3AF' }}>We're curating the best specials for you. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
