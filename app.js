const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const path = require('path');
const logger = require('./logger');

dotenv.config();

const app = express();
app.use(logger.requestLogger);
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 5000;
app.listen(port, () => logger.info(`Service started. Listening on port ${port}!`));

const { adminPage, shortenerAdminPage, base58AdminPage, pdfSplitterAdminPage, adminLogin, adminLogout, shortenerAdminData, base58AdminData, shortenerAdminDeleteKey, shortenerAdminCreateKey } = require('./admin');

//favicon
app.get('/favicon.ico', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'image/png' });
  res.end(fs.readFileSync(path.join(__dirname, 'public', 'favicon.png')));
});

//admin
app.get('/admin', adminPage);
app.post('/admin/login', adminLogin);
app.get('/admin/logout', adminLogout);
app.get('/admin/shortener', shortenerAdminPage);

//pdf-splitter
const { servePdfSplitterPage, uploadPdf, pdfAdminData, downloadPdfFile, deletePdfFile } = require('./pdf-splitter');
app.get('/pdf-splitter', servePdfSplitterPage);
app.post('/pdf-splitter/upload', uploadPdf);
app.get('/admin/pdf-splitter', pdfSplitterAdminPage);
app.get('/admin/pdf-splitter/data', pdfAdminData);
app.get('/admin/pdf-splitter/files/:filename', downloadPdfFile);
app.delete('/admin/pdf-splitter/files/:filename', deletePdfFile);

//base58
const { logBase58Action } = require('./base58');
app.get('/base58', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(path.join(__dirname, 'base58', 'index.html'), 'utf-8'));
});
app.post('/base58/log', logBase58Action);
app.get('/admin/base58-admin', base58AdminPage);
app.get('/admin/base58/data', base58AdminData);

//shortener
const { createShortUrl, redirectToUrl, shortenerPage } = require('./shortener');
app.get('/shortener', shortenerPage);
app.post('/shortener', createShortUrl);
app.get('/admin/shortener/data', shortenerAdminData);
app.delete('/admin/shortener/keys/:key', shortenerAdminDeleteKey);
app.post('/admin/shortener/keys', shortenerAdminCreateKey);

//token generator
app.get('/token', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(path.join(__dirname, 'token', 'index.html'), 'utf-8'));
});

app.get('/*', (req, res) => {
  let key = req.url.replace('/', '');
  if (key) {
    redirectToUrl(key, req, res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(__dirname, 'tools', 'index.html'), 'utf-8'));
  }
});
