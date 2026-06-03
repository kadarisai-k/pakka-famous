/**
 * seedSpecials.js
 * Run once after deployment to create default Specials categories.
 * Usage: node seedSpecials.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SpecialCategory = require('./models/SpecialCategory');

const DEFAULT_CATEGORIES = [
  { name: 'Rice & Grains',          slug: 'rice-and-grains',       order: 1,  description: 'Premium rice varieties and whole grains from across AP & Telangana' },
  { name: 'Spices',                  slug: 'spices',                order: 2,  description: 'Authentic spices — Guntur chilli, turmeric, coriander and more' },
  { name: 'Sweets',                  slug: 'sweets',                order: 3,  description: 'Traditional Indian sweets and mithai' },
  { name: 'Pickles',                 slug: 'pickles',               order: 4,  description: 'Tangy, spicy, and delicious traditional pickles' },
  { name: 'Pulses & Dal',            slug: 'pulses-and-dal',        order: 5,  description: 'High-quality lentils and pulses sourced from local farmers' },
  { name: 'Dry Fruits & Nuts',       slug: 'dry-fruits-and-nuts',   order: 6,  description: 'Premium quality dry fruits and roasted nuts' },
  { name: 'Oils',                    slug: 'oils',                  order: 7,  description: 'Cold-pressed and traditional oils — groundnut, sesame, coconut' },
  { name: 'Millets & Healthy Grains',slug: 'millets',               order: 8,  description: 'Nutritious millets for a healthy lifestyle' },
  { name: 'Sweeteners',              slug: 'sweeteners',            order: 9,  description: 'Natural jaggery, palm sugar, and traditional sweeteners' },
  { name: 'Snacks & Savories',       slug: 'snacks',                order: 10, description: 'Crispy, crunchy, and flavorful traditional snacks' },
  { name: 'Flours & Powders',        slug: 'flours-and-powders',    order: 11, description: 'Stone-ground flours and spice powders' },
  { name: 'Ready-to-Cook / Mixes',   slug: 'ready-to-cook',         order: 12, description: 'Convenient cooking mixes for authentic home-style meals' },
  { name: 'Festival Specials',       slug: 'festival-specials',     order: 13, description: 'Seasonal & festive products for every celebration' },
  { name: 'Seasonal Specials',       slug: 'seasonal-specials',     order: 14, description: 'Limited-time products available only during select seasons' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await SpecialCategory.findOne({ slug: cat.slug });
      if (existing) {
        console.log(`  ⏭️  Skipped (already exists): ${cat.name}`);
        skipped++;
      } else {
        await SpecialCategory.create(cat);
        console.log(`  ✅ Created: ${cat.name}`);
        created++;
      }
    }

    console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
