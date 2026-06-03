import React, { useState } from 'react';

const faqs = [
  {
    category: 'Orders',
    items: [
      { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, and proceed to checkout. You\'ll need to be logged in to complete your order. We accept UPI, cards, net banking, and wallets via Razorpay.' },
      { q: 'Can I modify my order after placing it?', a: 'Orders can be modified within 1 hour of placement, before they are dispatched. Please contact us immediately via WhatsApp or email with your order number.' },
      { q: 'How do I track my order?', a: 'Go to My Orders in your account dashboard. Once your order is dispatched, you\'ll receive a tracking link via email and WhatsApp. You can also view live status in the Order Detail page.' },
      { q: 'Why was my order cancelled?', a: 'Orders may be cancelled if a product goes out of stock, payment verification fails, or if we suspect fraudulent activity. A full refund is automatically issued in such cases within 5–7 business days.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and popular wallets. All payments are securely processed by Razorpay.' },
      { q: 'Is it safe to pay on Pakka Famous?', a: 'Absolutely. All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We never store your card details on our servers.' },
      { q: 'My payment failed but money was deducted. What do I do?', a: 'This can happen due to a bank or network issue. In most cases, the money is automatically refunded by your bank within 3–5 business days. If not, contact us at support@pakkafamous.com with your transaction details.' },
      { q: 'Can I pay on delivery (COD)?', a: 'We currently do not offer Cash on Delivery. All orders must be prepaid. We\'re working on adding COD for select pin codes in the future.' },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Delivery typically takes 1–3 days within Andhra Pradesh, 2–4 days for South India, 3–5 days for metro cities, and 5–7 days for the rest of India. These are business days and exclude Sundays and public holidays.' },
      { q: 'Do you offer free shipping?', a: 'Yes! Orders above ₹1,000 qualify for free shipping. For orders below ₹499, a flat shipping fee of ₹60 applies. Orders between ₹499–₹999 are charged ₹40.' },
      { q: 'Do you ship outside India?', a: 'Currently, we only ship within India. International shipping is on our roadmap — stay tuned!' },
      { q: 'What if my package is delayed?', a: 'While we strive for on-time delivery, delays can occasionally occur due to courier issues or weather. If your order hasn\'t arrived within 10 business days, please contact us and we\'ll investigate immediately.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'Can I return a product?', a: 'Since our products are perishable food items, we generally do not accept returns. However, if you receive a damaged, wrong, or expired product, we\'ll replace it or issue a full refund. Report within 24 hours of delivery with photos.' },
      { q: 'How long does a refund take?', a: 'Refunds are processed within 1–7 business days depending on your payment method — UPI refunds are fastest (1–3 days), while card refunds take 5–7 days.' },
      { q: 'Can I cancel my order?', a: 'Yes, you can cancel within 2 hours of placing the order, provided it hasn\'t been dispatched. Go to My Orders → View Order → Cancel Order. A full refund will be initiated immediately.' },
    ],
  },
  {
    category: 'Products',
    items: [
      { q: 'Are your products genuine GI-tagged sweets?', a: 'Yes! We source authentic GI-tagged sweets directly from certified artisans and sweet-makers in Andhra Pradesh. Each product page shows the origin and GI tag information.' },
      { q: 'What is the shelf life of your products?', a: 'Shelf life varies by product. Ghee-based sweets like Tirupati Laddu last 15–30 days. Dry sweets like Ariselu can last up to 45 days. The best-before date is clearly marked on the package.' },
      { q: 'Do your products contain allergens?', a: 'Many of our sweets contain nuts, dairy (ghee/milk), and gluten (maida/wheat). Allergen information is listed on each product page. Please read carefully before ordering if you have food allergies.' },
      { q: 'Are custom/bulk orders available?', a: 'Yes! We offer bulk and custom orders for weddings, festivals, and corporate gifting. Use the Occasions section or contact us directly for custom packaging and pricing.' },
    ],
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I create an account?', a: 'Click "Register" in the top navigation or at checkout. You\'ll need a valid email address and phone number. Registration is free and takes less than a minute.' },
      { q: 'I forgot my password. How do I reset it?', a: 'Click "Forgot Password" on the login page and enter your registered email. You\'ll receive a password reset link within a few minutes. Check your spam folder if it doesn\'t arrive.' },
      { q: 'How do I delete my account?', a: 'To delete your account and all associated data, email us at privacy@pakkafamous.com with the subject "Account Deletion Request". We\'ll process it within 30 days as per our Privacy Policy.' },
    ],
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid #E5E7EB',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '18px 0', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <span style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 15, lineHeight: 1.5 }}>{q}</span>
        <span style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
          background: open ? '#FF4C29' : '#F3F4F6',
          color: open ? '#fff' : '#6B7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 400, transition: 'all .2s',
          lineHeight: 1,
        }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 18, color: '#4B5563', fontSize: 14, lineHeight: 1.8 }}>
          {a}
        </div>
      )}
    </div>
  );
};

const FAQsPage = () => {
  const [activeCategory, setActiveCategory] = useState('Orders');

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
          }}>Support</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: 40, fontWeight: 900, marginBottom: 12 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontFamily: 'Poppins, sans-serif' }}>
            Find quick answers to common questions
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 860, padding: '52px 24px' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
          {faqs.map(({ category }) => (
            <button key={category} onClick={() => setActiveCategory(category)} style={{
              padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600,
              transition: 'all .2s',
              background: activeCategory === category ? '#FF4C29' : '#fff',
              color: activeCategory === category ? '#fff' : '#4B5563',
              boxShadow: activeCategory === category ? '0 4px 14px rgba(255,76,41,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
            }}>
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        {faqs.filter(f => f.category === activeCategory).map(({ category, items }) => (
          <div key={category} style={{ background: '#fff', borderRadius: 16, padding: '8px 28px 8px', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 32 }}>
            {items.map(item => <FAQItem key={item.q} {...item} />)}
          </div>
        ))}

        {/* Still need help */}
        <div style={{ textAlign: 'center', marginTop: 48, padding: '36px', background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🍬</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1A1A1A' }}>
            Didn't find your answer?
          </h3>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>Our support team is just a message away</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:support@pakkafamous.com" style={{
              background: '#FF4C29', color: '#fff', padding: '10px 24px',
              borderRadius: 999, fontWeight: 600, fontSize: 14,
              textDecoration: 'none', fontFamily: 'Poppins, sans-serif',
            }}>Email Support</a>
            <a href="/feedback" style={{
              background: '#fff', color: '#FF4C29', padding: '10px 24px',
              borderRadius: 999, fontWeight: 600, fontSize: 14, border: '2px solid #FF4C29',
              textDecoration: 'none', fontFamily: 'Poppins, sans-serif',
            }}>Leave Feedback</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;
