const express = require('express');
const { sendPage, asyncHandler } = require('../util/http');
const { isAuth, adminLogin, adminLogout, session } = require('../util/auth');

const router = express.Router();

/** Hub when logged in, login form otherwise */
const hub = sendPage(__dirname, 'hub.html');
const login = sendPage(__dirname, 'login.html');
router.get('/admin', asyncHandler(async (req, res, next) => {
  (await isAuth(req) ? hub : login)(req, res, next);
}));

router.post('/admin/login', adminLogin);
router.get('/admin/logout', adminLogout);
router.get('/api/session', session);

module.exports = { router };
