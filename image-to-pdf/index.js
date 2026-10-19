const express = require('express');
const { sendPage } = require('../util/http');

const router = express.Router();
router.get('/image-to-pdf', sendPage(__dirname, 'index.html'));

module.exports = { router };
