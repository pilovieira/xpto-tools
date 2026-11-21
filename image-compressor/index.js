const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const express = require('express');
const logger = require('../logger');
const { sendPage, asyncHandler, rateLimit, requestMeta } = require('../util/http');
const { pushLog, readLogs } = require('../util/logs');
const { redisDb } = require('../util/db');
const { requireAuth, requirePageAuth } = require('../util/auth');

const LOG_KEY = 'xpto-img:logs';
const STATS_KEY = 'xpto-img:stats';
const MAX_UPLOAD = '40mb';
const RETENTION_MS = (Number(process.env.IMG_RETENTION_DAYS) || 30) * 24 * 60 * 60 * 1000;
const MAX_STORE_BYTES = (Number(process.env.IMG_MAX_STORE_MB) || 2048) * 1024 * 1024;
const uploadDir = process.env.IMG_UPLOAD_DIR || path.join(__dirname, '..', 'data', 'images');
fs.mkdirSync(uploadDir, { recursive: true });

const FORMATS = ['jpeg', 'webp'];
const MODES = ['target', 'quality'];
const int = v => Math.max(Math.round(Number(v)) || 0, 0);

/** Identify the image by its magic bytes — the declared Content-Type is not trusted */
const detectType = b => {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', mime: 'image/png' };
  if (b.length > 12 && b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  return null;
};

/** Delete files past the retention window, then the oldest ones while the store is over its size budget */
const sweep = async () => {
  const entries = [];
  for (const name of await fsp.readdir(uploadDir)) {
    try {
      const st = await fsp.stat(path.join(uploadDir, name));
      if (st.isFile()) entries.push({ name, size: st.size, at: st.birthtimeMs || st.mtimeMs });
    } catch { /* vanished */ }
  }
  const cutoff = Date.now() - RETENTION_MS;
  let total = entries.reduce((s, e) => s + e.size, 0);
  for (const e of entries.sort((a, b) => a.at - b.at)) {
    if (e.at < cutoff || total > MAX_STORE_BYTES) {
      await fsp.unlink(path.join(uploadDir, e.name)).catch(() => {});
      total -= e.size;
    }
  }
};
sweep().catch(e => logger.error(`Image sweep failed: ${e.message}`));
setInterval(() => sweep().catch(() => {}), 60 * 60 * 1000).unref();

const resolveUpload = name => path.join(uploadDir, path.basename(name));

const router = express.Router();
router.get('/image-compressor', sendPage(__dirname, 'index.html'));

/** Raw image bytes in the body; the filename and the compression result travel in headers */
router.post('/image-compressor/upload',
  rateLimit({ windowMs: 60 * 1000, max: 60 }),
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_UPLOAD }),
  asyncHandler(async (req, res) => {
    const buffer = req.body;
    const type = Buffer.isBuffer(buffer) && buffer.length ? detectType(buffer) : null;
    if (!type) return res.status(400).json({ fail: 'Request body is not a supported image' });

    let filename = 'image';
    try { filename = decodeURIComponent(req.headers['x-filename'] || filename); } catch { /* keep default */ }
    filename = filename.slice(0, 200);

    let meta = {};
    try { meta = JSON.parse(decodeURIComponent(req.headers['x-meta'] || '{}')) || {}; } catch { /* ignore */ }

    const savedFilename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${type.ext}`;
    await fsp.writeFile(path.join(uploadDir, savedFilename), buffer);

    const outSize = int(meta.outSize);
    await pushLog(LOG_KEY, {
      filename,
      savedFilename,
      mime: type.mime,
      origSize: buffer.length,
      outSize,
      origWidth: int(meta.origWidth), origHeight: int(meta.origHeight),
      width: int(meta.width), height: int(meta.height),
      format: FORMATS.includes(meta.format) ? meta.format : 'jpeg',
      mode: MODES.includes(meta.mode) ? meta.mode : 'target',
      quality: Math.min(int(meta.quality), 100),
      targetMb: Math.min(Number(meta.targetMb) || 0, 1000),
      maxDim: int(meta.maxDim),
      kept: !!meta.kept,
      ...requestMeta(req)
    });
    await redisDb.multi()
      .hincrby(STATS_KEY, 'count', 1)
      .hincrby(STATS_KEY, 'bytesIn', buffer.length)
      .hincrby(STATS_KEY, 'bytesOut', outSize || buffer.length)
      .exec();
    res.status(201).json({ success: true });
  })
);

router.get('/admin/image-compressor', requirePageAuth, sendPage(__dirname, 'admin.html'));

router.get('/admin/image-compressor/data', requireAuth, asyncHandler(async (req, res) => {
  const [logs, totals] = await Promise.all([readLogs(LOG_KEY), redisDb.hgetall(STATS_KEY)]);
  const names = await fsp.readdir(uploadDir).catch(() => []);
  const files = (await Promise.all(names.map(async filename => {
    try {
      const { size, birthtime } = await fsp.stat(path.join(uploadDir, filename));
      return { filename, size, birthtime };
    } catch {
      return null;
    }
  }))).filter(Boolean).sort((a, b) => b.birthtime - a.birthtime);
  res.json({
    logs,
    files,
    totals: { count: int(totals.count), bytesIn: int(totals.bytesIn), bytesOut: int(totals.bytesOut) }
  });
}));

router.get('/admin/image-compressor/files/:filename', requireAuth, asyncHandler(async (req, res) => {
  const file = resolveUpload(req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).json({ fail: 'File not found' });
  if (req.query.inline === '1') return res.sendFile(file, { headers: { 'Content-Security-Policy': "default-src 'none'; sandbox" } });
  res.download(file, path.basename(file));
}));

router.delete('/admin/image-compressor/files/:filename', requireAuth, asyncHandler(async (req, res) => {
  const name = path.basename(req.params.filename);
  await fsp.unlink(resolveUpload(name)).catch(e => { if (e.code !== 'ENOENT') throw e; });
  const raw = await redisDb.lrange(LOG_KEY, 0, -1);
  const pipeline = redisDb.pipeline();
  raw.forEach(entry => {
    try { if (JSON.parse(entry).savedFilename === name) pipeline.lrem(LOG_KEY, 0, entry); } catch { /* corrupt */ }
  });
  await pipeline.exec();
  res.json({ success: true });
}));

module.exports = { router };
