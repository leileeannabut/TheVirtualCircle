// Fake Google OAuth + Drive API for local testing only (node dev/mock-google.mjs → http://localhost:8790).
// Implements just what src/storage.js uses: consent redirect, token exchange/refresh, folder search/create,
// multipart upload, download, and about.user.
import http from 'node:http';
import crypto from 'node:crypto';

const files = new Map(); // id → { name, mimeType, parents, bytes }
const tokens = new Set();
const REFRESH = 'mock-refresh-token';
let refreshes = 0;

const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': type }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
const newToken = () => { const t = 'at-' + crypto.randomUUID(); tokens.add(t); return t; };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const chunks = []; for await (const c of req) chunks.push(c); const raw = Buffer.concat(chunks);
  if (url.pathname === '/auth') { // consent screen: approve immediately
    const back = new URL(url.searchParams.get('redirect_uri'));
    if (url.searchParams.get('scope') !== 'https://www.googleapis.com/auth/drive.file') return send(res, 400, 'wrong scope');
    back.searchParams.set('code', 'mock-code'); back.searchParams.set('state', url.searchParams.get('state'));
    res.writeHead(302, { location: back.toString() }); return res.end();
  }
  if (url.pathname === '/token') {
    const f = new URLSearchParams(raw.toString());
    if (f.get('grant_type') === 'authorization_code' && f.get('code') === 'mock-code') return send(res, 200, { access_token: newToken(), refresh_token: REFRESH, expires_in: 3600 });
    if (f.get('grant_type') === 'refresh_token' && f.get('refresh_token') === REFRESH) { refreshes++; return send(res, 200, { access_token: newToken(), expires_in: 3600 }); }
    return send(res, 400, { error: 'invalid_grant' });
  }
  if (url.pathname === '/__stats') return send(res, 200, { refreshes, files: [...files].map(([id, f]) => ({ id, name: f.name, mimeType: f.mimeType, parents: f.parents, size: f.bytes ? f.bytes.length : 0 })) });

  if (!tokens.has((req.headers.authorization || '').replace('Bearer ', ''))) return send(res, 401, { error: 'unauthorized' });
  if (url.pathname === '/drive/v3/about') return send(res, 200, { user: { emailAddress: 'founder@gmail.com' } });
  if (url.pathname === '/drive/v3/files' && req.method === 'GET') {
    const q = url.searchParams.get('q') || '';
    const name = (q.match(/name = '((?:[^'\\]|\\.)*)'/) || [])[1]?.replace(/\\'/g, "'");
    const parent = (q.match(/'([^']+)' in parents/) || [])[1];
    return send(res, 200, { files: [...files].filter(([, f]) => f.name === name && (!parent || f.parents.includes(parent))).map(([id]) => ({ id })) });
  }
  if (url.pathname === '/drive/v3/files' && req.method === 'POST') {
    const m = JSON.parse(raw.toString()); const id = 'fld_' + crypto.randomUUID().slice(0, 8);
    files.set(id, { name: m.name, mimeType: m.mimeType, parents: m.parents || [] }); return send(res, 200, { id });
  }
  if (url.pathname === '/upload/drive/v3/files' && req.method === 'POST') {
    const boundary = (req.headers['content-type'].match(/boundary=(\S+)/) || [])[1];
    const sep = Buffer.from(`--${boundary}`);
    const parts = []; let at = raw.indexOf(sep);
    while (at >= 0) { const next = raw.indexOf(sep, at + sep.length); if (next < 0) break; parts.push(raw.subarray(at + sep.length + 2, next - 2)); at = next; }
    const body = (p) => p.subarray(p.indexOf('\r\n\r\n') + 4);
    const meta = JSON.parse(body(parts[0]).toString()); const type = (parts[1].toString().match(/content-type: ([^\r]+)/i) || [])[1];
    if (!meta.parents?.[0] || !files.has(meta.parents[0])) return send(res, 404, { error: 'parent not found' });
    const id = 'file_' + crypto.randomUUID().slice(0, 8);
    files.set(id, { name: meta.name, mimeType: type, parents: meta.parents, bytes: Buffer.from(body(parts[1])) }); return send(res, 200, { id });
  }
  const m = url.pathname.match(/^\/drive\/v3\/files\/([^/]+)$/);
  if (m && url.searchParams.get('alt') === 'media') { const f = files.get(m[1]); return f?.bytes ? send(res, 200, f.bytes, f.mimeType) : send(res, 404, { error: 'not found' }); }
  send(res, 404, { error: 'not found' });
}).listen(8790, () => console.log('Mock Google on http://localhost:8790'));
