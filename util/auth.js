const crypto = require('crypto');
const { redisDb } = require('./db');
const { rateLimit, asyncHandler } = require('./http');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN_TTL_MINUTES = Number(process.env.ADMIN_TOKEN_TTL_MINUTES) || 10;
const TOKEN_PREFIX = 'xpto-url:admin_token:';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD not defined in .env');
}

const parseCookies = header =>
  Object.fromEntries(
    String(header || '').split(';').map(c => c.trim()).filter(Boolean).map(c => {
      const i = c.indexOf('=');
      return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
    })
  );

/** Constant-time string comparison */
const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

/** Checks the admin session token stored in Redis */
const isAuth = async req => {
  const token = parseCookies(req.headers.cookie).admin_token;
  if (!token) return false;
  try {
    return (await redisDb.exists(TOKEN_PREFIX + token)) === 1;
  } catch {
    return false;
  }
};

/** Middleware for admin JSON endpoints */
const requireAuth = asyncHandler(async (req, res, next) => {
  if (await isAuth(req)) return next();
  res.status(401).json({ fail: 'Unauthorized' });
});

/** Middleware for admin pages: redirects to the login screen */
const requirePageAuth = asyncHandler(async (req, res, next) => {
  if (await isAuth(req)) return next();
  res.redirect('/admin');
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Try again in a few minutes.'
});

const adminLogin = [loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const okEmail = safeEqual(email ?? '', ADMIN_EMAIL);
  const okPassword = safeEqual(password ?? '', ADMIN_PASSWORD);
  if (!(okEmail && okPassword)) {
    return res.status(401).json({ fail: 'Invalid credentials' });
  }
  const token = crypto.randomBytes(24).toString('hex');
  await redisDb.setex(TOKEN_PREFIX + token, ADMIN_TOKEN_TTL_MINUTES * 60, '1');
  res.cookie('admin_token', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: ADMIN_TOKEN_TTL_MINUTES * 60 * 1000
  });
  res.json({ success: true });
})];

const adminLogout = asyncHandler(async (req, res) => {
  const token = parseCookies(req.headers.cookie).admin_token;
  if (token) await redisDb.del(TOKEN_PREFIX + token);
  res.clearCookie('admin_token', { path: '/' });
  res.redirect('/admin');
});

/** Lets public pages know whether to show admin shortcuts (the cookie is httpOnly) */
const session = asyncHandler(async (req, res) => {
  res.json({ admin: await isAuth(req) });
});

module.exports = { isAuth, requireAuth, requirePageAuth, adminLogin, adminLogout, session };
