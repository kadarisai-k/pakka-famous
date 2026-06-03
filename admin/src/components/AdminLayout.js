import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contentAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaTags, FaImage,
  FaMapMarkerAlt, FaBookOpen, FaGift, FaCog, FaSignOutAlt, FaBars,
  FaStar, FaFire, FaQuoteLeft, FaBoxOpen, FaClipboardList, FaTimes,
  FaChartLine, FaLayerGroup,
} from 'react-icons/fa';

// Logo fetched once and cached — never re-renders on nav
const SidebarLogo = React.memo(() => {
  const [logoUrl, setLogoUrl] = useState(() => {
    try { const c = localStorage.getItem('pakka_logo'); if (c) { const d = JSON.parse(c); return d?.url || ''; } } catch (_) {}
    return '';
  });
  useEffect(() => {
    contentAPI.getHomepage().then(r => {
      if (r.data.content?.logo?.url) {
        setLogoUrl(r.data.content.logo.url);
        try { localStorage.setItem('pakka_logo', JSON.stringify(r.data.content.logo)); } catch (_) {}
      }
    }).catch(() => {});
  }, []); // empty deps — runs once only

  if (logoUrl) {
    return (
      <img src={logoUrl} alt="Pakka Famous"
        style={{ height: 70, maxWidth: 210, objectFit: 'contain', objectPosition: 'left center', display: 'block', margin: '0', padding: '0', lineHeight: 0 }} />
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#FFD84D,#FF4C29)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍬</div>
      <span style={{ fontFamily: 'Playfair Display,serif', color: '#1A1A1A', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>Pakka Famous</span>
    </div>
  );
});

const NavLink = ({ to, icon, label, color }) => {
  const location = useLocation();
  const active = location.pathname === to;
  const activeColor = color || '#8B6800';
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none',
      color: active ? activeColor : '#4B5563',
      background: active ? (color ? `${color}14` : 'var(--yellow-lt)') : 'transparent',
      padding: '9px 12px 9px 16px', margin: '1px 8px', borderRadius: 8,
      fontSize: 13, fontWeight: active ? 600 : 500,
      fontFamily: 'Poppins,sans-serif', transition: 'all .18s',
      position: 'relative',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#1A1A1A'; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4B5563'; }}}>
      {active && (
        <span style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, background: color || '#F5C800', borderRadius: '0 3px 3px 0' }} />
      )}
      <span style={{ fontSize: 14, opacity: active ? 1 : 0.7, flexShrink: 0, color: active ? (color || '#F5C800') : undefined }}>{icon}</span>
      {label}
    </Link>
  );
};

const SectionLabel = ({ label }) => (
  <div style={{ padding: '14px 16px 4px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.8px', color: '#9CA3AF', textTransform: 'uppercase', fontFamily: 'Poppins,sans-serif' }}>{label}</div>
);

// Sidebar is extracted as a stable component so navigation doesn't re-mount it
const Sidebar = React.memo(({ user, onLogout, onClose }) => (
  <div style={{ width: 256, minWidth: 256, background: '#FFFFFF', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1.5px solid #E5E7EB', overflow: 'hidden' }}>
    {/* Logo area */}
    <div style={{ padding: '10px 16px 10px', borderBottom: '1.5px solid #F3F4F6', flexShrink: 0, lineHeight: 0 }}>
      <SidebarLogo />
      {/* User chip */}
      <div style={{ marginTop: 12, background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD84D,#FF4C29)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#1A1A1A', flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1A1A' }}>{user?.name || 'Admin'}</div>
          <div style={{ fontSize: 10, color: '#9CA3AF' }}>Administrator</div>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }} onClick={onClose}>
      <SectionLabel label="Management" />
      <NavLink to="/dashboard"       icon={<FaTachometerAlt />} label="Dashboard" />
      <NavLink to="/analytics"       icon={<FaChartLine />}      label="Analytics"        color="#3B82F6" />
      <NavLink to="/orders"          icon={<FaShoppingBag />}   label="Orders" />
      <NavLink to="/users"           icon={<FaUsers />}         label="Users" />
      <NavLink to="/occasion-orders" icon={<FaClipboardList />} label="Occasion Orders"  color="#4CAF50" />
      <NavLink to="/products"        icon={<FaBox />}           label="Products" />

      <SectionLabel label="Homepage — Part 1" />
      <NavLink to="/featured-picks"  icon={<FaStar />}   label="Featured Picks"   color="#F5C800" />
      <NavLink to="/top-sellers"     icon={<FaFire />}   label="Top Sellers"      color="#FF4C29" />
      <NavLink to="/content"         icon={<FaImage />}  label="Homepage Content" />

      <SectionLabel label="Homepage — Part 2" />
      <NavLink to="/today-special"   icon={<FaFire />}       label="Today's Special"  color="#FF4C29" />
      <NavLink to="/special-offers"  icon={<FaStar />}       label="Festival Offers"  color="#7C3AED" />
      <NavLink to="/occasions"        icon={<FaGift />}       label="Occasions"        color="#4CAF50" />
      <NavLink to="/packings"        icon={<FaBoxOpen />}    label="Packings"         color="#FF8C00" />
      <NavLink to="/testimonials"    icon={<FaQuoteLeft />}  label="Testimonials"     color="#F5C800" />

      <SectionLabel label="Pages" />
      <NavLink to="/specials"    icon={<FaLayerGroup />}   label="Specials 🌟"  color="#E8001D" />
      <NavLink to="/stories"     icon={<FaBookOpen />}     label="Our Story" />
      <NavLink to="/city-sweets" icon={<FaMapMarkerAlt />} label="City Sweets" />

      <SectionLabel label="Settings" />
      <NavLink to="/coupons"  icon={<FaTags />} label="Coupons" />
      <NavLink to="/settings" icon={<FaCog />}  label="Settings" />
    </nav>

    {/* Logout */}
    <div style={{ padding: '10px 8px', borderTop: '1.5px solid #F3F4F6', flexShrink: 0 }}>
      <button onClick={onLogout} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        background: '#FFF0EC', border: '1px solid rgba(255,76,41,0.2)', borderRadius: 8,
        padding: '9px 14px', cursor: 'pointer', color: '#FF4C29',
        fontSize: 13, fontWeight: 600, fontFamily: 'Poppins,sans-serif', transition: 'all .2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#FFD6CC'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#FFF0EC'; }}>
        <FaSignOutAlt size={14} /> Sign Out
      </button>
    </div>
  </div>
));

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar — fixed, never re-mounts */}
      <div className="d-none d-lg-block" style={{ flexShrink: 0, width: 256 }}>
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 256, zIndex: 100 }}>
          <Sidebar user={user} onLogout={handleLogout} onClose={() => {}} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 501 }}>
            <Sidebar user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: '1.5px solid #E5E7EB', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 99, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="d-lg-none" onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#374151' }}>
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            {title && <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>{title}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Admin Panel</span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD84D,#FF4C29)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>
        {/* Page content */}
        <div style={{ padding: '28px 24px', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
