const express = require('express');
const { sendPage, asyncHandler, rateLimit, requestMeta } = require('../util/http');
const { pushLog, readLogs } = require('../util/logs');
const { requireAuth, requirePageAuth } = require('../util/auth');

const LOG_KEY = 'xpto-json:logs';
const ACTIONS = ['format', 'minify'];
const INDENTS = ['2', '4', 'tab'];
const MAX_JSON = 10000;
const int = v => Math.max(parseInt(v, 10) || 0, 0);

const router = express.Router();

router.get('/json', sendPage(__dirname, 'index.html'));

/** Usage log: metadata plus the minified JSON (clipped) for valid input */
router.post('/json/log', rateLimit({ windowMs: 60 * 1000, max: 120 }), asyncHandler(async (req, res) => {
  const { action, valid, inputSize, outputSize, indent, sortKeys, error, minified } = req.body || {};
  if (!ACTIONS.includes(action) || typeof valid !== 'boolean') {
    return res.status(400).json({ fail: 'Missing logging parameters' });
  }
  const json = valid && typeof minified === 'string' ? minified : '';
  await pushLog(LOG_KEY, {
    action,
    valid,
    inputSize: int(inputSize),
    outputSize: valid ? int(outputSize) : 0,
    indent: INDENTS.includes(String(indent)) ? String(indent) : '2',
    sortKeys: !!sortKeys,
    error: valid ? '' : String(error || '').slice(0, 200),
    json: json.slice(0, MAX_JSON),
    truncated: json.length > MAX_JSON,
    ...requestMeta(req)
  });
  res.status(201).json({ success: true });
}));

router.get('/admin/json', requirePageAuth, sendPage(__dirname, 'admin.html'));
router.get('/admin/json/data', requireAuth, asyncHandler(async (req, res) => {
  res.json({ logs: await readLogs(LOG_KEY) });
}));

module.exports = { router };
