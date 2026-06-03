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

const PrivacyPolicyPage = () => (
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
          Privacy Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
          Last updated: June 1, 2025
        </p>
      </div>
    </div>

    <div className="container" style={{ maxWidth: 820, padding: '56px 24px' }}>
      <div style={{
        background: '#fff8e1', border: '1px solid #FFD84D', borderRadius: 12,
        padding: '16px 20px', marginBottom: 40, fontSize: 14, color: '#7c6500'
      }}>
        <strong>Summary:</strong> We collect only the data we need to serve you. We never sell your personal information. You have full rights over your data.
      </div>

      <Section title="1. Who We Are">
        <p>Pakka Famous ("we", "us", "our") is an e-commerce platform specializing in authentic GI-tagged sweets from Andhra Pradesh, India. We are the data controller responsible for your personal information collected through <strong>www.pakkafamous.com</strong> and our mobile applications.</p>
        <p style={{ marginTop: 12 }}>For privacy-related queries, contact us at: <a href="mailto:privacy@pakkafamous.com" style={{ color: '#FF4C29' }}>privacy@pakkafamous.com</a></p>
      </Section>

      <Section title="2. Information We Collect">
        <p><strong>Account Information:</strong> Name, email address, phone number, and password (encrypted) when you register.</p>
        <p style={{ marginTop: 10 }}><strong>Order & Transaction Data:</strong> Delivery addresses, order history, payment method details (we do not store full card numbers — payments are processed by Razorpay).</p>
        <p style={{ marginTop: 10 }}><strong>Usage Data:</strong> Pages visited, products viewed, search queries, device type, browser, IP address, and timestamps — collected automatically to improve your experience.</p>
        <p style={{ marginTop: 10 }}><strong>Communications:</strong> Messages you send us via email or WhatsApp for customer support.</p>
        <p style={{ marginTop: 10 }}><strong>Cookies & Tracking:</strong> See our Cookie Policy section below for full details.</p>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>To process and deliver your orders</li>
          <li>To send order confirmations, shipping updates, and delivery notifications</li>
          <li>To manage your account and preferences</li>
          <li>To respond to your customer support requests</li>
          <li>To send promotional offers and newsletters (only with your consent)</li>
          <li>To prevent fraud and ensure platform security</li>
          <li>To improve our website and product offerings through analytics</li>
          <li>To comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="4. Sharing Your Information">
        <p>We do <strong>not sell</strong> your personal data. We share information only with:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li><strong>Delivery Partners:</strong> Name, phone number, and address shared with shipping couriers to fulfil your order</li>
          <li><strong>Payment Processor (Razorpay):</strong> Payment details are processed securely by Razorpay under their privacy policy</li>
          <li><strong>Cloud Services:</strong> Cloudinary for secure image hosting; MongoDB Atlas for database storage</li>
          <li><strong>Analytics:</strong> Aggregated, anonymized data only</li>
          <li><strong>Legal Obligations:</strong> When required by Indian law or court order</li>
        </ul>
      </Section>

      <Section title="5. Data Retention">
        <p>We retain your personal data for as long as your account is active. After account deletion:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li>Account data is deleted within <strong>30 days</strong></li>
          <li>Order records are retained for <strong>7 years</strong> as required by Indian tax law (GST compliance)</li>
          <li>Anonymized analytics data may be retained indefinitely</li>
        </ul>
      </Section>

      <Section title="6. Your Rights">
        <p>You have the right to:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li><strong>Access</strong> — Request a copy of the personal data we hold about you</li>
          <li><strong>Correct</strong> — Update inaccurate or incomplete information via your Profile page</li>
          <li><strong>Delete</strong> — Request deletion of your account and personal data</li>
          <li><strong>Withdraw Consent</strong> — Unsubscribe from marketing emails at any time</li>
          <li><strong>Data Portability</strong> — Request your data in a machine-readable format</li>
        </ul>
        <p style={{ marginTop: 12 }}>To exercise any right, email <a href="mailto:privacy@pakkafamous.com" style={{ color: '#FF4C29' }}>privacy@pakkafamous.com</a>. We will respond within 30 days.</p>
      </Section>

      <Section title="7. Cookies & Tracking">
        <p>We use the following types of cookies:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li><strong>Essential Cookies:</strong> Required for login sessions, cart persistence, and security. Cannot be disabled.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (e.g., pages visited, time on site). These are anonymized.</li>
          <li><strong>Preference Cookies:</strong> Remember your settings like announcements dismissed.</li>
        </ul>
        <p style={{ marginTop: 12 }}>You can manage cookies through your browser settings. Disabling non-essential cookies will not affect your ability to shop.</p>
      </Section>

      <Section title="8. Security">
        <p>We use industry-standard security measures including:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li>HTTPS/TLS encryption for all data in transit</li>
          <li>Bcrypt password hashing</li>
          <li>JWT-based authentication with token expiry</li>
          <li>CSRF protection on all state-changing requests</li>
          <li>Role-based access control for admin functions</li>
        </ul>
        <p style={{ marginTop: 12 }}>No method of transmission over the internet is 100% secure. In the unlikely event of a data breach, we will notify affected users within 72 hours as required by the Digital Personal Data Protection Act, 2023.</p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>Our services are not directed to persons under 18 years of age. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately.</p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or via a prominent notice on our website. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
      </Section>

      <Section title="11. Contact Us">
        <p>Pakka Famous<br />
        Email: <a href="mailto:privacy@pakkafamous.com" style={{ color: '#FF4C29' }}>privacy@pakkafamous.com</a><br />
        WhatsApp: Available on site<br />
        Governing Law: Laws of India | Jurisdiction: Andhra Pradesh Courts</p>
      </Section>
    </div>
  </div>
);

export default PrivacyPolicyPage;
