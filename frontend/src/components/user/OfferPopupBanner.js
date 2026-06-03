import React, { useState, useEffect } from 'react';
import { FaTimes, FaTag, FaClock } from 'react-icons/fa';

const pad = n => String(n).padStart(2, '0');

const useCountdown = (targetDate) => {
  const [time, setTime] = useState({ d:0, h:0, m:0, s:0, ended:false });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(targetDate) - Date.now()) / 1000));
      setTime({
        d: Math.floor(diff / 86400),
        h: Math.floor((diff % 86400) / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
        ended: diff === 0,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
};

const TimeBox = ({ value, label, color }) => (
  <div style={{ textAlign:'center' }}>
    <div style={{ background:'rgba(0,0,0,0.35)', color:'#fff', borderRadius:8, padding:'6px 10px', fontWeight:900, fontSize:22, fontFamily:'monospace', minWidth:44, lineHeight:1 }}>
      {pad(value)}
    </div>
    <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', marginTop:3, textTransform:'uppercase', letterSpacing:1 }}>{label}</div>
  </div>
);

const OfferPopupBanner = ({ offer, onClose }) => {
  const [visible, setVisible] = useState(false);
  const isLive    = new Date() >= new Date(offer.startDate) && new Date() <= new Date(offer.endDate);
  const isUpcoming = new Date() < new Date(offer.startDate);
  const countdown = useCountdown(isLive ? offer.endDate : offer.startDate);
  const bg = offer.popupBgColor || '#E8001D';

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800); // slight delay for better UX
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 350); };

  if (!visible) return null;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,0.65)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16,
      animation:'fadeIn 0.3s ease',
    }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: `linear-gradient(135deg, ${bg}, ${bg}dd)`,
          borderRadius:24,
          maxWidth:520,
          width:'100%',
          boxShadow:'0 24px 80px rgba(0,0,0,0.4)',
          overflow:'hidden',
          position:'relative',
          animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Close button */}
        <button onClick={handleClose} style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,0.25)', border:'none', color:'white', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:10 }}>
          <FaTimes size={14} />
        </button>

        {/* Banner image if provided */}
        {offer.bannerImage?.url && (
          <img loading="lazy" src={offer.bannerImage.url} alt="" style={{ width:'100%', height:180, objectFit:'cover', display:'block' }} />
        )}

        <div style={{ padding:'28px 28px 24px' }}>
          {/* Badge */}
          <div style={{ display:'inline-block', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.4)', color:'white', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2, padding:'3px 12px', borderRadius:50, marginBottom:12 }}>
            {isLive ? '🔥 Live Now' : '⏳ Coming Soon'}
          </div>

          {/* Title */}
          <h2 style={{ color:'white', fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:'clamp(1.4rem,4vw,1.8rem)', marginBottom:8, textShadow:'0 2px 8px rgba(0,0,0,0.3)', lineHeight:1.2 }}>
            {offer.title}
          </h2>
          {offer.subtitle && (
            <p style={{ color:'rgba(255,255,255,0.85)', fontSize:14, marginBottom:16, lineHeight:1.5 }}>{offer.subtitle}</p>
          )}

          {/* Countdown */}
          {!countdown.ended && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                <FaClock size={11} />
                {isLive ? 'Offer ends in:' : 'Starts in:'}
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                {countdown.d > 0 && <TimeBox value={countdown.d} label="Days" />}
                <TimeBox value={countdown.h} label="Hrs" />
                <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:900, fontSize:20, marginBottom:16 }}>:</span>
                <TimeBox value={countdown.m} label="Min" />
                <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:900, fontSize:20, marginBottom:16 }}>:</span>
                <TimeBox value={countdown.s} label="Sec" />
              </div>
            </div>
          )}

          {/* Perks */}
          {offer.perks?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {offer.perks.map((p, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.18)', borderRadius:50, padding:'5px 14px', fontSize:13, color:'white', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                  <span>{p.icon}</span>{p.label}
                  {p.desc && <span style={{ opacity:0.8, fontSize:11 }}>— {p.desc}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Coupon code */}
          {offer.couponCode && (
            <div style={{ background:'rgba(255,255,255,0.15)', border:'2px dashed rgba(255,255,255,0.5)', borderRadius:12, padding:'10px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
              <FaTag size={14} style={{ color:'rgba(255,255,255,0.8)' }} />
              <div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1 }}>Use Coupon Code</div>
                <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:18, color:'white', letterSpacing:2 }}>
                  {offer.couponCode}
                  {offer.couponPercent > 0 && <span style={{ marginLeft:8, background:'rgba(255,255,255,0.2)', borderRadius:6, padding:'1px 8px', fontSize:14 }}>{offer.couponPercent}% OFF</span>}
                </div>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:10 }}>
            <a href="/products" style={{ flex:1, background:'white', color:bg, border:'none', borderRadius:50, padding:'11px 20px', fontWeight:800, fontSize:14, textAlign:'center', textDecoration:'none', boxShadow:'0 4px 14px rgba(0,0,0,0.2)', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}>
              Shop Now →
            </a>
            <button onClick={handleClose} style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.4)', borderRadius:50, padding:'11px 20px', fontWeight:600, fontSize:14, cursor:'pointer' }}>
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(60px) scale(0.95); opacity:0 } to { transform:translateY(0) scale(1); opacity:1 } }
      `}</style>
    </div>
  );
};

export default OfferPopupBanner;
