// Production-mode check of first-run setup (no DEV_MODE, no SMS provider), using Node's built-in SQLite in place of D1.
// Covers: sign-up works without SMS, claiming Founder with SETUP_CODE (once), what the setup status reveals, and the
// clear error when the database isn't bound.   node dev/setup-sim.mjs   (Node 22.13+)
import { DatabaseSync } from 'node:sqlite';
const { handleApi } = await import('../src/api.js');

const sq = new DatabaseSync(':memory:');
const rows = (r) => r.map((x) => ({ ...x }));
function prepare(sql) {
  let args = [];
  const st = {
    bind(...a) { args = a; return st; },
    async first() { const r = sq.prepare(sql).get(...args); return r ? { ...r } : null; },
    async all() { return { results: rows(sq.prepare(sql).all(...args)) }; },
    async run() { const r = sq.prepare(sql).run(...args); return { meta: { changes: Number(r.changes) } }; },
    exec() { const p = sq.prepare(sql); return /^\s*(SELECT|WITH)/i.test(sql) ? { results: rows(p.all(...args)) } : { meta: { changes: Number(p.run(...args).changes) } }; },
  };
  return st;
}
const D1 = { prepare, async batch(list) { sq.exec('BEGIN'); try { const out = list.map((s) => s.exec()); sq.exec('COMMIT'); return out; } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
const SITE = 'https://circle.example';
let env = { DB: D1, PEPPER: 'prod-pepper-for-test' }; // no SETUP_CODE yet, no SEMAPHORE_KEY, no DEV_MODE
let ip = 1;
async function call(path, body, cookie, from) {
  const headers = { origin: SITE, 'cf-connecting-ip': from || '10.0.' + Math.floor(ip / 200) + '.' + (ip++ % 200) };
  if (body) headers['content-type'] = 'application/json'; if (cookie) headers.cookie = cookie;
  const pending = [];
  const res = await handleApi(new Request(SITE + '/api/' + path, body ? { method: 'POST', headers, body: JSON.stringify(body) } : { headers }), env, { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  return { status: res.status, type: res.headers.get('content-type'), cookie: (res.headers.get('set-cookie') || '').split(';')[0], body: await res.json() };
}
let failures = 0;
const q = (sql, ...a) => rows(sq.prepare(sql).all(...a));
const ok = (cond, msg) => { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) failures++; };
const join = (name, email, mobile, type = 'va') => call('auth/register', { name, email, mobile, password: 'correct-horse-battery', consent: true, adult: true, account_type: type, tier: 'newbie', region: 'Luzon', hub: 'luzon-vas' });
let n = 100; const anyone = () => join('Person ' + n, `p${n}@x.ph`, '0917555' + String(n++).padStart(4, '0'));

console.log('Sign-up without an SMS provider');
const cfg = await call('config'); ok(cfg.status === 200 && cfg.body.sms === false, 'Site reports that SMS codes are off');
const owner = await join('Site Owner', 'owner@x.ph', '09171230001', 'client');
ok(owner.status === 200 && owner.body.next === 'kyc' && owner.cookie.startsWith('vc_session='), 'Sign-up goes straight to the ID step (no code that could never arrive)');
const me1 = await call('me', null, owner.cookie); ok(me1.body.user && me1.body.user.status === 'pending_kyc', 'The new member is signed in and waiting for ID verification');
sq.prepare("UPDATE users SET status = 'pending_otp' WHERE email = 'owner@x.ph'").run(); // someone who signed up while SMS was expected
ok((await call('me', null, owner.cookie)).body.user.status === 'pending_kyc', 'Members stuck at the code step move on automatically');
const kyc = await call('kyc/submit', { id_type: 'Passport', id_number: 'P1' }, owner.cookie);
ok(kyc.status === 503 && /ID uploads open soon/.test(kyc.body.error), 'The ID step skips the mobile-code check (it only waits for Drive, which the Founder connects)');

console.log('Claim Founder access');
const s0 = await call('setup/status'); ok(!s0.body.founder_exists && s0.body.checks && s0.body.checks.setup_code === false && s0.body.checks.sms === false, 'Before setup, the checklist shows what is missing');
ok(!JSON.stringify(s0.body).includes('prod-pepper'), 'The checklist never reveals secret values');
ok((await call('setup/claim', { code: 'anything-at-all' }, owner.cookie)).status === 409, 'Claiming needs a SETUP_CODE secret first');
env = { ...env, SETUP_CODE: 'short-code-1' };
ok((await call('setup/status')).body.checks.setup_code === false, 'A short SETUP_CODE (under 16 characters) does not count');
env = { ...env, SETUP_CODE: 'Xk9-pQ2-mW7-zR4-tY8\n' }; // pasted with a trailing newline
ok((await call('setup/claim', { code: 'Xk9-pQ2-mW7-zR4-tY8' })).status === 401, 'Claiming needs an account');

console.log('Guessing the setup code');
const net = (i) => `2001:db8:77:1::${i.toString(16)}`; // one server rotating addresses inside a single IPv6 /64
const att = await anyone(); const tries = [];
for (let i = 1; i <= 6; i++) tries.push((await call('setup/claim', { code: 'guess-' + i + '-xxxxxxxxxxxx' }, att.cookie, net(i))).status);
ok(tries.slice(0, 5).every((x) => x === 403) && tries[5] === 429, 'Rotating addresses inside one IPv6 network still hits the limit after 5 tries');
const sus = await anyone(); sq.prepare("UPDATE users SET status = 'suspended' WHERE email = ?").run('p' + (n - 1) + '@x.ph');
ok((await call('setup/claim', { code: 'Xk9-pQ2-mW7-zR4-tY8' }, sus.cookie, '198.51.100.1')).status === 403, 'A suspended account cannot claim, even with the right code');
let fails = 5, k = 0; // keep guessing from fresh accounts on fresh networks until the site-wide lock
while (fails < 20) { const a = await anyone(); for (let i = 0; i < 4 && fails < 20; i++) { const r = await call('setup/claim', { code: 'wrong-guess-' + fails + '-yyyyyy' }, a.cookie, `2001:db8:${100 + k}:1::${i + 1}`); if (r.status === 403) fails++; } k++; }
const locked = await call('setup/claim', { code: 'Xk9-pQ2-mW7-zR4-tY8' }, owner.cookie, '203.0.113.50');
ok(locked.status === 429 && /new SETUP_CODE/.test(locked.body.error), 'After 20 wrong codes in total the claim locks, even for the right code');
ok(q("SELECT COUNT(*) n FROM audit WHERE action = 'setup_claim_failed'")[0].n <= 21, 'Failed tries are logged, but the log cannot grow without limit');
env = { ...env, SETUP_CODE: 'New-Code-After-Lock-77 \n' }; // the owner sets a new secret (pasted with a stray space and newline) and redeploys

console.log('The owner claims');
const cl = await call('setup/claim', { code: 'New-Code-After-Lock-77' }, owner.cookie, '203.0.113.51');
const me2 = (await call('me', null, owner.cookie)).body.user;
ok(cl.status === 200 && me2.role === 'founder' && me2.status === 'active', 'The right code makes the owner the Founder (active, no ID upload needed), even if the secret was pasted with a stray space');
const other = await join('Second Person', 'two@x.ph', '09171230002');
ok((await call('setup/claim', { code: 'New-Code-After-Lock-77' }, other.cookie)).status === 409, 'Nobody can claim Founder a second time, even with the code');
const s1 = await call('setup/status', null, other.cookie); ok(s1.body.founder_exists && !s1.body.checks, 'After setup, members see no configuration details');
ok((await call('setup/status', null, owner.cookie)).body.checks.pepper === true, 'The Founder still sees the checklist');
ok((await call('admin/hosts', null, owner.cookie)).status === 200, 'The Founder can open Circle Ops');
sq.prepare("UPDATE users SET role = 'client' WHERE email = 'owner@x.ph'").run(); // the Founder role later changes hands or is removed
ok((await call('setup/claim', { code: 'New-Code-After-Lock-77' }, other.cookie, '203.0.113.60')).status === 409, 'The claim stays closed for good once used');
sq.prepare("UPDATE users SET role = 'founder' WHERE email = 'owner@x.ph'").run();

console.log('ID uploads from accounts without SMS checks');
const files = new Map(); env = { ...env, FILES: { put: async (k, v) => { files.set(k, v); }, get: async (k) => (files.has(k) ? { body: files.get(k), httpMetadata: {} } : null) } }; // storage connected
const up = []; for (let i = 0; i < 4; i++) { const a = await anyone(); up.push((await call('kyc/submit', { id_type: 'Passport', id_number: 'P' + i }, a.cookie, '2001:db8:999:1::' + (i + 1))).status); }
ok(up.slice(0, 3).every((x) => x !== 429) && up[3] === 429, 'One network gets 3 ID submissions a day from accounts without an SMS-verified mobile');
const later = await anyone(); env = { ...env, SEMAPHORE_KEY: 'now-configured' }; // SMS switched on after this member joined
const lk = await call('kyc/submit', { id_type: 'Passport', id_number: 'P9' }, later.cookie, '198.51.100.99');
ok(!/Verify your mobile/.test(lk.body.error || ''), 'Members who joined while SMS was off can still finish ID verification after SMS is switched on');
env = { ...env, SEMAPHORE_KEY: undefined, FILES: undefined };

console.log('Missing database binding');
env = { PEPPER: 'x' };
const nodb = await call('config'); ok(nodb.status === 503 && nodb.type.includes('json') && /D1 database binding/.test(nodb.body.error), 'A missing database gives a clear JSON error, not a silent failure');

console.log(failures ? `\n${failures} check(s) failed` : '\nAll setup checks passed ✨');
process.exit(failures ? 1 : 0);
