# 🍬 Pakka Famous — Authentic Andhra Pradesh Sweets Ecommerce

A full-stack MERN ecommerce platform selling the top 20 famous sweets from Andhra Pradesh.

---

## 📁 Project Structure

```
pakka-famous/
├── backend/
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   ├── cloudinary.js        # Cloudinary image upload
│   │   └── email.js             # Nodemailer email service
│   ├── controllers/
│   │   ├── authController.js    # Register, Login, Admin Login
│   │   ├── productController.js # CRUD for products
│   │   ├── cartController.js    # Cart operations
│   │   ├── orderController.js   # Order placement, status
│   │   └── adminController.js   # Admin user management
│   ├── middleware/
│   │   └── auth.js              # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   └── userRoutes.js
│   ├── server.js
│   ├── seedData.js              # Seed 20 products into DB
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.js
    │   │   │   └── Footer.js
    │   │   ├── user/
    │   │   │   └── ProductCard.js
    │   │   └── admin/
    │   │       └── AdminLayout.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── CartContext.js
    │   ├── pages/
    │   │   ├── user/
    │   │   │   ├── HomePage.js
    │   │   │   ├── ProductsPage.js
    │   │   │   ├── ProductDetailPage.js
    │   │   │   ├── CartPage.js
    │   │   │   ├── CheckoutPage.js
    │   │   │   ├── OrdersPage.js
    │   │   │   ├── OrderDetailPage.js
    │   │   │   ├── ProfilePage.js
    │   │   │   ├── LoginPage.js
    │   │   │   └── RegisterPage.js
    │   │   └── admin/
    │   │       ├── AdminLoginPage.js
    │   │       ├── AdminDashboard.js
    │   │       ├── AdminProducts.js
    │   │       ├── AdminOrders.js
    │   │       ├── AdminOrderDetail.js
    │   │       └── AdminUsers.js
    │   ├── services/
    │   │   └── api.js           # All API calls via Axios
    │   ├── App.js
    │   ├── index.js
    │   ├── index.css
    │   └── .env.example
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account (free tier)
- Gmail account with App Password enabled

### 1. Clone / Create Project
```bash
mkdir pakka-famous && cd pakka-famous
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file from template
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

### 3. Seed Database (First Time Only)
```bash
cd backend
node seedData.js
# This seeds all 20 Andhra Pradesh sweets into your MongoDB
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api

npm start
```

---

## 🔑 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas - Get from cloud.mongodb.com
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/pakka-famous

# JWT - Use any strong random string
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Cloudinary - Get from cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail - Enable 2FA, then create App Password at myaccount.google.com/apppasswords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=Pakka Famous <yourgmail@gmail.com>

# Admin emails (predefined)
ADMIN_EMAILS=pakkaadmin1@gmail.com,pakkaadmin2@gmail.com,pakkaadmin3@gmail.com,pakkaadmin4@gmail.com,pakkaadmin5@gmail.com

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Pakka Famous
```

---

## 👤 Authentication

### User Registration & Login
- **Register:** `/register`
- **Login:** `/login`
- Passwords are hashed with **bcryptjs** (salt rounds: 12)
- Sessions use **JWT tokens** stored in localStorage

### Admin Login
- **URL:** `/admin/login`
- **Emails:** pakkaadmin1@gmail.com to pakkaadmin5@gmail.com
- **Password:** `pakkaadmin@2003`
- Role-based access: `user` | `admin`

---

## 🛍️ Features Summary

| Feature | Details |
|---------|---------|
| Products | Top 20 AP sweets with images, city, price, discount, stock |
| Search | By name, city, category with filters |
| Cart | Add, update quantity, remove, totals |
| Checkout | Address + COD/Online + order placement |
| Emails | Welcome, Order confirmation (user), Order alert (admin) |
| Admin Dashboard | Stats: users, orders, revenue, products |
| Admin Products | Add/Edit/Delete with Cloudinary image upload |
| Admin Orders | View all, filter by status, update status |
| Admin Users | View user list, orders, activate/deactivate |

---

## 📧 Email Setup (Gmail App Password)

1. Go to **myaccount.google.com**
2. Security → 2-Step Verification → Enable
3. Security → App passwords → Create for "Mail"
4. Copy the 16-character password → set as `EMAIL_PASS`

---

## ☁️ Cloudinary Setup

1. Sign up at **cloudinary.com** (free tier: 25GB storage)
2. Dashboard → Copy Cloud Name, API Key, API Secret
3. Set in backend `.env`

---

## 🗄️ MongoDB Atlas Setup

1. Sign up at **cloud.mongodb.com**
2. Create a free cluster (M0 free tier)
3. Database Access → Create user with password
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string
6. Replace `<password>` and set as `MONGODB_URI`

---

## 🌐 Deployment

### Backend → Render (Free)

1. Push backend to GitHub
2. Go to **render.com** → New Web Service
3. Connect your repo, select the `backend` folder
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add all environment variables from `.env`
6. Change `FRONTEND_URL` to your Vercel URL
7. Deploy!

### Frontend → Vercel (Free)

1. Push frontend to GitHub
2. Go to **vercel.com** → New Project
3. Import repo, select `frontend` folder
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-render-app.onrender.com/api`
5. Deploy!

### Post-Deployment
- Run seed script once: `node seedData.js` (with production MONGODB_URI)
- Test admin login at `/admin/login`
- Verify emails are sending

---

## 🍬 Top 20 Sweets Included

| # | Sweet | City |
|---|-------|------|
| 1 | Kakinada Kaja | Kakinada |
| 2 | Athreyapuram Pootharekulu | Athreyapuram |
| 3 | Bandar Laddu | Machilipatnam |
| 4 | Tirupati Laddu | Tirupati |
| 5 | Bobbatlu | Vijayawada |
| 6 | Ariselu | Guntur |
| 7 | Madatha Kaja | Rajahmundry |
| 8 | Palakova | Nellore |
| 9 | Sunnundalu | Vijayawada |
| 10 | Kajjikayalu | Vijayawada |
| 11 | Kova Kajjikayalu | Machilipatnam |
| 12 | Ravva Laddu | Guntur |
| 13 | Chegodilu | Kurnool |
| 14 | Bandar Halwa | Machilipatnam |
| 15 | Kobbari Mithai | Ongole |
| 16 | Pesara Garelu | Vijayawada |
| 17 | Rava Kesari | Vizag |
| 18 | Kaju Katli | Tirupati |
| 19 | Bellam Pootharekulu | Athreyapuram |
| 20 | Gulab Jamun Kaja | Kakinada |

---

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs (12 salt rounds)
- ✅ JWT authentication with expiry
- ✅ Role-based middleware (protect + adminOnly)
- ✅ Input validation on models
- ✅ CORS configured for specific frontend URL
- ✅ File type validation on image uploads
- ✅ File size limit (5MB max)

---

## 📱 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | User login |
| POST | /api/auth/admin/login | Admin login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all (with filters) |
| GET | /api/products/featured | Featured products |
| GET | /api/products/cities | Get city list |
| GET | /api/products/:id | Single product |
| POST | /api/products | Create (admin) |
| PUT | /api/products/:id | Update (admin) |
| DELETE | /api/products/:id | Delete (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get user cart |
| POST | /api/cart/add | Add item |
| PUT | /api/cart/update | Update quantity |
| DELETE | /api/cart/remove/:id | Remove item |
| DELETE | /api/cart/clear | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order |
| GET | /api/orders/my-orders | User's orders |
| GET | /api/orders/:id | Single order |
| GET | /api/orders/admin/all | All orders (admin) |
| GET | /api/orders/admin/stats | Dashboard stats |
| PUT | /api/orders/:id/status | Update status (admin) |

---

Built with ❤️ for Andhra Pradesh — Pakka Famous 🍬
