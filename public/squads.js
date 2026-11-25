<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Squads — The Virtual Circle</title></head><body>
<main class="wrap page">
  <section class="hero" style="padding-top:2.5rem"><div class="eyebrow">Managed VA Team Academy</div><h1>Circle Squads</h1>
    <p class="lead">A Senior VA Pod Leader trains, supervises and quality-checks a team of verified VAs — so you get one accountable team on a monthly retainer.</p></section>

  <section class="grid g3" id="tiers"></section>

  <section class="split">
    <div class="card"><h2 style="font-size:1.6rem">How a squad works</h2>
      <ol class="steps" style="margin-top:1.5rem">
        <li><b>Scoping call</b><br><span class="muted">We map your workflows, hours and tools.</span></li>
        <li><b>Pod Leader match</b><br><span class="muted">A Seasoned VA with top simulation scores leads your squad.</span></li>
        <li><b>Newbie pairing</b><br><span class="muted">Incoming Newbies train under the Pod Leader on your real work, with daily QA.</span></li>
        <li><b>Monthly retainer</b><br><span class="muted">One invoice. Pod Leader and members are paid daily through the platform with BIR 2307 certificates.</span></li>
      </ol></div>
    <form class="card glow" id="req"><h3>Request a squad</h3>
      <div class="field-row"><div><label for="q-name">Your name</label><input id="q-name" name="name" required></div><div><label for="q-email">Work email</label><input id="q-email" name="email" type="email" required></div></div>
      <label for="q-co">Company</label><input id="q-co" name="company" required>
      <div class="field-row"><div><label for="q-tier">Squad size</label><select id="q-tier" name="tier"></select></div><div><label for="q-budget">Monthly budget</label><input id="q-budget" name="budget" placeholder="$3,000"></div></div>
      <label for="q-det">What should the squad handle?</label><textarea id="q-det" name="details" required></textarea>
      <button class="btn block" style="margin-top:1rem">Send request</button><div class="msg" id="qm"></div></form>
  </section>

  <section id="mine-wrap" class="hidden"><h2 style="font-size:1.6rem">My squads</h2><div class="grid g2" id="mine" style="margin-top:1rem"></div></section>
</main>
<script type="module">
import { api, $, esc, shell, say, busy, usd, chip, STAFF, FINANCE, toast, handlePayment } from '/js/app.js';
const { user } = await shell();
const cfg = await api('config');
$('#tiers').innerHTML = cfg.squad_tiers.map((t, i) => `<div class="card ${i === 1 ? 'glow' : ''}"><div class="eyebrow">${esc(t.name)}</div><div class="price">${esc(t.range)}</div><p class="muted">${esc(t.desc)}</p></div>`).join('');
$('#q-tier').innerHTML = cfg.squad_tiers.map((t) => `<option value="${t.id}">${esc(t.name)} — ${esc(t.range)}</option>`).join('');
if (user) { $('#q-name').value = user.name; $('#q-email').value = user.email; }
$('#req').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { await api('squads/request', { body: Object.fromEntries(new FormData(e.target)) }); e.target.reset(); say($('#qm'), 'Thank you! Our General Manager will reach out within 2 business days.', 'ok'); } catch (err) { say($('#qm'), err.message); } }); };
if (user) {
  const { squads } = await api('squads/mine');
  const staff = [...STAFF, ...FINANCE].includes(user.role);
  if (squads.length) { $('#mine-wrap').classList.remove('hidden');
    $('#mine').innerHTML = squads.map((s) => `<div class="card"><div class="card-head"><h3 style="margin:0">${esc(s.name)}</h3>${chip(s.status, s.status === 'active' ? 'ok' : 'warn')}</div>
      <p class="muted small">Client: ${esc(s.client || '—')} · ${usd(s.retainer_usd)}/mo · since ${esc(s.start_date || '—')}</p>
      <p class="small"><b>Pod Leader:</b> ${esc(s.leader)}<br><b>Members:</b> ${s.members.map(esc).join(', ') || '—'}</p>
      ${staff ? `<button class="btn ghost sm" data-inv="${s.id}">Create retainer invoice</button>` : ''}</div>`).join('');
    $('#mine').onclick = async (e) => { const id = e.target.dataset.inv; if (!id) return;
      try { const r = await api('admin/squads/invoice', { body: { id } }); if (r.checkout_url) { navigator.clipboard?.writeText(r.checkout_url); toast('Invoice link copied — send it to the client', 'ok'); } else handlePayment(r); } catch (err) { toast(err.message, 'err'); } };
  }
}
</script>
</body></html>
