const { redisDb } = require('./db');

const MAX_LOGS = 100;

/** Push a JSON entry to a capped Redis list (newest first) */
const pushLog = (listKey, entry) =>
  redisDb.multi().lpush(listKey, JSON.stringify(entry)).ltrim(listKey, 0, MAX_LOGS - 1).exec();

/** Read and parse a capped log list, skipping corrupt entries */
const readLogs = async listKey => {
  const raw = await redisDb.lrange(listKey, 0, MAX_LOGS - 1);
  return raw.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
};

/** Collect all keys matching a pattern using SCAN (non-blocking, unlike KEYS) */
const scanKeys = pattern => new Promise((resolve, reject) => {
  const found = [];
  const stream = redisDb.scanStream({ match: pattern, count: 200 });
  stream.on('data', keys => found.push(...keys));
  stream.on('end', () => resolve(found));
  stream.on('error', reject);
});

module.exports = { pushLog, readLogs, scanKeys };
