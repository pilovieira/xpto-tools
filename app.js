require('dotenv').config();

const path = require('path');
const express = require('express');
const logger = require('./logger');
const { redisDb } = require('./util/db');

const isProd = process.env.NODE_ENV === 'production';
const app = express();

app.disable('x-powered-by');
if (process.env.TRUST_PROXY) {
  // "1" -> number of proxy hops, "true"/"false" -> boolean, anything else (e.g. "loopback") passes through
  const v = process.env.TRUST_PROXY;
  app.set('trust proxy', /^\d+$/.test(v) ? Number(v) : v === 'true' ? true : v === 'false' ? false : v);
}

app.use(logger.requestLogger);
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  next();
});

app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '1h' : 0 }));
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, 'public', 'favicon.png')));
app.get('/healthz', async (req, res) => {
  try {
    await redisDb.ping();
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

// The PDF upload parses its own (raw, 50 MB) body; everything else is small JSON/forms
const jsonBody = express.json({ limit: '100kb' });
const formBody = express.urlencoded({ extended: false, limit: '100kb' });
app.use((req, res, next) => (req.path === '/pdf-splitter/upload' ? next() : jsonBody(req, res, () => formBody(req, res, next))));

// Tool modules – each one owns its public pages, API and admin dashboard
app.use(require('./admin').router);
app.use(require('./shortener').router);
app.use(require('./base58').router);
app.use(require('./token').router);
app.use(require('./json-formatter').router);
app.use(require('./pdf-splitter').router);
app.use(require('./pdf-signer').router);
app.use(require('./image-to-pdf').router);

// Home page, then short links
const { redirectToUrl } = require('./shortener');
app.get('/', require('./util/http').sendPage(__dirname, 'tools', 'index.html'));
app.get('/:key', redirectToUrl);

// Errors (oversized bodies, malformed JSON, redis failures…)
app.use((err, req, res, next) => {
  if (err.status && err.status < 500) return res.status(err.status).json({ fail: err.type === 'entity.too.large' ? 'Payload too large' : 'Bad request' });
  logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
  res.status(500).json({ fail: 'Internal server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => logger.info(`Service started. Listening on port ${port}!`));
