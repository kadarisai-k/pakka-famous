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

const Card = ({ icon, title, desc, color }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '24px 28px',
    border: `2px solid ${color}20`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontWeight: 700, color: '#1A1A1A', marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>{title}</div>
    <div style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.7 }}>{desc}</div>
  </div>
);

const CancellationPolicyPage = () => (
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
          Cancellation & Refund Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
          Last updated: June 1, 2025
        </p>
      </div>
    </div>

    <div className="container" style={{ maxWidth: 820, padding: '56px 24px' }}>

      {/* Quick Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 52 }}>
        <Card icon="⏰" title="Cancel within 2 hours" desc="Free cancellation within 2 hours of placing your order, before dispatch." color="#4CAF50" />
        <Card icon="🔄" title="Refund in 5–7 days" desc="Approved refunds processed to your original payment method within 5–7 business days." color="#FFD84D" />
        <Card icon="📦" title="Damaged? We'll replace" desc="Report damaged or wrong items within 24 hours of delivery for a free replacement or refund." color="#FF4C29" />
      </div>

      <Section title="1. Order Cancellation">
        <p><strong>Before Dispatch:</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
          <li>You may cancel your order within <strong>2 hours</strong> of placement, provided it has not been dispatched</li>
          <li>To cancel, go to <strong>My Orders → View Order → Cancel Order</strong> or contact us on WhatsApp</li>
          <li>A full refund will be initiated immediately upon cancellation</li>
        </ul>

        <p style={{ marginTop: 16 }}><strong>After Dispatch:</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
          <li>Once an order is dispatched, it cannot be cancelled</li>
          <li>You may refuse delivery — the item will be returned to us and a refund issued after inspection (excluding shipping charges)</li>
        </ul>

        <p style={{ marginTop: 16 }}><strong>Occasion & Custom Orders:</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
          <li>Custom/occasion orders cannot be cancelled once preparation has begun (typically 1 hour after confirmation)</li>
          <li>Contact us immediately at <a href="mailto:support@pakkafamous.com" style={{ color: '#FF4C29' }}>support@pakkafamous.com</a> if you need to cancel a custom order</li>
        </ul>
      </Section>

      <Section title="2. Returns">
        <div style={{ background: '#FFF0EC', border: '1px solid #FF4C29', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
          <strong style={{ color: '#c0341a' }}>Important:</strong> As our products are perishable food items, we generally do not accept returns once delivery is confirmed.
        </div>
        <p>Returns are accepted only in the following cases:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li>The product is <strong>damaged</strong> or broken upon delivery</li>
          <li>You received a <strong>wrong product</strong> (different from what you ordered)</li>
          <li>The product is <strong>expired</strong> or clearly unfit for consumption</li>
          <li>The package was <strong>tampered</strong> with or unsealed on arrival</li>
        </ul>
        <p style={{ marginTop: 14 }}>To initiate a return, report the issue within <strong>24 hours of delivery</strong> by emailing <a href="mailto:support@pakkafamous.com" style={{ color: '#FF4C29' }}>support@pakkafamous.com</a> with your order number and photos of the product.</p>
      </Section>

      <Section title="3. Refunds">
        <p><strong>Eligible for Full Refund:</strong></p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
          <li>Order cancelled within 2 hours before dispatch</li>
          <li>Damaged, wrong, or expired product received</li>
          <li>Order not delivered within 10 business days of dispatch (with no tracking update)</li>
          <li>Order cancelled by Pakka Famous due to stock unavailability or any other reason on our end</li>
        </ul>

        <p style={{ marginTop: 16 }}><strong>Refund Timeline:</strong></p>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginTop: 10 }}>
          {[
            ['UPI / Wallets', '1–3 business days'],
            ['Debit / Credit Card', '5–7 business days'],
            ['Net Banking', '3–5 business days'],
            ['EMI', '5–7 business days (check with your bank)'],
          ].map(([method, time]) => (
            <div key={method} style={{ display: 'flex', padding: '12px 18px', borderBottom: '1px solid #E5E7EB', fontSize: 14 }}>
              <span style={{ flex: 1, fontWeight: 600, color: '#1A1A1A' }}>{method}</span>
              <span style={{ color: '#4B5563' }}>{time}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 13, color: '#6B7280' }}>Refunds are processed to the original payment method only. We cannot transfer refunds to a different account.</p>
      </Section>

      <Section title="4. Non-Refundable Situations">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>Order cancelled after 2 hours or after dispatch</li>
          <li>Product disliked due to personal taste preference (we offer authentic traditional recipes)</li>
          <li>Delivery address entered incorrectly by the customer</li>
          <li>Delay due to circumstances beyond our control (natural calamity, courier strikes, etc.)</li>
          <li>Damage reported after 24 hours of delivery</li>
          <li>Products consumed partially</li>
        </ul>
      </Section>

      <Section title="5. Coupon & Discount Refunds">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>If a discounted order is refunded, only the amount actually paid will be refunded</li>
          <li>Coupons used in refunded orders are generally not reinstated unless the cancellation was on our end</li>
          <li>Contact support if you believe your coupon should be reinstated</li>
        </ul>
      </Section>

      <Section title="6. How to Request a Refund">
        <ol style={{ paddingLeft: 20, lineHeight: 2.2 }}>
          <li>Email us at <a href="mailto:support@pakkafamous.com" style={{ color: '#FF4C29' }}>support@pakkafamous.com</a> with subject: <em>"Refund Request – Order #[your order number]"</em></li>
          <li>Include photos if the item is damaged or incorrect</li>
          <li>Our team will respond within 24 hours</li>
          <li>Once approved, refund will be processed within the timelines above</li>
        </ol>
        <p style={{ marginTop: 14 }}>You can also reach us via <strong>WhatsApp</strong> — the number is available on our website footer.</p>
      </Section>

      <Section title="7. Contact">
        <p>Pakka Famous Customer Support<br />
        Email: <a href="mailto:support@pakkafamous.com" style={{ color: '#FF4C29' }}>support@pakkafamous.com</a><br />
        Response time: Within 24 hours on business days</p>
      </Section>
    </div>
  </div>
);

export default CancellationPolicyPage;
