const express = require('express');
const { sendPage, asyncHandler, rateLimit, requestMeta } = require('../util/http');
const { pushLog, readLogs } = require('../util/logs');
const { requireAuth, requirePageAuth } = require('../util/auth');

const LOG_KEY = 'xpto-img2pdf:logs';
const PAGE_SIZES = ['a4', 'letter', 'a3', 'fit'];
const ORIENTATIONS = ['auto', 'portrait', 'landscape'];
const int = v => Math.max(Math.round(Number(v)) || 0, 0);

const router = express.Router();
router.get('/image-to-pdf', sendPage(__dirname, 'index.html'));

/** Usage log (metadata only): the images and the PDF themselves never leave the browser */
router.post('/image-to-pdf/log', rateLimit({ windowMs: 60 * 1000, max: 60 }), asyncHandler(async (req, res) => {
  const { images, inputSize, outputSize, pageSize, orientation, names } = req.body || {};
  if (!int(images)) return res.status(400).json({ fail: 'Missing logging parameters' });
  await pushLog(LOG_KEY, {
    images: int(images), inputSize: int(inputSize), outputSize: int(outputSize),
    pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : 'a4',
    orientation: ORIENTATIONS.includes(orientation) ? orientation : 'auto',
    names: (Array.isArray(names) ? names : []).slice(0, 20).map(n => String(n).slice(0, 120)),
    ...requestMeta(req)
  });
  res.status(201).json({ success: true });
}));

router.get('/admin/image-to-pdf', requirePageAuth, sendPage(__dirname, 'admin.html'));
router.get('/admin/image-to-pdf/data', requireAuth, asyncHandler(async (req, res) => {
  res.json({ logs: await readLogs(LOG_KEY) });
}));

module.exports = { router };
