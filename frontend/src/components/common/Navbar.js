import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { FaShoppingCart, FaHeart, FaUser, FaSignOutAlt, FaBox, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Navbar = ({ logo, announcement }) => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when route changes
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    toast.success('See you soon! 👋');
    navigate('/');
  };

  const isActive = path => location.pathname === path;
  const ribbonText = (announcement !== null && announcement !== undefined && announcement !== '')
    ? announcement
    : '🎁 Free delivery above ₹500 · Use PAKKA10 for 10% off · 🍬 Fresh daily!';

  const navLinks = [['/', 'Home'], ['/products', 'Our Sweets'], ['/specials', 'Specials'], ['/about', 'About Us']];

  return (
    <>
      <div className="nav-ribbon">{ribbonText}</div>
      <nav className={`navbar-pakka${scrolled ? ' scrolled' : ''}`}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:'100%', padding:'0 16px' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', flexShrink:0, lineHeight:0, padding:'0', margin:'0', height:'100%' }}>
            {logo?.url ? (
              <img src={logo.url} alt="Pakka Famous"
                style={{ height:'100%', maxHeight:'none', maxWidth:260, objectFit:'contain', objectPosition:'left center', display:'block', transition:'transform .25s' }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} />
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#FFD84D,#FF4C29)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:'0 3px 12px rgba(255,216,77,.4)' }}>🍬</div>
                <div>
                  <span style={{ fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:900,color:'#1A1A1A',letterSpacing:'-.3px' }}>Pakka</span>
                  <span style={{ fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:900,color:'#FF4C29',letterSpacing:'-.3px' }}> Famous</span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Nav Links */}
          <div className="d-none d-lg-flex" style={{ alignItems:'center', gap:4 }}>
            {navLinks.map(([path, label]) => (
              <Link key={path} to={path} className={`nav-link-custom${isActive(path) ? ' active' : ''}`}>{label}</Link>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {isLoggedIn && !isAdmin && (
              <>
                <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
                  <FaHeart size={15} />
                  {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
                </Link>
                <Link to="/cart" className="nav-icon-btn" title="Cart">
                  <FaShoppingCart size={15} />
                  {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                </Link>
              </>
            )}

            {isLoggedIn ? (
              <div style={{ position:'relative' }} ref={dropRef}>
                {/* Avatar button — pure React onClick, no Bootstrap JS needed */}
                <button
                  className="nav-avatar"
                  onClick={() => setDropOpen(prev => !prev)}
                  title={user?.name}
                  style={{ display:'flex', alignItems:'center', gap:6 }}
                >
                  {user?.name?.[0]?.toUpperCase() || <FaUser size={14} />}
                  <FaChevronDown size={10} style={{ opacity:0.6, transition:'transform .2s', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>

                {/* Dropdown Menu */}
                {dropOpen && (
                  <div style={{
                    position:'absolute', right:0, top:'calc(100% + 8px)',
                    background:'white', borderRadius:12, minWidth:200,
                    boxShadow:'0 8px 32px rgba(0,0,0,0.15)', border:'1px solid #F3F4F6',
                    zIndex:9999, overflow:'hidden',
                  }}>
                    {/* User info header */}
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid #F3F4F6' }}>
                      <div style={{ fontWeight:700, fontSize:13.5, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{user?.name}</div>
                      <div style={{ fontSize:11.5, color:'#9CA3AF' }}>{user?.email}</div>
                    </div>

                    {/* Menu items */}
                    {isAdmin ? (
                      <Link className="dropdown-item" to="/admin" onClick={() => setDropOpen(false)}
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', color:'#374151', textDecoration:'none', fontSize:14 }}>
                        <FaBox style={{ color:'#FF4C29' }} /> Admin Panel
                      </Link>
                    ) : (
                      <>
                        <Link to="/profile" onClick={() => setDropOpen(false)}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', color:'#374151', textDecoration:'none', fontSize:14, transition:'background .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <FaUser style={{ color:'#FFD84D' }} /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setDropOpen(false)}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', color:'#374151', textDecoration:'none', fontSize:14, transition:'background .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <FaBox style={{ color:'#4CAF50' }} /> My Orders
                        </Link>
                        <Link to="/wishlist" onClick={() => setDropOpen(false)}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', color:'#374151', textDecoration:'none', fontSize:14, transition:'background .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <FaHeart style={{ color:'#FF4C29' }} /> Wishlist
                        </Link>
                      </>
                    )}

                    <div style={{ borderTop:'1px solid #F3F4F6', margin:'4px 0' }} />

                    <button onClick={handleLogout}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', color:'#EF4444', background:'none', border:'none', width:'100%', textAlign:'left', fontSize:14, cursor:'pointer', transition:'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={{ textDecoration:'none' }}>
                <button className="btn-red" style={{ padding:'9px 22px', fontSize:13.5, borderRadius:10, background:'#FF4C29', color:'white', border:'none', fontFamily:'Poppins,sans-serif', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 18px rgba(255,76,41,.28)', transition:'all .22s' }}>
                  Sign In
                </button>
              </Link>
            )}

            <button className="d-lg-none nav-icon-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes size={15} /> : <FaBars size={15} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ background:'white', borderTop:'1px solid #F3F4F6', padding:'12px 16px 20px', boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
            {navLinks.map(([path, label]) => (
              <Link key={path} to={path} style={{
                display:'block', padding:'12px 14px', borderRadius:10,
                color: isActive(path) ? '#1A1A1A' : '#374151',
                background: isActive(path) ? '#FFFBEB' : 'transparent',
                fontWeight: isActive(path) ? 600 : 500, fontSize:15,
                marginBottom:3, textDecoration:'none', fontFamily:'Poppins,sans-serif',
                borderLeft: isActive(path) ? '3px solid #FFD84D' : '3px solid transparent',
              }}>{label}</Link>
            ))}
            {isLoggedIn && !isAdmin && (
              <>
                <Link to="/profile" style={{ display:'block', padding:'12px 14px', borderRadius:10, color:'#374151', fontWeight:500, fontSize:15, marginBottom:3, textDecoration:'none', fontFamily:'Poppins,sans-serif', borderLeft:'3px solid transparent' }}>
                  👤 My Profile
                </Link>
                <Link to="/orders" style={{ display:'block', padding:'12px 14px', borderRadius:10, color:'#374151', fontWeight:500, fontSize:15, marginBottom:3, textDecoration:'none', fontFamily:'Poppins,sans-serif', borderLeft:'3px solid transparent' }}>
                  📦 My Orders
                </Link>
              </>
            )}
            {!isLoggedIn && (
              <Link to="/login" style={{ textDecoration:'none', display:'block', marginTop:8 }}>
                <button style={{ width:'100%', padding:12, background:'#FF4C29', color:'white', border:'none', borderRadius:10, fontFamily:'Poppins,sans-serif', fontWeight:700, cursor:'pointer', fontSize:15 }}>Sign In</button>
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
