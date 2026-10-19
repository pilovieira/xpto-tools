// shortener/index.js – URL shortening: public API, redirects and admin dashboard
const crypto = require('crypto');
const express = require('express');
const logger = require('../logger');
const { redisDb } = require('../util/db');
const { sendPage, asyncHandler, rateLimit, requestMeta } = require('../util/http');
const { pushLog, readLogs, scanKeys } = require('../util/logs');
const { requireAuth, requirePageAuth } = require('../util/auth');

const KEY_PREFIX = 'xpto-url:keys:';
const COUNT_PREFIX = 'xpto-url:count:';
const LOG_KEY = 'xpto-url:logs';

const KEY_RE = /^[a-zA-Z0-9_-]{1,64}$/;
// Top-level routes a custom slug must never shadow
const RESERVED = new Set(['admin', 'api', 'public', 'shortener', 'base58', 'token', 'json', 'pdf-splitter', 'pdf-signer', 'image-to-pdf', 'favicon.ico', 'healthz']);
// No lookalike characters (0/o, 1/l/i); 32 symbols so the byte-to-char mapping is unbiased
const ALPHABET = '23456789abcdefghijkmnpqrstuvwxyz';

/** Validate a user supplied URL; only http(s) is allowed. Returns the normalised URL or null */
const parseTarget = raw => {
  let value = String(raw || '').trim();
  if (!value || value.length > 2048) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

const randomKey = (length = 6) =>
  Array.from(crypto.randomBytes(length), b => ALPHABET[b % ALPHABET.length]).join('');

const router = express.Router();

/* ── Public ─────────────────────────────────────────────── */

router.get('/shortener', sendPage(__dirname, 'index.html'));

router.post('/shortener', rateLimit({ windowMs: 60 * 1000, max: 30 }), asyncHandler(async (req, res) => {
  const target = parseTarget(req.body?.url);
  if (!target) return res.status(400).json({ fail: 'Please enter a valid http(s) URL.' });

  for (let attempt = 0; attempt < 5; attempt++) {
    const key = randomKey();
    if (await redisDb.set(KEY_PREFIX + key, target, 'NX')) {
      logger.info(`Short URL created - Key: ${key}, URL: ${target}`);
      return res.status(201).json({ key });
    }
  }
  res.status(503).json({ fail: 'Could not allocate a key, please try again.' });
}));

/** GET /:key – redirect to the original URL */
const redirectToUrl = asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (!KEY_RE.test(key)) return res.redirect('/');

  const stored = await redisDb.get(KEY_PREFIX + key);
  const target = stored && parseTarget(stored);
  const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?') + 1) : '';
  if (!target) {
    logger.warn(`Redirect with invalid key - Key[${key}]`);
    return res.redirect('/');
  }

  const finalUrl = new URL(target);
  new URLSearchParams(query).forEach((v, k) => finalUrl.searchParams.append(k, v));
  res.redirect(302, finalUrl.href);

  // Log and count after responding so the redirect is never delayed
  setImmediate(() => {
    pushLog(LOG_KEY, { key, url: stored, ...requestMeta(req) }).catch(e => logger.error(`Redirect log failed: ${e.message}`));
    redisDb.incr(COUNT_PREFIX + key).catch(e => logger.error(`Count increment failed for ${key}: ${e.message}`));
  });
});

/* ── Admin ──────────────────────────────────────────────── */

router.get('/admin/shortener', requirePageAuth, sendPage(__dirname, 'admin.html'));

router.get('/admin/shortener/data', requireAuth, asyncHandler(async (req, res) => {
  const redisKeys = (await scanKeys(`${KEY_PREFIX}*`)).sort();
  const slugs = redisKeys.map(k => k.slice(KEY_PREFIX.length));
  const [urls, counts, logs] = await Promise.all([
    redisKeys.length ? redisDb.mget(redisKeys) : [],
    redisKeys.length ? redisDb.mget(slugs.map(s => COUNT_PREFIX + s)) : [],
    readLogs(LOG_KEY)
  ]);
  const keys = slugs.map((key, i) => ({ key, url: urls[i], count: parseInt(counts[i] || '0', 10) }));
  res.json({ keys, logs });
}));

router.delete('/admin/shortener/keys/:key', requireAuth, asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (!KEY_RE.test(key)) return res.status(400).json({ fail: 'Invalid key' });
  await redisDb.del(KEY_PREFIX + key, COUNT_PREFIX + key);
  res.json({ success: true });
}));

router.post('/admin/shortener/keys', requireAuth, asyncHandler(async (req, res) => {
  const { key, url } = req.body || {};
  if (!key || !url) return res.status(400).json({ fail: 'Both key and url are required' });
  if (!/^[a-zA-Z0-9-]{1,64}$/.test(key)) {
    return res.status(400).json({ fail: 'Key may only contain letters, numbers and hyphens' });
  }
  if (RESERVED.has(key.toLowerCase())) return res.status(400).json({ fail: `"${key}" is a reserved name` });
  const target = parseTarget(url);
  if (!target) return res.status(400).json({ fail: 'Destination must be a valid http(s) URL' });

  if (!await redisDb.set(KEY_PREFIX + key, target, 'NX')) {
    return res.status(409).json({ fail: `Key "${key}" already exists` });
  }
  res.status(201).json({ key, url: target });
}));

module.exports = { router, redirectToUrl };
