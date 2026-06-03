import React, { useState, useEffect, useRef, useCallback } from 'react';
import { testimonialAPI } from '../../services/api';

const Stars = ({ n }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize:15, color: i<=n ? '#FFD84D' : '#E5E7EB' }}>★</span>
    ))}
  </div>
);

const Avatar = ({ t, size=52 }) => (
  <div style={{
    width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0,
    background:'linear-gradient(135deg,#FFD84D,#FF4C29)',
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'#1A1A1A', fontWeight:800, fontSize:size*0.38, fontFamily:'Poppins,sans-serif',
  }}>
    {t.profileImage?.url
      ? <img loading="lazy" src={t.profileImage.url} alt={t.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
      : t.name?.[0]?.toUpperCase()}
  </div>
);

const TestimonialsSection = () => {
  const [list, setList]     = useState([]);
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef            = useRef(null);

  useEffect(() => {
    testimonialAPI.getAll()
      .then(r => setList(r.data.testimonials || []))
      .catch(() => {});
  }, []);

  const goTo = useCallback((idx) => {
    if (fading || !list.length) return;
    setFading(true);
    setTimeout(() => { setActive(idx); setFading(false); }, 260);
  }, [fading, list.length]);

  const startAuto = useCallback(() => {
    if (list.length < 2) return;
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % list.length);
    }, 5000);
  }, [list.length]);

  useEffect(() => {
    startAuto();
    return () => clearInterval(timerRef.current);
  }, [startAuto]);

  const pause  = () => clearInterval(timerRef.current);
  const resume = () => startAuto();

  if (!list.length) return null;

  const leftIdx  = (active - 1 + list.length) % list.length;
  const rightIdx = (active + 1) % list.length;

  return (
    <section className="testimonials-section">
      <div className="container">

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <span className="section-label">Happy Customers</span>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="section-divider" style={{ margin:'12px auto 14px' }} />
          <p style={{ color:'#6B7280', fontSize:14.5, maxWidth:420, margin:'0 auto', fontFamily:'Poppins,sans-serif' }}>
            Authentic reviews from sweet lovers across India
          </p>
        </div>

        {/* ── Desktop 3-card carousel ── */}
        <div className="d-none d-md-block" onMouseEnter={pause} onMouseLeave={resume}>
          <div className="testimonials-carousel-row">

            {/* Prev arrow */}
            {list.length > 1 && (
              <button onClick={() => { pause(); goTo(leftIdx); }} style={{
                position:'absolute', left:-8, top:'50%', transform:'translateY(-50%)', zIndex:10,
                width:42, height:42, borderRadius:'50%', border:'1.5px solid #E5E7EB', background:'white',
                cursor:'pointer', fontSize:20, color:'#374151', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 16px rgba(0,0,0,0.10)', transition:'all .2s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='#FFD84D';e.currentTarget.style.borderColor='#FFD84D';}}
              onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.borderColor='#E5E7EB';}}>
                ‹
              </button>
            )}

            {/* Left side card */}
            {list.length >= 2 && (
              <div className="testimonial-card side" style={{ width:300, alignSelf:'center' }}
                onClick={() => { pause(); goTo(leftIdx); }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexShrink:0 }}>
                  <Avatar t={list[leftIdx]} size={40} />
                  <div>
                    <div style={{ fontWeight:700, fontSize:13.5, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{list[leftIdx].name}</div>
                    {list[leftIdx].designation && <div style={{ fontSize:11, color:'#9CA3AF' }}>{list[leftIdx].designation}</div>}
                  </div>
                </div>
                <div style={{ flexShrink:0 }}><Stars n={list[leftIdx].rating} /></div>
                <p className="testimonial-review-text">
                  "{list[leftIdx].review}"
                </p>
              </div>
            )}

            {/* Centre featured card */}
            <div className="testimonial-card center" style={{ width:420, opacity:fading?0:1, transform:fading?'scale(0.97)':'scale(1)', transition:'opacity .26s, transform .26s' }}>
              <div style={{ position:'absolute', top:18, right:20, fontSize:56, opacity:0.05, color:'#FFD84D', fontFamily:'Georgia,serif', lineHeight:1, userSelect:'none' }}>"</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, flexShrink:0 }}>
                <Avatar t={list[active]} size={52} />
                <div>
                  <div style={{ fontWeight:800, fontSize:15.5, color:'#1A1A1A', fontFamily:'Poppins,sans-serif', lineHeight:1.2 }}>{list[active].name}</div>
                  {list[active].designation && <div style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>{list[active].designation}</div>}
                </div>
              </div>
              <div style={{ flexShrink:0 }}><Stars n={list[active].rating} /></div>
              <p className="testimonial-review-text center-text">
                "{list[active].review}"
              </p>
            </div>

            {/* Right side card */}
            {list.length >= 3 && (
              <div className="testimonial-card side" style={{ width:300, alignSelf:'center' }}
                onClick={() => { pause(); goTo(rightIdx); }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexShrink:0 }}>
                  <Avatar t={list[rightIdx]} size={40} />
                  <div>
                    <div style={{ fontWeight:700, fontSize:13.5, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{list[rightIdx].name}</div>
                    {list[rightIdx].designation && <div style={{ fontSize:11, color:'#9CA3AF' }}>{list[rightIdx].designation}</div>}
                  </div>
                </div>
                <div style={{ flexShrink:0 }}><Stars n={list[rightIdx].rating} /></div>
                <p className="testimonial-review-text">
                  "{list[rightIdx].review}"
                </p>
              </div>
            )}

            {/* Next arrow */}
            {list.length > 1 && (
              <button onClick={() => { pause(); goTo(rightIdx); }} style={{
                position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', zIndex:10,
                width:42, height:42, borderRadius:'50%', border:'1.5px solid #E5E7EB', background:'white',
                cursor:'pointer', fontSize:20, color:'#374151', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 16px rgba(0,0,0,0.10)', transition:'all .2s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='#FFD84D';e.currentTarget.style.borderColor='#FFD84D';}}
              onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.borderColor='#E5E7EB';}}>
                ›
              </button>
            )}
          </div>
        </div>

        {/* Mobile single card */}
        <div className="d-md-none" style={{ padding:'0 8px' }}>
          <div className="testimonial-card center" style={{ opacity:fading?0:1, transition:'opacity .26s', height:280 }}>
            <div style={{ position:'absolute', top:16, right:18, fontSize:40, opacity:0.06, color:'#FFD84D', fontFamily:'Georgia,serif', lineHeight:1 }}>"</div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, flexShrink:0 }}>
              <Avatar t={list[active]} size={48} />
              <div>
                <div style={{ fontWeight:800, fontSize:15, color:'#1A1A1A', fontFamily:'Poppins,sans-serif' }}>{list[active].name}</div>
                {list[active].designation && <div style={{ fontSize:11.5, color:'#9CA3AF', marginTop:2 }}>{list[active].designation}</div>}
              </div>
            </div>
            <div style={{ flexShrink:0 }}><Stars n={list[active].rating} /></div>
            <p className="testimonial-review-text center-text">"{list[active].review}"</p>
          </div>
          {list.length > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:20 }}>
              <button onClick={() => { pause(); goTo(leftIdx); }} style={{ width:40, height:40, borderRadius:'50%', border:'1.5px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:20, color:'#374151', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.08)' }}>‹</button>
              <button onClick={() => { pause(); goTo(rightIdx); }} style={{ width:40, height:40, borderRadius:'50%', border:'1.5px solid #E5E7EB', background:'white', cursor:'pointer', fontSize:20, color:'#374151', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,.08)' }}>›</button>
            </div>
          )}
        </div>

        {/* Dots */}
        {list.length > 1 && (
          <div className="testimonial-dots">
            {list.map((_, i) => (
              <button key={i} onClick={() => { pause(); goTo(i); }}
                className="testimonial-dot"
                style={{ width:i===active?24:8, background:i===active?'#FF4C29':'#D1D5DB' }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
