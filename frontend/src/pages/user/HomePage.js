import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI, contentAPI, citySweetAPI, seasonalAPI, specialOfferAPI, occasionAPI } from '../../services/api';
import ProductCard from '../../components/user/ProductCard';
import FeaturedShopsSection from '../../components/user/FeaturedShopsSection';
import OfferPopupBanner from '../../components/user/OfferPopupBanner';
import { FaLeaf, FaHeart, FaMapMarkerAlt, FaTruck, FaMedal, FaArrowRight } from 'react-icons/fa';
import TestimonialsSection from '../../components/user/TestimonialsSection';

/* ── Shop Scroll Row — image-only cards, expand on hover to show text below ── */
const ShopScrollRow = ({ shops }) => {
  const trackRef = useRef(null);
  const posRef   = useRef(0);
  const frameRef = useRef(null);
  const paused   = useRef(false);
  const doubled  = [...shops, ...shops, ...shops];
  const SHOP_W   = 280;
  const SHOP_GAP = 20;
  const IMG_H    = 200; // image height always
  const SPEED    = 0.55;

  useEffect(() => {
    const el = trackRef.current;
    if (!el || shops.length < 1) return;
    const animate = () => {
      if (!paused.current) {
        posRef.current += SPEED;
        const third = el.scrollWidth / 3;
        if (posRef.current >= third) posRef.current -= third;
        el.style.transform = `translateX(-${posRef.current}px)`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [shops.length]);

  return (
    /* Outer wrapper: same left/right padding as Featured Picks scroll row */
    <div style={{ width:'100%', boxSizing:'border-box', overflow:'hidden', position:'relative', padding:'8px 0 16px' }}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}>

      {/* Edge fades matching section bg */}
      <div style={{ position:'absolute',top:0,left:0,width:40,height:'100%',background:'linear-gradient(to right,#F9FAFB,transparent)',zIndex:3,pointerEvents:'none' }}/>
      <div style={{ position:'absolute',top:0,right:0,width:40,height:'100%',background:'linear-gradient(to left,#F9FAFB,transparent)',zIndex:3,pointerEvents:'none' }}/>

      <div ref={trackRef} style={{ display:'flex', gap:SHOP_GAP, willChange:'transform', paddingLeft:24, alignItems:'flex-start' }}>
        {doubled.map((shop, i) => (
          <ShopCard key={i} shop={shop} imgH={IMG_H} cardW={SHOP_W} />
        ))}
      </div>
    </div>
  );
};

/* Individual shop card — overlay text always visible on hover */
const ShopCard = ({ shop, imgH, cardW }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        flexShrink: 0,
        width: cardW,
        height: imgH,
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
        zIndex: hovered ? 20 : 1,
        cursor: 'default',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.28)' : '0 2px 12px rgba(0,0,0,0.10)',
        transition: 'box-shadow 0.3s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {shop.url
        ? <img loading="lazy" src={shop.url} alt={shop.shopName}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />
        : <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#f5e6d0,#ffe0b2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem' }}>🏪</div>
      }

      {/* Overlay — always present, slides up on hover */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(20,10,0,0.92) 0%, rgba(20,10,0,0.65) 60%, transparent 100%)',
        padding: hovered ? '28px 16px 16px' : '16px 16px 8px',
        transform: hovered ? 'translateY(0)' : 'translateY(40%)',
        opacity: hovered ? 1 : 0,
        transition: 'transform 0.35s ease, opacity 0.3s ease, padding 0.3s ease',
      }}>
        <div style={{ fontWeight:800, fontSize:14, color:'#fff', marginBottom:4, lineHeight:1.3, textShadow:'0 1px 4px rgba(0,0,0,0.5)' }}>
          {shop.shopName || 'Famous Sweet Shop'}
        </div>
        {shop.description && (
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.82)', lineHeight:1.5, marginBottom:5 }}>
            {shop.description}
          </div>
        )}
        <div style={{ fontSize:12, color:'#FFBE00', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFBE00"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          {shop.city || 'Andhra Pradesh'}
        </div>
      </div>

      {/* Subtle name label always visible at bottom (non-hover) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
        padding: '20px 12px 8px',
        opacity: hovered ? 0 : 1,
        transition: 'opacity 0.25s ease',
      }}>
        <div style={{ fontWeight:700, fontSize:12, color:'white', textShadow:'0 1px 3px rgba(0,0,0,0.8)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {shop.shopName || 'Sweet Shop'}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', gap:3, marginTop:2 }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
          {shop.city || 'Andhra Pradesh'}
        </div>
      </div>
    </div>
  );
};

const DEFAULT = {
  heroTitle: 'Taste the Authentic Andhra Sweets',
  heroSubtitle: 'From the golden shores of Kakinada to the sacred hills of Tirupati — experience the rich heritage of Andhra Pradesh.',
  heroButtonText: 'Shop Now',
  bestSellingTitle: '🔥 Best Selling Sweets',
  bestSellingSubtitle: "Most ordered by our customers — don't miss these!",
  seasonalTitle: '🎁 Special Occasions & Corporate Orders',
  seasonalSubtitle: 'We cater to every occasion with authentic Andhra flavours',
  offerBannerText: '🎁 Special Festival Offers',
  offerBannerSubtext: 'Order above ₹500 — FREE delivery! Use code PAKKA10 for 10% off.',
};


/* ── Offer Countdown ── */
const OfferCountdown = ({ endDate, label, compact }) => {
  const [time, setTime] = React.useState({ d:0, h:0, m:0, s:0 });
  React.useEffect(() => {
    const tick = () => {
      const target = endDate ? new Date(endDate) : (() => { const m = new Date(); m.setHours(24,0,0,0); return m; })();
      const diff = Math.max(0, Math.floor((target - new Date()) / 1000));
      setTime({ d: Math.floor(diff/86400), h: Math.floor((diff%86400)/3600), m: Math.floor((diff%3600)/60), s: diff%60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  const pad = n => String(n).padStart(2,'0');
  const boxes = time.d > 0
    ? [{ v:time.d, l:'d' }, { v:time.h, l:'h' }, { v:time.m, l:'m' }]
    : [{ v:time.h, l:'h' }, { v:time.m, l:'m' }, { v:time.s, l:'s' }];
  if (compact) return (
    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#6B7280', fontFamily:'Poppins,sans-serif' }}>
      <span style={{ fontWeight:600 }}>{label || 'In'}:</span>
      <span style={{ fontFamily:'monospace', fontWeight:700, color:'#FF4C29' }}>
        {time.d > 0 ? `${time.d}d ` : ''}{pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    </div>
  );
  return (
    <div>
      <div className="offer-timer-label">{label || 'Ends in'}</div>
      <div className="offer-timer-digits">
        {boxes.map((b, i) => (
          <React.Fragment key={i}>
            <div className="offer-timer-box">
              {pad(b.v)}<span style={{ fontSize:9, opacity:0.6, marginLeft:1 }}>{b.l}</span>
            </div>
            {i < boxes.length-1 && <span className="offer-timer-sep">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const WHY = [
  { icon: <FaLeaf />, title: 'Authentic Recipes', desc: 'Sourced directly from traditional sweet makers', color: '#2EA94B' },
  { icon: <FaHeart />, title: 'Freshly Made', desc: 'No preservatives, made fresh to order', color: '#E8001D' },
  { icon: <FaMapMarkerAlt />, title: 'Famous Cities', desc: 'Straight from Kakinada, Tirupati and more', color: '#00C8D4' },
  { icon: <FaTruck />, title: 'Fast Delivery', desc: 'Delivered in 3–5 business days', color: '#FFBE00' },
  { icon: <FaMedal />, title: 'Trusted Quality', desc: 'Heritage recipes, 10,000+ happy customers', color: '#7c3aed' },
];



const HomePage = () => {
  const [content, setContent]   = useState(DEFAULT);
  const [featured, setFeatured]       = useState([]);
  const [topSellers, setTopSellers]   = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [todaySpecial, setTodaySpecial] = useState([]);
  const [citySweets, setCitySweets]   = useState([]);
  const [seasonalSpecials, setSeasonalSpecials] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [liveOffers, setLiveOffers]     = useState([]);
  const [upcomingOffers, setUpcomingOffers] = useState([]);
  const [popupOffer, setPopupOffer]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    contentAPI.getHomepage().then(r => setContent({ ...DEFAULT, ...r.data.content })).catch(() => {});
    productAPI.getFeatured().then(r => setFeatured(r.data.products || [])).catch(() => {});
    productAPI.getTopSellers().then(r => setTopSellers(r.data.products || [])).catch(() => {});
    productAPI.getBestSelling().then(r => setBestSelling(r.data.products || [])).catch(() => {});
    productAPI.getTodaySpecial().then(r => setTodaySpecial(r.data.products || [])).catch(() => {});
    citySweetAPI.getAll().then(r => setCitySweets(r.data.citySweets || [])).catch(() => {});
    seasonalAPI.getAll().then(r => setSeasonalSpecials(r.data.specials || [])).catch(() => {});
    occasionAPI.getAll().then(r => setOccasions(r.data.occasions || [])).catch(() => {});

    // Load special offers
    specialOfferAPI.getLive().then(r => {
      const { live = [], upcoming = [], popup } = r.data;
      setLiveOffers(live);
      setUpcomingOffers(upcoming);
      // Show popup on every page load/refresh (no session check)
      if (popup) setPopupOffer(popup);
    }).catch(() => {});
  }, []);

  const heroOverlay = content.heroOverlay ?? 0.38;

  return (
    <div>
      {/* ═══ POPUP OFFER BANNER ═══ */}
      {popupOffer && (
        <OfferPopupBanner
          offer={popupOffer}
          onClose={() => { setPopupOffer(null); }}
        />
      )}

      {/* ═══ HERO — 100vh ═══ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden' }}>
        {/* Hero image — rendered as <img> for full native sharpness, no CSS scaling blur */}
        {content.heroImage?.url
          ? <img
              src={content.heroImage.url}
              alt="Hero"
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block', pointerEvents:'none' }}
            />
          : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#1a1a2e 0%,#E8001D 50%,#FFBE00 100%)' }} />
        }
        <div style={{ position:'absolute', inset:0, background:`rgba(0,0,0,${heroOverlay})` }} />
        <div className="container" style={{ position:'relative', zIndex:2, color:'white', padding:'40px 16px' }}>
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(2.2rem,5vw,4rem)', fontWeight:900, lineHeight:1.1, textShadow:'0 4px 20px rgba(0,0,0,0.5)', marginBottom:16 }}>
                {content.heroTitle} <span style={{ color:'#FFBE00' }}></span>
              </div>
              <p style={{ fontSize:'clamp(1rem,2vw,1.2rem)', opacity:0.9, maxWidth:500, lineHeight:1.7, marginBottom:32 }}>{content.heroSubtitle}</p>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                <button onClick={() => navigate('/products')}
                  style={{ background:'linear-gradient(135deg,#FFBE00,#ff9900)', border:'none', borderRadius:50, padding:'12px 32px', fontSize:15, fontWeight:700, color:'#1a1a2e', cursor:'pointer', boxShadow:'0 4px 18px rgba(255,190,0,0.4)', transition:'all 0.3s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}>
                  {content.heroButtonText || 'Shop Now'} →
                </button>
                <Link to="/story" style={{ color:'white', border:'2px solid rgba(255,255,255,0.5)', borderRadius:50, padding:'12px 28px', fontWeight:600, textDecoration:'none', fontSize:15, transition:'all 0.3s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='white'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'}>
                  Our Story
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OUR SWEET SHOPS (moved here: right after hero) ═══ */}
      {(content.shopImages?.length > 0) && (
        <section style={{ background:'#F9FAFB', padding:'52px 0 56px' }}>
          <div className="container">
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <span style={{ display:'inline-block', background:'rgba(255,190,0,0.15)', border:'1px solid rgba(255,190,0,0.35)', color:'#FFBE00', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2, padding:'4px 14px', borderRadius:50, marginBottom:10 }}>
                Across Andhra Pradesh
              </span>
              <div style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:26, color:'#111827', display:'block', marginBottom:6 }}>Our Sweet Shops</div>
              <div style={{ fontSize:14, color:'#6B7280', fontStyle:'italic' }}>Discover the finest sweet shops across Andhra Pradesh</div>
              <div style={{ width:60, height:4, background:'#E8001D', borderRadius:4, margin:'14px auto 0' }} />
            </div>
          </div>
          <ShopScrollRow shops={content.shopImages} />
        </section>
      )}

      {/* ═══ FEATURED PICKS + TOP SELLERS — full width ═══ */}
      <div style={{ background:'#fdf5ec' }}>
        <FeaturedShopsSection featured={featured} topSellers={topSellers} />
      </div>

      {/* ═══ SEARCH + BROWSE BY CITY ═══ */}
      <section style={{ padding:'52px 0 44px', background:'#ffffff', borderTop:'3px solid #f0e8d8' }}>
        <div className="container">

          {/* Search bar */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:40 }}>
            <div style={{ position:'relative', width:'100%', maxWidth:560 }}>
              <span style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', color:'#aaa', fontSize:18 }}>🔍</span>
              <input
                type="text"
                placeholder="Search for your favorite sweet..."
                onKeyDown={e => { if(e.key==='Enter' && e.target.value.trim()) navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`); }}
                onChange={e => { if(!e.target.value) {} }}
                style={{ width:'100%', padding:'14px 20px 14px 50px', borderRadius:50, border:'1.5px solid #e8e0d5', background:'white', fontSize:15, color:'#333', outline:'none', boxShadow:'0 2px 16px rgba(0,0,0,0.07)', transition:'box-shadow 0.2s' }}
                onFocus={e=>e.target.style.boxShadow='0 4px 24px rgba(232,0,29,0.12)'}
                onBlur={e=>e.target.style.boxShadow='0 2px 16px rgba(0,0,0,0.07)'}
              />
            </div>
          </div>

          {/* Browse by City */}
          {citySweets.length > 0 && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#E8001D"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:'clamp(1.8rem,3vw,2.4rem)', color:'#1a1a2e' }}>Browse by City</span>
              </div>

              <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                <button
                  onClick={() => navigate('/products')}
                  style={{ background:'linear-gradient(135deg,#ff9900,#E8001D)', color:'white', border:'none', borderRadius:12, padding:'10px 22px', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s', boxShadow:'0 3px 10px rgba(232,0,29,0.25)' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}>
                  All Cities
                </button>
                <div style={{ width:'100%', display:'flex', gap:10, flexWrap:'wrap', marginTop:4 }}>
                  {citySweets.map(c => (
                    <button key={c.cityName}
                      onClick={() => navigate(`/products?city=${encodeURIComponent(c.cityName)}`)}
                      style={{ background:'white', color:'#333', border:'1.5px solid #e0d8cc', borderRadius:12, padding:'10px 20px', fontSize:14, fontWeight:500, cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor='#E8001D'; e.currentTarget.style.color='#E8001D'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(232,0,29,0.15)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e0d8cc'; e.currentTarget.style.color='#333'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='none'; }}>
                      {c.cityName}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </section>

      {/* ═══ TODAY'S SPECIAL OFFER + UPCOMING SPECIAL OFFERS ═══ */}
      {(liveOffers.length > 0 || todaySpecial.length > 0 || upcomingOffers.length > 0) && (
      <section style={{ padding:'64px 0', background:'#fff' }}>
        <div className="container">

          {/* PRIORITY 1: Live Festival Offer */}
          {liveOffers.length > 0 ? liveOffers.map((offer) => (
            <div key={offer._id} style={{ marginBottom:56 }}>
              <span style={{ display:'inline-block', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'white', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2, padding:'4px 14px', borderRadius:50, marginBottom:14 }}>
                🎊 Festival Offer — Live Now
              </span>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, color:'#1A1A1A', marginBottom:8 }}>{offer.title}</h2>
              <div style={{ width:52, height:3, background:'linear-gradient(90deg,#7c3aed,#FFD84D)', borderRadius:3, marginBottom:20 }} />

              {/* Clean info row */}
              <div className="offer-info-row">
                <OfferCountdown endDate={offer.endDate} label="Ends in" />
                {offer.couponCode && (
                  <div className="offer-coupon-pill">
                    <div>
                      <div className="offer-coupon-label">Use Code</div>
                      <div className="offer-coupon-code">{offer.couponCode}</div>
                    </div>
                    {offer.couponPercent > 0 && <span className="offer-coupon-badge">{offer.couponPercent}% OFF</span>}
                  </div>
                )}
              </div>

              {/* Responsive banner — 1 offer = 50% centered */}
              {offer.bannerImage?.url && (
                <div className="offer-banners-wrap count-1" style={{ marginBottom:24 }}>
                  <div className="offer-banner-card">
                    <img loading="lazy" src={offer.bannerImage.url} alt={offer.title} />
                  </div>
                </div>
              )}

              {offer.subtitle && <p style={{ color:'#6B7280', marginBottom:10, fontSize:15 }}>{offer.subtitle}</p>}
              {offer.description && <p style={{ color:'#4B5563', marginBottom:20, fontSize:15, lineHeight:1.7 }}>{offer.description}</p>}

              {offer.perks?.length > 0 && (
                <div className="row g-2 mb-4">
                  {offer.perks.map((p, i) => (
                    <div key={i} className="col-6 col-lg-3">
                      <div style={{ background:`${p.color||'#7c3aed'}0d`, border:`1.5px solid ${p.color||'#7c3aed'}22`, borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ fontSize:'1.5rem', flexShrink:0 }}>{p.icon}</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:p.color||'#7c3aed', fontFamily:'Poppins,sans-serif' }}>{p.label}</div>
                          {p.desc && <div style={{ fontSize:11, color:'#9CA3AF', lineHeight:1.4 }}>{p.desc}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {offer.featuredProducts?.length > 0 && (
                <div className="row g-3">
                  {offer.featuredProducts.slice(0,4).map(p => (
                    <div key={p._id} className="col-6 col-md-4 col-lg-3">
                      <div style={{ position:'relative' }}>
                        <div style={{ position:'absolute', top:-8, left:8, zIndex:10, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'white', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>
                          🎊 FESTIVAL DEAL
                        </div>
                        <ProductCard product={p} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )) : todaySpecial.length > 0 ? (

            /* PRIORITY 2: Today's Special */
            <div style={{ marginBottom:56 }}>
              <span style={{ display:'inline-block', background:'linear-gradient(135deg,#FF4C29,#E03A1A)', color:'white', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2, padding:'4px 14px', borderRadius:50, marginBottom:14 }}>
                Today's Special
              </span>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, color:'#1A1A1A', marginBottom:8 }}>
                {content.todayOfferTitle || "Today's Special Offer"}
              </h2>
              <div style={{ width:52, height:3, background:'linear-gradient(90deg,#FF4C29,#FFD84D)', borderRadius:3, marginBottom:20 }} />

              {/* Clean info row */}
              <div className="offer-info-row">
                <OfferCountdown label="Resets in" />
                {content.todayOfferCouponCode && (
                  <div className="offer-coupon-pill">
                    <div>
                      <div className="offer-coupon-label">Use Code</div>
                      <div className="offer-coupon-code">{content.todayOfferCouponCode}</div>
                    </div>
                    {content.todayOfferCouponPercent > 0 && (
                      <span className="offer-coupon-badge">{content.todayOfferCouponPercent}% OFF</span>
                    )}
                  </div>
                )}
              </div>

              {/* Banner image — 50% centered */}
              {content.todayOfferBannerImage?.url && (
                <div className="offer-banners-wrap count-1" style={{ marginBottom:28 }}>
                  <div className="offer-banner-card">
                    <img loading="lazy" src={content.todayOfferBannerImage.url} alt="Today's Special" />
                  </div>
                </div>
              )}

              {content.todayOfferSubtitle && (
                <p style={{ color:'#6B7280', marginBottom:24 }}>{content.todayOfferSubtitle}</p>
              )}

              <div className="row g-3">
                {todaySpecial.slice(0,8).map(p => {
                  const specialPrice   = p.todaySpecialPrice > 0 ? p.todaySpecialPrice : null;
                  const normalPrice    = p.weightPrices?.[0]?.price ?? p.price;
                  const hasDiscount    = specialPrice && specialPrice < normalPrice;
                  const displayProduct = specialPrice
                    ? { ...p, weightPrices: p.weightPrices?.length
                        ? [{ weight: p.weightPrices[0].weight, price: specialPrice }, ...p.weightPrices.slice(1)]
                        : p.weightPrices, price: specialPrice, discountedPrice: specialPrice }
                    : p;
                  return (
                    <div key={p._id} className="col-6 col-md-4 col-lg-3">
                      <div style={{ position:'relative' }}>
                        {hasDiscount && (
                          <div style={{ position:'absolute', top:-8, right:8, zIndex:10, background:'linear-gradient(135deg,#4CAF50,#388E3C)', color:'white', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:50 }}>
                            SAVE ₹{normalPrice - specialPrice}
                          </div>
                        )}
                        <ProductCard product={displayProduct} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Upcoming Offers — responsive grid */}
          {upcomingOffers.length > 0 && (() => {
            const count = upcomingOffers.length;
            const cls = count === 1 ? 'count-1' : count === 2 ? 'count-2' : 'count-many';
            return (
              <div>
                <span style={{ display:'inline-block', background:'linear-gradient(135deg,#FFD84D,#FF4C29)', color:'#1A1A1A', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2, padding:'4px 14px', borderRadius:50, marginBottom:14 }}>
                  Coming Soon
                </span>
                <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, color:'#1A1A1A', marginBottom:8 }}>Upcoming Special Offers</h2>
                <div style={{ width:52, height:3, background:'linear-gradient(90deg,#FFD84D,#FF4C29)', borderRadius:3, marginBottom:24 }} />
                <div className={`offer-banners-wrap ${cls}`} style={{ marginBottom:24 }}>
                  {upcomingOffers.map(offer => (
                    <div key={offer._id} className="offer-banner-card">
                      {offer.bannerImage?.url && <img loading="lazy" src={offer.bannerImage.url} alt={offer.title} />}
                      <div style={{ padding:'18px 20px 16px' }}>
                        <div style={{ fontWeight:700, fontSize:15, color:'#1A1A1A', marginBottom:5, fontFamily:'Poppins,sans-serif' }}>{offer.title}</div>
                        {offer.subtitle && <div style={{ fontSize:13, color:'#6B7280', marginBottom:10 }}>{offer.subtitle}</div>}
                        {offer.couponCode && (
                          <div className="offer-coupon-pill" style={{ marginBottom:12 }}>
                            <div>
                              <div className="offer-coupon-label">Code</div>
                              <div className="offer-coupon-code" style={{ fontSize:14 }}>{offer.couponCode}</div>
                            </div>
                            {offer.couponPercent > 0 && <span className="offer-coupon-badge">{offer.couponPercent}% OFF</span>}
                          </div>
                        )}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <OfferCountdown endDate={offer.startDate} label="Starts in" compact />
                          <span style={{ background:'linear-gradient(135deg,#FFD84D,#FF4C29)', color:'#1A1A1A', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:50 }}>COMING SOON</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={{ textAlign:'center', marginTop:40 }}>
            <Link to="/products" style={{ display:'inline-flex', alignItems:'center', gap:8, border:'2px solid #FF4C29', color:'#FF4C29', borderRadius:50, padding:'10px 28px', textDecoration:'none', fontWeight:600, fontSize:14, transition:'all 0.3s', fontFamily:'Poppins,sans-serif' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#FF4C29';e.currentTarget.style.color='white';}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#FF4C29';}}>
              View All Sweets <FaArrowRight size={12}/>
            </Link>
          </div>
        </div>
      </section>
      )}


      {/* ═══ SPECIAL OCCASIONS — fully dynamic from admin ═══ */}
      {occasions.length > 0 && (
        <section style={{ padding:'72px 0', background:'#FAFAFA' }}>
          <div className="container">
            <span className="section-label">Occasions</span>
            <h2 className="section-title">{content.seasonalTitle || 'Special Occasions'}</h2>
            <div className="section-divider" />
            <p className="section-subtitle" style={{ marginBottom:40 }}>{content.seasonalSubtitle || 'We cater to every occasion with authentic Andhra flavours'}</p>
            <div className="row g-3">
              {occasions.map(occ => (
                <div key={occ._id} className="col-6 col-md-4 col-lg-2">
                  <div className="occasion-card"
                    onClick={() => navigate(`/occasions/${occ._id}`)}>
                    {occ.image?.url
                      ? <img loading="lazy" src={occ.image.url} alt={occ.title} className="occasion-img" style={{ objectFit:'cover' }} />
                      : <div className="occasion-img" style={{ background:'linear-gradient(135deg,#1A1A1A,#2D2D2D)', position:'absolute', inset:0 }} />
                    }
                    <div className="occasion-gradient" />
                    <div className="occasion-overlay" />
                    <div className="occasion-content">
                      <div className="occasion-emoji">{occ.emoji || '🎁'}</div>
                      <div className="occasion-title">{occ.title}</div>
                      {occ.description && <div className="occasion-desc">{occ.description}</div>}
                      <div style={{ marginTop:8, fontSize:10, background:'rgba(255,216,77,0.92)', color:'#1A1A1A', borderRadius:50, padding:'3px 10px', display:'inline-block', fontWeight:700, letterSpacing:0.3 }}>View Packages →</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ WHY CHOOSE US ═══ */}
      <section style={{ padding:'72px 0', background:'#fff' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, color:'#1A1A1A', fontSize:'clamp(1.8rem,3vw,2.4rem)', marginBottom:8 }}>Why Thousands Love Us</h2>
            <div style={{ width:52, height:3, background:'linear-gradient(90deg,#FFD84D,#FF4C29)', borderRadius:3, margin:'0 auto' }} />
          </div>
          <div className="row g-4 justify-content-center">
            {WHY.map((w, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-2">
                <div style={{ textAlign:'center' }}>
                  <div style={{ width:68,height:68,borderRadius:20,background:w.color+'18',color:w.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 18px',border:`2px solid ${w.color}28`,boxShadow:`0 4px 16px ${w.color}20` }}>{w.icon}</div>
                  <div style={{ fontWeight:700,color:'#1A1A1A',marginBottom:6,fontSize:14,fontFamily:'Poppins,sans-serif' }}>{w.title}</div>
                  <div style={{ fontSize:12,color:'#6B7280',lineHeight:1.65,fontFamily:'Poppins,sans-serif' }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsSection />

      {/* ═══ CTA ═══ */}
      <section style={{ padding:'64px 0', background:'transparent', textAlign:'center' }}>
        <div className="container">
          <div style={{ maxWidth:580, margin:'0 auto' }}>
            <div style={{ fontSize:42, marginBottom:12 }}></div>
            <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, color:'#1A1A1A', marginBottom:12, fontSize:'clamp(1.6rem,3vw,2.2rem)', lineHeight:1.3 }}>Ready to Experience Authentic Andhra Sweets?</h2>
            <p style={{ color:'#6B7280', marginBottom:32, fontFamily:'Poppins,sans-serif', fontSize:15.5 }}>Order now and get them delivered fresh to your doorstep</p>
            <Link to="/products" style={{ background:'linear-gradient(135deg,#FF4C29,#E8001D)',color:'white',borderRadius:14,padding:'14px 44px',textDecoration:'none',fontSize:15.5,fontWeight:700,display:'inline-block',boxShadow:'0 6px 24px rgba(232,0,29,.25)',fontFamily:'Poppins,sans-serif',letterSpacing:0.3 }}>
              Shop All Sweets 
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
