const express = require('express');
const { sendPage, asyncHandler, requestMeta } = require('../util/http');
const { pushLog, readLogs } = require('../util/logs');
const { requireAuth, requirePageAuth } = require('../util/auth');

const LOG_KEY = 'xpto-token:logs';
const TYPES = ['hex', 'base64', 'base62', 'uuid', 'numeric', 'alphanumeric'];
const SEPARATORS = ['none', '-', '_', '.'];
const int = (v, max) => Math.min(Math.max(parseInt(v, 10) || 0, 0), max);

const router = express.Router();

router.get('/token', sendPage(__dirname, 'index.html'));

router.post('/token/log', asyncHandler(async (req, res) => {
  const { type, length, quantity, prefix, separator, groupSize } = req.body || {};
  if (!TYPES.includes(type) || !int(quantity, 1000)) {
    return res.status(400).json({ fail: 'Missing logging parameters' });
  }
  await pushLog(LOG_KEY, {
    type,
    length: int(length, 1024),
    quantity: int(quantity, 1000),
    prefix: String(prefix || '').slice(0, 64),
    separator: SEPARATORS.includes(separator) ? separator : 'none',
    groupSize: int(groupSize, 64),
    ...requestMeta(req)
  });
  res.status(201).json({ success: true });
}));

router.get('/admin/token', requirePageAuth, sendPage(__dirname, 'admin.html'));
router.get('/admin/token/data', requireAuth, asyncHandler(async (req, res) => {
  res.json({ logs: await readLogs(LOG_KEY) });
}));

module.exports = { router };
