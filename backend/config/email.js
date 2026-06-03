const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// ─── Welcome Email ──────────────────────────────────────────────────────────────
const sendWelcomeEmail = async (userEmail, userName) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: '🍬 Welcome to Pakka Famous - Authentic Andhra Sweets!',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#d4380d,#fa8c16);padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;">🍬 Pakka Famous</h1>
          <p style="color:rgba(255,255,255,0.9);margin:5px 0 0;">Authentic Andhra Pradesh Sweets</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#d4380d;">Namaste, ${userName}! 🙏</h2>
          <p style="color:#555;font-size:16px;line-height:1.6;">Welcome to <strong>Pakka Famous</strong>! Explore the finest sweets from across Andhra Pradesh.</p>
          <a href="${process.env.FRONTEND_URL}/products" style="display:inline-block;background:linear-gradient(135deg,#d4380d,#fa8c16);color:white;padding:12px 30px;border-radius:25px;text-decoration:none;font-weight:bold;margin:10px 0;">🛍️ Start Shopping</a>
        </div>
      </div>`
  });
};

// ─── Order Confirmation to User ─────────────────────────────────────────────────
const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₹${item.price}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₹${item.totalPrice}</td>
    </tr>`).join('');

  const orderId = order._id.toString().slice(-8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  const addr = order.shippingAddress;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `✅ Order Confirmed - #${orderId} | Pakka Famous`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#d4380d,#fa8c16);padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;">🍬 Pakka Famous</h1>
          <p style="color:rgba(255,255,255,0.9);margin:5px 0 0;">Order Confirmation</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#52c41a;">✅ Your Order is Confirmed!</h2>
          <p>Namaste <strong>${userName}</strong>! Thank you for your order.</p>

          <div style="background:white;border-radius:8px;padding:16px;margin:16px 0;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <p style="margin:4px 0;"><strong>Order ID:</strong> #${orderId}</p>
            <p style="margin:4px 0;"><strong>Order Date:</strong> ${orderDate}</p>
            <p style="margin:4px 0;"><strong>Status:</strong> <span style="color:#fa8c16;font-weight:bold;">Ordered</span></p>
          </div>

          <h3 style="color:#d4380d;">📍 Delivery Address</h3>
          <div style="background:white;border-radius:8px;padding:14px;margin-bottom:16px;">
            <p style="margin:0;color:#555;">${addr.name}<br/>${addr.street}, ${addr.city}<br/>${addr.state} - ${addr.pincode}<br/>📞 ${addr.phone}</p>
          </div>

          <h3 style="color:#d4380d;">🍬 Order Items</h3>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;">
            <thead><tr style="background:#fff3e0;">
              <th style="padding:10px;text-align:left;color:#d4380d;">Item</th>
              <th style="padding:10px;text-align:center;color:#d4380d;">Qty</th>
              <th style="padding:10px;text-align:right;color:#d4380d;">Price</th>
              <th style="padding:10px;text-align:right;color:#d4380d;">Total</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="background:white;border-radius:8px;padding:14px;margin-top:12px;">
            <div style="display:flex;justify-content:space-between;color:#555;margin:4px 0;"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
            <div style="display:flex;justify-content:space-between;color:#555;margin:4px 0;"><span>Delivery</span><span>${order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge}</span></div>
            ${order.couponDiscount > 0 ? `<div style="display:flex;justify-content:space-between;color:#52c41a;margin:4px 0;"><span>Coupon (${order.couponCode})</span><span>-₹${order.couponDiscount}</span></div>` : ''}
            <hr style="margin:8px 0;border:none;border-top:1px solid #eee;"/>
            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:18px;color:#d4380d;"><span>Grand Total</span><span>₹${order.totalAmount}</span></div>
          </div>

          <p style="color:#888;font-size:13px;margin-top:16px;">Expected delivery: <strong>3–5 business days</strong></p>
        </div>
      </div>`
  });
};

// ─── Order Notification to All Admins ──────────────────────────────────────────
const sendAdminOrderNotification = async (order, userName) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  if (!adminEmails.length) return;

  const orderId = order._id.toString().slice(-8).toUpperCase();
  const addr = order.shippingAddress;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">${item.quantity}</td>
      <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">₹${item.totalPrice}</td>
    </tr>`).join('');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: adminEmails,
    subject: `🔔 New Order #${orderId} - ₹${order.totalAmount} | Pakka Famous`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;border-radius:12px;overflow:hidden;">
        <div style="background:#1a1a2e;padding:25px;text-align:center;">
          <h1 style="color:#fa8c16;margin:0;">🔔 New Order Alert</h1>
          <p style="color:rgba(255,255,255,0.7);margin:5px 0 0;">Pakka Famous Admin</p>
        </div>
        <div style="padding:24px;background:white;margin:10px;border-radius:8px;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Customer:</strong> ${userName}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN')}</p>
          <p><strong>Grand Total:</strong> <span style="color:#52c41a;font-size:18px;font-weight:bold;">₹${order.totalAmount}</span></p>

          <h3>📍 Delivery Address</h3>
          <p>${addr.name} | ${addr.phone}<br/>${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}</p>

          <h3>🍬 Items Ordered</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#f0f0f0;">
              <th style="padding:8px;text-align:left;">Item</th>
              <th style="padding:8px;text-align:center;">Qty</th>
              <th style="padding:8px;text-align:right;">Total</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          ${order.couponDiscount > 0 ? `<p style="color:#52c41a;margin-top:8px;">Coupon <strong>${order.couponCode}</strong> applied — ₹${order.couponDiscount} off</p>` : ''}

          <div style="margin-top:20px;text-align:center;">
            <a href="${process.env.FRONTEND_URL}/admin/orders" style="background:#fa8c16;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">View in Admin Panel →</a>
          </div>
        </div>
      </div>`
  });
};

module.exports = { sendWelcomeEmail, sendOrderConfirmationEmail, sendAdminOrderNotification };

// ─── Password Reset Email ────────────────────────────────────────────────────────
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      userEmail,
    subject: '🔐 Reset Your Pakka Famous Password',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#d4380d,#fa8c16);padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;">🍬 Pakka Famous</h1>
          <p style="color:rgba(255,255,255,0.9);margin:5px 0 0;">Password Reset Request</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#d4380d;">Namaste, ${userName}! 🙏</h2>
          <p style="color:#555;font-size:16px;line-height:1.6;">
            We received a request to reset your password.
            Click the button below — this link expires in <strong>15 minutes</strong>.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#d4380d,#fa8c16);color:white;padding:14px 36px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:16px;">
              🔐 Reset My Password
            </a>
          </div>
          <p style="color:#888;font-size:13px;">
            If you did not request this, ignore this email — your password will not change.<br/>
            This link will expire in 15 minutes and can only be used once.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
          <p style="color:#aaa;font-size:12px;">
            If the button doesn't work, copy this link:<br/>
            <span style="color:#d4380d;word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
      </div>`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
  sendPasswordResetEmail,
};
