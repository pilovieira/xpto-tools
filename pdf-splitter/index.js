const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const express = require('express');
const logger = require('../logger');
const { sendPage, asyncHandler, rateLimit, requestMeta } = require('../util/http');
const { pushLog, readLogs } = require('../util/logs');
const { redisDb } = require('../util/db');
const { requireAuth, requirePageAuth } = require('../util/auth');

const LOG_KEY = 'xpto-pdf:logs';
const MAX_UPLOAD = '50mb';
const RETENTION_MS = (Number(process.env.PDF_RETENTION_DAYS) || 7) * 24 * 60 * 60 * 1000;
const uploadDir = process.env.PDF_UPLOAD_DIR || path.join(os.tmpdir(), 'xpto-pdf-uploads');
fs.mkdirSync(uploadDir, { recursive: true });

/** Remove stored uploads older than the retention window */
const sweepOldFiles = async () => {
  const cutoff = Date.now() - RETENTION_MS;
  for (const name of await fsp.readdir(uploadDir)) {
    const file = path.join(uploadDir, name);
    try {
      if ((await fsp.stat(file)).birthtimeMs < cutoff) await fsp.unlink(file);
    } catch { /* file vanished or is busy; next sweep will retry */ }
  }
};
sweepOldFiles().catch(e => logger.error(`Upload sweep failed: ${e.message}`));
setInterval(() => sweepOldFiles().catch(() => {}), 60 * 60 * 1000).unref();

/** Resolve a user supplied file name inside the upload directory (no path traversal) */
const resolveUpload = name => path.join(uploadDir, path.basename(name));

const router = express.Router();

router.get('/pdf-splitter', sendPage(__dirname, 'index.html'));

/** Receives the raw PDF bytes (Content-Type: application/pdf, name in the X-Filename header) */
router.post('/pdf-splitter/upload',
  rateLimit({ windowMs: 60 * 1000, max: 10 }),
  express.raw({ type: 'application/pdf', limit: MAX_UPLOAD }),
  asyncHandler(async (req, res) => {
    const buffer = req.body;
    if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.subarray(0, 5).toString() !== '%PDF-') {
      return res.status(400).json({ fail: 'Request body is not a valid PDF' });
    }

    let filename = 'document.pdf';
    try { filename = decodeURIComponent(req.headers['x-filename'] || filename); } catch { /* keep default */ }
    filename = filename.slice(0, 200);

    const savedFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    await fsp.writeFile(path.join(uploadDir, savedFilename), buffer);
    await pushLog(LOG_KEY, { filename, filesize: buffer.length, savedFilename, ...requestMeta(req) });
    res.status(201).json({ success: true, savedFilename });
  })
);

router.get('/admin/pdf-splitter', requirePageAuth, sendPage(__dirname, 'admin.html'));

router.get('/admin/pdf-splitter/data', requireAuth, asyncHandler(async (req, res) => {
  const logs = await readLogs(LOG_KEY);
  const names = await fsp.readdir(uploadDir).catch(() => []);
  const files = (await Promise.all(names.map(async filename => {
    try {
      const { size, birthtime } = await fsp.stat(path.join(uploadDir, filename));
      return { filename, size, birthtime };
    } catch {
      return null;
    }
  }))).filter(Boolean).sort((a, b) => b.birthtime - a.birthtime);
  res.json({ logs, files });
}));

router.get('/admin/pdf-splitter/files/:filename', requireAuth, asyncHandler(async (req, res) => {
  const file = resolveUpload(req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).json({ fail: 'File not found' });
  res.download(file, path.basename(file));
}));

router.delete('/admin/pdf-splitter/files/:filename', requireAuth, asyncHandler(async (req, res) => {
  const name = path.basename(req.params.filename);
  await fsp.unlink(resolveUpload(name)).catch(e => { if (e.code !== 'ENOENT') throw e; });

  // Drop matching entries from the log list as well
  const raw = await redisDb.lrange(LOG_KEY, 0, -1);
  const pipeline = redisDb.pipeline();
  raw.forEach(entry => {
    try {
      if (JSON.parse(entry).savedFilename === name) pipeline.lrem(LOG_KEY, 0, entry);
    } catch { /* corrupt entry, leave it */ }
  });
  await pipeline.exec();
  res.json({ success: true });
}));

module.exports = { router };
