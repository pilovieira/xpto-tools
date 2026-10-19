const fs = require('fs');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

/** Client IP, honouring the `trust proxy` setting (TRUST_PROXY in .env) */
const clientIp = req => (req.ip || req.socket.remoteAddress || 'unknown').replace(/^::ffff:/, '');

/** Common metadata stored with every log entry */
const requestMeta = req => ({
  ip: clientIp(req),
  userAgent: String(req.headers['user-agent'] || 'Unknown').slice(0, 300),
  timestamp: new Date().toISOString()
});

/** Express handler that serves a static HTML file (cached in production) */
const sendPage = (...segments) => {
  const file = path.join(...segments);
  let cached;
  return (req, res) => {
    if (!cached || !isProd) cached = fs.readFileSync(file, 'utf-8');
    res.type('html').send(cached);
  };
};

/** Lets async handlers throw into the Express error handler */
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Tiny in-memory fixed-window rate limiter, keyed by client IP */
const rateLimit = ({ windowMs, max, message = 'Too many requests, slow down.' }) => {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  }, windowMs).unref();

  return (req, res, next) => {
    const key = clientIp(req);
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    if (++entry.count > max) {
      res.set('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ fail: message });
    }
    next();
  };
};

module.exports = { clientIp, requestMeta, sendPage, asyncHandler, rateLimit };
