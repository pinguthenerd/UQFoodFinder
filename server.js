#!/usr/bin/env node
/**
 * UQ Free Food Finder — Local Proxy Server
 * Uses only Node.js built-in modules (no npm install needed)
 * Proxies requests to Anthropic API to bypass browser CORS restrictions
 *
 * Usage: node server.js
 * Then open: http://localhost:3747
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = process.env.PORT || 3747;
const ANTHROPIC_HOST = 'api.anthropic.com';

// ── MIME TYPES ────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

// ── SERVER ────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname  = parsedUrl.pathname;

  // ── CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version, anthropic-beta');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── PROXY: /api/anthropic → https://api.anthropic.com
  if (pathname.startsWith('/api/anthropic')) {
    const apiPath = pathname.replace('/api/anthropic', '');
    proxyToAnthropic(req, res, apiPath);
    return;
  }

  // ── STATIC FILE SERVER
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  // Security: prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA fallback: serve index.html
        fs.readFile(path.join(__dirname, 'index.html'), (e2, d2) => {
          if (e2) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(d2);
        });
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

// ── ANTHROPIC PROXY ───────────────────────────────────────────────────────
function proxyToAnthropic(req, res, apiPath) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    const options = {
      hostname: ANTHROPIC_HOST,
      port: 443,
      path: apiPath || '/v1/messages',
      method: req.method,
      headers: {
        'Content-Type':      'application/json',
        'anthropic-version': req.headers['anthropic-version'] || '2023-06-01',
        'x-api-key':         process.env.ANTHROPIC_API_KEY || '',  // ← from env
        'Content-Length':    Buffer.byteLength(body),
      },
    };
    const proxyReq = https.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      proxyRes.pipe(res);
    });
    proxyReq.on('error', err => {
      res.writeHead(502);
      res.end(JSON.stringify({ error: { message: 'Proxy error: ' + err.message } }));
    });
    proxyReq.write(body);
    proxyReq.end();
  });
}

// ── START ─────────────────────────────────────────────────────────────────
server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  🍕  UQ Free Food Finder');
  console.log('  ─────────────────────────────────────');
  console.log(`  ✅  Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('  Open the URL above in your browser.');
  console.log('  Press Ctrl+C to stop the server.');
  console.log('');
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ❌  Port ${PORT} is already in use.`);
    console.error(`     Try: lsof -ti:${PORT} | xargs kill`);
  } else {
    console.error('\n  ❌  Server error:', err.message);
  }
  process.exit(1);
});
