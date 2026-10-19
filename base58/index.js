const express = require('express');
const { sendPage, asyncHandler, requestMeta } = require('../util/http');
const { pushLog, readLogs } = require('../util/logs');
const { requireAuth, requirePageAuth } = require('../util/auth');

const LOG_KEY = 'xpto-base58:logs';
const MAX_FIELD = 2000;
const clip = s => (s.length > MAX_FIELD ? s.slice(0, MAX_FIELD) + '...' : s);

const router = express.Router();

router.get('/base58', sendPage(__dirname, 'index.html'));

router.post('/base58/log', asyncHandler(async (req, res) => {
  const { type, input, output } = req.body || {};
  if (!['encode', 'decode'].includes(type) || typeof input !== 'string' || !input || typeof output !== 'string') {
    return res.status(400).json({ fail: 'Missing logging parameters' });
  }
  await pushLog(LOG_KEY, { type, input: clip(input), output: clip(output), ...requestMeta(req) });
  res.status(201).json({ success: true });
}));

router.get('/admin/base58', requirePageAuth, sendPage(__dirname, 'admin.html'));
router.get('/admin/base58-admin', (req, res) => res.redirect('/admin/base58'));
router.get('/admin/base58/data', requireAuth, asyncHandler(async (req, res) => {
  res.json({ logs: await readLogs(LOG_KEY) });
}));

module.exports = { router };
