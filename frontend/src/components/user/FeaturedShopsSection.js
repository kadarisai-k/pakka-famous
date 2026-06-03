import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── constants ── */
const CIRCLE_SIZE = 160;
const CARD_WRAP   = CIRCLE_SIZE + 24;
const GAP         = 20;
// 5 cards visible inside a max-width container — side margins handled by section padding
const CAROUSEL_MAX_W = 1200;
const SPEED_STEP  = 0.55;

/* ─── Sweet Card — circle → rounded square on hover, ZERO layout shift ─── */
const SweetCard = ({ product }) => {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(false);

  const primaryImg = product.image?.url || '';
  const hoverImg   = product.hoverImage?.url || primaryImg;

  return (
    /* Fixed-size wrapper — dimensions NEVER change, siblings never move */
    <div
      style={{ flexShrink:0, width:CARD_WRAP, height:CARD_WRAP, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Inner card — only uses CSS transform:scale, no layout change */}
      <div
        onClick={() => navigate(`/products/${product._id}`)}
        style={{
          width: CIRCLE_SIZE, height: CIRCLE_SIZE,
          borderRadius: hovered ? 24 : '50%',
          overflow: 'hidden', cursor: 'pointer', position: 'relative',
          border: hovered ? '3px solid #FFBE00' : '3px solid rgba(255,190,0,0.35)',
          boxShadow: hovered
            ? '0 16px 40px rgba(232,0,29,0.25), 0 0 0 5px rgba(255,190,0,0.2)'
            : '0 4px 16px rgba(0,0,0,0.10)',
          transform: hovered ? 'scale(1.13)' : 'scale(1)',
          transition: 'border-radius 0.35s ease, box-shadow 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          background: 'linear-gradient(135deg,#fff3e0,#ffe0b2)',
          zIndex: hovered ? 10 : 1,
        }}
      >
        <img loading="lazy" src={primaryImg} alt={product.name}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: hovered ? 0 : 1, transition:'opacity 0.3s ease' }} />
        <img loading="lazy" src={hoverImg || primaryImg} alt={product.name}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1.08)' : 'scale(1)', transition:'opacity 0.3s ease, transform 0.4s ease' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top,rgba(26,26,46,0.88),transparent)', padding:'22px 6px 8px', textAlign:'center', opacity: hovered ? 1 : 0, transition:'opacity 0.25s ease' }}>
          <span style={{ color:'white', fontSize:11, fontWeight:700 }}>{product.name}</span>
        </div>
      </div>
    </div>
  );
};


/* ─── Horizontal auto-scroll row ─────────────────────────────────── */
const ScrollRow = ({ items, direction = 'left' }) => {
  const trackRef = useRef(null);
  const posRef   = useRef(0);
  const frameRef = useRef(null);
  const paused   = useRef(false);
  const tripled  = [...items, ...items, ...items];

  useEffect(() => {
    const el = trackRef.current;
    if (!el || items.length < 1) return;
    const animate = () => {
      if (!paused.current) {
        if (direction === 'left') {
          posRef.current += SPEED_STEP;
          const third = el.scrollWidth / 3;
          if (posRef.current >= third) posRef.current -= third;
        } else {
          posRef.current -= SPEED_STEP;
          if (posRef.current < 0) posRef.current += el.scrollWidth / 3;
        }
        el.style.transform = `translateX(-${posRef.current}px)`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [items.length, direction]);

  return (
    /* Outer: full width, no extra horizontal padding */
    <div style={{ width:'100%', boxSizing:'border-box' }}>
      {/* Inner: max-width centred container, clips the scrolling track */}
      <div
        style={{ maxWidth: CAROUSEL_MAX_W, margin:'0 auto', overflow:'hidden', position:'relative' }}
        onMouseEnter={() => paused.current = true}
        onMouseLeave={() => paused.current = false}
      >
        {/* Soft edge fades — very subtle */}
        <div style={{ position:'absolute',top:0,left:0,width:32,height:'100%',background:'linear-gradient(to right,#fdf5ec,transparent)',zIndex:3,pointerEvents:'none' }}/>
        <div style={{ position:'absolute',top:0,right:0,width:32,height:'100%',background:'linear-gradient(to left,#fdf5ec,transparent)',zIndex:3,pointerEvents:'none' }}/>
        <div ref={trackRef} style={{ display:'flex', gap:GAP, willChange:'transform', alignItems:'center', padding:'14px 0' }}>
          {tripled.map((p, i) => <SweetCard key={`${p._id}-${i}`} product={p} />)}
        </div>
      </div>
    </div>
  );
};

/* ─── Main exported section ──────────────────────────────────────── */
const FeaturedShopsSection = ({ featured = [], topSellers = [] }) => {
  const fill = (arr) => {
    if (!arr.length) return [];
    let out = [...arr];
    while (out.length < 6) out = [...out, ...arr];
    return out;
  };

  // Placeholder circles when no data
  const Placeholder = () => (
    <div style={{ display:'flex', justifyContent:'center', gap:GAP, padding:'10px 0' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ width:CIRCLE_SIZE, height:CIRCLE_SIZE, borderRadius:'50%', background:`linear-gradient(135deg,#f5e6d0,#ffe0b2)`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', opacity: 0.6 + i*0.06 }}>🍬</div>
      ))}
    </div>
  );

  return (
    <section style={{ width:'100%', overflow:'hidden', background:'#fdf5ec', paddingBottom: 32 }}>

      {/* ── Row 1: Featured Picks ── */}
      <div style={{ paddingTop: 32 }}>
        <div style={{ textAlign:'center', marginBottom:6 }}>
          <span style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:26, color:'#1a1a2e' }}>Featured Picks</span>
        </div>
        <div style={{ textAlign:'center', marginBottom:18 }}>
          <span style={{ fontSize:14, color:'#888', fontStyle:'italic' }}>Handpicked favourites, fresh &amp; authentic</span>
        </div>
        {featured.length > 0 ? <ScrollRow items={fill(featured)} direction="left" /> : <Placeholder />}
      </div>

      {/* Divider */}
      <div style={{ height:2, background:'linear-gradient(to right,transparent,rgba(255,190,0,0.3),transparent)', margin:'36px auto 8px', width:'60%' }}/>

      {/* ── Row 2: Top Sellers ── */}
      <div>
        <div style={{ textAlign:'center', marginBottom:6 }}>
          <span style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:26, color:'#1a1a2e' }}>🔥 Top Sellers</span>
        </div>
        <div style={{ textAlign:'center', marginBottom:18 }}>
          <span style={{ fontSize:14, color:'#888', fontStyle:'italic', fontWeight:600 }}>Our most loved sweets</span>
        </div>
        {topSellers.length > 0 ? <ScrollRow items={fill(topSellers)} direction="right" /> : <Placeholder />}
      </div>

    </section>
  );
};

export default FeaturedShopsSection;
