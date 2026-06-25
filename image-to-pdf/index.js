const fs = require('fs');
const path = require('path');

const serveImageToPdfPage = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8'));
};

module.exports = {
  serveImageToPdfPage
};
