/**
 * dailySummary.js
 * At cutoff time:
 *  1. Mark all PENDING orders as CONFIRMED
 *  2. Send WhatsApp summary to each shop (only CONFIRMED orders)
 */

const Order  = require('../models/Order');
const { sendWhatsAppRaw } = require('./whatsapp');
const logger = require('./logger');

async function sendDailyShopSummaries() {
  logger.info('[DailySummary] Starting daily cutoff job...');

  try {
    const IST_MS = 5.5 * 60 * 60 * 1000;
    const now    = new Date();
    const istNow = new Date(now.getTime() + IST_MS);

    // Today's window in UTC
    const startIST = new Date(istNow); startIST.setHours(0, 0, 0, 0);
    const endIST   = new Date(istNow); endIST.setHours(23, 59, 59, 999);
    const startUTC = new Date(startIST.getTime() - IST_MS);
    const endUTC   = new Date(endIST.getTime()   - IST_MS);

    // ── Step 1: Confirm all still-PENDING orders ─────────────────
    const confirmResult = await Order.updateMany(
      {
        createdAt:    { $gte: startUTC, $lte: endUTC },
        cutoffStatus: 'PENDING',
        orderStatus:  { $nin: ['Cancelled'] },
      },
      {
        $set: { cutoffStatus: 'CONFIRMED' },
        $push: {
          statusHistory: {
            status:    'Ordered',
            note:      'Order confirmed — daily cutoff reached',
            updatedAt: new Date(),
          },
        },
      }
    );
    logger.info(`[DailySummary] Confirmed ${confirmResult.modifiedCount} PENDING order(s)`);

    // ── Step 2: Fetch all CONFIRMED orders today ─────────────────
    const orders = await Order.find({
      createdAt:    { $gte: startUTC, $lte: endUTC },
      cutoffStatus: 'CONFIRMED',
    }).populate('items.product', 'name weight shopWhatsapp shopName');

    if (!orders.length) {
      logger.info('[DailySummary] No confirmed orders today — skipping WhatsApp');
      return;
    }

    // ── Step 3: Group by shop ────────────────────────────────────
    const shopMap = {};
    for (const order of orders) {
      const customerName = order.shippingAddress?.name || 'Customer';
      for (const item of order.items) {
        const product     = item.product;
        const shopPhone   = product?.shopWhatsapp;
        const shopName    = product?.shopName || 'Shop';
        const productName = item.name;
        const qty         = item.quantity;
        const unit        = product?.weight || 'unit';

        if (!shopPhone) continue;

        if (!shopMap[shopPhone]) shopMap[shopPhone] = { shopName, products: {} };
        if (!shopMap[shopPhone].products[productName])
          shopMap[shopPhone].products[productName] = { totalQty: 0, unit, orders: [] };

        shopMap[shopPhone].products[productName].totalQty += qty;
        shopMap[shopPhone].products[productName].orders.push({ customer: customerName, qty });
      }
    }

    const entries = Object.entries(shopMap);
    if (!entries.length) {
      logger.info('[DailySummary] No shop numbers on any product — skipping WhatsApp');
      return;
    }

    // ── Step 4: Send WhatsApp summary to each shop ───────────────
    const dateStr = istNow.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
    });

    await Promise.allSettled(
      entries.map(async ([shopPhone, { shopName, products }]) => {
        const productLines = Object.entries(products).map(([pName, data]) => {
          const lines = data.orders.map(o => `   • ${o.customer} → ${o.qty} ${data.unit}`).join('\n');
          return `📦 *${pName}*\n${lines}\n   🔢 Total: *${data.totalQty} ${data.unit}*`;
        }).join('\n\n');

        const totalOrders = Object.values(products).reduce((s, p) => s + p.orders.length, 0);
        const totalQty    = Object.values(products).reduce((s, p) => s + p.totalQty, 0);

        const body =
`📊 *Pakka Famous – Daily Summary*
🏪 ${shopName}
📅 ${dateStr}
${'─'.repeat(30)}

${productLines}

${'─'.repeat(30)}
📋 *Total Orders: ${totalOrders}*
📦 *Total Quantity: ${totalQty} units*

_(Only confirmed orders included. Cancelled orders excluded.)_

Thank you for partnering with Pakka Famous! 🍬`;

        await sendWhatsAppRaw(shopPhone, body);
        logger.info(`[DailySummary] Summary sent → ${shopPhone} (${shopName})`);
      })
    );

    logger.info(`[DailySummary] Done — ${entries.length} shop(s) notified`);
  } catch (err) {
    logger.error(`[DailySummary] Fatal error: ${err.message}`);
  }
}

module.exports = { sendDailyShopSummaries };
