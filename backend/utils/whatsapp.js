/**
 * WhatsApp Notification Utility
 * Uses Twilio WhatsApp API (Sandbox or Business Account)
 *
 * Env vars required:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   (e.g. whatsapp:+14155238886 for sandbox)
 *   ADMIN_WHATSAPP_1       (e.g. +919876543210)
 *   ADMIN_WHATSAPP_2       (e.g. +919876543211)
 */

const logger = require('./logger');

// ── Lazy-load Twilio so server still starts without credentials ───
let twilioClient = null;
function getClient() {
  if (twilioClient) return twilioClient;
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || sid.startsWith('YOUR_') || token.startsWith('YOUR_')) {
    return null;
  }
  try {
    const twilio = require('twilio');
    twilioClient = twilio(sid, token);
    return twilioClient;
  } catch (e) {
    logger.warn('Twilio package not found – WhatsApp notifications disabled');
    return null;
  }
}

// ── Normalise number to E.164 with whatsapp: prefix ──────────────
function waNumber(raw) {
  if (!raw) return null;
  const clean = raw.replace(/\s+/g, '').replace(/^0+/, '');
  const withCountry = clean.startsWith('+') ? clean : `+91${clean}`;
  return `whatsapp:${withCountry}`;
}

// ── Core send function ────────────────────────────────────────────
async function sendWhatsApp(to, body) {
  const client = getClient();
  if (!client) {
    logger.info(`[WhatsApp SKIP – not configured] To: ${to} | ${body.slice(0, 60)}…`);
    return;
  }
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) {
    logger.warn('TWILIO_WHATSAPP_FROM not set – skipping');
    return;
  }
  const toNumber = waNumber(to);
  if (!toNumber) {
    logger.warn(`Invalid WhatsApp number: ${to}`);
    return;
  }
  try {
    const msg = await client.messages.create({ from, to: toNumber, body });
    logger.info(`[WhatsApp SENT] To: ${toNumber} SID: ${msg.sid}`);
  } catch (err) {
    logger.error(`[WhatsApp ERROR] To: ${toNumber} – ${err.message}`);
  }
}

// ── Format item list for message ─────────────────────────────────
function formatItems(items) {
  return items
    .map(i => `• ${i.name} × ${i.quantity} = ₹${i.totalPrice}`)
    .join('\n');
}

// ── 1. USER order confirmation ────────────────────────────────────
async function sendUserOrderConfirmation(userPhone, order) {
  if (!userPhone) return;
  const itemLines = formatItems(order.items);
  const body =
`🎉 *Order Confirmed – Pakka Famous!*

Hi ${order.shippingAddress?.name || 'Customer'}, your order has been placed successfully!

📦 *Items Ordered:*
${itemLines}

💰 *Order Total: ₹${order.totalAmount}*
🚚 Delivery Charge: ₹${order.deliveryCharge === 0 ? 'FREE' : order.deliveryCharge}

📍 Delivering to:
${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} – ${order.shippingAddress?.pincode}

Thank you for ordering from *Pakka Famous* 🍬
Authentic Andhra Sweets delivered fresh to your doorstep!`;

  await sendWhatsApp(userPhone, body);
}

// ── 2. ADMIN new order alert ──────────────────────────────────────
async function sendAdminOrderAlert(order, userName, userPhone) {
  const adminNumbers = [
    process.env.ADMIN_WHATSAPP_1,
    process.env.ADMIN_WHATSAPP_2,
  ].filter(Boolean);

  if (!adminNumbers.length) {
    logger.warn('No admin WhatsApp numbers configured (ADMIN_WHATSAPP_1 / ADMIN_WHATSAPP_2)');
    return;
  }

  const itemLines = formatItems(order.items);
  const body =
`🚨 *New Order Received – Pakka Famous!*

👤 *Customer:* ${userName}
📱 *Mobile:* ${userPhone || order.shippingAddress?.phone || 'N/A'}
🏠 *Address:* ${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} – ${order.shippingAddress?.pincode}

📦 *Items:*
${itemLines}

💰 *Grand Total: ₹${order.totalAmount}*
💳 Payment: ${order.paymentMethod === 'Online' ? '✅ Paid Online' : '💵 Cash on Delivery'}
🕐 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Order ID: #${order._id.toString().slice(-8).toUpperCase()}`;

  await Promise.allSettled(adminNumbers.map(num => sendWhatsApp(num, body)));
}

// ── 3. SWEET SHOP alerts — each shop gets only their items ────────
async function sendShopOrderAlerts(order) {
  // Group order items by shopWhatsapp number
  const shopMap = {};
  for (const item of order.items) {
    const product    = item.product; // must be populated
    const shopNumber = product?.shopWhatsapp;
    const shopName   = product?.shopName || product?.name || 'Shop';
    if (!shopNumber) continue; // skip products with no shop number set

    if (!shopMap[shopNumber]) {
      shopMap[shopNumber] = { shopName, items: [] };
    }
    shopMap[shopNumber].items.push(item);
  }

  const entries = Object.entries(shopMap);
  if (!entries.length) {
    logger.info('[WhatsApp] No shopWhatsapp set on any product — skipping shop alerts');
    return;
  }

  await Promise.allSettled(
    entries.map(([shopNumber, { shopName, items }]) => {
      const itemLines = items
        .map(i => `• ${i.name} × ${i.quantity} = ₹${i.totalPrice}`)
        .join('\n');

      const body =
`🍬 *New Order – ${shopName} (Pakka Famous)*

📦 *Items to Prepare:*
${itemLines}

📍 *Deliver to:*
${order.shippingAddress?.name}
${order.shippingAddress?.street}, ${order.shippingAddress?.city}
${order.shippingAddress?.state} – ${order.shippingAddress?.pincode}
📱 ${order.shippingAddress?.phone}

💳 Payment: ${order.paymentMethod === 'Online' ? '✅ Paid Online' : '💵 Cash on Delivery'}
🕐 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Order ID: #${order._id.toString().slice(-8).toUpperCase()}

Please prepare and dispatch at the earliest! 🙏`;

      return sendWhatsApp(shopNumber, body);
    })
  );
}

module.exports = { sendUserOrderConfirmation, sendAdminOrderAlert, sendShopOrderAlerts };

// ── Raw send — used by dailySummary directly ──────────────────────
// Same as sendWhatsApp but exported with a different name to avoid confusion
const sendWhatsAppRaw = sendWhatsApp;

// Re-export with raw name so dailySummary.js can use it
module.exports.sendWhatsAppRaw = sendWhatsAppRaw;
