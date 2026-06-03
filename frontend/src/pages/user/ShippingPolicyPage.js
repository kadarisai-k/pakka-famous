import React from 'react';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: 22, fontWeight: 700,
      color: '#1A1A1A', marginBottom: 14,
      paddingBottom: 10,
      borderBottom: '2px solid #FFD84D',
      display: 'inline-block'
    }}>{title}</h2>
    <div style={{ color: '#4B5563', lineHeight: 1.85, fontSize: 15 }}>{children}</div>
  </div>
);

const ShippingPolicyPage = () => (
  <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
    {/* Hero */}
    <div style={{
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%)',
      padding: '64px 0 48px', textAlign: 'center', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,216,77,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,76,41,0.08) 0%, transparent 50%)',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(255,216,77,0.15)',
          border: '1px solid rgba(255,216,77,0.3)', borderRadius: 999,
          padding: '6px 18px', fontSize: 12, fontWeight: 600,
          color: '#FFD84D', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20
        }}>Legal</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: 40, fontWeight: 900, marginBottom: 12 }}>
          Shipping Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
          Last updated: June 1, 2025
        </p>
      </div>
    </div>

    <div className="container" style={{ maxWidth: 820, padding: '56px 24px' }}>

      {/* Delivery Timeline Visual */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '32px', marginBottom: 48, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 28, color: '#1A1A1A', textAlign: 'center' }}>Estimated Delivery Timeline</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { zone: 'Andhra Pradesh', time: '1–3 days', icon: '⚡' },
            { zone: 'South India', time: '2–4 days', icon: '🚚' },
            { zone: 'Metro Cities', time: '3–5 days', icon: '🏙️' },
            { zone: 'Rest of India', time: '5–7 days', icon: '🗺️' },
          ].map(({ zone, time, icon }) => (
            <div key={zone} style={{ textAlign: 'center', background: '#F9FAFB', borderRadius: 12, padding: '20px 16px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 700, color: '#1A1A1A', fontSize: 13, marginBottom: 6, fontFamily: 'Poppins, sans-serif' }}>{zone}</div>
              <div style={{ color: '#FF4C29', fontWeight: 700, fontSize: 15 }}>{time}</div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9CA3AF' }}>* Business days only. Excludes public holidays and Sundays.</p>
      </div>

      <Section title="1. Order Processing">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>Orders are processed within <strong>1 business day</strong> after payment confirmation</li>
          <li>Orders placed after 2 PM or on Sundays/public holidays are processed the next business day</li>
          <li>You will receive an email and/or WhatsApp notification with your tracking details once dispatched</li>
          <li>Custom/occasion orders may require additional 1–2 days for preparation</li>
        </ul>
      </Section>

      <Section title="2. Shipping Charges">
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          {[
            ['Order Value', 'Shipping Charge'],
            ['Below ₹499', '₹60 flat'],
            ['₹499 – ₹999', '₹40 flat'],
            ['₹1,000 and above', 'FREE shipping 🎉'],
          ].map(([col1, col2], i) => (
            <div key={i} style={{
              display: 'flex', padding: '13px 18px',
              borderBottom: '1px solid #E5E7EB', fontSize: 14,
              background: i === 0 ? '#F9FAFB' : (i === 3 ? '#F0FFF0' : '#fff'),
              fontWeight: i === 0 ? 700 : 400
            }}>
              <span style={{ flex: 1, color: i === 0 ? '#1A1A1A' : '#4B5563' }}>{col1}</span>
              <span style={{ color: i === 3 ? '#4CAF50' : '#1A1A1A', fontWeight: i === 3 ? 700 : 400 }}>{col2}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Remote locations (PIN codes not serviceable by standard couriers) may incur additional charges. You will be informed at checkout.</p>
      </Section>

      <Section title="3. Shipping Partners">
        <p>We ship through reputed courier partners including Delhivery, Blue Dart, DTDC, and India Post (for select PIN codes). The courier is chosen automatically based on your delivery location for fastest delivery.</p>
      </Section>

      <Section title="4. Packaging">
        <p>Our sweets are packed in food-safe, tamper-evident packaging designed to:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li>Keep sweets fresh during transit</li>
          <li>Prevent breakage of delicate items like Pootharekulu</li>
          <li>Maintain temperature stability for ghee-based sweets</li>
        </ul>
        <p style={{ marginTop: 12 }}>Gift packaging is available for select products and occasions. Look for the "Gift Pack" option on product pages.</p>
      </Section>

      <Section title="5. Tracking Your Order">
        <ol style={{ paddingLeft: 20, lineHeight: 2.2 }}>
          <li>Log in to your account and go to <strong>My Orders</strong></li>
          <li>Click on your order to view order details and tracking status</li>
          <li>A tracking link will also be sent via email/WhatsApp once dispatched</li>
        </ol>
      </Section>

      <Section title="6. Delivery Attempts">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>Couriers typically make <strong>2–3 delivery attempts</strong></li>
          <li>If you miss all attempts, the package is held at the local courier facility for 3–5 days</li>
          <li>After that, it is returned to us. A re-delivery charge may apply</li>
          <li>Please ensure your phone number and address are correct at checkout</li>
        </ul>
      </Section>

      <Section title="7. Damaged or Lost Shipments">
        <p>If your order arrives damaged or appears to be lost in transit:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li>Report damaged packages within <strong>24 hours of delivery</strong> with photos</li>
          <li>For lost shipments, contact us after <strong>10 business days</strong> from dispatch date</li>
          <li>We will investigate with the courier and arrange a replacement or refund</li>
          <li>Email: <a href="mailto:support@pakkafamous.com" style={{ color: '#FF4C29' }}>support@pakkafamous.com</a></li>
        </ul>
      </Section>

      <Section title="8. Currently Not Serviceable">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>International shipping (outside India)</li>
          <li>Andaman & Nicobar Islands and Lakshadweep (in progress)</li>
          <li>Some remote PIN codes — you'll be notified at checkout if your location is not serviceable</li>
        </ul>
      </Section>

      <Section title="9. Contact">
        <p>For shipping queries:<br />
        Email: <a href="mailto:support@pakkafamous.com" style={{ color: '#FF4C29' }}>support@pakkafamous.com</a><br />
        WhatsApp: Available on site — we respond within business hours</p>
      </Section>
    </div>
  </div>
);

export default ShippingPolicyPage;
