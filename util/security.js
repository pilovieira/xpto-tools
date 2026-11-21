/* Intrusion guard: spots scanners / brute force by IP, blocks them for a while and pushes an alert to the owner's phone (ntfy).
   Runs as the first middleware, so blocked clients cost almost nothing. Config (all optional) in .env:
   SECURITY_NTFY_TOPIC (secret topic; without it blocking still works but nothing is pushed), SECURITY_NTFY_URL,
   SECURITY_BLOCK_HOURS (24), SECURITY_SCAN_THRESHOLD (10 points/min), SECURITY_ALLOW_IPS (comma separated). */
const logger = require('../logger');
const { redisDb } = require('./db');
const { clientIp } = require('./http');
const { pushLog, readLogs, scanKeys } = require('./logs');

const TOPIC = (process.env.SECURITY_NTFY_TOPIC || '').trim();
const NTFY_URL = (process.env.SECURITY_NTFY_URL || 'https://ntfy.sh').replace(/\/$/, '');
const SITE_URL = process.env.SECURITY_SITE_URL || 'https://xpto.in';
const BLOCK_MS = (Number(process.env.SECURITY_BLOCK_HOURS) || 24) * 3600 * 1000;
const THRESHOLD = Number(process.env.SECURITY_SCAN_THRESHOLD) || 10;
const WINDOW_MS = 60 * 1000;
const LOGIN_MAX = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_BLOCK_MS = 3600 * 1000;
const MAX_SCAN_ALERTS_PER_HOUR = 8;
const ALLOW = new Set((process.env.SECURITY_ALLOW_IPS || '').split(',').map(s => s.trim()).filter(Boolean));

const INCIDENTS_KEY = 'xpto-sec:incidents';
const BLOCK_PREFIX = 'xpto-sec:block:';
const ADMIN_IPS_KEY = 'xpto-sec:admin-ips';

/* Paths no real visitor ever requests: secrets, VCS folders, PHP/CMS probes, traversal… */
const HIGH_SIGNAL = new RegExp([
  '(^|/)\\.(env|git|svn|aws|ssh|ds_store|htaccess|htpasswd|npmrc|docker|vscode|idea)',
  '\\.(php\\d?|asp|aspx|jsp|cgi|bak|old|sql|swp|ini|ya?ml|log|tar|gz|zip|rar|7z|pem|key)(\\?|$)',
  'wp-(admin|login|content|includes|json)', 'xmlrpc', 'phpmyadmin', 'phpinfo', 'cgi-bin', 'actuator', 'vendor/', 'node_modules',
  'etc/passwd', '\\.\\./', '%2e%2e', 'boaform', 'solr', 'jenkins', '/shell', 'eval-stdin', 'config\\.(json|js)$', '/\\.well-known/security'
].join('|'), 'i');
const BENIGN_404 = /^\/(favicon\.ico|robots\.txt|apple-touch-icon.*|sitemap\.xml|\.well-known\/.*)$/i;

const blocked = new Map();   // key -> { key, ip, reason, at, until, hits }
const scans = new Map();     // key -> { start, points, paths:Set }
const loginFails = new Map();// key -> { start, count }
let scanAlerts = { hour: 0, count: 0 };
let totalBlockedHits = 0;
let warnedNoTopic = false;

const isPrivate = ip => /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(ip) || ip === '::1' || /^(fe80|fc|fd)/i.test(ip) || ip === 'unknown';

/** IPv4 as is; IPv6 collapsed to its /64, because attackers rotate inside the prefix they own */
const keyOf = ip => {
  if (!ip.includes(':')) return ip;
  try {
    const host = new URL(`http://[${ip}]`).hostname.slice(1, -1);
    const [head, tail] = host.split('::');
    let a = head ? head.split(':') : [];
    if (tail !== undefined) {
      const b = tail ? tail.split(':') : [];
      while (a.length + b.length < 8) a.push('0');
      a = a.concat(b);
    }
    return `${a.slice(0, 4).map(x => x.padStart(4, '0')).join(':')}::/64`;
  } catch {
    return ip;
  }
};

const exempt = ip => isPrivate(ip) || ALLOW.has(ip);

/* ── Push notification (ntfy) ─────────────────────────────────────── */
async function notify({ title, message, priority = 3, tags = 'warning' }) {
  if (!TOPIC) {
    if (!warnedNoTopic) { warnedNoTopic = true; logger.warn('SECURITY_NTFY_TOPIC not set: security alerts are logged but not pushed'); }
    return false;
  }
  try {
    const res = await fetch(`${NTFY_URL}/${encodeURIComponent(TOPIC)}`, {
      method: 'POST',
      headers: { Title: title, Priority: String(priority), Tags: tags, Click: `${SITE_URL}/admin/security` },
      body: message,
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (e) {
    logger.warn(`Security alert could not be sent: ${e.message}`);
    return false;
  }
}

/* ── Blocking ─────────────────────────────────────────────────────── */
async function block(ip, reason, ms = BLOCK_MS) {
  const key = keyOf(ip);
  const entry = { key, ip, reason, at: new Date().toISOString(), until: Date.now() + ms, hits: 0 };
  blocked.set(key, entry);
  await redisDb.setex(BLOCK_PREFIX + key, Math.ceil(ms / 1000), JSON.stringify(entry)).catch(e => logger.error(`Redis: ${e.message}`));
  return entry;
}

async function unblock(key) {
  blocked.delete(key);
  await redisDb.del(BLOCK_PREFIX + key);
}

const listBlocks = () => [...blocked.values()].filter(b => b.until > Date.now()).sort((a, b) => b.until - a.until);

/** Reload blocks that survived a restart */
(async () => {
  try {
    for (const k of await scanKeys(`${BLOCK_PREFIX}*`)) {
      const entry = JSON.parse(await redisDb.get(k) || 'null');
      if (entry && entry.until > Date.now()) blocked.set(entry.key, entry);
    }
    if (blocked.size) logger.info(`Security: ${blocked.size} blocked IP(s) restored`);
  } catch (e) { logger.warn(`Security: could not restore blocks (${e.message})`); }
})();

/* ── Detection ────────────────────────────────────────────────────── */
async function raise(req, { type, ip, key, points, samples, blockMs, reason, priority, tags, title, summary, capped }) {
  // The owner is never locked out of their own site
  const { isAuth } = require('./auth');
  if (await isAuth(req).catch(() => false)) return;

  const entry = await block(ip, reason, blockMs);
  const hour = Math.floor(Date.now() / 3600e3);
  if (scanAlerts.hour !== hour) scanAlerts = { hour, count: 0 };
  const allowed = !capped || ++scanAlerts.count <= MAX_SCAN_ALERTS_PER_HOUR;
  const country = req.headers['cf-ipcountry'];
  const ua = String(req.headers['user-agent'] || 'Unknown').slice(0, 300);

  const sent = allowed && await notify({
    title, priority, tags,
    message: `${summary}\n${samples.slice(0, 8).join('  ')}\nBlocked for ${Math.round(blockMs / 3600e3 * 10) / 10} h${country ? ` · ${country}` : ''}\nUA: ${ua.slice(0, 120)}`
  });
  logger.warn(`Security [${type}] ${ip} blocked: ${summary}`);
  await pushLog(INCIDENTS_KEY, {
    type, ip, key, points, samples: samples.slice(0, 12), userAgent: ua, country: country || '',
    blockedUntil: new Date(entry.until).toISOString(), notified: !!sent, timestamp: new Date().toISOString()
  }).catch(() => {});
}

function onScanHit(req, path, status) {
  const ip = clientIp(req);
  if (exempt(ip)) return;
  const high = HIGH_SIGNAL.test(path);
  if (!high && !(status === 404 && !BENIGN_404.test(path))) return;
  const key = keyOf(ip);
  const now = Date.now();
  let s = scans.get(key);
  if (!s || now - s.start > WINDOW_MS) { s = { start: now, points: 0, paths: new Set() }; scans.set(key, s); }
  if (s.paths.has(path)) return;               // reloading the same dead link is not a scan
  s.paths.add(path);
  s.points += high ? 3 : 1;
  if (s.points >= THRESHOLD && !blocked.has(key)) {
    scans.delete(key);
    raise(req, {
      type: 'scan', ip, key, points: s.points, samples: [...s.paths], blockMs: BLOCK_MS, capped: true,
      reason: 'Scanning for sensitive files', priority: 3, tags: 'warning,shield',
      title: `XPTO scan blocked ${ip}`.slice(0, 120),
      summary: `${ip} made ${s.paths.size} suspicious requests in ${Math.round((now - s.start) / 1000)}s`
    }).catch(e => logger.error(`Security: ${e.message}`));
  }
}

async function onAdminLogin(req, status) {
  const ip = clientIp(req);
  if (exempt(ip)) return;
  const key = keyOf(ip);
  const now = Date.now();
  if (status === 200) {
    loginFails.delete(key);
    // Only a login from an IP never seen before is worth a buzz
    if (await redisDb.sadd(ADMIN_IPS_KEY, key) === 1) {
      const ua = String(req.headers['user-agent'] || '').slice(0, 120);
      notify({ title: 'XPTO admin login from new IP', priority: 4, tags: 'key', message: `${ip}${req.headers['cf-ipcountry'] ? ` · ${req.headers['cf-ipcountry']}` : ''}\nUA: ${ua}` });
      pushLog(INCIDENTS_KEY, { type: 'admin-login', ip, key, points: 0, samples: [], userAgent: ua, country: req.headers['cf-ipcountry'] || '', blockedUntil: '', notified: !!TOPIC, timestamp: new Date().toISOString() }).catch(() => {});
    }
    return;
  }
  if (status !== 401) return;
  let f = loginFails.get(key);
  if (!f || now - f.start > LOGIN_WINDOW_MS) { f = { start: now, count: 0 }; loginFails.set(key, f); }
  if (++f.count >= LOGIN_MAX && !blocked.has(key)) {
    loginFails.delete(key);
    raise(req, {
      type: 'login-bruteforce', ip, key, points: f.count, samples: ['POST /admin/login'], blockMs: LOGIN_BLOCK_MS, capped: false,
      reason: 'Repeated failed admin logins', priority: 5, tags: 'rotating_light,key',
      title: `XPTO admin brute force from ${ip}`.slice(0, 120),
      summary: `${f.count} failed admin logins from ${ip} in ${Math.round((now - f.start) / 60000)} min`
    }).catch(e => logger.error(`Security: ${e.message}`));
  }
}

/** First middleware: drop blocked clients, watch everyone else */
function guard(req, res, next) {
  const ip = clientIp(req);
  const entry = blocked.get(keyOf(ip));
  if (entry) {
    if (entry.until > Date.now()) {
      entry.hits++; totalBlockedHits++;
      return res.status(403).end();
    }
    blocked.delete(entry.key);
  }
  res.on('finish', () => {
    let path = req.path;
    try { path = decodeURIComponent(req.originalUrl.split('?')[0]); } catch { /* keep raw */ }
    onScanHit(req, path, res.statusCode);
    if (req.method === 'POST' && req.path === '/admin/login') onAdminLogin(req, res.statusCode).catch(() => {});
  });
  next();
}

const readIncidents = () => readLogs(INCIDENTS_KEY);
const stats = () => ({ blockedHits: totalBlockedHits, topic: !!TOPIC, threshold: THRESHOLD, blockHours: BLOCK_MS / 3600e3 });

module.exports = { guard, block, unblock, listBlocks, readIncidents, notify, stats, keyOf };
