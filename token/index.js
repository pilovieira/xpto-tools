const { redisDb } = require('../util/db');

/** Log token generation actions */
const logTokenAction = async (req, res) => {
  const { type, length, quantity, prefix, separator, groupSize } = req.body || {};
  if (!type || !quantity) {
    return res.status(400).json({ fail: 'Missing logging parameters' });
  }
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const logData = JSON.stringify({
      type,
      length: length || 0,
      quantity,
      prefix: prefix || '',
      separator: separator || 'none',
      groupSize: groupSize || 0,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
    redisDb.lpush('xpto-token:logs', logData, (err) => {
      if (err) {
        console.error(`Failed to push token log: ${err.message}`);
        return res.status(500).json({ fail: 'Database error' });
      }
      redisDb.ltrim('xpto-token:logs', 0, 99);
      res.status(201).json({ success: true });
    });
  } catch (e) {
    res.status(500).json({ fail: e.message });
  }
};

module.exports = { logTokenAction };
