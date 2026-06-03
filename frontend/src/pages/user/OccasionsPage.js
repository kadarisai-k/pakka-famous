import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packingAPI, occasionAPI, productAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

// Min delivery: today + 3 days
const minDelivery = () => {
  const d = new Date(); d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
};

// Sweet builder for custom packages
const SweetBuilder = ({ products, sweets, onChange }) => {
  const [selId, setSelId] = useState('');
  const [qty,   setQty]   = useState(1);

  const add = () => {
    if (!selId) return;
    const p = products.find(x => x._id === selId);
    if (!p || sweets.find(s => s.productId === selId)) { if (sweets.find(s=>s.productId===selId)) alert('Already added'); return; }
    onChange([...sweets, { productId:p._id, name:p.name, quantity:qty, pricePerKg:p.weightPrices?.[0]?.price||p.price||0 }]);
    setSelId(''); setQty(1);
  };
  const upd = (i,v) => onChange(sweets.map((s,idx)=>idx===i?{...s,quantity:parseFloat(v)||1}:s));
  const rem = i => onChange(sweets.filter((_,idx)=>idx!==i));
  const total = sweets.reduce((s,x)=>s+(x.pricePerKg||0)*x.quantity, 0);

  return (
    <div>
      {sweets.length > 0 && (
        <div style={{ marginBottom:14 }}>
          {sweets.map((s,i)=>(
            <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#FFFBEB',borderRadius:10,marginBottom:7,border:'1px solid rgba(255,216,77,.3)' }}>
              <span style={{ flex:1,fontSize:14,fontWeight:600,color:'#1A1A1A',fontFamily:'Poppins,sans-serif' }}>🍬 {s.name}</span>
              <input type="number" min=".25" step=".25" value={s.quantity} onChange={e=>upd(i,e.target.value)} style={{ width:65,border:'1.5px solid #E5E7EB',borderRadius:8,padding:'6px 8px',fontSize:13,textAlign:'center',fontFamily:'Poppins,sans-serif',outline:'none' }}/>
              <span style={{ fontSize:12,color:'#6B7280',fontWeight:600 }}>kg</span>
              <span style={{ fontSize:13,fontWeight:700,color:'#4CAF50',minWidth:64,textAlign:'right' }}>₹{((s.pricePerKg||0)*s.quantity).toFixed(0)}</span>
              <button onClick={()=>rem(i)} style={{ background:'none',border:'none',cursor:'pointer',color:'#FF4C29',fontSize:18,lineHeight:1,padding:'2px' }}>×</button>
            </div>
          ))}
          <div style={{ display:'flex',justifyContent:'space-between',padding:'10px 14px',background:'linear-gradient(135deg,#FFD84D,#F5C800)',borderRadius:10 }}>
            <span style={{ fontWeight:700,fontSize:14,color:'#1A1A1A',fontFamily:'Poppins,sans-serif' }}>Total ({sweets.reduce((s,x)=>s+x.quantity,0).toFixed(2)} kg)</span>
            <span style={{ fontWeight:800,fontSize:16,color:'#1A1A1A',fontFamily:'Poppins,sans-serif' }}>₹{total.toFixed(0)}</span>
          </div>
        </div>
      )}
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',alignItems:'center' }}>
        <select value={selId} onChange={e=>setSelId(e.target.value)} style={{ flex:2,minWidth:180,border:'1.5px solid #E5E7EB',borderRadius:10,padding:'10px 13px',fontSize:13.5,fontFamily:'Poppins,sans-serif',outline:'none',background:'white',color:'#1A1A1A' }}>
          <option value="">— Choose a sweet —</option>
          {products.map(p=><option key={p._id} value={p._id}>{p.name} — ₹{p.weightPrices?.[0]?.price||p.price||0}/kg</option>)}
        </select>
        <input type="number" min=".25" step=".25" value={qty} onChange={e=>setQty(parseFloat(e.target.value)||1)} style={{ width:70,border:'1.5px solid #E5E7EB',borderRadius:10,padding:'10px 8px',fontSize:13.5,textAlign:'center',fontFamily:'Poppins,sans-serif',outline:'none' }}/>
        <span style={{ fontSize:12,color:'#6B7280',fontWeight:600 }}>kg</span>
        <button onClick={add} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)',color:'#1A1A1A',border:'none',borderRadius:10,padding:'10px 18px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'Poppins,sans-serif',whiteSpace:'nowrap' }}>+ Add Sweet</button>
      </div>
    </div>
  );
};

// Address form
const AddrForm = ({ form, setForm, I, L }) => (
  <div style={{ background:'#F9FAFB',borderRadius:12,padding:'14px 16px',border:'1.5px solid #F3F4F6',marginBottom:14 }}>
    <label style={{...L,marginBottom:10}}>📍 Delivery Address</label>
    <div style={{ marginBottom:10 }}><label style={L}>Street / Area *</label><input style={I} placeholder="House no., Street, Area" value={form.street} onChange={e=>setForm(f=>({...f,street:e.target.value}))}/></div>
    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10 }}>
      <div><label style={L}>City *</label><input style={I} placeholder="City" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))}/></div>
      <div><label style={L}>State</label><input style={I} placeholder="State" value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}/></div>
    </div>
    <div><label style={L}>Pincode *</label><input style={I} placeholder="6-digit" maxLength={6} value={form.pincode} onChange={e=>setForm(f=>({...f,pincode:e.target.value.replace(/\D/,'')}))} /></div>
  </div>
);

const OccasionsPage = ({ logo, announcement }) => {
  const { occasionId } = useParams();    // now uses MongoDB _id
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [allOccasions, setAllOccasions] = useState([]);
  const [occasion,     setOccasion]     = useState(null);
  const [packings,     setPackings]     = useState([]);
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  const [orderModal, setOrderModal]     = useState(null);
  const [customModal, setCustomModal]   = useState(false);
  const [success,     setSuccess]       = useState(false);
  const [submitting,  setSubmitting]    = useState(false);

  const emptyAddr = { phone:user?.phone||'', street:user?.address?.street||'', city:user?.address?.city||'', state:user?.address?.state||'Andhra Pradesh', pincode:user?.address?.pincode||'' };
  const [orderForm,   setOrderForm]     = useState({ ...emptyAddr, deliveryDate:'', notes:'' });
  const [customSweets, setCustomSweets] = useState([]);
  const [customForm,   setCustomForm]   = useState({ ...emptyAddr, deliveryDate:'', notes:'' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [occRes, prodRes] = await Promise.all([
          occasionAPI.getAll(),
          productAPI.getAll({ limit:200 }),
        ]);
        const occs = occRes.data.occasions || [];
        setAllOccasions(occs);
        setProducts(prodRes.data.products || []);
        if (occasionId) {
          const occ = occs.find(o => o._id === occasionId);
          setOccasion(occ || null);
          const packRes = await packingAPI.getByOccasion(occasionId);
          setPackings(packRes.data.packings || []);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [occasionId]);

  const requireLogin = () => {
    if (!isLoggedIn) { navigate('/login', { state:{ from: window.location.pathname } }); return false; }
    return true;
  };

  const openOrder = p => {
    if (!requireLogin()) return;
    setOrderModal(p); setOrderForm({ phone:user?.phone||'', street:user?.address?.street||'', city:user?.address?.city||'', state:user?.address?.state||'Andhra Pradesh', pincode:user?.address?.pincode||'', deliveryDate:'', notes:'' }); setSuccess(false);
  };
  const openCustom = () => {
    if (!requireLogin()) return;
    setCustomSweets([]); setCustomForm({ phone:user?.phone||'', street:user?.address?.street||'', city:user?.address?.city||'', state:user?.address?.state||'Andhra Pradesh', pincode:user?.address?.pincode||'', deliveryDate:'', notes:'' }); setCustomModal(true); setSuccess(false);
  };
  const closeAll = () => { setOrderModal(null); setCustomModal(false); setSuccess(false); };

  const validate = f => {
    if (!f.phone.trim()) { alert('Phone required'); return false; }
    if (!f.street.trim()) { alert('Street/Area required'); return false; }
    if (!f.city.trim()) { alert('City required'); return false; }
    if (!f.pincode || f.pincode.length !== 6) { alert('Valid 6-digit pincode required'); return false; }
    if (!f.deliveryDate) { alert('Please select delivery date (min 3 days from today)'); return false; }
    return true;
  };

  const submitOrder = async (payload) => {
    setSubmitting(true);
    try { await packingAPI.submitOrder(payload); setSuccess(true); }
    catch { alert('Failed. Please try again.'); } finally { setSubmitting(false); }
  };

  const I = { width:'100%',border:'1.5px solid #E5E7EB',borderRadius:10,padding:'10px 14px',fontSize:14,outline:'none',color:'#1A1A1A',fontFamily:'Poppins,sans-serif',background:'white' };
  const L = { fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:.8,marginBottom:5,display:'block',fontFamily:'Poppins,sans-serif' };

  // Success screen
  const SuccessScreen = ({ custom }) => (
    <div style={{ textAlign:'center',padding:'48px 24px' }}>
      <div style={{ fontSize:60,marginBottom:16 }}>🎉</div>
      <h3 style={{ fontFamily:'Playfair Display,serif',fontWeight:900,color:'#1A1A1A',marginBottom:10 }}>{custom?'Request Submitted!':'Order Placed!'}</h3>
      <p style={{ color:'#6B7280',fontFamily:'Poppins,sans-serif',marginBottom:28,maxWidth:320,margin:'0 auto 28px' }}>We'll call you shortly to confirm and arrange delivery.</p>
      <button onClick={closeAll} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)',color:'#1A1A1A',border:'none',borderRadius:12,padding:'12px 28px',fontWeight:700,cursor:'pointer',fontFamily:'Poppins,sans-serif' }}>Done</button>
    </div>
  );

  const heroGrad = occasion?.image?.url ? null : 'linear-gradient(135deg,#1A1A1A,#2D2D2D)';

  return (
    <div>
      <Navbar logo={logo} announcement={announcement}/>

      {/* Hero */}
      <div style={{ position:'relative',padding:'56px 0 48px',color:'white',overflow:'hidden', background:heroGrad||'#1A1A1A' }}>
        {occasion?.image?.url && (
          <>
            <img loading="lazy" src={occasion.image.url} alt="" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.35 }}/>
            <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,.7))' }}/>
          </>
        )}
        <div style={{ position:'absolute',inset:0,opacity:.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'24px 24px' }}/>
        <div className="container" style={{ position:'relative' }}>
          {occasionId ? (
            <>
              <button onClick={()=>navigate('/occasions')} style={{ background:'rgba(255,255,255,.12)',border:'none',borderRadius:50,padding:'6px 16px',color:'rgba(255,255,255,.8)',fontSize:13,cursor:'pointer',marginBottom:20,fontFamily:'Poppins,sans-serif' }}>← All Occasions</button>
              <div style={{ fontSize:'3rem',marginBottom:12 }}>{occasion?.emoji||'🎁'}</div>
              <h1 style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'clamp(2rem,5vw,3rem)',margin:'0 0 12px' }}>{occasion?.title||'Loading…'}</h1>
              {occasion?.description && <p style={{ color:'rgba(255,255,255,.75)',fontSize:15,fontFamily:'Poppins,sans-serif',maxWidth:520 }}>{occasion.description}</p>}
            </>
          ) : (
            <>
              <span style={{ background:'rgba(255,216,77,.2)',color:'#FFD84D',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:2,padding:'4px 14px',borderRadius:50,marginBottom:16,display:'inline-block',fontFamily:'Poppins,sans-serif' }}>Special Occasions</span>
              <h1 style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:'clamp(2rem,5vw,3rem)',margin:'0 0 12px' }}>Gifts for Every Occasion</h1>
              <p style={{ color:'rgba(255,255,255,.7)',fontSize:15,maxWidth:520,fontFamily:'Poppins,sans-serif' }}>Authentic Andhra sweets packaged beautifully for every celebration.</p>
            </>
          )}
        </div>
      </div>

      <div className="container" style={{ padding:'48px 16px' }}>
        {loading ? (
          <div style={{ textAlign:'center',padding:'60px 0' }}><div className="spinner-border" style={{ color:'#FFD84D' }}/></div>
        ) : !occasionId ? (
          // All occasions grid
          <>
            <h2 style={{ fontFamily:'Playfair Display,serif',fontWeight:900,color:'#1A1A1A',marginBottom:24,fontSize:'1.8rem' }}>Choose Your Occasion</h2>
            {allOccasions.length === 0 ? (
              <div style={{ textAlign:'center',padding:'60px 20px',background:'white',borderRadius:20,border:'2px dashed #E5E7EB' }}>
                <div style={{ fontSize:48,marginBottom:14,opacity:.3 }}>🎁</div>
                <p style={{ color:'#9CA3AF',fontFamily:'Poppins,sans-serif' }}>No occasions available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="row g-3">
                {allOccasions.map(occ=>(
                  <div key={occ._id} className="col-6 col-md-4 col-lg-2">
                    <div onClick={()=>navigate(`/occasions/${occ._id}`)}
                      style={{ background:'white',borderRadius:16,padding:'22px 14px',textAlign:'center',cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,.06)',border:'2px solid transparent',transition:'all .25s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#FFD84D';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.12)';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='transparent';e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.06)';}}>
                      {occ.image?.url
                        ? <img loading="lazy" src={occ.image.url} alt={occ.title} style={{ width:64,height:64,borderRadius:12,objectFit:'cover',marginBottom:10 }}/>
                        : <div style={{ fontSize:'2.5rem',marginBottom:10 }}>{occ.emoji||'🎁'}</div>}
                      <div style={{ fontWeight:700,fontSize:13,color:'#1A1A1A',fontFamily:'Poppins,sans-serif',marginBottom:4 }}>{occ.title}</div>
                      {occ.description && <div style={{ fontSize:11,color:'#9CA3AF' }}>{occ.description.substring(0,40)}{occ.description.length>40?'…':''}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : packings.length === 0 ? (
          // Occasion selected but no packages
          <div style={{ textAlign:'center',padding:'60px 20px',background:'white',borderRadius:20,border:'2px dashed #E5E7EB' }}>
            <div style={{ fontSize:48,marginBottom:14,opacity:.3 }}>📦</div>
            <h5 style={{ fontFamily:'Poppins,sans-serif',fontWeight:700,color:'#1A1A1A',marginBottom:8 }}>No packages yet for this occasion</h5>
            <p style={{ color:'#9CA3AF',marginBottom:24 }}>Tell us what you need and we'll create a custom package</p>
            <button onClick={openCustom} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)',color:'#1A1A1A',border:'none',borderRadius:12,padding:'12px 28px',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'Poppins,sans-serif' }}>Build Your Own Package →</button>
          </div>
        ) : (
          <>
            {/* Package cards */}
            <div className="row g-4">
              {packings.map(p=>(
                <div key={p._id} className="col-12 col-md-6 col-lg-4">
                  <div style={{ background:'white',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.08)',border:'1.5px solid #F3F4F6',transition:'all .28s',height:'100%',display:'flex',flexDirection:'column' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,.13)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.08)';}}>
                    <div style={{ height:200,background:'#F9FAFB',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative' }}>
                      {p.image?.url
                        ? <img loading="lazy" src={p.image.url} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'contain' }}/>
                        : <div style={{ fontSize:'4rem',opacity:.25 }}>📦</div>}
                    </div>
                    <div style={{ padding:'20px 22px',flex:1,display:'flex',flexDirection:'column' }}>
                      <h4 style={{ fontFamily:'Poppins,sans-serif',fontWeight:800,color:'#1A1A1A',marginBottom:8,fontSize:17 }}>{p.name}</h4>
                      {p.description && <p style={{ fontSize:13.5,color:'#6B7280',marginBottom:14,lineHeight:1.65 }}>{p.description}</p>}
                      {p.sweets?.length > 0 && (
                        <div style={{ marginBottom:16 }}>
                          <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:.8,marginBottom:8 }}>Included Sweets</div>
                          <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                            {p.sweets.map((s,i)=><span key={i} style={{ background:'#FFFBEB',color:'#8B6800',fontSize:11.5,fontWeight:600,padding:'4px 10px',borderRadius:50,border:'1px solid rgba(255,216,77,.4)' }}>🍬 {s.name} × {s.quantity}kg</span>)}
                          </div>
                          {p.totalQuantity > 0 && <div style={{ fontSize:12,color:'#9CA3AF',marginTop:8 }}>Total: {p.totalQuantity} kg</div>}
                        </div>
                      )}
                      <div style={{ marginTop:'auto',display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:14,borderTop:'1px solid #F3F4F6' }}>
                        {p.price > 0 ? <span style={{ fontSize:22,fontWeight:800,color:'#FF4C29',fontFamily:'Poppins,sans-serif' }}>₹{p.price.toLocaleString('en-IN')}</span> : <span style={{ fontSize:13,color:'#9CA3AF' }}>Price on request</span>}
                        <button onClick={()=>openOrder(p)} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)',color:'#1A1A1A',border:'none',borderRadius:12,padding:'11px 22px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'Poppins,sans-serif',boxShadow:'0 3px 12px rgba(255,216,77,.4)' }}>Order Now →</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom package CTA */}
            <div style={{ marginTop:48,background:'linear-gradient(135deg,#1A1A1A,#2D2D2D)',borderRadius:20,padding:'40px 32px',textAlign:'center',color:'white' }}>
              <div style={{ fontSize:'2.5rem',marginBottom:14 }}>✨</div>
              <h3 style={{ fontFamily:'Playfair Display,serif',fontWeight:900,marginBottom:10,fontSize:'1.8rem' }}>Can't find what you need?</h3>
              <p style={{ color:'rgba(255,255,255,.7)',marginBottom:24,maxWidth:460,margin:'0 auto 24px',fontFamily:'Poppins,sans-serif' }}>Build your own custom package — select sweets with exact quantities. Price calculated automatically.</p>
              <button onClick={openCustom} style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)',color:'#1A1A1A',border:'none',borderRadius:12,padding:'13px 32px',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'Poppins,sans-serif',boxShadow:'0 4px 20px rgba(255,216,77,.5)' }}>Build Your Own Package →</button>
            </div>
          </>
        )}
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ background:'white',borderRadius:20,width:'100%',maxWidth:520,maxHeight:'94vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.22)' }}>
            {success ? <SuccessScreen/> : (
              <>
                <div style={{ padding:'22px 24px 16px',borderBottom:'1px solid #F3F4F6',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                  <div>
                    <h5 style={{ margin:0,fontWeight:800,color:'#1A1A1A',fontFamily:'Poppins,sans-serif' }}>Order: {orderModal.name}</h5>
                    {orderModal.price > 0 && <p style={{ margin:'2px 0 0',fontSize:14,color:'#FF4C29',fontWeight:700 }}>₹{orderModal.price.toLocaleString('en-IN')}</p>}
                  </div>
                  <button onClick={closeAll} style={{ background:'#F3F4F6',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,color:'#6B7280' }}>✕</button>
                </div>
                <div style={{ padding:'20px 24px' }}>
                  <div style={{ marginBottom:14 }}><label style={L}>Phone *</label><input style={I} type="tel" placeholder="Phone number" value={orderForm.phone} onChange={e=>setOrderForm(f=>({...f,phone:e.target.value}))}/></div>
                  <AddrForm form={orderForm} setForm={setOrderForm} I={I} L={L}/>
                  <div style={{ marginBottom:14 }}>
                    <label style={L}>Delivery Date * (min 3 days)</label>
                    <input style={I} type="date" min={minDelivery()} value={orderForm.deliveryDate} onChange={e=>setOrderForm(f=>({...f,deliveryDate:e.target.value}))}/>
                    <p style={{ fontSize:11,color:'#9CA3AF',marginTop:4,marginBottom:0 }}>⏰ We need at least 3 days to prepare your order</p>
                  </div>
                  <div style={{ marginBottom:22 }}><label style={L}>Notes</label><textarea style={{...I,minHeight:68,resize:'vertical'}} placeholder="Special requirements..." value={orderForm.notes} onChange={e=>setOrderForm(f=>({...f,notes:e.target.value}))}/></div>
                  <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
                    <button onClick={closeAll} style={{ background:'#F9FAFB',color:'#374151',border:'1.5px solid #E5E7EB',borderRadius:10,padding:'10px 20px',fontWeight:600,fontSize:14,cursor:'pointer' }}>Cancel</button>
                    <button onClick={()=>{ if(!validate(orderForm)) return; submitOrder({ name:user?.name||'Customer', phone:orderForm.phone, email:user?.email||'', occasionId:occasion?._id||'', occasionTitle:occasion?.title||'', packingId:orderModal._id, packingName:orderModal.name, quantity:1, totalPrice:orderModal.price||0, deliveryDate:orderForm.deliveryDate, notes:orderForm.notes, deliveryAddress:{ street:orderForm.street, city:orderForm.city, state:orderForm.state, pincode:orderForm.pincode } }); }} disabled={submitting}
                      style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)',color:'#1A1A1A',border:'none',borderRadius:10,padding:'10px 24px',fontWeight:700,fontSize:14,cursor:'pointer',opacity:submitting?.7:1 }}>
                      {submitting?'Submitting…':'Place Order →'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom Package Modal */}
      {customModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ background:'white',borderRadius:20,width:'100%',maxWidth:600,maxHeight:'94vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.22)' }}>
            {success ? <SuccessScreen custom/> : (
              <>
                <div style={{ padding:'22px 24px 16px',borderBottom:'1px solid #F3F4F6',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                  <div><h5 style={{ margin:0,fontWeight:800,color:'#1A1A1A',fontFamily:'Poppins,sans-serif' }}>✨ Build Your Package</h5><p style={{ margin:'2px 0 0',fontSize:12,color:'#9CA3AF' }}>Select sweets — price calculated automatically</p></div>
                  <button onClick={closeAll} style={{ background:'#F3F4F6',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',fontSize:16,color:'#6B7280' }}>✕</button>
                </div>
                <div style={{ padding:'20px 24px' }}>
                  <div style={{ marginBottom:20,background:'#F9FAFB',borderRadius:12,padding:'16px',border:'1.5px solid #F3F4F6' }}>
                    <label style={{...L,marginBottom:12}}>🍬 Select Your Sweets</label>
                    <SweetBuilder products={products} sweets={customSweets} onChange={setCustomSweets}/>
                  </div>
                  <div style={{ marginBottom:14 }}><label style={L}>Phone *</label><input style={I} type="tel" placeholder="Phone number" value={customForm.phone} onChange={e=>setCustomForm(f=>({...f,phone:e.target.value}))}/></div>
                  <AddrForm form={customForm} setForm={setCustomForm} I={I} L={L}/>
                  <div style={{ marginBottom:14 }}>
                    <label style={L}>Delivery Date * (min 3 days)</label>
                    <input style={I} type="date" min={minDelivery()} value={customForm.deliveryDate} onChange={e=>setCustomForm(f=>({...f,deliveryDate:e.target.value}))}/>
                    <p style={{ fontSize:11,color:'#9CA3AF',marginTop:4,marginBottom:0 }}>⏰ We need at least 3 days to prepare your package</p>
                  </div>
                  <div style={{ marginBottom:22 }}><label style={L}>Notes</label><textarea style={{...I,minHeight:60,resize:'vertical'}} value={customForm.notes} onChange={e=>setCustomForm(f=>({...f,notes:e.target.value}))} placeholder="Special packaging, delivery preferences..."/></div>
                  <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
                    <button onClick={closeAll} style={{ background:'#F9FAFB',color:'#374151',border:'1.5px solid #E5E7EB',borderRadius:10,padding:'10px 20px',fontWeight:600,fontSize:14,cursor:'pointer' }}>Cancel</button>
                    <button disabled={submitting} onClick={()=>{ if(!validate(customForm)) return; if(customSweets.length===0){alert('Please add at least one sweet');return;} const total=customSweets.reduce((s,x)=>s+(x.pricePerKg||0)*x.quantity,0); submitOrder({ name:user?.name||'Customer', phone:customForm.phone, email:user?.email||'', occasionId:occasion?._id||'', occasionTitle:occasion?.title||'', packingName:'Custom Package', selectedSweets:customSweets.map(s=>`${s.name}×${s.quantity}kg`).join(', '), quantity:customSweets.reduce((s,x)=>s+x.quantity,0), totalPrice:total, deliveryDate:customForm.deliveryDate, notes:customForm.notes, deliveryAddress:{ street:customForm.street, city:customForm.city, state:customForm.state, pincode:customForm.pincode } }); }}
                      style={{ background:'linear-gradient(135deg,#FFD84D,#F5C800)',color:'#1A1A1A',border:'none',borderRadius:10,padding:'10px 24px',fontWeight:700,fontSize:14,cursor:'pointer',opacity:submitting?.7:1 }}>
                      {submitting?'Submitting…':'Place Order →'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer logo={logo}/>
    </div>
  );
};
export default OccasionsPage;
