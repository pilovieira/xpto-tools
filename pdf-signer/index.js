const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const express = require('express');
const logger = require('../logger');
const { sendPage, asyncHandler, rateLimit, requestMeta } = require('../util/http');
const { pushLog, readLogs } = require('../util/logs');
const { redisDb } = require('../util/db');
const { requireAuth, requirePageAuth } = require('../util/auth');

const LOG_KEY = 'xpto-signer:logs';
const MAX_UPLOAD = '50mb';
const RETENTION_MS = (Number(process.env.SIGNER_RETENTION_DAYS) || 30) * 24 * 60 * 60 * 1000;
const MAX_STORE_BYTES = (Number(process.env.SIGNER_MAX_STORE_MB) || 2048) * 1024 * 1024;
const uploadDir = process.env.SIGNER_UPLOAD_DIR || path.join(__dirname, '..', 'data', 'signer');
fs.mkdirSync(uploadDir, { recursive: true });

const KINDS = ['original', 'signed', 'signature'];
const ID_RE = /^[a-f0-9-]{36}$/;
const int = v => Math.max(Math.round(Number(v)) || 0, 0);
const name = v => String(v || '').slice(0, 200);

/** Identify the file by its magic bytes — the declared Content-Type is not trusted */
const detectType = b => {
  if (b.length > 12 && b.subarray(0, 5).toString() === '%PDF-') return 'pdf';
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length > 12 && b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
};

/** Delete files past the retention window, then the oldest ones while the store is over its size budget */
const sweep = async () => {
  const entries = [];
  for (const file of await fsp.readdir(uploadDir)) {
    try {
      const st = await fsp.stat(path.join(uploadDir, file));
      if (st.isFile()) entries.push({ file, size: st.size, at: st.birthtimeMs || st.mtimeMs });
    } catch { /* vanished */ }
  }
  const cutoff = Date.now() - RETENTION_MS;
  let total = entries.reduce((s, e) => s + e.size, 0);
  for (const e of entries.sort((a, b) => a.at - b.at)) {
    if (e.at < cutoff || total > MAX_STORE_BYTES) {
      await fsp.unlink(path.join(uploadDir, e.file)).catch(() => {});
      total -= e.size;
    }
  }
};
sweep().catch(e => logger.error(`Signer sweep failed: ${e.message}`));
setInterval(() => sweep().catch(() => {}), 60 * 60 * 1000).unref();

const router = express.Router();
router.get('/pdf-signer', sendPage(__dirname, 'index.html'));

/** Raw bytes in the body; ?id= groups the files of one signing, ?kind= says which one it is */
router.post('/pdf-signer/upload',
  rateLimit({ windowMs: 60 * 1000, max: 60 }),
  express.raw({ type: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'], limit: MAX_UPLOAD }),
  asyncHandler(async (req, res) => {
    const { id, kind } = req.query;
    if (!ID_RE.test(String(id)) || !KINDS.includes(kind)) return res.status(400).json({ fail: 'Missing logging parameters' });
    const buffer = req.body;
    const type = Buffer.isBuffer(buffer) && buffer.length ? detectType(buffer) : null;
    if (!type || (kind !== 'signature') !== (type === 'pdf')) return res.status(400).json({ fail: 'Request body is not a supported file' });
    await fsp.writeFile(path.join(uploadDir, `${id}_${kind}.${type}`), buffer);
    res.status(201).json({ success: true });
  })
);

/** Usage log, sent once the files above have been uploaded */
router.post('/pdf-signer/log', rateLimit({ windowMs: 60 * 1000, max: 60 }), asyncHandler(async (req, res) => {
  const { id, pdfName, pdfSize, pages, signedPages, signatures, sigName, sigSize, sigType, outputSize } = req.body || {};
  if (!int(signatures)) return res.status(400).json({ fail: 'Missing logging parameters' });
  await pushLog(LOG_KEY, {
    id: ID_RE.test(String(id)) ? id : '',
    pdfName: name(pdfName), pdfSize: int(pdfSize), pages: int(pages), signedPages: int(signedPages), signatures: int(signatures),
    sigName: name(sigName), sigSize: int(sigSize), sigType: String(sigType || '').slice(0, 40), outputSize: int(outputSize),
    ...requestMeta(req)
  });
  res.status(201).json({ success: true });
}));

router.get('/admin/pdf-signer', requirePageAuth, sendPage(__dirname, 'admin.html'));

router.get('/admin/pdf-signer/data', requireAuth, asyncHandler(async (req, res) => {
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

router.get('/admin/pdf-signer/files/:filename', requireAuth, asyncHandler(async (req, res) => {
  const file = path.join(uploadDir, path.basename(req.params.filename));
  if (!fs.existsSync(file)) return res.status(404).json({ fail: 'File not found' });
  res.download(file, path.basename(file));
}));

/** Deletes every stored file of one signing and its log entry */
router.delete('/admin/pdf-signer/signings/:id', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ID_RE.test(id)) return res.status(400).json({ fail: 'Invalid key' });
  for (const file of await fsp.readdir(uploadDir).catch(() => [])) {
    if (file.startsWith(`${id}_`)) await fsp.unlink(path.join(uploadDir, file)).catch(() => {});
  }
  const raw = await redisDb.lrange(LOG_KEY, 0, -1);
  const pipeline = redisDb.pipeline();
  raw.forEach(entry => {
    try { if (JSON.parse(entry).id === id) pipeline.lrem(LOG_KEY, 0, entry); } catch { /* corrupt */ }
  });
  await pipeline.exec();
  res.json({ success: true });
}));

module.exports = { router };
