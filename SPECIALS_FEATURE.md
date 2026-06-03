# 🌟 Specials Feature — Integration Guide

## What Was Built

A fully dynamic, admin-controlled **Specials** page for the Pakka Famous ecommerce platform, with:

- **Public page** at `/specials` and `/specials/:categorySlug`
- **Admin management** panel at `/specials` (admin app)
- **Full REST API** — categories + products
- **MongoDB models** — `SpecialCategory` + `SpecialProduct`
- **14 default categories** pre-seeded

---

## Files Added / Modified

### 🆕 New Files

| File | Purpose |
|------|---------|
| `backend/models/SpecialCategory.js` | MongoDB model for categories |
| `backend/models/SpecialProduct.js` | MongoDB model for special products |
| `backend/routes/specialsRoutes.js` | All API routes (categories + products) |
| `backend/seedSpecials.js` | One-time seed for 14 default categories |
| `frontend/src/pages/user/SpecialsPage.js` | Public-facing Specials page |
| `admin/src/pages/AdminSpecials.js` | Full admin CRUD UI |

### ✏️ Modified Files

| File | Change |
|------|--------|
| `backend/server.js` | Registered `/api/specials` route |
| `frontend/src/App.js` | Added `/specials` and `/specials/:categorySlug` routes |
| `frontend/src/services/api.js` | Added `specialsAPI` object |
| `frontend/src/components/common/Navbar.js` | Removed "Our Story", added "Specials" |
| `admin/src/App.js` | Added `/specials` admin route |
| `admin/src/services/api.js` | Added `specialsAPI` object |
| `admin/src/components/AdminLayout.js` | Added "Specials 🌟" sidebar link |
| `frontend/src/components/admin/AdminLayout.js` | Added "Specials 🌟" sidebar link |

---

## Setup Instructions

### Step 1 — Copy new files into your project

Copy these files into your live project:
- `backend/models/SpecialCategory.js`
- `backend/models/SpecialProduct.js`
- `backend/routes/specialsRoutes.js`
- `backend/seedSpecials.js`
- `frontend/src/pages/user/SpecialsPage.js`
- `admin/src/pages/AdminSpecials.js`

### Step 2 — Apply the modifications

The easiest way is to copy the entire `pakka-specials` folder. The only changes to
existing files are additive (nothing was removed or broken).

### Step 3 — Seed default categories (run once)

```bash
cd backend
node seedSpecials.js
```

This creates the 14 default categories (Rice & Grains, Spices, Sweets, etc.).
It is idempotent — safe to run multiple times.

### Step 4 — Restart backend

```bash
pm2 restart all
# or
node server.js
```

### Step 5 — Rebuild frontend + admin

```bash
# Frontend
cd frontend && npm run build

# Admin
cd admin && npm run build
```

---

## API Reference

### Category Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/specials/categories` | Public | All active categories |
| `GET` | `/api/specials/categories/admin` | Admin | All categories (incl. hidden) |
| `POST` | `/api/specials/categories` | Admin | Create category (multipart) |
| `PUT` | `/api/specials/categories/:id` | Admin | Update category (multipart) |
| `DELETE` | `/api/specials/categories/:id` | Admin | Delete category + its products |
| `POST` | `/api/specials/categories/reorder` | Admin | Bulk reorder (`{ order: [{ id, order }] }`) |

### Product Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/specials/products` | Public | Products (filter: `?category=slug&tag=trending&search=rice&page=1`) |
| `GET` | `/api/specials/products/admin` | Admin | All products for admin |
| `POST` | `/api/specials/products` | Admin | Create product (multipart) |
| `PUT` | `/api/specials/products/:id` | Admin | Update product (multipart) |
| `PATCH` | `/api/specials/products/:id/toggle` | Admin | Toggle availability |
| `DELETE` | `/api/specials/products/:id` | Admin | Delete product |
| `GET` | `/api/specials/summary` | Public | Categories + their products grouped |

### Product Fields (POST/PUT)

```
name            string   required  Product name
price           number   required  Price in ₹
categoryId      ObjectId required  Category _id
description     string            Product description
famousLocation  string            e.g. "Guntur District"
isAvailable     boolean           default: true
tags            JSON[]            ["trending","festival","seasonal","new","bestseller"]
order           number            Display sort order
image           file              Product image (multipart)
```

---

## MongoDB Schemas

### SpecialCategory
```js
{
  name:        String (required)
  slug:        String (unique, auto-generated from name)
  image:       { url, publicId }
  description: String
  order:       Number
  isActive:    Boolean
  timestamps:  true
}
```

### SpecialProduct
```js
{
  name:           String (required)
  price:          Number (required)
  image:          { url, publicId }
  description:    String
  famousLocation: String
  categoryId:     ObjectId → SpecialCategory
  isAvailable:    Boolean
  tags:           ["trending"|"festival"|"seasonal"|"new"|"bestseller"]
  order:          Number
  timestamps:     true
}
```

---

## Admin Panel Features

- ✅ Create / Edit / Delete categories with images
- ✅ Create / Edit / Delete products with images
- ✅ Toggle product availability (In Stock / Out of Stock)
- ✅ Filter products by category + search
- ✅ Tag products: Trending 🔥 / Festival 🎉 / Seasonal 🌿 / New ✨ / Best Seller ⭐
- ✅ Set display order for both categories and products
- ✅ Confirmation modal before delete (categories warn about cascading delete)

## Public Page Features

- ✅ Category pills (horizontal scroll, responsive)
- ✅ Tag filter buttons (Trending / Festival / Seasonal / etc.)
- ✅ Full-text search
- ✅ Pagination (24 per page)
- ✅ URL-based category routing (`/specials/spices`, `/specials/rice-and-grains`)
- ✅ Lazy-loaded images
- ✅ Out-of-stock overlay
- ✅ Famous location badge (📍 Guntur District)
- ✅ Responsive grid layout
- ✅ Empty states for no results / no categories

---

## Default Categories (seeded)

1. Rice & Grains
2. Spices
3. Sweets
4. Pickles
5. Pulses & Dal
6. Dry Fruits & Nuts
7. Oils
8. Millets & Healthy Grains
9. Sweeteners
10. Snacks & Savories
11. Flours & Powders
12. Ready-to-Cook / Mixes
13. Festival Specials
14. Seasonal Specials

---

## Navbar Change

`Our Story` has been removed from the main navbar and replaced with `Specials`.
The `/story` route still exists in the app — it's just no longer in the top nav.

---

*Built for Pakka Famous · Production-ready · Cloudinary image upload · Fully admin-controlled*
