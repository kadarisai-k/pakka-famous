import React, { useState, useEffect } from 'react';
import { contentAPI } from '../../services/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaTags, FaImage, FaMapMarkerAlt, FaBookOpen, FaGift, FaCog, FaSignOutAlt, FaBars, FaStar, FaFire, FaTrophy, FaQuoteLeft, FaBoxOpen, FaClipboardList, FaLayerGroup } from 'react-icons/fa';
import toast from 'react-hot-toast';


const LogoDisplay = () => {
  const [logoUrl, setLogoUrl] = useState('');
  useEffect(() => {
    try {
      const cached = localStorage.getItem('pakka_logo');
      if (cached) { const d = JSON.parse(cached); if (d?.url) setLogoUrl(d.url); }
    } catch(_) {}
    contentAPI.getHomepage().then(r => {
      if (r.data.content?.logo?.url) {
        setLogoUrl(r.data.content.logo.url);
        try { localStorage.setItem('pakka_logo', JSON.stringify(r.data.content.logo)); } catch(_) {}
      }
    }).catch(() => {});
  }, []);
  if (logoUrl) return (
    <div style={{ padding:'4px 0', lineHeight:0 }}>
      <img src={logoUrl} alt="Pakka Famous" style={{ height:48, maxWidth:180, objectFit:'contain', objectPosition:'left center', display:'block' }} />
    </div>
  );
  return <div style={{ fontFamily:'Playfair Display, serif', color:'#FFD84D', fontWeight:900, fontSize:18 }}>🍬 Pakka Famous</div>;
};

const NAV = [
  { to:'/admin',                  icon:<FaTachometerAlt />, label:'Dashboard' },
  { to:'/admin/products',         icon:<FaBox />,           label:'Products' },
  { divider: true, label: 'HOMEPAGE SECTIONS' },
  { to:'/admin/featured-picks',   icon:<FaStar />,          label:'Featured Picks',  color:'#FFBE00' },
  { to:'/admin/top-sellers',      icon:<FaFire />,          label:'Top Sellers',     color:'#E8001D' },
  { to:'/admin/best-selling',     icon:<FaTrophy />,        label:'Best Selling',    color:'#2EA94B' },
  { divider: true, label: 'MANAGEMENT' },
  { to:'/admin/today-special',  icon:<FaFire />, label:"Today's Special", color:'#E8001D' },
  { to:'/admin/special-offers', icon:<FaFire />, label:'Festival Offers', color:'#7c3aed' },
  { to:'/admin/orders',           icon:<FaShoppingBag />,   label:'Orders' },
  { to:'/admin/users',            icon:<FaUsers />,         label:'Users' },
  { to:'/admin/coupons',          icon:<FaTags />,          label:'Coupons' },
  { to:'/admin/content',          icon:<FaImage />,         label:'Homepage Content' },
  { to:'/admin/city-sweets',      icon:<FaMapMarkerAlt />,  label:'City Sweets' },
  { to:'/admin/stories',          icon:<FaBookOpen />,      label:'Our Story' },
  { to:'/admin/specials',         icon:<FaLayerGroup />,    label:'Specials 🌟', color:'#E8001D' },
  { to:'/admin/seasonal',         icon:<FaGift />,          label:'Occasions' },
  { to:'/admin/testimonials',     icon:<FaQuoteLeft />,   label:'Testimonials',    color:'#FFD84D' },
  { divider: true, label: 'OCCASIONS' },
  { to:'/admin/packings',         icon:<FaBoxOpen />,     label:'Packings',        color:'#FF8C00' },
  { to:'/admin/occasion-orders',  icon:<FaClipboardList />, label:'Occasion Orders', color:'#4CAF50' },
  { divider: true, label: 'QUICK ACCESS' },
  { to:'/admin/hub',              icon:<FaLayerGroup />,  label:'Sections Hub',    color:'#0891b2' },
  { to:'/admin/settings',         icon:<FaCog />,         label:'Settings' },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  const Sidebar = () => (
    <div className="admin-sidebar d-flex flex-column" style={{ height:'100vh' }}>
      <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <LogoDisplay />
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:4 }}>Admin Panel</div>
        {user && <div style={{ color:'rgba(255,255,255,0.8)', fontSize:12, marginTop:8, background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:20 }}>👤 {user.name}</div>}
      </div>
      <nav style={{ flex:1, padding:'12px 0', overflowY:'auto', minHeight:0 }}>
        {NAV.map((n, i) => {
          if (n.divider) return (
            <div key={i} style={{ padding:'16px 16px 6px', fontSize:10, fontWeight:800, letterSpacing:1.5, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>
              {n.label}
            </div>
          );
          const isActive = location.pathname === n.to;
          return (
            <Link key={n.to} to={n.to}
              className={`admin-nav-item d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              style={n.color && isActive ? { borderLeft:`3px solid ${n.color}` } : {}}
            >
              <span style={{ fontSize:14, color: isActive && n.color ? n.color : undefined }}>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
        <button className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout} style={{ borderRadius:20 }}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Desktop sidebar */}
      <div className="d-none d-lg-block"><Sidebar /></div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:240 }}><Sidebar /></div>
        </div>
      )}

      <div className="admin-main flex-grow-1">
        {/* Mobile top bar */}
        <div className="d-lg-none d-flex align-items-center gap-3 px-3 py-2" style={{ background:'#1a1a2e', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <button className="btn btn-sm" style={{ color:'white' }} onClick={() => setSidebarOpen(true)}><FaBars /></button>
          <span style={{ color:'#FFBE00', fontFamily:'Playfair Display, serif', fontWeight:700 }}>🍬 Admin</span>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
