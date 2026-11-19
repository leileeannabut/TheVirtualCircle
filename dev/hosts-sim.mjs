// Production-like simulation of the Circle Hosts (no DEV_MODE: the real background tick runs on ordinary requests),
// using Node's built-in SQLite in place of D1 and a fake clock. Covers what the browser test can't:
// nothing posts before Day 1, a rebuilt calendar reaches the database on deploy (team edits kept), late posts are skipped,
// and a reply that stopped halfway never blocks other replies.
//   node dev/hosts-sim.mjs        (Node 22.13+)
import { DatabaseSync } from 'node:sqlite';

let fake = Date.parse('2026-12-01T00:00:00Z');
Date.now = () => fake;
const at = (manilaIso) => { fake = Date.parse(manilaIso + ':00+08:00'); };
const { handleApi } = await import('../src/api.js');
const { HOST_ROUTES, CALENDAR_VERSION } = await import('../src/hosts.js');
const { CALENDAR } = await import('../src/host-calendar.js');
const { makeDb, loadConfig } = await import('../src/lib.js');

// ── a tiny D1 stand-in ──
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
const env = { DB: D1 }; // no DEV_MODE: behaves like production
const q = (sql, ...a) => rows(sq.prepare(sql).all(...a));
const one = (sql, ...a) => q(sql, ...a)[0];
async function visit() { // an ordinary page visit: runs due background jobs after the response
  const pending = []; const res = await handleApi(new Request('https://circle.example/api/config'), env, { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending); return res.status;
}
async function asFounder(route, body = {}) {
  const db = makeDb(D1); const c = { env, db, cfg: await loadConfig(db), body, query: {}, user: { id: 'f', role: 'founder', status: 'active', name: 'Founder' } };
  return HOST_ROUTES[route](c);
}
const status = (id) => one('SELECT status FROM host_calendar WHERE id = ?', id)?.status;
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) failures++; };
const hostPosts = () => one("SELECT COUNT(*) n FROM posts WHERE user_id LIKE 'host-%'").n;

console.log('Deploy, before Day 1');
at('2026-12-01T10:00'); ok((await visit()) === 200, 'First visit creates the database');
at('2026-12-01T12:30'); await visit();
ok(hostPosts() === 0 && one("SELECT value FROM config WHERE key = 'hosts_launch_date'").value === '', 'Hosts stay quiet after deploy until the team sets Day 1');
const preview = await asFounder('GET admin/hosts');
ok(preview.items.length === 29 && one('SELECT COUNT(*) n FROM host_calendar').n === CALENDAR.length, 'Circle Ops can preview the calendar before Day 1');

console.log('Day 1');
await asFounder('POST admin/hosts/settings', { launch_date: '2026-12-03' });
at('2026-12-03T08:00'); await visit();
ok(status('d01-am') === 'posted' && status('d01-prompt') === 'pending', '08:00: the 07:30 question went out; the 09:00 prompt waits for its time');
at('2026-12-03T08:05'); await visit();
ok(status('d01-prompt') === 'pending', 'Ticks are at most every 10 minutes');
at('2026-12-03T21:30'); await visit();
ok(status('d01-noon') === 'missed' && status('d01-hub') === 'missed', 'Quiet day: the noon tip and 18:00 hub question were over 2½ hours late at 21:30, so they were skipped');
ok(status('d01-prompt') === 'posted' && status('d01-laughs') === 'posted', 'The weekly prompt may still go out late; the 21:00 meme went out on time');

console.log('Redeploy with a rebuilt calendar');
sq.prepare("UPDATE host_calendar SET text = 'OLD WORDING' WHERE id = 'd02-am'").run();
sq.prepare("UPDATE host_calendar SET text = 'Team edit', edited = 1 WHERE id = 'd02-noon'").run();
sq.prepare("INSERT INTO host_calendar (id, day, time, host, channel, hub, kind, format, text, body, status) VALUES ('d02-old', 2, '15:00', 'glow', 'feed', '', 'post', '', 'Removed from the calendar', '{}', 'pending')").run();
sq.prepare("UPDATE config SET value = 'previous-deploy' WHERE key = 'hosts_calendar_version'").run();
at('2026-12-04T06:00'); await visit();
ok(one('SELECT text FROM host_calendar WHERE id = ?', 'd02-am').text === CALENDAR.find((i) => i.id === 'd02-am').text, 'Upcoming posts pick up the new wording from the deploy');
ok(one('SELECT text FROM host_calendar WHERE id = ?', 'd02-noon').text === 'Team edit', "The team's edits are kept");
ok(!status('d02-old'), 'Posts removed from the calendar are dropped');
ok(status('d01-am') === 'posted', 'Posts that already went out are untouched');
ok(one("SELECT value FROM config WHERE key = 'hosts_calendar_version'").value === CALENDAR_VERSION, 'Calendar version recorded, so the sync runs once per deploy');

console.log('Replies');
sq.prepare("INSERT INTO users (id, email, name, mobile, pw_hash, referral_code, status, account_type, role, created_at) VALUES ('m1', 'm1@x.ph', 'Member One', '+639170000001', 'x$y', 'ABC123', 'active', 'va', 'va', ?)").run(fake);
for (let i = 1; i <= 4; i++) sq.prepare("INSERT INTO posts (id, ts, user_id, kind, text, hub, tags, reactions, comments, boosted_until, removed) VALUES (?, ?, 'm1', 'question', ?, '', '', 0, 0, 0, 0)").run('q' + i, fake - (5 + i) * 3600e3, 'Question number ' + i + ' about clients?');
for (let i = 2; i <= 4; i++) sq.prepare("INSERT INTO host_activity (id, ts, host, action, target, detail) VALUES (?, ?, 'sage', 'reply', ?, 'stopped halfway')").run('a' + i, fake, 'q' + i); // three replies that never finished
at('2026-12-04T06:20'); await visit();
ok(one("SELECT comments FROM posts WHERE id = 'q1'").comments === 1, 'Unfinished replies elsewhere do not block a new reply');
const welcome = q("SELECT text FROM notifications WHERE user_id = 'm1' AND type = 'host' AND text LIKE '%Welcome%'");
ok(welcome.length === 1 && welcome[0].text.includes('AI helper'), 'New member welcomed once, by an AI host that says so');

console.log('Switched off');
await asFounder('POST admin/hosts/settings', { enabled: false });
const before = hostPosts();
at('2026-12-04T12:10'); await visit(); at('2026-12-04T18:30'); await visit();
ok(hostPosts() === before, 'Nothing posts while the hosts are switched off');

console.log(failures ? `\n${failures} check(s) failed` : '\nAll host simulation checks passed ✨');
process.exit(failures ? 1 : 0);
