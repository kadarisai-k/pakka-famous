# How to Run Pakka Famous

## Project Structure

```
pakka-fixed/
├── backend/        ← Express API server  (port 5000)
├── frontend/       ← User website        (port 3000)
├── admin/          ← Admin panel         (port 3001)  ← NEW: separate app
└── nginx/          ← Production nginx config
```

## ⚠️ Admin Panel is Now Separate

The admin panel runs on its **own port (3001)** and its **own subdomain** in production.
This means regular users on port 3000 / yourdomain.com **cannot access or see** the admin login.

| App       | Local Dev              | Production                   |
|-----------|------------------------|------------------------------|
| User site | http://localhost:3000  | https://yourdomain.com       |
| Admin     | http://localhost:3001  | https://admin.yourdomain.com |
| Backend   | http://localhost:5000  | (internal, via nginx proxy)  |

---

## Local Development

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# User frontend
cd frontend && npm install

# Admin panel
cd admin && npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — fill in MONGO_URI, JWT_SECRET, etc.

# Admin (optional — defaults to localhost:5000)
cp admin/.env.example admin/.env
```

### 3. Seed admin account

```bash
cd backend
node seedAdmin.js
```

### 4. Start all three servers (3 terminal windows)

```bash
# Terminal 1 — Backend API
cd backend && npm start

# Terminal 2 — User website (http://localhost:3000)
cd frontend && npm start

# Terminal 3 — Admin panel (http://localhost:3001)
cd admin && npm start
```

---

## Production Deployment

### Build static files

```bash
cd frontend && npm run build   # → frontend/build/
cd admin    && npm run build   # → admin/build/
```

### Copy builds to server

```bash
scp -r frontend/build/ user@server:/var/www/pakka/frontend/build/
scp -r admin/build/    user@server:/var/www/pakka/admin/build/
```

### Start backend with PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Configure nginx

```bash
# Copy nginx config
sudo cp nginx/nginx.conf /etc/nginx/sites-available/pakka
sudo ln -s /etc/nginx/sites-available/pakka /etc/nginx/sites-enabled/

# Get SSL certificates (run twice for each domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com

sudo nginx -t && sudo systemctl reload nginx
```

---

## Security Notes

- Admin login is **completely isolated** — served from a different domain/port
- Backend CORS allows both `localhost:3000` and `localhost:3001` in dev
- In production, update `FRONTEND_URL` in `backend/.env`:
  ```
  FRONTEND_URL=https://yourdomain.com,https://admin.yourdomain.com
  ```
- Admin routes use JWT + role check (`isAdmin`) — even if someone guesses the URL, they cannot access admin endpoints without a valid admin token
