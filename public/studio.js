<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Studio — The Virtual Circle</title></head><body>
<main class="wrap page">
  <section class="hero" style="padding-top:2.5rem"><div class="eyebrow">Circle Studio · vibe-coder agency</div><h1>Build My Platform</h1>
    <p class="lead">Commission a custom platform on the same zero-cost serverless stack that runs The Virtual Circle: Cloudflare Pages and Functions, a D1 database, and private file storage in your own Google Drive. No servers to manage, and it starts on the free tier.</p>
    <a class="btn" href="#brief">Start a project</a></section>

  <section class="grid g3" id="tiers"></section>

  <section class="split rev">
    <div class="card soft"><h3>What's included</h3><ul class="list">
      <li>Cloudflare Pages site + Functions API<span class="chip ok">Free tier</span></li><li>D1 SQL database + Google Drive file storage<span class="chip ok">Free tier</span></li>
      <li>Auth, OTP and role-based access<span class="chip">All tiers</span></li><li>PayMongo / Xendit payments with signed webhooks<span class="chip">Growth+</span></li>
      <li>KYC, fraud flags, AI (Gemini) features<span class="chip">Enterprise</span></li><li>RA 10173 privacy notice &amp; data-request flows<span class="chip">All tiers</span></li></ul></div>
    <form class="card glow" id="brief"><h3>Tell us what you want to build</h3>
      <div class="field-row"><div><label for="b-name">Your name</label><input id="b-name" name="name" required></div><div><label for="b-email">Email</label><input id="b-email" name="email" type="email" required></div></div>
      <label for="b-co">Company / project</label><input id="b-co" name="company">
      <div class="field-row"><div><label for="b-tier">Tier</label><select id="b-tier" name="tier"></select></div><div><label for="b-budget">Budget (USD)</label><input id="b-budget" name="budget" placeholder="$2,000"></div></div>
      <label for="b-det">Describe your platform</label><textarea id="b-det" name="details" required placeholder="Who uses it, what they do, payments, timeline…"></textarea>
      <button class="btn block" style="margin-top:1rem">Send brief</button><div class="msg" id="bm"></div></form>
  </section>
</main>
<script type="module">
import { api, $, esc, shell, say, busy } from '/js/app.js';
const { user } = await shell();
const cfg = await api('config');
$('#tiers').innerHTML = cfg.studio_tiers.map((t, i) => `<div class="card ${i === 2 ? 'glow' : ''}"><div class="eyebrow">${esc(t.name)}</div><div class="price">${esc(t.range)}</div><p class="muted">${esc(t.desc)}</p></div>`).join('');
$('#b-tier').innerHTML = cfg.studio_tiers.map((t) => `<option value="${t.id}">${esc(t.name)} (${esc(t.range)})</option>`).join('');
if (user) { $('#b-name').value = user.name; $('#b-email').value = user.email; }
$('#brief').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { await api('studio/request', { body: Object.fromEntries(new FormData(e.target)) }); e.target.reset(); say($('#bm'), 'Brief received ✨ We will reply with a scoped proposal within 3 business days.', 'ok'); } catch (err) { say($('#bm'), err.message); } }); };
</script>
</body></html>
