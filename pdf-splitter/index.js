const fs = require('fs');
const path = require('path');
const { redisDb } = require('../util/db');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/** Serve public pdf-splitter tool page */
const servePdfSplitterPage = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8'));
};

/** Upload original PDF, log transaction, save file */
const uploadPdf = async (req, res) => {
  const { filename, fileData } = req.body || {};
  if (!filename || !fileData) {
    return res.status(400).json({ fail: 'Missing filename or fileData' });
  }

  try {
    // Extract client IP address
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Decode base64 data
    const buffer = Buffer.from(fileData, 'base64');
    const filesize = buffer.length;

    // Create a unique filename to avoid collision
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const savedFilename = `${timestamp}_${cleanFilename}`;
    const filePath = path.join(uploadDir, savedFilename);

    // Save to filesystem
    fs.writeFileSync(filePath, buffer);

    // Log metadata in Redis list
    const logEntry = JSON.stringify({
      filename,
      filesize,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      savedFilename
    });

    redisDb.lpush('xpto-pdf:logs', logEntry, (err) => {
      if (err) {
        console.error(`Failed to push PDF log: ${err.message}`);
        return res.status(500).json({ fail: 'Database error storing log' });
      }
      redisDb.ltrim('xpto-pdf:logs', 0, 99); // Keep last 100 entries
      res.status(201).json({ success: true, savedFilename });
    });
  } catch (e) {
    console.error('PDF upload/log error:', e);
    res.status(500).json({ fail: e.message });
  }
};

/** Get pdf-splitter logs and files for admin */
const pdfAdminData = async (req, res) => {
  const { isAuth } = require('../util/auth');
  if (!await isAuth(req)) {
    return res.status(401).json({ fail: 'Unauthorized' });
  }

  // Fetch logs from Redis
  redisDb.lrange('xpto-pdf:logs', 0, 99, (err, logs) => {
    if (err) return res.status(500).json({ fail: err.message });
    
    const logList = (logs || []).map(l => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);

    // Scan uploads directory to see actual files on disk
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        return res.status(200).json({ logs: logList, files: [] });
      }

      const fileList = files.map(file => {
        try {
          const filePath = path.join(uploadDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            birthtime: stats.birthtime
          };
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Sort files by date descending
      fileList.sort((a, b) => b.birthtime - a.birthtime);

      res.status(200).json({ logs: logList, files: fileList });
    });
  });
};

/** Download a saved original PDF */
const downloadPdfFile = async (req, res) => {
  const { isAuth } = require('../util/auth');
  if (!await isAuth(req)) {
    return res.status(401).json({ fail: 'Unauthorized' });
  }

  const filename = req.params.filename;
  if (!filename) return res.status(400).json({ fail: 'Filename is required' });

  // Prevent path traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(uploadDir, safeFilename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, safeFilename);
  } else {
    res.status(404).json({ fail: 'File not found' });
  }
};

/** Delete a saved original PDF and remove it from logs */
const deletePdfFile = async (req, res) => {
  const { isAuth } = require('../util/auth');
  if (!await isAuth(req)) {
    return res.status(401).json({ fail: 'Unauthorized' });
  }

  const filename = req.params.filename;
  if (!filename) return res.status(400).json({ fail: 'Filename is required' });

  const safeFilename = path.basename(filename);
  const filePath = path.join(uploadDir, safeFilename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Also remove from Redis logs list
    redisDb.lrange('xpto-pdf:logs', 0, -1, (err, logs) => {
      if (err || !logs) return res.status(200).json({ success: true });

      const pipeline = redisDb.pipeline();
      logs.forEach(l => {
        try {
          const parsed = JSON.parse(l);
          if (parsed.savedFilename === safeFilename) {
            pipeline.lrem('xpto-pdf:logs', 0, l);
          }
        } catch (e) {}
      });

      pipeline.exec((err) => {
        if (err) console.error('Failed to clean up logs on delete:', err);
        res.status(200).json({ success: true });
      });
    });
  } catch (e) {
    res.status(500).json({ fail: e.message });
  }
};

module.exports = {
  servePdfSplitterPage,
  uploadPdf,
  pdfAdminData,
  downloadPdfFile,
  deletePdfFile
};
