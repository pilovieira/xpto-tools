const Redis = require('ioredis');
const logger = require('../logger');

const redisDb = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || process.env.REDIS_PASS || undefined
});

redisDb.on('error', e => logger.error(`Redis: ${e.message}`));

module.exports = { redisDb };
