/**
 * Run ONCE to create admin accounts with hashed passwords.
 * Usage: node seedAdmin.js
 * Then remove ADMIN_PASSWORD from your .env
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const emails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const password = process.env.ADMIN_PASSWORD;

  if (!password) { console.error('Set ADMIN_PASSWORD in .env first'); process.exit(1); }
  if (!emails.length) { console.error('Set ADMIN_EMAILS in .env first'); process.exit(1); }

  for (const email of emails) {
    const existing = await User.findOne({ email });
    if (existing) {
      // Update role and re-hash password
      existing.role = 'admin';
      existing.password = password; // pre-save hook hashes it
      await existing.save();
      console.log(`✅ Updated admin: ${email}`);
    } else {
      await User.create({
        name: `Admin ${email.split('@')[0]}`,
        email,
        phone: '9000000000',
        password,
        role: 'admin',
      });
      console.log(`✅ Created admin: ${email}`);
    }
  }

  console.log('\n⚠️  DONE — now remove ADMIN_PASSWORD from your .env file!');
  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
