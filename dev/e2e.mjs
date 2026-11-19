// End-to-end test against the local Pages dev server (run `npm run dev` first; it uses a local D1 + R2).
// Start from a fresh local database: rm -rf .wrangler && npm run dev
//   node dev/e2e.mjs [screenshotDir]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // pre-installed globally; or: npm i -D playwright
import crypto from 'node:crypto';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:8787';
const SHOTS = process.argv[2] || '';
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✔ ' : '  ✘ ') + msg); if (!cond) failures++; };
const browser = await chromium.launch();

// Each person gets their own user agent so device fingerprints differ (except the deliberate duplicate)
async function person(name, email, mobile, type = 'va', tier = 'seasoned', device = email) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, userAgent: 'Mozilla/5.0 TVC-e2e/' + device });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.log('  ✘ JS error on', page.url(), e.message); failures++; });
  const api = (p, body) => page.evaluate(async ([p, body]) => {
    const r = await fetch('/api/' + p, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {});
    return { status: r.status, ...(await r.json().catch(() => ({}))) };
  }, [p, body]);
  return { ctx, page, api, name, email, mobile, type, tier };
}
async function shot(page, file, full = true) { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${file}.png`, fullPage: full, animations: 'disabled' }); }
async function otp(mobile) { return (await (await fetch(`${BASE}/api/__dev/otp?mobile=${encodeURIComponent('+63' + mobile.slice(1))}`)).json()).code; }
async function devRole(email, role, status) { await fetch(`${BASE}/api/__dev/role`, { method: 'POST', body: JSON.stringify({ email, role, status }) }); }

async function registerUI(p, stopAtKyc = false) {
  await p.page.goto(BASE + '/join.html');
  if (p.type === 'client') await p.page.click('#type [data-v="client"]');
  await p.page.fill('#r-name', p.name); await p.page.fill('#r-mobile', p.mobile); await p.page.fill('#r-email', p.email); await p.page.fill('#r-pw', 'correct-horse-battery');
  if (p.type === 'va') await p.page.check(`input[name=tier][value=${p.tier}]`);
  await p.page.check('input[name=adult]');
  await p.page.check('input[name=consent]');
  await p.page.click('#reg button.btn.block');
  await p.page.waitForSelector('#otp:not(.hidden)');
  await p.page.fill('#code', await otp(p.mobile)); await p.page.click('#otpf button');
  await p.page.waitForSelector('#kyc:not(.hidden)');
  if (stopAtKyc) return;
  await p.page.fill('#k-no', 'PSN-' + crypto.randomInt(1e8));
  await p.page.setInputFiles('#k-id', { name: 'id.png', mimeType: 'image/png', buffer: PNG });
  await p.page.setInputFiles('#k-selfie', { name: 'selfie.png', mimeType: 'image/png', buffer: PNG });
  if (p.type === 'va' && p.tier === 'seasoned') { // tenured VAs add proof of work
    await p.page.fill('#k-years', '4'); await p.page.fill('#k-emp', 'US real estate team'); await p.page.fill('#k-roles', 'Executive assistant: inbox, calendar, CRM updates and client support.');
    await p.page.setInputFiles('[name=proof_1]', { name: 'coe.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 certificate of employment') });
  }
  await p.page.click('#kycf button');
  await p.page.waitForSelector('#review:not(.hidden)');
}

console.log('Landing');
const guest = await person('Guest', 'g@x.ph', '09170000000');
await guest.page.goto(BASE + '/');
ok((await guest.page.textContent('#n')) === '20' && (await guest.page.textContent('#s')) === '30', 'Founders counter shows 20 / 30');
await shot(guest.page, '01-landing');
await guest.page.setViewportSize({ width: 390, height: 844 }); await shot(guest.page, '01b-landing-mobile', false); await guest.page.setViewportSize({ width: 1280, height: 900 });

console.log('Registration → OTP → KYC');
const founder = await person('Liza Founder', 'founder@tvc.ph', '09171111111', 'client');
await registerUI(founder, true);
const early = await founder.page.evaluate(async () => { const f = new FormData(); f.append('id_type', 'Passport'); f.append('id_number', 'P1234567');
  f.append('id_file', new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' })); f.append('selfie_file', new File([new Uint8Array([137, 80, 78, 71])], 'b.png', { type: 'image/png' }));
  return (await fetch('/api/kyc/submit', { method: 'POST', body: f })).status; });
ok(early === 503, 'ID uploads pause until Drive is connected');
await devRole(founder.email, 'founder', 'active');

console.log('Connect Google Drive (mock Google)');
await founder.page.goto(BASE + '/admin.html'); await founder.page.click('[data-tab=settings]'); await founder.page.waitForSelector('#drive a.btn');
await shot(founder.page, '00-drive-not-connected', false);
await founder.page.click('#drive a.btn'); await founder.page.waitForURL(/drive=connected/);
await founder.page.waitForSelector('#drive h3:has-text("Google Drive connected")');
ok((await founder.page.textContent('#drive')).includes('founder@gmail.com'), 'Drive connected to the Founder account via OAuth');
await shot(founder.page, '00b-drive-connected', false);
const va = await person('Maria Santos', 'maria@tvc.ph', '09172222222', 'va', 'seasoned');
await va.page.goto(BASE + '/join.html'); await shot(va.page, '02-join');
await registerUI(va); await shot(va.page, '03-kyc-review', false);
const nb = await person('Jun Reyes', 'jun@tvc.ph', '09173333333', 'va', 'newbie');
await registerUI(nb);
const client = await person('Sam Client', 'sam@brightcart.com', '09174444444', 'client');
await registerUI(client);
const dupe = await person('Maria Dupe', 'maria2@tvc.ph', '09175555555', 'va', 'seasoned', 'maria@tvc.ph'); // same device as Maria
await registerUI(dupe);

console.log('Ops: KYC approvals');
await founder.page.goto(BASE + '/admin.html'); await founder.page.click('[data-tab=kyc]');
await founder.page.waitForSelector('#kycq [data-k]');
await shot(founder.page, '04-admin-kyc');
for (const n of ['Maria Santos', 'Jun Reyes', 'Sam Client']) {
  const card = founder.page.locator('#kycq [data-k]', { hasText: n });
  await card.locator('[data-a="1"]').click(); await founder.page.waitForTimeout(300);
}
const meVa = await va.api('me');
ok(meVa.user.status === 'active' && meVa.user.founder_slot === 'seasoned-1' && meVa.user.badges.includes('Founding Member'), 'Approved VA is active with Founders slot seasoned-1 + badges');
ok((await nb.api('me')).user.founder_slot === 'newbie-1', 'Newbie got newbie-1');
ok(!(await client.api('me')).user.founder_slot, 'Clients do not take founder slots');
const cfg = await guest.api('config'); ok(cfg.newbie_remaining === 19 && cfg.seasoned_remaining === 29, 'Slot counter decremented');

console.log('Dashboard + profile');
await va.page.goto(BASE + '/app.html');
await va.page.fill('#p-skills', 'Customer support, Shopify, Canva'); await va.page.fill('#p-bio', 'Night-shift support lead. Call me 09179998888!'); await va.page.fill('#p-rate', '$7/hr');
await va.page.click('#pf button'); await va.page.waitForTimeout(400);
const prof = (await va.api('me')).user;
ok(!/0917/.test(prof.bio) && prof.risk_points >= 3, 'Phone number stripped from bio and penalised');
await shot(va.page, '05-dashboard');

console.log('Hubs + anti-scam');
await va.page.goto(BASE + '/hubs.html#manila-vas'); await va.page.waitForSelector('.msgs');
await va.page.fill('#text', 'Hello Manila VAs! Anyone on the 10pm–6am shift? 🌙'); await va.page.press('#text', 'Enter'); await va.page.waitForTimeout(500);
const flagged = await va.api('hubs/post', { channel: 'manila-vas', text: 'add me on telegram t.me/maria_va for gigs' });
ok(flagged.flagged && /hidden/.test(flagged.text), 'Telegram link hidden in hub message');
await nb.page.goto(BASE + '/hubs.html#manila-vas'); await nb.page.waitForTimeout(800);
await nb.page.fill('#text', 'Hi Maria! Newbie here from Quezon City 👋'); await nb.page.press('#text', 'Enter'); await nb.page.waitForTimeout(600);
await va.page.reload(); await va.page.waitForTimeout(800); await shot(va.page, '06-hubs', false);
const vent = await nb.api('hubs/post', { channel: 'vent-room', text: 'Rough night, client yelled at me.' });
const ventMsgs = await va.api('hubs/messages?channel=vent-room');
ok(ventMsgs.messages[0].name === 'Someone in the circle', 'Vent Room posts are anonymous');
const pending = await dupe.api('hubs/messages?channel=manila-vas'); ok(pending.status === 403, 'Unverified member blocked from hubs');

console.log('Circle Bestie academy');
await va.page.goto(BASE + '/academy.html'); await va.page.click('[data-start="angry-client"]'); await va.page.waitForSelector('#conv .bubble');
for (const t of ['I am so sorry, Karen. I understand how serious this is. I will pause the campaign right now and check the code settings.',
  'Next step: I will send a correction email within 30 minutes and update you by 4am with the numbers. Going forward I will add a checklist so this is prevented.']) {
  await va.page.fill('#reply', t); await va.page.press('#reply', 'Enter'); await va.page.waitForTimeout(400);
}
await va.page.click('#grade'); await va.page.waitForSelector('#score:not(.hidden)');
ok(Number(await va.page.textContent('#score .score')) > 0, 'Simulation graded (offline rules)');
await shot(va.page, '07-academy', false);

console.log('Circle Scam-Buster');
await va.page.goto(BASE + '/scambuster.html');
await va.page.fill('#txt', 'Hiring data entry VA, $45/hr no experience! Pay a refundable training fee of P1500 via GCash, then message HR on Telegram. Salary paid in USDT.');
await va.page.fill('#s-title', 'Fake data-entry job'); await va.page.fill('#s-co', 'Quick Hire Global');
await va.page.click('#share'); await va.page.waitForSelector('#result:not(.hidden)');
ok((await va.page.textContent('#result')).includes('High risk'), 'Scam text rated High risk');
await shot(va.page, '08-scambuster', false);
const reps = await nb.api('scam/reports'); await nb.api('scam/vote', { id: reps.reports[0].id, value: 1 });
await nb.api('scam/company', { name: 'Quick Hire Global', issue: 'withheld_wages', details: 'Never paid two weeks of work.' });
const cos = await nb.api('scam/companies'); ok(cos.companies[0].name === 'Quick Hire Global' && cos.companies[0].risk > 0, 'Company red-flag board scores the company');
await va.page.click('[data-tab=reg]'); await va.page.waitForTimeout(500); await shot(va.page, '09-company-board', false);

console.log('Marketplace unlock (dev auto-payment)');
await client.page.goto(BASE + '/talent.html'); await client.page.waitForSelector('[data-unlock]');
await shot(client.page, '10-talent');
const unlocked = await client.api('talent/unlock', { va_id: meVa.user.id });
ok(unlocked.paid && unlocked.channel.startsWith('dm:'), 'Client unlocked VA chat');
const dm = await client.api('hubs/post', { channel: unlocked.channel, text: 'Hi Maria, can we talk about a support role?' }); ok(!dm.error, 'Client can DM after unlock');
ok((await nb.api('hubs/messages?channel=' + encodeURIComponent(unlocked.channel))).status === 403, 'Others cannot read the DM');

console.log('Wellness');
await nb.api('wellness/apply', { prc_license: '0123456', specialty: 'Psychiatrist', rate: 2000, availability: 'Nightly 11pm–5am', bio: 'Shift-work sleep and burnout.' });
await founder.page.goto(BASE + '/admin.html'); await founder.page.click('[data-tab=people]'); await founder.page.waitForSelector('[data-prac]');
await founder.page.check('[data-prac]'); await founder.page.waitForTimeout(400); await shot(founder.page, '11-admin-people');
const pr = await va.api('wellness/practitioners'); ok(pr.practitioners.length === 1 && pr.practitioners[0].prc_license.startsWith('•••'), 'Verified practitioner listed with masked license');
const book = await va.api('wellness/book', { practitioner_id: pr.practitioners[0].id, scheduled_at: new Date(Date.now() + 864e5).toISOString(), concern: 'Cannot sleep after shifts' });
ok(book.paid, 'Consultation booked & paid');
await va.page.goto(BASE + '/wellness.html'); await va.page.waitForTimeout(600); await shot(va.page, '12-wellness');

console.log('Mentors');
ok((await va.api('mentor/save', { hourly_rate: 800, bio: 'x' })).status === 402, 'Selling training needs Tier 2 · Circle Pro');
ok((await va.api('pro/subscribe', {})).paid, 'Maria joined Tier 2 (dev payment)');
await va.api('mentor/save', { hourly_rate: 800, bio: 'Support lead, 5 years.' });
const badSplit = await va.api('mentor/module', { title: 'Zendesk mastery', price: 1200, mentor_split_pct: 95, description: 'x' }); ok(badSplit.status === 400, 'Split outside 50–85% rejected');
const mod = await va.api('mentor/module', { title: 'Zendesk mastery for night-shift support', price: 1200, mentor_split_pct: 70, description: 'Macros, SLAs and calm escalation.' });
ok((await client.api('mentor/buy', { module_id: mod.id })).paid, 'Module purchased');
await va.page.goto(BASE + '/mentor.html'); await va.page.click('[data-tab=coach]'); await va.page.waitForTimeout(600); await shot(va.page, '13-mentor');

console.log('Squads');
await guest.api('squads/request', { name: 'Ann', email: 'ann@northwind.io', company: 'Northwind', tier: 'squad', budget: '$3,000', details: 'Inbox + support coverage' });
const sq = await founder.api('admin/squads/save', { name: 'Night Owls', client: 'Brightcart', retainer_usd: 3000, status: 'active', leader_id: meVa.user.id, members: (await nb.api('me')).user.id });
ok(sq.id, 'Squad created');
ok((await founder.api('admin/squads/invoice', { id: sq.id })).paid, 'Squad retainer paid (USD)');
await va.page.goto(BASE + '/squads.html'); await va.page.waitForTimeout(500); await shot(va.page, '14-squads');

console.log('Studio');
await guest.page.goto(BASE + '/studio.html'); await guest.page.fill('#b-name', 'Kai'); await guest.page.fill('#b-email', 'kai@startup.sg');
await guest.page.fill('#b-det', 'Marketplace for tutors in Singapore with payments and KYC.'); await guest.page.click('#brief button'); await guest.page.waitForTimeout(500);
ok((await guest.page.textContent('#bm')).includes('received'), 'Studio brief submitted'); await shot(guest.page, '15-studio');

console.log('Ingestion + sourcing + pipeline');
await founder.api('admin/sources/save', { type: 'job', format: 'json', url: BASE + '/api/__dev/feed' });
const src = await founder.api('admin/sources'); const run = await founder.api('admin/sources/run', { id: src.sources[0].id });
ok(run.results[0].added === 3, 'Ingested 3 jobs from JSON feed');
const jobs = await va.api('jobs/list'); ok(jobs.jobs.some((j) => j.safety === 'danger'), 'Scam job auto-flagged as danger');
await va.page.goto(BASE + '/app.html'); await va.page.waitForTimeout(700); await shot(va.page, '16-dashboard-jobs');
await devRole(client.email, 'recruiter');
const s = await client.api('sourcing/search?min_score=0'); ok(s.results.length >= 2, 'Sourcing terminal returns members');
const card = await client.api('pipeline/add', { ref: 'user:' + meVa.user.id, name: 'Maria Santos' });
await client.api('pipeline/add', { ref: 'user:' + (await nb.api('me')).user.id, name: 'Jun Reyes' });
await client.api('pipeline/move', { id: card.id, stage: 'Placed', client: 'Brightcart' });
ok((await va.api('me')).user.badges.includes('Placed'), 'Placed badge awarded');
await client.page.goto(BASE + '/talent.html'); await client.page.click('[data-tab=pipe]'); await client.page.waitForTimeout(600); await shot(client.page, '17-pipeline');
await client.page.click('[data-tab=source]'); await client.page.waitForTimeout(600); await shot(client.page, '18-sourcing');

console.log('Escalations');
const esc = await founder.api('admin/escalations');
ok(esc.escalations.some((e) => e.rule === 'off_platform') && esc.escalations.some((e) => e.rule === 'dup_fingerprint'), 'Off-platform and duplicate-device escalations logged');
await founder.page.goto(BASE + '/admin.html'); await founder.page.click('[data-tab=esc]'); await founder.page.waitForTimeout(500); await shot(founder.page, '19-admin-escalations');

console.log('Payment webhooks');
const evt = { data: { id: 'evt_test_1', attributes: { type: 'checkout_session.payment.paid', data: { id: 'cs_1', attributes: { metadata: { ref_type: 'studio', ref_id: 'deposit-1', user_id: (await client.api('me')).user.id }, payments: [{ attributes: { amount: 150000 } }] } } } } };
const raw = JSON.stringify(evt); const t = Math.floor(Date.now() / 1000);
const sig = crypto.createHmac('sha256', 'whsk_dev').update(`${t}.${raw}`).digest('hex');
const good = await fetch(BASE + '/api/webhooks/paymongo', { method: 'POST', headers: { 'paymongo-signature': `t=${t},te=${sig},li=` }, body: raw });
ok(good.status === 200, 'Signed PayMongo webhook accepted');
const again = await (await fetch(BASE + '/api/webhooks/paymongo', { method: 'POST', headers: { 'paymongo-signature': `t=${t},te=${sig},li=` }, body: raw })).json();
ok(again.ok, 'Replay is idempotent');
const bad = await fetch(BASE + '/api/webhooks/paymongo', { method: 'POST', headers: { 'paymongo-signature': `t=${t},te=deadbeef,li=` }, body: raw });
ok(bad.status === 401, 'Bad signature rejected');
const xnd = await fetch(BASE + '/api/webhooks/xendit', { method: 'POST', headers: { 'x-callback-token': 'wrong' }, body: '{}' }); ok(xnd.status === 401, 'Xendit bad token rejected');
const csrf = await fetch(BASE + '/api/auth/logout', { method: 'POST', headers: { origin: 'https://evil.example' } }); ok(csrf.status === 403, 'Cross-origin POST blocked');

console.log('Daily payouts + BIR 2307');
const pay = await founder.api('admin/payouts/run', {});
ok(pay.payouts.length >= 3, `Payouts generated for ${pay.payouts.length} payees`);
const maria = pay.payouts.find((p) => p.payee === 'Maria Santos' && p.currency === 'PHP');
ok(maria && Math.abs(maria.ewt - maria.gross * 0.05) < 0.02, 'EWT 5% withheld');
const files = await (await fetch(BASE + '/api/__dev/payouts')).json(); ok(files.length && files.every((r) => r.form2307_file), '2307 PDF generated for each payout');
const mine = await va.page.evaluate(async (id) => { const r = await fetch('/api/payouts/form2307?id=' + id); return { s: r.status, t: r.headers.get('content-type'), head: (await r.text()).slice(0, 8) }; }, files.find((r) => r.payee_id === meVa.user.id).id);
ok(mine.s === 200 && mine.t === 'application/pdf' && mine.head === '%PDF-1.4', 'Payee can download their own 2307 PDF');
const drv = await (await fetch('http://localhost:8790/__stats')).json();
const kycFolder = drv.files.find((f) => f.name === 'KYC'), birFolder = drv.files.find((f) => f.name === 'BIR-2307');
ok(kycFolder && drv.files.filter((f) => f.parents.includes(kycFolder.id)).length >= 8, 'KYC photos stored in Drive → The Virtual Circle (private)/KYC');
ok(birFolder && drv.files.some((f) => f.parents.includes(birFolder.id) && f.mimeType === 'application/pdf'), '2307 PDFs stored in Drive → BIR-2307');
ok(files.every((r) => r.form2307_file.startsWith('gdrive:')), 'Payout records point at Drive files');
const other = await nb.page.evaluate(async (id) => (await fetch('/api/payouts/form2307?id=' + id)).status, files.find((r) => r.payee_id === meVa.user.id).id);
ok(other === 403, "Members cannot download someone else's 2307");
ok((await founder.api('admin/config/save', { key: 'unlock_fee_php', value: '599' })).ok && (await guest.api('config')).unlock_fee_php === 599, 'Settings change takes effect');
ok((await founder.api('admin/config/save', { key: 'penalty_points', value: '{bad json' })).status === 400, 'Invalid JSON setting rejected');
await founder.page.click('[data-tab=settings]'); await founder.page.waitForTimeout(600); await shot(founder.page, '24-admin-settings');
await founder.page.click('[data-tab=fin]'); await founder.page.waitForTimeout(600); await shot(founder.page, '20-admin-finance');
await founder.page.click('[data-tab=pulse]'); await founder.page.waitForTimeout(600); await shot(founder.page, '21-admin-pulse');
await founder.page.click('[data-tab=strat]'); await founder.page.waitForTimeout(600); await shot(founder.page, '22-admin-strategy');


console.log('Social: feed, reactions, comments, notifications');
for (const e of (await founder.api('admin/escalations')).escalations.filter((x) => x.name === 'Maria Santos' && x.status === 'open' && x.action.includes('mute')))
  await founder.api('admin/escalations/resolve', { id: e.id, action: 'reinstate' });
ok(!(await va.api('me')).user.muted_until || (await va.api('me')).user.muted_until < Date.now(), 'Ops reinstated a muted member');
const feedPost = await nb.api('feed/post', { text: 'First week as a VA and my client yelled at me on a call. Still shaking. #newbie #support', kind: 'struggle' });
ok(feedPost.id && feedPost.bff_suggest.some((t) => t.id === 'difficult_client'), 'Struggle post detected the "difficult client" topic for Circle BFF');
await va.api('feed/post', { text: 'Landed a 3rd client this month! Consistency pays off 🏆 #wins', kind: 'win' });
ok((await va.api('feed/react', { post_id: feedPost.id, type: 'hug' })).reactions === 1, 'Reaction counted');
ok((await va.api('feed/comment', { post_id: feedPost.id, text: 'Sending a hug. It gets better, you did nothing wrong 💛' })).ok, 'Comment posted');
const leak = await va.api('feed/comment', { post_id: feedPost.id, text: 'message me on telegram t.me/x' }); ok(leak.flagged, 'Off-platform contact in comments is hidden');
const notes = await nb.api('notifications'); ok(notes.unread >= 2 && notes.notifications.some((n) => n.type === 'comment'), 'Author notified of reaction + comment');
await nb.page.goto(BASE + '/feed.html'); await nb.page.waitForSelector('article.post'); await shot(nb.page, '25-feed');
await nb.page.click('#bell'); await nb.page.waitForSelector('#bell-panel .notif'); await shot(nb.page, '26-notifications', false);

console.log('Connections + direct messages');
const blocked = await nb.api('dm/open', { user_id: meVa.user.id }); ok(blocked.status === 403, 'Newbie cannot DM a stranger before connecting');
ok((await nb.api('connect/request', { user_id: meVa.user.id })).status === 'pending', 'Connection requested');
ok((await va.api('connect/list')).incoming.length === 1, 'Request shows as incoming');
await va.api('connect/respond', { user_id: (await nb.api('me')).user.id, accept: true });
const dmOpen = await nb.api('dm/open', { user_id: meVa.user.id }); ok(dmOpen.channel, 'Connected VAs can message each other');
await nb.api('hubs/post', { channel: dmOpen.channel, text: 'Thanks for the kind comment! 💛' });
ok((await va.api('dm/list')).conversations.some((x) => x.last && x.last.text.includes('Thanks for the kind')), 'DM appears in Messages list');
await va.page.goto(BASE + '/messages.html#' + encodeURIComponent(dmOpen.channel)); await va.page.waitForSelector('.bubble'); await shot(va.page, '27-messages', false);
await va.page.goto(BASE + '/profile.html?id=' + (await nb.api('me')).user.id); await va.page.waitForSelector('#head h1'); await shot(va.page, '28-profile');

console.log('Circle BFF matching');
await va.api('bff/set', { topic: 'difficult_client', mode: 'been_through' });
const bm = await nb.api('bff/set', { topic: 'difficult_client', mode: 'going_through' });
ok(bm.matched.some((m) => m.with === 'Maria Santos' && m.kind === 'mentor'), 'Circle BFF auto-matched the newbie with a VA who has been through it');
const vaB = await va.api('bff/me'); ok(vaB.matches.some((m) => m.role === 'helper'), 'Helper sees the match too');
await nb.page.goto(BASE + '/bff.html'); await nb.page.waitForSelector('#matches .person'); await shot(nb.page, '29-bff');

console.log('Learning: lessons, knowledge checks, certificates, simulators');
const courses = await nb.api('learn/courses');
ok(courses.courses.length === 3 && courses.courses.find((c) => c.id === 'c-exec').locked, 'Seed courses present; Pro course locked for free members');
const scLessons = (await nb.api('learn/course?id=c-scamproof')).lessons;
const fullKey = { 'c-scamproof-l1': [1, 2, 1], 'c-scamproof-l2': [1] };
const wrong = await nb.api('learn/submit', { lesson_id: 'c-scamproof-l1', answers: [0, 0, 0] }); ok(!wrong.passed && wrong.results[0].explain, 'Wrong answers fail with explanations');
let last; for (const l of scLessons) last = await nb.api('learn/submit', { lesson_id: l.id, answers: fullKey[l.id] });
ok(last.passed && last.certificate, 'Passing every lesson issues a certificate');
ok((await nb.api('me')).user.badges.includes('Certified: Scam-Proof Freelancing'), 'Certificate badge added to profile');
const lockedLesson = await nb.api('learn/lesson?id=c-exec-l1'); ok(lockedLesson.status === 402, 'Pro lesson blocked for free members');
await nb.page.goto(BASE + '/learn.html#lesson=c-foundations-l1'); await nb.page.waitForSelector('.slide'); await shot(nb.page, '30-lesson-deck', false);
await nb.page.click('#next'); await nb.page.click('#next'); await nb.page.click('#next'); await nb.page.click('#toquiz');
for (const [k, a] of [[0, 1], [1, 1], [2, 2]]) await nb.page.check(`input[name=q${k}][value="${a}"]`);
await nb.page.click('#qf button.btn'); await nb.page.waitForSelector('#qres .score'); ok((await nb.page.textContent('#qres .score')) === '100%', 'Lesson quiz playable in the browser');
await shot(nb.page, '31-knowledge-check');
await nb.page.goto(BASE + '/learn.html#cert=' + last.certificate); await nb.page.waitForSelector('.certificate'); await shot(nb.page, '32-certificate', false);
await nb.page.goto(BASE + '/learn.html#sim=inbox'); await nb.page.waitForSelector('.sim-email');
for (let k = 0; k < 10; k++) await nb.page.click(`[data-k="${k}"][data-b="archive"]`);
await nb.page.click('#finish'); await nb.page.waitForSelector('#res .score'); ok(Number(await nb.page.textContent('#res .score')) >= 0, 'Inbox simulator scores and reports');
await shot(nb.page, '33-sim-inbox');
await nb.page.goto(BASE + '/learn.html#sim=calendar'); await nb.page.waitForSelector('#hr'); await shot(nb.page, '34-sim-calendar', false);

console.log('Free-plan AI limit + Circle Pro');
for (let k = 0; k < 3; k++) { await nb.api('academy/turn', { scenario_id: 'angry-client', history: [] }); await nb.api('academy/grade', { scenario_id: 'angry-client', history: [{ role: 'client', text: 'x' }, { role: 'va', text: 'I will fix it now, sorry.' }, { role: 'va', text: 'Update by 4pm.' }] }); }
ok((await nb.api('academy/turn', { scenario_id: 'angry-client', history: [] })).status === 402, '4th AI simulation of the day asks free members to go Pro');
ok((await nb.api('pro/subscribe', {})).paid, 'Pro purchase (dev payment)');
const proMe = (await nb.api('me')).user; ok(proMe.pro && proMe.badges.includes('Pro'), 'Pro active with badge');
ok(!(await nb.api('academy/turn', { scenario_id: 'angry-client', history: [] })).error, 'Pro removes the AI limit');
ok(!(await nb.api('learn/lesson?id=c-exec-l1')).error, 'Pro unlocks Pro courses');
await nb.page.goto(BASE + '/pro.html'); await nb.page.waitForSelector('#state .chip'); await shot(nb.page, '35-pro');

console.log('Direct job posts');
const scamJob = await client.api('jobs/create', { title: 'Data entry $50/hr', description: 'No experience. Pay a refundable training fee first and contact HR on Telegram. Paid in USDT.', rate: '$50/hr' });
ok(scamJob.status === 400, 'Scam-pattern job post rejected');
const job = await client.api('jobs/create', { title: 'Night-shift Customer Support VA', company: 'Brightcart', rate: '$6/hr', tags: 'Zendesk, Shopify', description: 'Handle tickets and live chat for a US store, 9pm–5am Manila time. Zendesk experience preferred.' });
ok(job.paid, 'Client paid for job post (dev payment)');
const jb = await va.api('jobs/board'); const posted = jb.jobs.find((j) => j.direct && j.title.startsWith('Night-shift'));
ok(posted, 'Paid job is live on the board');
ok((await va.api('jobs/apply', { job_id: posted.id, note: '4 years on Zendesk, night shift ready.' })).ok, 'VA applied for free');
const apps = await client.api('jobs/applicants?job_id=' + posted.id); ok(apps.applicants[0]?.name === 'Maria Santos', 'Client sees the applicant');
ok((await client.api('hubs/post', { channel: apps.applicants[0].channel, text: 'Hi Maria! Can we talk tomorrow?' })).id, 'Client can message the applicant on-platform');
await client.page.goto(BASE + '/jobs.html#mine'); await client.page.waitForSelector('#mine .person'); await shot(client.page, '36-jobs-applicants');

console.log('Ranks: proof of work, upgrades, privileges');
ok(meVa.user && (await va.api('me')).user.va_rank === 2, 'Tenured VA approved as Proven VA (rank 2) with proof of work');
ok((await nb.api('me')).user.va_rank === 1, 'Aspiring VA approved as rank 1');
ok((await nb.api('mentor/save', { hourly_rate: 500, bio: 'x' })).status === 403, 'Coaching locked below Proven VA rank');
const upForm = await va.page.evaluate(async () => { const f = new FormData(); f.append('kind', 'upgrade'); f.append('years', '5'); f.append('roles', 'Team lead for 6 VAs, QA, onboarding and SOP writing.');
  f.append('proof_1', new File(['%PDF-1.4 promotion letter'], 'promo.pdf', { type: 'application/pdf' })); return (await fetch('/api/kyc/submit', { method: 'POST', body: f })).status; });
ok(upForm === 200, 'Active VA submitted a rank-upgrade request');
const q2 = await founder.api('admin/kyc'); const upReq = q2.queue.find((k) => k.kind === 'upgrade');
ok(upReq && upReq.proofs === 1 && upReq.suggested_rank === 3, 'Upgrade request in Ops with proof file');
await founder.page.goto(BASE + '/admin.html'); await founder.page.click('[data-tab=kyc]'); await founder.page.waitForSelector('#kycq [data-k] .rank'); await shot(founder.page, '37-admin-rank-review');
await founder.api('admin/kyc/review', { id: upReq.id, approve: true, rank: 3 });
ok((await va.api('me')).user.va_rank === 3, 'Rank raised to Senior VA');

console.log('Circle Academy editor (CMS)');
const nc = await va.api('cms/course', { title: 'Zendesk for Night-Shift Support', summary: 'Macros, SLAs and calm escalations.', level: 'Intermediate', status: 'published' });
ok(nc.status === 'review', 'Senior VA course goes to review, not straight to publish');
ok((await va.api('cms/lesson', { course_id: nc.id, title: 'Macros that save hours', position: 1, slides: [{ title: 'Why macros', body: 'Answer the top 10 questions in one click.' }],
  quiz: [{ q: 'What is a macro?', choices: ['A saved reply/action', 'A virus'], answer: 0, explain: 'Macros are saved replies and actions.' }] })).id, 'Lesson with slides + quiz saved');
const pub = await founder.api('cms/course', { id: nc.id, title: 'Zendesk for Night-Shift Support', summary: 'Macros, SLAs and calm escalations.', level: 'Intermediate', status: 'published' });
ok(pub.status === 'published' && (await nb.api('learn/courses')).courses.some((c) => c.id === nc.id), 'Staff published it and members can see it');
await va.page.goto(BASE + '/cms.html#' + nc.id); await va.page.waitForSelector('[data-lesson]'); await shot(va.page, '38-cms');

console.log('Membership: Keep the Circle Glowing');
ok((await client.api('support/contribute', { amount: 10 })).status === 400, 'Contribution below the ₱20 minimum rejected');
ok((await client.api('support/contribute', { amount: 50, anonymous: true, message: 'Thank you, circle! call 09171234567' })).paid, 'Anonymous ₱50 contribution (dev payment)');
ok((await nb.api('support/contribute', { amount: 20, message: 'For everyone 💛' })).paid, 'Named ₱20 contribution');
const cm = await client.api('membership/status'); ok(cm.supporter && cm.tier === 1, 'Client is a Glow Keeper while staying on Tier 1');
ok((await client.api('me')).user.badges.includes('Glow Keeper'), 'Glow Keeper badge added');
const wall = await guest.api('support/wall');
ok(wall.month.total === 70 && wall.month.people === 2, 'Glow Wall shows this month\'s total and supporters');
ok(wall.recent.some((r) => r.display === 'A Glow Keeper' && !/0917/.test(r.message)) && wall.recent.some((r) => r.display === 'Jun R.'), 'Anonymous + named display; contact details stripped');
ok(!(await founder.api('admin/ledger')).ledger.some((t) => t.ref_type === 'support' && t.type === 'commission'), 'Contributions never pay referral commissions');
{ // a gateway payment that matches nothing is kept on record and flagged, never silently credited
  const evt = { data: { id: 'evt_orphan', attributes: { type: 'checkout_session.payment.paid', data: { id: 'cs_x', attributes: { metadata: { ref_type: 'rage', ref_id: 'no-such-purchase', user_id: (await nb.api('me')).user.id }, payments: [{ attributes: { amount: 5000 } }] } } } } };
  const raw = JSON.stringify(evt); const t = Math.floor(Date.now() / 1000); const sig = crypto.createHmac('sha256', 'whsk_dev').update(`${t}.${raw}`).digest('hex');
  ok((await fetch(BASE + '/api/webhooks/paymongo', { method: 'POST', headers: { 'paymongo-signature': `t=${t},te=${sig},li=` }, body: raw })).status === 200, 'Unmatched payment accepted by the webhook');
  ok((await founder.api('admin/requests')).requests.some((r) => r.type === 'payment_review' && r.details.includes('evt_orphan')), 'Unmatched payment flagged for Finance review');
  ok((await founder.api('admin/payments/mark_paid', { ref_type: 'squad', ref_id: 'nope', user_id: (await nb.api('me')).user.id, amount: 100, reference: 'BANK-1' })).status === 400, 'Manual payment to a non-existent item is refused');
}
await nb.page.goto(BASE + '/pro.html'); await nb.page.waitForSelector('#wall span'); await shot(nb.page, '40-membership');

console.log('Circle Rage Room tiers');
const rsVa = await va.api('rage/status');
ok(rsVa.tiers.length === 3 && rsVa.tiers[0].owned === 15 && rsVa.tiers[1].owned === 0, 'Tier 1 gets 15 free Simmer throws; no paid packs yet');
ok((await nb.api('rage/status')).tiers[0].owned === 35, 'Glow Keepers get +20 free throws a day');
const s1 = await va.api('rage/spend', { tier: 'simmer', count: 10 }), s2 = await va.api('rage/spend', { tier: 'simmer', count: 10 }), s3 = await va.api('rage/spend', { tier: 'simmer', count: 5 });
ok(s1.spent === 10 && s2.spent === 5 && s3.spent === 0, 'Free throws are counted as thrown and run out for the day');
ok((await va.api('rage/spend', { tier: 'boiling', count: 5 })).spent === 0, 'No Boiling throws without a pack');
ok((await va.api('rage/buy', { tier: 'boiling' })).paid && (await va.api('rage/status')).tiers[1].owned === 60, '₱50 Boiling pack adds 60 throws');
ok((await va.api('rage/buy', { tier: 'simmer' })).status === 400, 'Simmer cannot be bought (it is free)');
await nb.page.goto(BASE + '/rage.html'); await nb.page.waitForSelector('.level');
await shot(nb.page, '41-rage-levels', false);
await nb.page.click('.level[data-t=volcano]'); await nb.page.waitForSelector('#overlay [data-buy=volcano]');
await nb.page.click('#overlay [data-buy=volcano]'); await nb.page.waitForSelector('#overlay', { state: 'hidden' });
await nb.page.fill('#target', 'THAT 3AM EMAIL'); await nb.page.click('#write'); await nb.page.click('#sound');
for (const [a, x, y] of [['egg', 300, 200], ['tomato', 520, 260], ['plate', 700, 180], ['slime', 420, 330], ['knife', 600, 330], ['dirt', 760, 300]]) {
  await nb.page.click(`[data-a=${a}]`); await nb.page.locator('#wall').click({ position: { x, y } }); await nb.page.waitForTimeout(350); }
await nb.page.waitForTimeout(2200);
ok((await nb.page.textContent('#hand')).includes('144 throws left in your Volcano pack') && !(await nb.page.isHidden('#care')), 'Volcano wall active with care links; counter exact');
ok((await nb.api('rage/status')).tiers[2].owned === 144, 'Exactly the 6 thrown items were deducted on the server (nothing lost)');
await nb.page.click('.level[data-t=simmer]'); await nb.page.locator('#wall').click({ position: { x: 300, y: 200 } }); await nb.page.waitForTimeout(300);
await nb.page.goto(BASE + '/feed.html'); await nb.page.waitForTimeout(500);
ok((await nb.api('rage/status')).tiers[0].owned === 34, 'Throw made just before leaving the page is still counted (keepalive flush)');
ok((await nb.api('rage/status')).tiers[2].owned === 144, 'Switching tiers never loses paid throws');
await nb.page.goto(BASE + '/rage.html'); await nb.page.waitForSelector('.level'); await nb.page.click('.level[data-t=volcano]');
await shot(nb.page, '42-rage-volcano', false);
await nb.page.click('#cool'); await nb.page.waitForSelector('.breathe'); await shot(nb.page, '43-rage-cooldown', false);

console.log('Tier 2 teaching gigs');
ok((await nb.api('gigs/save', { title: 'Newbie tips', kind: 'mentoring', price: 300, duration_min: 60 })).status === 403, 'Tier 2 alone is not enough: teaching needs Proven VA rank');
ok((await va.api('gigs/save', { title: 'Cheap gig', kind: 'mentoring', price: 50, duration_min: 60 })).status === 400, 'Gig price below minimum rejected');
ok((await va.api('gigs/save', { title: 'Guaranteed job placement', kind: 'mentoring', price: 500, duration_min: 60, description: 'Pay a refundable training fee first, salary paid in USDT, message me on Telegram' })).status === 400, 'Gig matching scam patterns rejected');
const gig = await va.api('gigs/save', { title: 'Land your first client in 30 days', kind: 'mentoring', price: 500, duration_min: 60, description: 'Profile, pitch and proposals, reviewed live. Message me at maria@mail.com' });
ok(gig.id, 'Proven VA on Tier 2 created a teaching gig');
const gl = await nb.api('gigs/list'); const g0 = gl.gigs.find((g) => g.id === gig.id);
ok(g0 && !/maria@/.test(g0.description), 'Gig listed for members; contact details stripped');
ok((await va.api('gigs/book', { gig_id: gig.id, scheduled_at: new Date(Date.now() + 864e5).toISOString() })).status === 400, "Mentors can't book their own gig");
ok((await nb.api('gigs/book', { gig_id: gig.id, scheduled_at: new Date(Date.now() + 3600e3).toISOString() })).status === 400, 'Bookings need 2 hours notice');
ok((await nb.api('gigs/book', { gig_id: gig.id, scheduled_at: new Date(Date.now() + 864e5).toISOString(), note: 'Help with my first proposal' })).paid, 'Aspiring VA booked and paid');
const gm = await va.api('gigs/mine'); ok(gm.teaching.length === 1 && gm.earnings.held === 400, "Mentor's 80% commission is HELD until the session happens");
ok((await client.api('gigs/book', { gig_id: gig.id, scheduled_at: new Date(Date.now() + 864e5 + 30 * 60000).toISOString() })).status === 409, 'Mentor cannot be double-booked for an overlapping slot');
const bk2 = await client.api('gigs/book', { gig_id: gig.id, scheduled_at: new Date(Date.now() + 3 * 864e5).toISOString() }); ok(bk2.paid, 'Second mentee booked another slot');
const cbk = (await client.api('gigs/mine')).learning[0];
ok(cbk.can_cancel_mentee && (await client.api('gigs/cancel', { booking_id: cbk.id })).refund, 'Mentee cancelled 3 days ahead: refund queued');
ok((await founder.api('admin/requests')).requests.some((r) => r.type === 'refund' && r.details.includes(cbk.id)), 'Refund shows up for Finance');
ok((await va.api('gigs/mine')).earnings.held === 400, "Cancelled booking's commission was voided (not paid to the mentor)");
ok((await va.api('notifications')).notifications.some((n) => n.type === 'gig'), 'Mentor notified of the booking');
const bkId = (await nb.api('gigs/mine')).learning[0].id;
ok((await nb.api('gigs/complete', { booking_id: bkId, rating: 5 })).status === 400, 'Rating waits until the session starts');
await fetch(BASE + '/api/__dev/gig_past', { method: 'POST', body: JSON.stringify({ id: bkId }) });
ok((await nb.api('gigs/complete', { booking_id: bkId, rating: 5, review: 'So practical, thank you!' })).ok, 'Mentee rated the session');
const gm2 = await va.api('gigs/mine'); ok(gm2.earnings.held === 0 && gm2.earnings.unpaid >= 400, "Confirming the session released the mentor's commission for payout");
// a disputed session (no-show) stays held until Ops decides
const bk3 = await nb.api('gigs/book', { gig_id: gig.id, scheduled_at: new Date(Date.now() + 5 * 864e5).toISOString() });
const bk3id = (await nb.api('gigs/mine')).learning.find((b) => b.status === 'confirmed').id;
await fetch(BASE + '/api/__dev/gig_past', { method: 'POST', body: JSON.stringify({ id: bk3id }) });
ok((await nb.api('gigs/dispute', { booking_id: bk3id, reason: 'Mentor did not show up' })).ok, 'Mentee reported a no-show');
ok((await founder.api('admin/gigs/disputes')).disputes.length === 1, 'Dispute appears in Circle Ops → Finance');
await founder.api('admin/gigs/resolve', { booking_id: bk3id, outcome: 'refund' });
ok((await va.api('gigs/mine')).earnings.held === 0 && (await founder.api('admin/requests')).requests.filter((r) => r.type === 'refund').length === 2, 'Upheld dispute: mentor not paid, mentee refunded');
ok((await nb.api('gigs/list')).gigs.find((g) => g.id === gig.id).rating === 5, 'Gig rating updated');
await nb.page.goto(BASE + '/mentor.html'); await nb.page.waitForSelector('#gigs .card'); await shot(nb.page, '44-gigs');
await va.page.goto(BASE + '/mentor.html#gigs'); await va.page.waitForSelector('#mygigs tr'); await shot(va.page, '45-my-teaching');
await nb.page.click('[data-tab=coach]'); await nb.page.waitForSelector('#gate:not(.hidden)'); ok((await nb.page.textContent('#gate')).includes('Proven VA'), 'Teaching tab explains the rank requirement');

console.log('Circle Laughs comedy');
for (const e of (await founder.api('admin/escalations')).escalations.filter((x) => x.name === 'Maria Santos' && x.status === 'open'))
  await founder.api('admin/escalations/resolve', { id: e.id, action: e.action.includes('mute') ? 'reinstate' : 'dismiss' });
const tk = await nb.api('comedy/post', { format: 'tracker', body: { activity: 3, timer: '07:59:58', caption: 'me googling "how to look busy"', punchline: 'The ONE minute I opened Facebook. #timetracker' } });
ok(tk.id, 'Time-tracker meme posted');
ok((await va.api('comedy/post', { format: 'dialog', body: { lines: [{ who: 'Client', text: "It's just a quick task" }, { who: 'Me', text: 'Sure! What is it?' }, { who: 'Client', text: 'Rebuild the website 🙂' }] }, podcast_ok: true })).id, 'Client-vs-Me meme posted (OK for podcast)');
ok((await va.api('comedy/post', { format: 'starter', body: { title: 'Graveyard VA', items: ['Kopiko', 'Ring light'] } })).status === 400, 'Starter pack needs 3+ items');
const anonP = await client.api('comedy/post', { format: 'story', anonymous: true, body: { text: 'Client asked me to find a cheaper VA. Call me at 09171234567 lol' } });
const cfeed = await nb.api('comedy/feed');
const anonPost = cfeed.posts.find((p) => p.id === anonP.id);
ok(anonPost && anonPost.author.anonymous && !anonPost.author.id && !/0917/.test(anonPost.body.text), 'Anonymous story hides the author and contact details');
const prm = await nb.api('comedy/prompts'); ok(prm.active && prm.active.text.includes('time tracker'), 'Weekly prompt is live');
ok((await va.api('comedy/post', { format: 'pov', prompt_id: prm.active.id, body: { text: 'POV: it screenshots you mid-yawn for the third time' } })).id, 'Prompt entry posted');
ok((await nb.api('comedy/prompts')).active.entries === 1, 'Prompt entry counted');
const rx = await va.api('comedy/react', { id: tk.id, type: 'dead' }); ok(rx.reactions.dead === 1 && rx.my_reaction === 'dead', '💀 reaction counted');
await client.api('comedy/react', { id: tk.id, type: 'tawa' });
ok((await va.api('comedy/comment', { id: tk.id, text: 'Why is this literally me 😭' })).ok, 'Comment on a meme');
ok((await nb.api('notifications')).notifications.some((n) => n.type === 'comedy'), 'Author notified of laughs');
ok((await nb.api('comedy/report', { id: anonP.id, reason: 'mentions a real client' })).ok, 'Report sent');
ok((await founder.api('admin/escalations')).escalations.some((e) => e.rule === 'comedy_report' && e.status === 'open'), 'Report lands in Wed escalations');
ok((await nb.api('comedy/hall')).posts[0].id === tk.id, 'Hall of Fame ranks the funniest post');
ok((await va.api('comedy/article', { title: 'A Field Guide to Quick Task', body: 'x'.repeat(250) })).status === 403, "Circle Writers needs an approved writer");
ok((await va.api('creators/apply', { kind: 'writer', stage_name: 'Maria Writes', bio: 'I write satirical "Dear Client" letters every night shift.' })).ok, 'Writer application sent');
ok((await nb.api('creators/apply', { kind: 'comedian', stage_name: 'Jun the Newbie', bio: 'Stand-up about my first month as a VA, told in English.', sample_url: 'https://www.tiktok.com/@example' })).ok, 'Comedian application sent');
for (const a of (await founder.api('admin/creators')).applications) await founder.api('admin/creators/review', { id: a.id, approve: true });
ok((await va.api('me')).user.badges.some((b) => b.includes('Writer')), 'Writer approved with badge');
const col = await va.api('comedy/article', { title: 'A Field Guide to the Words "Quick Task"', body: 'Quick task (n.): a task that is neither quick nor, legally speaking, a single task. '.repeat(4) });
ok(col.id, 'Writer published a column');
ok((await nb.api('podcast/episode', { title: 'Ep 1: Idle Since 3:02 AM', media_url: 'https://evil.example.com/ep1.mp3' })).status === 400, 'Episodes only from YouTube/Spotify/SoundCloud');
const ep1 = await nb.api('podcast/episode', { title: 'Ep 1: Idle Since 3:02 AM', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Time trackers, explained by people who fear them.' });
ok(ep1.id && ep1.number === 1, 'Comedian published episode 1');
ok((await va.api('comedy/react', { id: ep1.id, type: 'tawa' })).reactions.tawa === 1, 'Listeners react to episodes');
await nb.page.goto(BASE + '/comedy.html'); await nb.page.waitForSelector('#posts article'); await shot(nb.page, '46-tawa-feed');
await nb.page.click('#fmts [data-f="expectation"]'); await nb.page.fill('[name=f_expectation]', 'Work from the beach'); await nb.page.fill('[name=f_reality]', 'Phone hotspot on the bus, 2 bars');
await nb.page.click('#compose button.btn:not(.quiet):not(.sm)'); await nb.page.waitForSelector('#cm.ok');
ok(await nb.page.waitForFunction(() => document.querySelector('#posts').textContent.includes('Phone hotspot on the bus'), null, { timeout: 8000 }).then(() => true, () => false), 'Expectation-vs-Reality meme posted from the UI');
await nb.page.click('[data-tab=podcast]'); await nb.page.waitForSelector('#episodes .embed iframe'); await shot(nb.page, '47-tawa-podcast');
await nb.page.goto(BASE + '/comedy.html#article=' + col.id); await nb.page.waitForSelector('article.essay'); await shot(nb.page, '48-tawa-column', false);

console.log('Circle Hosts (labeled AI)');
const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const hostRun = async (body) => (await fetch(BASE + '/api/__dev/hosts', { method: 'POST', body: JSON.stringify(body) })).json();
const hitem = async (id) => (await founder.api('admin/hosts')).items.find((i) => i.id === id);
ok((await nb.api('admin/hosts/settings', { enabled: true })).status === 403, 'Members cannot change host settings');
const h0 = await founder.api('admin/hosts');
ok(h0.enabled && h0.launch_date === '' && h0.day === 0 && h0.can_manage, 'Fresh install: hosts are on but have no Day 1 yet');
ok(h0.items.filter((i) => i.day <= 7).length === 29 && h0.items.some((i) => i.kind === 'meme' && i.body && Object.keys(i.body).length), 'Before Day 1 the team can preview the first week, memes included');
ok((await hostRun({ clock: '09:00', force: false })).skipped === 'no day 1', 'Hosts stay quiet until the team sets Day 1 (nothing posts on deploy)');
ok((await founder.api('admin/hosts/run', {})).status === 409, '"Run now" needs Day 1 first');
ok((await founder.api('admin/hosts/settings', { launch_date: today })).ok, 'Founder set Day 1 of the host calendar');
const r1 = await hostRun({ clock: '09:00' });
ok(r1.posted.join() === 'd01-am,d01-prompt', '09:00: the 07:30 question and the 09:00 prompt went out (max 2 per run)');
ok(r1.welcomed >= 3, 'Hosts privately welcomed the newly verified members');
const r2 = await hostRun({ clock: '12:05' }); ok(r2.posted.join() === 'd01-noon' && r2.welcomed === 0, '12:05: the noon tip went out; nobody welcomed twice');
const r3 = await hostRun({ clock: '18:10' }); ok(r3.posted.join() === 'd01-hub', '18:10: the hub question went out');
const r4 = await hostRun({ clock: '21:01' }); ok(r4.posted.join() === 'd01-laughs', '21:01: the nightly meme went out');
ok((await hostRun({ clock: '23:59' })).posted.length === 0, 'Nothing is ever posted twice');
const hfeed = await nb.api('feed'); const hpost = hfeed.posts.find((x) => x.author.id === 'host-luna');
ok(hpost && hpost.author.host && hpost.author.rank_name === 'Circle Host · AI', 'Host post on Circle Feed is labeled "Circle Host · AI"');
const hubMsgs = await nb.api('hubs/messages?channel=luzon-vas'); const hubHost = hubMsgs.messages.find((m) => m.host);
ok(hubHost && hubHost.name.startsWith('Aurora') && !hubMsgs.messages.some((m) => m.host && m.mine), 'Hub messages carry a server-side AI flag (not just a display name)');
const fakeHost = await fetch(BASE + '/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json', origin: BASE, 'cf-connecting-ip': '10.9.9.8' },
  body: JSON.stringify({ name: 'Aurora 🌏 · Circle Host (AI)', email: 'fake@x.ph', mobile: '09179990000', password: 'correct-horse-battery', consent: true, adult: true, account_type: 'va', tier: 'newbie' }) });
ok(fakeHost.status === 400 && /reserved/.test((await fakeHost.json()).error || ''), 'Nobody can register with "Circle Host" or "(AI)" in their name');
const hmeme = (await nb.api('comedy/feed')).posts.find((x) => x.author.id === 'host-punchline'); ok(hmeme && hmeme.author.host, 'Punchline posted a labeled meme on Circle Laughs');
const hprompt = (await nb.api('comedy/prompts')).active;
ok(hprompt.text === (await hitem('d01-prompt')).text && hprompt.by_host && hprompt.by_host.name === 'Punchline', "Punchline set this week's Circle Laughs prompt, credited as an AI host");
ok(!(await nb.api('comedy/hall')).posts.some((x) => x.author && x.author.host), 'Hosts never appear in the Hall of Fame');
const nbNotes = (await nb.api('notifications')).notifications, samNotes = (await client.api('notifications')).notifications, fNotes = (await founder.api('notifications')).notifications;
ok(nbNotes.some((n) => n.type === 'host' && n.text.includes('AI helper') && n.text.includes('Circle Academy')), 'VA welcome says the host is an AI helper and points to VA features');
ok(samNotes.some((n) => n.type === 'host' && n.text.includes('Circle Talent')) && !fNotes.some((n) => n.type === 'host'), 'Clients get a client welcome; staff get none');
const q = await nb.api('feed/post', { text: "How do you price your first bookkeeping client? Hourly or per project? #rates", kind: 'question' });
await fetch(BASE + '/api/__dev/age_post', { method: 'POST', body: JSON.stringify({ id: q.id, hours: 4 }) });
ok((await hostRun({ clock: '23:59' })).replies === 1, 'Coach Sage replied to a question nobody had answered after 3 hours');
const qp = (await nb.api('feed')).posts.find((x) => x.id === q.id); ok(qp && qp.comments === 1, 'Reply counted on the post');
const qc = await nb.api('feed/comments?post_id=' + q.id); const hc = (qc.comments || []).find((x) => x.author.id === 'host-sage');
ok(hc && hc.author.host && hc.text.startsWith('🤖 (Circle Host · AI)'), 'Host reply is flagged as AI and starts with the AI label');
ok((await nb.api('notifications')).notifications.some((n) => n.text.includes('Coach Sage (Circle Host · AI) replied')), 'Member notified of the AI reply');
ok((await hostRun({ clock: '23:59' })).replies === 0, 'Hosts reply only once per post');
ok((await nb.api('dm/open', { user_id: 'host-luna' })).status === 403, 'Hosts cannot be messaged privately');
ok((await nb.api('connect/request', { user_id: 'host-luna' })).status >= 400, 'Hosts cannot be added as connections');
ok(!(await nb.api('connect/list')).suggestions.some((x) => x.id.startsWith('host-')), 'Hosts never appear in connection suggestions');
const hprof = await nb.api('profile?id=host-luna'); ok(hprof.profile.host && !hprof.can_dm, 'Host profile marked as AI host, no messaging');
ok((await guest.api('auth/login', { email: 'luna@hosts.thevirtualcircle.invalid', password: '!no-login' })).status === 401, 'Nobody can log in as a host');
ok((await guest.api('config')).newbie_remaining === 19 && (await guest.api('config')).seasoned_remaining === 29, 'Hosts take no Founders Cohort slots');
ok((await founder.api('admin/users?q=hosts.thevirtualcircle')).users.length === 0 && (await founder.api('admin/users/role', { id: 'host-luna', role: 'moderator' })).status === 404, 'Hosts are not managed as people (no role changes)');
ok((await founder.api('admin/squads/save', { name: 'AI squad', leader_id: 'host-sage', members: '' })).status === 400, 'Hosts cannot lead or join a Circle Squad');
ok((await nb.api('podcast/episode', { title: 'Ep 2: With a special guest', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', co_host_ids: 'host-luna' })).status === 400, 'Hosts cannot be listed as podcast co-hosts');
// Referral codes of hosts (HOST1–HOST8) never make a host a referrer, so a host can never earn or be paid
const regRes = await fetch(BASE + '/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json', origin: BASE, 'cf-connecting-ip': '10.9.9.9' },
  body: JSON.stringify({ name: 'Ref Tester', email: 'reftest@x.ph', mobile: '09178887777', password: 'correct-horse-battery', consent: true, adult: true, account_type: 'va', tier: 'newbie', ref: 'host1' }) });
const refCookie = (regRes.headers.get('set-cookie') || '').split(';')[0];
const refExp = await (await fetch(BASE + '/api/privacy/export', { headers: { cookie: refCookie } })).json();
ok(regRes.ok && refExp.profile && refExp.profile.referred_by === '', 'Signing up with a host referral code does not make the AI host a referrer');
const hadm = await founder.api('admin/hosts');
ok(hadm.day === 1 && hadm.counts.posted === 5 && hadm.items.some((i) => i.day === 2), 'Circle Ops shows day 1 of 90 and the week ahead');
ok((await founder.api('admin/hosts/item', { id: 'd02-am', text: 'Edited by the team: what is one small win from your week? Share it below! #wins' })).ok, 'Team edited an upcoming host post');
ok((await founder.api('admin/hosts/item', { id: 'd02-hub', text: 'Message me at someone@example.com for tips' })).status === 400, 'Host posts cannot be edited to include contact details');
ok((await founder.api('admin/hosts/item', { id: 'd02-noon', skip: true })).ok && (await hitem('d02-noon')).status === 'skipped', 'Team skipped an upcoming host post');
ok((await founder.api('admin/hosts/item', { id: 'd02-noon', unskip: true })).ok && (await hitem('d02-noon')).status === 'pending', 'Team brought a skipped post back');
ok((await founder.api('admin/hosts/item', { id: 'd01-am', text: 'too late' })).status === 404, 'Already-posted items cannot be edited');
const d2 = await hitem('d02-am'); ok(d2.text.startsWith('Edited by the team') && d2.edited, 'Edit saved and marked as edited by the team');
await founder.page.goto(BASE + '/admin.html'); await founder.page.click('[data-tab=hosts]'); await founder.page.waitForSelector('#hostitems tr[data-hi]'); await shot(founder.page, '49-ops-hosts');
ok((await founder.page.textContent('#hostitems')).includes('meme:'), 'Ops preview shows the text of upcoming memes');
await nb.page.goto(BASE + '/feed.html'); await nb.page.waitForSelector('.chip.host'); await shot(nb.page, '50-feed-host-label', false);
ok(!(await nb.page.evaluate(() => document.body.innerText)).includes('&#39;'), "Apostrophes in posts render as text, never as '&#39;'");
ok((await nb.page.$$('a[href^="/messages.html?to=host-"]')).length === 0, 'No ✉️ message link on host posts');
await nb.page.click(`[data-id="${q.id}"] [data-comments]`); await nb.page.waitForSelector(`[data-id="${q.id}"] .comment .chip.host`);
ok(true, 'Host reply shows the 🤖 chip in the comment thread');
await nb.page.goto(BASE + '/feed.html#tag=%E0%A4%A'); await nb.page.waitForSelector('article.post'); ok(true, 'A malformed #tag link does not break the feed');
await nb.page.goto(BASE + '/hubs.html#luzon-vas'); await nb.page.waitForSelector('.bubble .chip.host'); ok(true, 'Hub shows the 🤖 chip on host messages');
ok((await founder.api('admin/hosts/settings', { enabled: false })).ok && (await founder.api('admin/hosts')).enabled === false, 'Founder can switch the hosts off');
ok((await founder.api('admin/hosts/run', {})).status === 409, '"Run now" does nothing while the hosts are switched off');
await founder.api('admin/hosts/settings', { enabled: true });
ok((await founder.api('admin/comedy/prompt', { text: 'The team picked this one: my most creative excuse for a late reply was…' })).ok, 'Team set their own Circle Laughs prompt');
await founder.api('admin/hosts/settings', { launch_date: new Date(Date.now() + 8 * 3600e3 - 7 * 864e5).toISOString().slice(0, 10) });
const d8 = await hostRun({ clock: '12:00' });
const tp = (await nb.api('comedy/prompts')).active;
ok(d8.posted.join() === 'd08-noon' && tp.text.startsWith('The team picked this one') && !tp.by_host, "Day 8: Punchline kept the team's prompt instead of replacing it");
ok((await hitem('d08-am')).status === 'missed' && (await hitem('d08-prompt')).status === 'skipped', 'The 07:30 post was 4½ hours late at noon, so it was skipped rather than posted out of time');
ok((await founder.api('admin/hosts')).counts.missed > 0, 'Earlier unposted days are marked missed, never dumped all at once');

console.log('Founding Ambassadors');
const ab0 = await nb.api('ambassadors/board'); ok(ab0.eligible && !ab0.ambassador && ab0.spots_left === 50, 'VA sees the program with 50 spots');
ok((await client.api('creators/apply', { kind: 'ambassador', bio: 'I would love to invite other business owners to hire here.' })).status === 409, 'Clients cannot be Founding Ambassadors');
ok((await nb.api('creators/apply', { kind: 'ambassador', bio: 'Short' })).status === 400, 'Application needs a real reason');
ok((await nb.api('creators/apply', { kind: 'ambassador', bio: 'I want every newbie in my province to have the support I did not have when I started.', pitch: 'My VA course batchmates' })).ok, 'VA applied to be a Founding Ambassador');
ok((await nb.api('creators/apply', { kind: 'ambassador', bio: 'I want every newbie in my province to have the support I did not have.' })).status === 409, 'Duplicate application blocked');
ok((await nb.api('ambassadors/board')).application.status === 'pending', 'Application shows as pending');
const before = (await nb.api('me')).user.pro_until;
const amApp = (await founder.api('admin/creators')).applications.find((a) => a.kind === 'ambassador' && a.status === 'pending');
const [ap1, ap2] = await Promise.all([founder.api('admin/creators/review', { id: amApp.id, approve: true }), founder.api('admin/creators/review', { id: amApp.id, approve: true })]);
ok([ap1, ap2].filter((r) => r.ok).length === 1 && [ap1, ap2].some((r) => r.status === 409), 'A double-clicked approval is applied exactly once');
const nbMe = (await nb.api('me')).user;
ok(nbMe.pro && nbMe.pro_until - Math.max(before, Date.now()) > 89 * 864e5 && nbMe.pro_until - Math.max(before, Date.now()) < 91 * 864e5 && nbMe.badges.some((b) => b.includes('Founding Ambassador')), 'Ambassador got exactly 90 more days of Tier 2 and the badge');
const ab1 = await nb.api('ambassadors/board');
ok(ab1.ambassador && ab1.spots_left === 49 && ab1.leaderboard.some((x) => x.id === nbMe.id), 'Ambassador on the founding leaderboard, spot counted');
ok((await nb.api('creators/apply', { kind: 'ambassador', bio: 'Applying again to get even more free days please.' })).status === 409, "Can't re-apply while already an ambassador");
ok((await va.api('feed')).posts.some((x) => x.author.id === nbMe.id && x.author.ambassador), 'Ambassador badge shows on their posts');
ok((await nb.api('notifications')).notifications.some((n) => n.type === 'ambassador'), 'Ambassador notified with a link to the playbook');
await nb.page.goto(BASE + '/ambassador.html'); await nb.page.waitForSelector('#link'); ok((await nb.page.inputValue('#link')).includes('/join.html?ref='), 'Ambassador page shows their invite link'); await shot(nb.page, '51-ambassador');

console.log('Privacy');
const exp = await va.api('privacy/export'); ok(exp.profile && !exp.profile.pw_hash && exp.messages.length > 0, 'Data export works and omits password hash');
await guest.page.goto(BASE + '/privacy.html'); await shot(guest.page, '23-privacy');
const logout = await va.api('auth/logout', {}); ok((await va.api('me')).user === null, 'Logout clears session');

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed ✨');
process.exit(failures ? 1 : 0);
