const crypto = require('crypto');

/**
 * CSRF protection using the double-submit cookie pattern.
 * 
 * How it works:
 *  1. On GET /api/auth/csrf-token → server sets a random token in a cookie AND returns it in JSON.
 *  2. Frontend stores this token in memory and sends it as X-CSRF-Token header on every
 *     state-changing request (POST/PUT/PATCH/DELETE).
 *  3. Server compares the header value against the cookie value.
 *     If they match, the request is allowed — a cross-site attacker can't read cookies
 *     so they can never forge the header.
 * 
 * Note: This is only effective combined with SameSite=Strict cookies and CORS restrictions.
 */

const CSRF_COOKIE = 'pakka_csrf';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Generate a new CSRF token
const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

// Middleware: validate CSRF on state-changing requests
const csrfProtect = (req, res, next) => {
  // Skip CSRF for safe HTTP methods
  if (SAFE_METHODS.includes(req.method)) return next();

  // Skip CSRF for auth endpoints that create the session (login/register)
  const skipPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/admin/login', '/api/auth/refresh'];
  if (skipPaths.includes(req.path)) return next();

  const cookieToken  = req.cookies?.[CSRF_COOKIE];
  const headerToken  = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ success: false, message: 'CSRF token missing', code: 'CSRF_MISSING' });
  }

  // Constant-time comparison to prevent timing attacks
  try {
    const a = Buffer.from(cookieToken);
    const b = Buffer.from(headerToken);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(403).json({ success: false, message: 'CSRF token invalid', code: 'CSRF_INVALID' });
    }
  } catch {
    return res.status(403).json({ success: false, message: 'CSRF token invalid', code: 'CSRF_INVALID' });
  }

  next();
};

// Cookie options for CSRF token (NOT httpOnly — JS needs to read it)
const csrfCookieOptions = {
  httpOnly: false,   // intentionally readable by JS — that's the whole point
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/',
};

// Issue a new CSRF token
const issueCsrfToken = (res) => {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE, token, csrfCookieOptions);
  return token;
};

module.exports = { csrfProtect, issueCsrfToken, CSRF_COOKIE };
