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

const TermsPage = () => (
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
          Terms of Service
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
        <strong>Please read these terms carefully.</strong> By using Pakka Famous, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
      </div>

      <Section title="1. Acceptance of Terms">
        <p>By accessing or using the Pakka Famous website (<strong>www.pakkafamous.com</strong>) or placing an order, you agree to these Terms of Service and our Privacy Policy. These terms apply to all visitors, users, and customers.</p>
        <p style={{ marginTop: 10 }}>These terms constitute a binding legal agreement between you and Pakka Famous.</p>
      </Section>

      <Section title="2. Eligibility">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>You must be at least 18 years old to create an account and place orders</li>
          <li>You must provide accurate and complete registration information</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You are responsible for all activities that occur under your account</li>
        </ul>
      </Section>

      <Section title="3. Products & Ordering">
        <p><strong>Product Descriptions:</strong> We strive to display accurate product information, including ingredients, weight, and images. Minor variations in appearance may occur due to handcrafted nature of our sweets.</p>
        <p style={{ marginTop: 10 }}><strong>Pricing:</strong> All prices are in Indian Rupees (INR) and inclusive of applicable taxes. Prices may change without prior notice, but your confirmed order price will not change.</p>
        <p style={{ marginTop: 10 }}><strong>Order Confirmation:</strong> An order is confirmed only after successful payment. We reserve the right to cancel any order due to stock unavailability, pricing errors, or fraud suspicion, with a full refund.</p>
        <p style={{ marginTop: 10 }}><strong>Customization:</strong> Custom or occasion orders are subject to additional terms communicated at time of order.</p>
      </Section>

      <Section title="4. Payment">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>Payments are processed securely via <strong>Razorpay</strong></li>
          <li>We accept UPI, credit/debit cards, net banking, and wallets</li>
          <li>All transactions are encrypted and PCI-DSS compliant</li>
          <li>We do not store your payment card details</li>
          <li>In case of payment failure, please check with your bank before retrying</li>
        </ul>
      </Section>

      <Section title="5. Delivery">
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>We currently deliver within India only</li>
          <li>Estimated delivery timelines are shown at checkout and are approximate</li>
          <li>Delivery delays due to weather, courier issues, or force majeure are beyond our control</li>
          <li>Risk of loss passes to you upon delivery to the courier</li>
          <li>You are responsible for ensuring someone is available to receive the order</li>
          <li>For perishable items, please inspect upon delivery and report any issues within 24 hours</li>
        </ul>
      </Section>

      <Section title="6. Cancellations & Refunds">
        <p>Please see our <a href="/cancellation-policy" style={{ color: '#FF4C29' }}>Cancellation & Refund Policy</a> for complete details.</p>
        <p style={{ marginTop: 10 }}>In summary:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 8 }}>
          <li>Orders can be cancelled within 2 hours of placement if not yet dispatched</li>
          <li>Perishable food products cannot be returned once delivered unless damaged/incorrect</li>
          <li>Approved refunds are processed within 5-7 business days to original payment method</li>
        </ul>
      </Section>

      <Section title="7. Prohibited Uses">
        <p>You agree not to:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li>Use the platform for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
          <li>Submit false, misleading, or fraudulent orders or reviews</li>
          <li>Use automated bots, scrapers, or scripts without written permission</li>
          <li>Resell products purchased on our platform without authorization</li>
          <li>Harass, abuse, or threaten our staff or other users</li>
        </ul>
        <p style={{ marginTop: 12 }}>Violation of these terms may result in immediate account termination and legal action.</p>
      </Section>

      <Section title="8. Intellectual Property">
        <p>All content on Pakka Famous — including logos, product photographs, text, graphics, and the "Pakka Famous" brand name — is the exclusive property of Pakka Famous or its licensors.</p>
        <p style={{ marginTop: 10 }}>You may not copy, reproduce, distribute, or create derivative works without our express written permission.</p>
      </Section>

      <Section title="9. User-Generated Content">
        <p>By submitting reviews, testimonials, or any content on our platform, you grant Pakka Famous a non-exclusive, royalty-free license to use, display, and promote that content on our website and marketing materials.</p>
        <p style={{ marginTop: 10 }}>You warrant that your content is truthful and does not infringe any third-party rights.</p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>To the maximum extent permitted by applicable law, Pakka Famous shall not be liable for:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 10 }}>
          <li>Indirect, incidental, or consequential damages arising from use of our platform</li>
          <li>Loss of data, revenue, or profits</li>
          <li>Delays or failures caused by third-party services (couriers, payment gateways)</li>
          <li>Personal health conditions related to food consumption — please review ingredients carefully</li>
        </ul>
        <p style={{ marginTop: 12 }}>Our maximum liability shall not exceed the amount paid by you for the specific order giving rise to the claim.</p>
      </Section>

      <Section title="11. Governing Law & Disputes">
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Andhra Pradesh, India.</p>
        <p style={{ marginTop: 10 }}>We encourage you to contact us first at <a href="mailto:support@pakkafamous.com" style={{ color: '#FF4C29' }}>support@pakkafamous.com</a> to resolve any dispute amicably before pursuing legal remedies.</p>
      </Section>

      <Section title="12. Changes to Terms">
        <p>We reserve the right to modify these terms at any time. Significant changes will be communicated via email or a notice on our website. Continued use of our platform after changes constitutes acceptance of the revised terms.</p>
      </Section>

      <Section title="13. Contact">
        <p>Pakka Famous<br />
        Email: <a href="mailto:support@pakkafamous.com" style={{ color: '#FF4C29' }}>support@pakkafamous.com</a><br />
        For legal notices: <a href="mailto:legal@pakkafamous.com" style={{ color: '#FF4C29' }}>legal@pakkafamous.com</a></p>
      </Section>
    </div>
  </div>
);

export default TermsPage;
