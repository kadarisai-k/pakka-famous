import React, { useState, useEffect, useRef, useCallback } from 'react';
import { specialsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FaPlus, FaEdit, FaTrash, FaGripVertical, FaToggleOn, FaToggleOff,
  FaSearch, FaLayerGroup, FaBox, FaTimes, FaUpload, FaMapMarkerAlt,
  FaTag, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';

// ── Helpers ───────────────────────────────────────────────────────
const TAG_OPTIONS = ['trending', 'festival', 'seasonal', 'new', 'bestseller'];
const TAG_META = {
  trending:   { label: 'Trending 🔥',   bg: '#FF4C29', color: '#fff' },
  festival:   { label: 'Festival 🎉',   bg: '#7C3AED', color: '#fff' },
  seasonal:   { label: 'Seasonal 🌿',   bg: '#16A34A', color: '#fff' },
  new:        { label: 'New ✨',         bg: '#0EA5E9', color: '#fff' },
  bestseller: { label: 'Best Seller ⭐', bg: '#F59E0B', color: '#fff' },
};
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90' viewBox='0 0 120 90'%3E%3Crect fill='%23F3F4F6' width='120' height='90'/%3E%3Ctext fill='%23D1D5DB' x='50%25' y='50%25' font-size='28' text-anchor='middle' dy='.35em'%3E🖼️%3C/text%3E%3C/svg%3E";

const btn = (extra = {}) => ({
  border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
  padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'opacity .15s',
  ...extra,
});

// ── Image Preview Input ───────────────────────────────────────────
function ImageInput({ label, preview, onFile }) {
  const ref = useRef();
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: '2px dashed #D1D5DB', borderRadius: 10, padding: 16,
          cursor: 'pointer', textAlign: 'center', background: '#F9FAFB',
          transition: 'border-color .2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#E8001D'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
      >
        {preview ? (
          <img src={preview} alt="" style={{ maxHeight: 100, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
        ) : (
          <div style={{ color: '#9CA3AF', fontSize: 13 }}>
            <FaUpload style={{ marginBottom: 4 }} /><br />Click to upload
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onFile(e.target.files[0])} />
    </div>
  );
}

// ── Modal Shell ───────────────────────────────────────────────────
function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18 }}><FaTimes /></button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#E8001D' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8,
  fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
};

// ── Category Form Modal ───────────────────────────────────────────
function CategoryModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initial?.image?.url || '');
  const [saving, setSaving] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Category name is required.');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('description', description.trim());
      fd.append('order', order);
      fd.append('isActive', isActive);
      if (imageFile) fd.append('image', imageFile);

      if (initial?._id) await specialsAPI.updateCategory(initial._id, fd);
      else await specialsAPI.createCategory(fd);

      toast.success(initial ? 'Category updated!' : 'Category created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    } finally { setSaving(false); }
  };

  return (
    <Modal title={initial ? 'Edit Category' : 'New Category'} onClose={onClose}>
      <ImageInput label="Category Image" preview={preview} onFile={handleFile} />
      <FormField label="Category Name" required>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. Rice & Grains" />
      </FormField>
      <FormField label="Description">
        <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, height: 70, resize: 'vertical' }} placeholder="Short description (optional)" />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField label="Display Order">
          <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} style={inputStyle} min={0} />
        </FormField>
        <FormField label="Status">
          <select value={isActive} onChange={e => setIsActive(e.target.value === 'true')} style={inputStyle}>
            <option value="true">Active</option>
            <option value="false">Hidden</option>
          </select>
        </FormField>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <button onClick={onClose} style={btn({ background: '#F3F4F6', color: '#374151' })}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={btn({ background: '#E8001D', color: '#fff', opacity: saving ? 0.7 : 1 })}>
          {saving ? 'Saving...' : (initial ? 'Update' : 'Create')}
        </button>
      </div>
    </Modal>
  );
}

// ── Product Form Modal ────────────────────────────────────────────
function ProductModal({ initial, categories, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [famousLocation, setFamousLocation] = useState(initial?.famousLocation || '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId?._id || initial?.categoryId || categories[0]?._id || '');
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [tags, setTags] = useState(initial?.tags || []);
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initial?.image?.url || '');
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Product name is required.');
    if (!price || Number(price) < 0) return toast.error('Valid price is required.');
    if (!categoryId) return toast.error('Please select a category.');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('price', Number(price));
      fd.append('description', description.trim());
      fd.append('famousLocation', famousLocation.trim());
      fd.append('categoryId', categoryId);
      fd.append('isAvailable', isAvailable);
      fd.append('tags', JSON.stringify(tags));
      fd.append('order', order);
      if (imageFile) fd.append('image', imageFile);

      if (initial?._id) await specialsAPI.updateProduct(initial._id, fd);
      else await specialsAPI.createProduct(fd);

      toast.success(initial ? 'Product updated!' : 'Product added!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally { setSaving(false); }
  };

  return (
    <Modal title={initial ? 'Edit Product' : 'Add Product'} onClose={onClose} width={580}>
      <ImageInput label="Product Image" preview={preview} onFile={handleFile} />
      <FormField label="Product Name" required>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. Guntur Red Chilli" />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField label="Price (₹)" required>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} placeholder="0" min={0} />
        </FormField>
        <FormField label="Category" required>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Famous Location">
        <div style={{ position: 'relative' }}>
          <FaMapMarkerAlt style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input value={famousLocation} onChange={e => setFamousLocation(e.target.value)} style={{ ...inputStyle, paddingLeft: 30 }} placeholder="e.g. Guntur District" />
        </div>
      </FormField>
      <FormField label="Description">
        <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Brief description of this product..." />
      </FormField>
      <FormField label="Tags">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TAG_OPTIONS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              style={{
                ...btn({ padding: '5px 12px', fontSize: 12 }),
                background: tags.includes(tag) ? TAG_META[tag].bg : '#F3F4F6',
                color: tags.includes(tag) ? TAG_META[tag].color : '#374151',
              }}
            >
              {TAG_META[tag].label}
            </button>
          ))}
        </div>
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField label="Availability">
          <select value={isAvailable} onChange={e => setIsAvailable(e.target.value === 'true')} style={inputStyle}>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </FormField>
        <FormField label="Display Order">
          <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} style={inputStyle} min={0} />
        </FormField>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <button onClick={onClose} style={btn({ background: '#F3F4F6', color: '#374151' })}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={btn({ background: '#E8001D', color: '#fff', opacity: saving ? 0.7 : 1 })}>
          {saving ? 'Saving...' : (initial ? 'Update' : 'Add Product')}
        </button>
      </div>
    </Modal>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Confirm Delete" onClose={onClose} width={380}>
      <p style={{ color: '#374151', fontSize: 14, margin: '0 0 20px' }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={btn({ background: '#F3F4F6', color: '#374151' })}>Cancel</button>
        <button
          onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
          disabled={busy}
          style={btn({ background: '#DC2626', color: '#fff', opacity: busy ? 0.7 : 1 })}
        >
          {busy ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

// ── Main Admin Specials Component ─────────────────────────────────
export default function AdminSpecials() {
  const [tab, setTab] = useState('categories'); // 'categories' | 'products'
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [prodsLoading, setProdsLoading] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedCats, setExpandedCats] = useState({});
  const searchTimer = useRef();

  // Modals
  const [catModal, setCatModal]     = useState(null); // null | 'new' | category-object
  const [prodModal, setProdModal]   = useState(null); // null | 'new' | product-object
  const [deleteModal, setDeleteModal] = useState(null); // null | { type, item }

  const LIMIT = 30;

  const loadCategories = useCallback(() => {
    setCatsLoading(true);
    specialsAPI.adminGetCategories()
      .then(r => setCategories(r.data.data || []))
      .catch(() => toast.error('Failed to load categories.'))
      .finally(() => setCatsLoading(false));
  }, []);

  const loadProducts = useCallback(() => {
    setProdsLoading(true);
    const params = { page, limit: LIMIT };
    if (filterCat) params.category = filterCat;
    if (search) params.search = search;
    specialsAPI.adminGetProducts(params)
      .then(r => { setProducts(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error('Failed to load products.'))
      .finally(() => setProdsLoading(false));
  }, [filterCat, search, page]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { if (tab === 'products') loadProducts(); }, [tab, loadProducts]);

  const handleDeleteCategory = async (cat) => {
    try {
      await specialsAPI.deleteCategory(cat._id);
      toast.success('Category deleted.');
      loadCategories();
      setDeleteModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleDeleteProduct = async (prod) => {
    try {
      await specialsAPI.deleteProduct(prod._id);
      toast.success('Product deleted.');
      loadProducts();
      setDeleteModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleToggleProduct = async (prod) => {
    try {
      await specialsAPI.toggleProduct(prod._id);
      toast.success(prod.isAvailable ? 'Marked Out of Stock' : 'Marked In Stock');
      loadProducts();
    } catch { toast.error('Toggle failed.'); }
  };

  const handleSearch = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  };

  // ── RENDER ──
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111', fontFamily: 'Playfair Display, serif' }}>
            🌟 Specials Manager
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>
            Manage special categories and products shown on the /specials page
          </p>
        </div>
        <button
          onClick={() => tab === 'categories' ? setCatModal('new') : setProdModal('new')}
          style={btn({ background: '#E8001D', color: '#fff', fontSize: 14, padding: '10px 20px' })}
        >
          <FaPlus /> {tab === 'categories' ? 'New Category' : 'Add Product'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'categories', label: 'Categories', icon: <FaLayerGroup /> },
          { key: 'products',   label: 'Products',   icon: <FaBox /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            ...btn({ padding: '8px 20px' }),
            background: tab === t.key ? '#fff' : 'transparent',
            color: tab === t.key ? '#E8001D' : '#6B7280',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
          }}>
            {t.icon} {t.label}
            {t.key === 'categories' && <span style={{ background: '#E8001D20', color: '#E8001D', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{categories.length}</span>}
          </button>
        ))}
      </div>

      {/* ── CATEGORIES TAB ── */}
      {tab === 'categories' && (
        catsLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner-border" style={{ color: '#E8001D' }} /></div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 56 }}>🗂️</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#374151' }}>No categories yet</h3>
            <p style={{ color: '#9CA3AF' }}>Create your first category like "Rice & Grains" or "Spices".</p>
            <button onClick={() => setCatModal('new')} style={btn({ background: '#E8001D', color: '#fff', fontSize: 14, padding: '10px 22px' })}>
              <FaPlus /> Create First Category
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Quick tip */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#92400E', marginBottom: 8 }}>
              💡 <strong>Tip:</strong> Set the "Display Order" number when editing to control the order categories appear on the Specials page.
            </div>
            {categories.map(cat => (
              <div key={cat._id} style={{
                background: '#fff', borderRadius: 12, border: '1.5px solid #F3F4F6',
                overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                  <FaGripVertical style={{ color: '#D1D5DB', cursor: 'grab', flexShrink: 0 }} />
                  {cat.image?.url ? (
                    <img src={cat.image.url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🗂️</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{cat.name}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: cat.isActive ? '#DCFCE7' : '#FEE2E2', color: cat.isActive ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                        {cat.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    {cat.description && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</p>}
                    <span style={{ fontSize: 11, color: '#D1D5DB' }}>slug: {cat.slug} · order: {cat.order}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => { setFilterCat(cat._id); setTab('products'); }}
                      style={btn({ background: '#EFF6FF', color: '#2563EB', padding: '6px 12px', fontSize: 12 })}
                      title="View products in this category"
                    >
                      <FaBox /> Products
                    </button>
                    <button onClick={() => setCatModal(cat)} style={btn({ background: '#F3F4F6', color: '#374151', padding: '6px 10px' })} title="Edit">
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ type: 'category', item: cat })}
                      style={btn({ background: '#FEE2E2', color: '#DC2626', padding: '6px 10px' })}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── PRODUCTS TAB ── */}
      {tab === 'products' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={searchInput}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search products..."
                style={{ ...inputStyle, paddingLeft: 34, width: '100%' }}
              />
            </div>
            <select
              value={filterCat}
              onChange={e => { setFilterCat(e.target.value); setPage(1); }}
              style={{ ...inputStyle, width: 'auto', minWidth: 180 }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {(filterCat || search) && (
              <button
                onClick={() => { setFilterCat(''); setSearchInput(''); setSearch(''); setPage(1); }}
                style={btn({ background: '#F3F4F6', color: '#374151' })}
              >
                <FaTimes /> Clear
              </button>
            )}
          </div>

          <p style={{ color: '#9CA3AF', fontSize: 13, margin: '0 0 14px' }}>
            {prodsLoading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''}`}
          </p>

          {prodsLoading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner-border" style={{ color: '#E8001D' }} /></div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: 56 }}>📦</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#374151' }}>No products yet</h3>
              <p style={{ color: '#9CA3AF' }}>Add your first special product to a category.</p>
              <button onClick={() => setProdModal('new')} style={btn({ background: '#E8001D', color: '#fff', fontSize: 14, padding: '10px 22px' })}>
                <FaPlus /> Add First Product
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {products.map(prod => (
                  <div key={prod._id} style={{
                    background: '#fff', borderRadius: 12, border: '1.5px solid #F3F4F6',
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    opacity: prod.isAvailable ? 1 : 0.65,
                  }}>
                    <img
                      src={prod.image?.url || PLACEHOLDER}
                      alt={prod.name}
                      style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.src = PLACEHOLDER; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{prod.name}</span>
                        {prod.tags?.map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: TAG_META[tag]?.bg || '#6B7280', color: TAG_META[tag]?.color || '#fff', fontWeight: 600 }}>
                            {TAG_META[tag]?.label || tag}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#E8001D' }}>₹{prod.price}</span>
                        {prod.famousLocation && <span style={{ fontSize: 12, color: '#9CA3AF' }}>📍 {prod.famousLocation}</span>}
                        {prod.categoryId?.name && <span style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', padding: '1px 8px', borderRadius: 8 }}>{prod.categoryId.name}</span>}
                        <span style={{ fontSize: 12, fontWeight: 600, color: prod.isAvailable ? '#16A34A' : '#DC2626' }}>
                          {prod.isAvailable ? '✓ In Stock' : '✗ Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggleProduct(prod)}
                        style={btn({ background: prod.isAvailable ? '#DCFCE7' : '#FEE2E2', color: prod.isAvailable ? '#16A34A' : '#DC2626', padding: '6px 10px' })}
                        title={prod.isAvailable ? 'Mark Out of Stock' : 'Mark In Stock'}
                      >
                        {prod.isAvailable ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                      </button>
                      <button onClick={() => setProdModal(prod)} style={btn({ background: '#F3F4F6', color: '#374151', padding: '6px 10px' })} title="Edit">
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ type: 'product', item: prod })}
                        style={btn({ background: '#FEE2E2', color: '#DC2626', padding: '6px 10px' })}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {total > LIMIT && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '24px 0' }}>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={btn({ background: page === 1 ? '#F3F4F6' : '#E8001D', color: page === 1 ? '#9CA3AF' : '#fff' })}>← Prev</button>
                  <span style={{ padding: '8px 14px', fontWeight: 600, color: '#374151', fontSize: 13 }}>Page {page} / {Math.ceil(total / LIMIT)}</span>
                  <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)} style={btn({ background: page >= Math.ceil(total / LIMIT) ? '#F3F4F6' : '#E8001D', color: page >= Math.ceil(total / LIMIT) ? '#9CA3AF' : '#fff' })}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      {catModal && (
        <CategoryModal
          initial={catModal === 'new' ? null : catModal}
          onSave={() => { setCatModal(null); loadCategories(); }}
          onClose={() => setCatModal(null)}
        />
      )}

      {prodModal && (
        <ProductModal
          initial={prodModal === 'new' ? null : prodModal}
          categories={categories}
          onSave={() => { setProdModal(null); loadProducts(); }}
          onClose={() => setProdModal(null)}
        />
      )}

      {deleteModal && (
        <ConfirmModal
          message={
            deleteModal.type === 'category'
              ? `Delete category "${deleteModal.item.name}"? All products in this category will also be permanently deleted.`
              : `Delete product "${deleteModal.item.name}"? This cannot be undone.`
          }
          onConfirm={() =>
            deleteModal.type === 'category'
              ? handleDeleteCategory(deleteModal.item)
              : handleDeleteProduct(deleteModal.item)
          }
          onClose={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}
