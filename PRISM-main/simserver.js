/**
 * PRISM Simulation Server
 * Serves the 4 simulation pages (Amazon, Flipkart, JioMart, Brand) on port 5174
 * Run: node simserver.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5174;
const SIM_DIR = path.join(__dirname, 'simulation');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // CORS headers for API cross-origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Default to amazon.html for root
  let urlPath = req.url === '/' ? '/amazon.html' : req.url;

  // Strip query strings
  urlPath = urlPath.split('?')[0];

  const filePath = path.join(SIM_DIR, urlPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(SIM_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
          <head><title>PRISM Simulation</title></head>
          <body style="font-family:Inter,sans-serif;background:#0f172a;color:#94a3b8;padding:40px;text-align:center">
            <h1 style="color:#f1f5f9">PRISM Simulation Pages</h1>
            <p>Navigate to one of the simulation pages:</p>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap">
              <a href="/amazon.html" style="color:#FF9900;text-decoration:none;padding:12px 24px;border:1px solid #FF9900;border-radius:8px">🛒 Amazon</a>
              <a href="/flipkart.html" style="color:#2874f0;text-decoration:none;padding:12px 24px;border:1px solid #2874f0;border-radius:8px">🛍 Flipkart</a>
              <a href="/jiomart.html" style="color:#EE3030;text-decoration:none;padding:12px 24px;border:1px solid #EE3030;border-radius:8px">🏪 JioMart</a>
              <a href="/brand.html" style="color:#8b5cf6;text-decoration:none;padding:12px 24px;border:1px solid #8b5cf6;border-radius:8px">✨ Brand Store</a>
            </div>
            <p style="margin-top:32px"><a href="http://localhost:5173" style="color:#3b82f6">← Back to PRISM Dashboard</a></p>
          </body>
          </html>
        `);
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║         PRISM Simulation Server Running           ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(`\n  Amazon:   http://localhost:${PORT}/amazon.html`);
  console.log(`  Flipkart: http://localhost:${PORT}/flipkart.html`);
  console.log(`  JioMart:  http://localhost:${PORT}/jiomart.html`);
  console.log(`  Brand:    http://localhost:${PORT}/brand.html\n`);
  console.log('  PRISM Dashboard: http://localhost:5173\n');
});
