const fs = require('fs');
const path = require('path');

/** Serve public pdf-signer tool page */
const servePdfSignerPage = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8'));
};

module.exports = {
  servePdfSignerPage
};
