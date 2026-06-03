# 🚀 Pakka Famous — Production Deployment Guide

## Prerequisites
- Ubuntu 22.04 VPS (DigitalOcean / AWS / Hetzner)
- Domain name pointed to server IP
- Node.js 18+, npm, Git installed

---

## Step 1: Generate Secure JWT Secrets

Run this on your server (never reuse these anywhere else):

```bash
node -e "console.log('JWT_SECRET='+require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET='+require('crypto').randomBytes(64).toString('hex'))"
```

Paste both values into your production `.env`.

---

## Step 2: Set Up Environment Variables

```bash
cd /var/www/pakka/backend
cp .env.example .env
nano .env   # fill in all values
```

**Required `.env` values for production:**
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
MONGO_URI=your_atlas_connection_string
JWT_SECRET=<64 hex chars from step 1>
JWT_REFRESH_SECRET=<different 64 hex chars from step 1>
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
ADMIN_EMAILS=admin@yourdomain.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Step 3: Install Dependencies

```bash
cd /var/www/pakka/backend
npm install

cd /var/www/pakka/frontend
npm install
```

---

## Step 4: Seed Admin Users

```bash
cd /var/www/pakka/backend
# Add ADMIN_PASSWORD=yourpassword temporarily to .env
node seedAdmin.js
# Remove ADMIN_PASSWORD from .env after seeding!
```

---

## Step 5: Build Frontend

```bash
cd /var/www/pakka/frontend
REACT_APP_API_URL=https://yourdomain.com/api npm run build
```

---

## Step 6: Install & Configure Nginx

```bash
sudo apt install nginx
sudo cp /var/www/pakka/nginx/nginx.conf /etc/nginx/sites-available/pakka
sudo ln -s /etc/nginx/sites-available/pakka /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: Install SSL with Certbot (Free HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Certbot auto-renews — test with:
sudo certbot renew --dry-run
```

---

## Step 8: Start App with PM2

```bash
npm install -g pm2
cd /var/www/pakka
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

**PM2 Commands:**
```bash
pm2 status              # check app status
pm2 logs pakka-famous   # view live logs
pm2 reload pakka-famous # zero-downtime reload
pm2 stop pakka-famous   # stop
```

---

## Step 9: MongoDB Atlas — Production Settings

1. In Atlas → Network Access → Add your server's IP (not 0.0.0.0/0)
2. In Atlas → Database Access → use a dedicated user with read/write only (not admin)
3. Enable Atlas backup

---

## Security Checklist Before Going Live

- [ ] `NODE_ENV=production` in `.env`
- [ ] Strong JWT secrets (64+ chars, different for access vs refresh)
- [ ] `ADMIN_PASSWORD` removed from `.env` after seeding
- [ ] HTTPS working (padlock in browser)
- [ ] MongoDB Atlas IP whitelist set to server IP only
- [ ] `.env` not committed to Git (check `.gitignore`)
- [ ] PM2 running in cluster mode
- [ ] Nginx rate limiting active

---

## Monitoring

```bash
# Live error logs
pm2 logs pakka-famous --err

# CPU / memory
pm2 monit

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

