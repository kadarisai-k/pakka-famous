import axios from 'axios';
import { getMemoryToken, setMemoryToken } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── CSRF token: stored in memory (read from cookie after login) ───
let csrfToken = null;

const getCsrfFromCookie = () => {
  const match = document.cookie.match(/(?:^|;\s*)pakka_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const setCsrfToken = (t) => { csrfToken = t; };
export const getCsrfToken = ()  => csrfToken || getCsrfFromCookie();

// ── Axios instance ─────────────────────────────────────────────────
const api = axios.create({
  baseURL:      API_URL,
  withCredentials: true,   // sends httpOnly refresh cookie automatically
  timeout:      15000,     // 15 s timeout on every request
  headers:      { 'Content-Type': 'application/json' },
});

// ── Request interceptor ────────────────────────────────────────────
// Attach access token + CSRF header on every request
api.interceptors.request.use(
  (config) => {
    const token = getMemoryToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Add CSRF header for all state-changing methods
    const mutating = ['post', 'put', 'patch', 'delete'];
    if (mutating.includes(config.method?.toLowerCase())) {
      const csrf = getCsrfToken();
      if (csrf) config.headers['X-CSRF-Token'] = csrf;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — silent token refresh on 401 ────────────
let isRefreshing  = false;
let refreshQueue  = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status   = error.response?.status;
    const code     = error.response?.data?.code;

    // Attempt one silent refresh when access token expires
    if (status === 401 && code === 'TOKEN_EXPIRED' && !original._retried) {
      original._retried = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;
      try {
        const res = await api.post('/auth/refresh');
        const { token, csrfToken: newCsrf } = res.data;
        setMemoryToken(token);
        if (newCsrf) setCsrfToken(newCsrf);
        processQueue(null, token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setMemoryToken(null);
        setCsrfToken(null);
        sessionStorage.removeItem('pakka_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Hard 401 (invalid token, not expiry) — go to login
    if (status === 401 && !original._retried) {
      setMemoryToken(null);
      setCsrfToken(null);
      sessionStorage.removeItem('pakka_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ── API modules ────────────────────────────────────────────────────
export const authAPI = {
  getCsrfToken:  ()     => api.get('/auth/csrf-token'),
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  adminLogin:    (data) => api.post('/auth/admin/login', data),
  refresh:       ()     => api.post('/auth/refresh'),
  logout:        ()     => api.post('/auth/logout'),
  getMe:         ()     => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productAPI = {
  getAll:        (params) => api.get('/products', { params }),
  getOne:        (id)     => api.get(`/products/${id}`),
  getFeatured:   ()       => api.get('/products/featured'),
  getTopSellers: ()       => api.get('/products/topsellers'),
  getBestSelling:()       => api.get('/products/bestselling'),
  getTodaySpecial:()      => api.get('/products/todayspecial'),
  updateFlags:        (id, flags) => api.patch(`/products/${id}/flags`, flags),
  setTodaySpecialPrice: (id, price) => api.patch(`/products/${id}/flags`, { isTodaySpecial: true, todaySpecialPrice: price }),
  getSeasonal:   ()       => api.get('/products/seasonal'),
  getCities:     ()       => api.get('/products/cities'),
  create:        (fd)     => api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:        (id, fd) => api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:        (id)     => api.delete(`/products/${id}`),
};

export const cartAPI = {
  get:    ()                  => api.get('/cart'),
  add:    (data)              => api.post('/cart/add', data),
  update: (data)              => api.put('/cart/update', data),
  remove: (productId, weight) => api.delete(`/cart/remove/${productId}${weight ? `?weight=${encodeURIComponent(weight)}` : ''}`),
  clear:  ()                  => api.delete('/cart/clear'),
};

export const wishlistAPI = {
  get:    ()          => api.get('/wishlist'),
  getIds: ()          => api.get('/wishlist/ids'),
  add:    (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
};

export const orderAPI = {
  place:        (data)   => api.post('/orders', data),
  getMyOrders:          ()       => api.get('/orders/my-orders'),
  getCancellationStatus:()       => api.get('/orders/cancellation-status'),
  cancelOrder:          (id, d)  => api.post(`/orders/${id}/cancel`, d || {}),
  getOne:       (id)     => api.get(`/orders/${id}`),
  getAll:       (params) => api.get('/orders/admin/all', { params }),
  getAnalytics: () => api.get('/orders/admin/analytics'),
  getStats:     ()       => api.get('/orders/admin/stats'),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  export:       (params) => api.get('/orders/admin/export', { params, responseType: 'blob' }),
};

export const adminAPI = {
  getUsers:          (params) => api.get('/admin/users', { params }),
  getUserWithOrders: (id)     => api.get(`/admin/users/${id}`),
  toggleUser:        (id)     => api.put(`/admin/users/${id}/toggle`),
  changePassword:    (data)   => api.put('/admin/change-password', data),
  getCoupons:        ()       => api.get('/admin/coupons'),
  createCoupon:      (data)   => api.post('/admin/coupons', data),
  updateCoupon:      (id, d)  => api.put(`/admin/coupons/${id}`, d),
  deleteCoupon:      (id)     => api.delete(`/admin/coupons/${id}`),
  getSettings:       ()       => api.get('/admin/settings'),
  updateSettings:    (data)   => api.put('/admin/settings', data),
  triggerSummaryNow: ()       => api.post('/admin/trigger-summary'),
};

export const couponAPI    = { validate: (data) => api.post('/coupons/validate', data) };

export const contentAPI   = {
  getHomepage:     ()     => api.get('/content/homepage'),
  updateHomepage:  (fd)   => api.put('/content/homepage', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addShopImage:    (fd)   => api.post('/content/homepage/shop-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeShopImage: (pid)  => api.delete(`/content/homepage/shop-image/${encodeURIComponent(pid)}`),
};

export const citySweetAPI = {
  getAll:      ()       => api.get('/city-sweets'),
  adminGetAll: ()       => api.get('/admin/city-sweets'),
  create:      (fd)     => api.post('/admin/city-sweets', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, fd) => api.put(`/admin/city-sweets/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id)     => api.delete(`/admin/city-sweets/${id}`),
};

export const storyAPI = {
  getAll:      ()       => api.get('/stories'),
  adminGetAll: ()       => api.get('/stories/admin/all'),
  create:      (fd)     => api.post('/stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, fd) => api.put(`/stories/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id)     => api.delete(`/stories/${id}`),
};

export const seasonalAPI = {
  getAll:      ()       => api.get('/seasonal-specials'),
  adminGetAll: ()       => api.get('/seasonal-specials/admin/all'),
  create:      (fd)     => api.post('/seasonal-specials', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, fd) => api.put(`/seasonal-specials/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id)     => api.delete(`/seasonal-specials/${id}`),
};

export const specialOfferAPI = {
  getLive:     ()       => api.get('/special-offers'),
  adminGetAll: ()       => api.get('/special-offers/admin/all'),
  create:      (fd)     => api.post('/special-offers', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, fd) => api.put(`/special-offers/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id)     => api.delete(`/special-offers/${id}`),
};

export const occasionAPI = {
  getAll:      ()       => api.get('/occasions'),
  adminGetAll: ()       => api.get('/occasions/admin/all'),
  create:      (fd)     => api.post('/occasions', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, fd) => api.put(`/occasions/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id)     => api.delete(`/occasions/${id}`),
};

export const packingAPI = {
  getByOccasion:   (id) => api.get(`/packings/by-occasion/${id}`),
  getAll:          (cat) => api.get('/packings' + (cat ? `?category=${encodeURIComponent(cat)}` : '')),
  adminGetAll:     ()    => api.get('/packings/admin/all'),
  create:          (fd)  => api.post('/packings', fd, { headers:{'Content-Type':'multipart/form-data'} }),
  update:          (id, fd) => api.put(`/packings/${id}`, fd, { headers:{'Content-Type':'multipart/form-data'} }),
  delete:          (id)  => api.delete(`/packings/${id}`),
  submitOrder:     (data) => api.post('/packings/occasion-orders', data),
  getOrders:       ()    => api.get('/packings/occasion-orders/all'),
  updateOrder:     (id, data) => api.put(`/packings/occasion-orders/${id}`, data),
};

export const testimonialAPI = {
  getAll:      ()       => api.get("/testimonials"),
  adminGetAll: ()       => api.get("/testimonials/admin/all"),
  create:      (fd)     => api.post("/testimonials", fd, { headers:{"Content-Type":"multipart/form-data"} }),
  update:      (id, fd) => api.put(`/testimonials/${id}`, fd, { headers:{"Content-Type":"multipart/form-data"} }),
  delete:      (id)     => api.delete(`/testimonials/${id}`),
};

export const specialsAPI = {
  getSummary:         ()       => api.get('/specials/summary'),
  getCategories:      ()       => api.get('/specials/categories'),
  getProducts:        (params) => api.get('/specials/products', { params }),
  adminGetCategories: ()       => api.get('/specials/categories/admin'),
  createCategory:     (fd)     => api.post('/specials/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCategory:     (id, fd) => api.put(`/specials/categories/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCategory:     (id)     => api.delete(`/specials/categories/${id}`),
  reorderCategories:  (data)   => api.post('/specials/categories/reorder', data),
  adminGetProducts:   (params) => api.get('/specials/products/admin', { params }),
  createProduct:      (fd)     => api.post('/specials/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct:      (id, fd) => api.put(`/specials/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggleProduct:      (id)     => api.patch(`/specials/products/${id}/toggle`),
  deleteProduct:      (id)     => api.delete(`/specials/products/${id}`),
};

export default api;
