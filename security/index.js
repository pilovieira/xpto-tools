const net = require('net');
const express = require('express');
const { sendPage, asyncHandler } = require('../util/http');
const { requireAuth, requirePageAuth } = require('../util/auth');
const sec = require('../util/security');

const router = express.Router();

router.get('/admin/security', requirePageAuth, sendPage(__dirname, 'admin.html'));

router.get('/admin/security/data', requireAuth, asyncHandler(async (req, res) => {
  res.json({ incidents: await sec.readIncidents(), blocks: sec.listBlocks(), ...sec.stats() });
}));

router.post('/admin/security/unblock', requireAuth, asyncHandler(async (req, res) => {
  const key = String(req.body?.key || '');
  if (!key || key.length > 64) return res.status(400).json({ fail: 'Missing logging parameters' });
  await sec.unblock(key);
  res.json({ success: true });
}));

router.post('/admin/security/block', requireAuth, asyncHandler(async (req, res) => {
  const ip = String(req.body?.ip || '').trim();
  const hours = Math.min(Math.max(Number(req.body?.hours) || 24, 1), 24 * 365);
  if (!net.isIP(ip)) return res.status(400).json({ fail: 'Please enter a valid IP address.' });
  await sec.block(ip, 'Blocked manually', hours * 3600 * 1000);
  res.json({ success: true });
}));

router.post('/admin/security/test', requireAuth, asyncHandler(async (req, res) => {
  const ok = await sec.notify({ title: 'XPTO security test', message: 'Alerts are working. You will be notified here when an attack is blocked.', priority: 3, tags: 'white_check_mark' });
  res.status(ok ? 200 : 502).json(ok ? { success: true } : { fail: 'Could not reach the notification service (is SECURITY_NTFY_TOPIC set?)' });
}));

module.exports = { router };
