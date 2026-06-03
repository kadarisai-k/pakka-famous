import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const categories = ['Product Quality', 'Delivery Experience', 'Website / App', 'Customer Support', 'Packaging', 'Other'];

const FeedbackPage = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { alert('Please select a rating.'); return; }
    if (!category) { alert('Please select a category.'); return; }
    if (!message.trim()) { alert('Please enter your feedback.'); return; }
    setLoading(true);
    // Simulate submission — replace with actual API call
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: '#1A1A1A', marginBottom: 12 }}>
          Thank you for your feedback!
        </h2>
        <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
          Your feedback helps us improve our sweets and service. We truly appreciate you taking the time to share your thoughts.
        </p>
        <a href="/" style={{
          background: '#FF4C29', color: '#fff', padding: '12px 32px',
          borderRadius: 999, fontWeight: 600, fontSize: 15,
          textDecoration: 'none', fontFamily: 'Poppins, sans-serif',
          boxShadow: '0 4px 14px rgba(255,76,41,0.3)',
          display: 'inline-block',
        }}>Back to Home</a>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%)',
        padding: '64px 0 48px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,216,77,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,76,41,0.08) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,216,77,0.15)',
            border: '1px solid rgba(255,216,77,0.3)', borderRadius: 999,
            padding: '6px 18px', fontSize: 12, fontWeight: 600,
            color: '#FFD84D', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20
          }}>Your Voice Matters</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: 40, fontWeight: 900, marginBottom: 12 }}>
            Share Your Feedback
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontFamily: 'Poppins, sans-serif' }}>
            Help us serve you better with Andhra Pradesh's finest sweets
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 640, padding: '56px 24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

            {/* Star Rating */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: 16, fontSize: 16, fontFamily: 'Poppins, sans-serif' }}>
                Overall Experience
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 40, padding: 4, transition: 'transform .15s',
                      transform: (hover || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                    }}>
                    <FaStar color={(hover || rating) >= star ? '#FFD84D' : '#E5E7EB'} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
                </div>
              )}
            </div>

            {/* Category */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#1A1A1A', marginBottom: 10, fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
                What is your feedback about? *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map(cat => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} style={{
                    padding: '7px 16px', borderRadius: 999, border: '2px solid',
                    borderColor: category === cat ? '#FF4C29' : '#E5E7EB',
                    background: category === cat ? '#FFF0EC' : '#fff',
                    color: category === cat ? '#FF4C29' : '#6B7280',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', transition: 'all .15s',
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#1A1A1A', marginBottom: 10, fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
                Your Feedback *
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                placeholder="Tell us what you loved, what we can improve, or share your experience..."
                style={{
                  width: '100%', borderRadius: 12, border: '2px solid #E5E7EB',
                  padding: '14px 16px', fontSize: 14, fontFamily: 'Poppins, sans-serif',
                  color: '#1A1A1A', resize: 'vertical', outline: 'none', transition: 'border-color .2s',
                  lineHeight: 1.6,
                }}
                onFocus={e => e.target.style.borderColor = '#FF4C29'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{message.length}/500</div>
            </div>

            {/* Name & Email (if not logged in) */}
            {!user && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Your Name', value: name, setter: setName, placeholder: 'Full name' },
                  { label: 'Email Address', value: email, setter: setEmail, placeholder: 'you@email.com' },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#1A1A1A', marginBottom: 8, fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>{label}</label>
                    <input value={value} onChange={e => setter(e.target.value)} placeholder={placeholder} style={{
                      width: '100%', borderRadius: 10, border: '2px solid #E5E7EB',
                      padding: '11px 14px', fontSize: 14, fontFamily: 'Poppins, sans-serif',
                      outline: 'none', transition: 'border-color .2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#FF4C29'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#F3F4F6' : 'linear-gradient(135deg, #FF4C29, #c5380f)',
              color: loading ? '#9CA3AF' : '#fff',
              fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif', transition: 'all .2s',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(255,76,41,0.3)',
            }}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
