import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, citySweetAPI } from '../../services/api';
import ProductCard from '../../components/user/ProductCard';
import { FaSearch, FaTimes } from 'react-icons/fa';

const CATEGORIES = ['Laddu','Kaja','Pootharekulu','Halwa','Burfi','Murukku','Payasam','Other'];
const SORT_OPTIONS = [
  { value: '', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'bestselling', label: 'Best Selling' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [cities, setCities] = useState([]);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { citySweetAPI.getAll().then(r => setCities((r.data.citySweets || []).map(c => c.cityName).filter(Boolean).sort())); }, []);
  useEffect(() => { fetchProducts(); }, [search, city, category, sort, page]); // eslint-disable-line
  useEffect(() => {
    const s = searchParams.get('search'); const c = searchParams.get('city');
    if (s) setSearch(s); if (c) setCity(c);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (city) params.city = city;
      if (category) params.category = category;
      if (sort) params.sort = sort;
      const res = await productAPI.getAll(params);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const reset = () => { setSearch(''); setCity(''); setCategory(''); setSort(''); setPage(1); setSearchParams({}); };
  const hasFilters = search || city || category || sort;

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '28px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, color: '#111827', margin: 0, fontSize: 28 }}>All Sweets</h2>
              <p style={{ color: '#6B7280', margin: '4px 0 0', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{pagination.total} authentic products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 16px' }}>
        {/* Filter bar */}
        <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 20 }}>
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><FaSearch size={12} /></span>
                <input type="text" className="form-control" placeholder="Search sweets…" value={search}
                  style={{ paddingLeft: 34, fontSize: 13 }}
                  onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={city} style={{ fontSize: 13 }} onChange={e => { setCity(e.target.value); setPage(1); }}>
                <option value="">All Cities</option>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={category} style={{ fontSize: 13 }} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={sort} style={{ fontSize: 13 }} onChange={e => { setSort(e.target.value); setPage(1); }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {hasFilters && (
              <div className="col-md-auto">
                <button onClick={reset} className="btn-brand-outline" style={{ padding: '9px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FaTimes size={10} /> Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* City pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={() => { setCity(''); setPage(1); }} className={`location-chip${!city ? ' active' : ''}`}>All</button>
          {cities.map(c => (
            <button key={c} onClick={() => { setCity(c); setPage(1); }} className={`location-chip${city === c ? ' active' : ''}`}>{c}</button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner-border" /></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>🍬</div>
            <h4 style={{ fontFamily: 'Playfair Display, serif', color: '#111827' }}>No sweets found</h4>
            <p style={{ color: '#6B7280', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Try adjusting your filters</p>
            <button className="btn-brand-outline" onClick={reset}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="row g-3">
              {products.map(p => <div key={p._id} className="col-6 col-md-4 col-lg-3"><ProductCard product={p} /></div>)}
            </div>
            {pagination.pages > 1 && (
              <nav style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
                <ul className="pagination">
                  <li className={`page-item${page === 1 ? ' disabled' : ''}`}><button className="page-link" onClick={() => setPage(p => p - 1)}>←</button></li>
                  {[...Array(Math.min(pagination.pages, 7))].map((_, i) => (
                    <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}><button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button></li>
                  ))}
                  <li className={`page-item${page === pagination.pages ? ' disabled' : ''}`}><button className="page-link" onClick={() => setPage(p => p + 1)}>→</button></li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default ProductsPage;
