<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Wellness — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle Wellness (telehealth)</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Rest is part of the work</h1>
    <p class="muted">Private video consultations with PRC-licensed psychiatrists and mental health practitioners who understand graveyard-shift burnout, nocturnal sleep problems and isolation.</p></div></div>

  <div class="notice bad" id="crisis" style="margin-bottom:2rem"><b>In crisis right now?</b> Please reach out immediately — you don't have to wait for a booking.<ul id="crisis-list" style="margin:.5rem 0 0"></ul></div>

  <div class="grid g3" style="margin-bottom:2.5rem">
    <div class="card soft"><div class="icon">😮‍💨</div><h3>Burnout</h3><p class="muted small">When every shift feels heavier than the last.</p></div>
    <div class="card soft"><div class="icon">🌙</div><h3>Sleep</h3><p class="muted small">Shift-work sleep disorder, insomnia, and resetting your rhythm.</p></div>
    <div class="card soft"><div class="icon">🫂</div><h3>Isolation</h3><p class="muted small">Working while the world sleeps can get lonely. Talk it through.</p></div>
  </div>

  <div id="signed-out" class="card glow center hidden"><h3>Sign in to book a consult</h3><p class="muted">Bookings are private and linked to your verified account.</p><a class="btn" href="/join.html?next=/wellness.html">Join or sign in</a></div>

  <div id="signed-in" class="hidden">
    <div class="split">
      <div><h2 style="font-size:1.6rem">Practitioners</h2><div class="grid g2" id="pracs" style="margin-top:1rem"></div></div>
      <div class="stack">
        <div class="card"><h3>My sessions</h3><ul class="list" id="mine"></ul></div>
        <div class="card soft"><h3>Are you a PRC-licensed practitioner?</h3><p class="muted small">Join the Circle Wellness. We verify your license before you appear here. Platform fee: <span id="fee">15</span>% per session.</p>
          <details><summary class="btn ghost sm">Apply</summary>
          <form id="apply"><label for="a-lic">PRC license no.</label><input id="a-lic" name="prc_license" inputmode="numeric" required>
            <label for="a-spec">Specialty</label><input id="a-spec" name="specialty" placeholder="Psychiatrist, Psychologist, Guidance counselor…" required>
            <div class="field-row"><div><label for="a-rate">Rate per session (₱)</label><input id="a-rate" name="rate" type="number" min="300" value="1500"></div>
              <div><label for="a-av">Availability</label><input id="a-av" name="availability" placeholder="Mon–Fri 10pm–4am"></div></div>
            <label for="a-bio">Short bio</label><textarea id="a-bio" name="bio"></textarea>
            <button class="btn block" style="margin-top:1rem">Submit application</button><div class="msg" id="am"></div></form></details></div>
      </div>
    </div>
  </div>
  <p class="faint small" style="margin-top:2.5rem">Consultations follow the DOH–NPC Joint Memorandum Circular on telemedicine and the Data Privacy Act of 2012. Session notes stay with your practitioner. The Virtual Circle is not an emergency service.</p>
</main>
<script type="module">
import { api, $, esc, shell, toast, when, peso, handlePayment, say, busy } from '/js/app.js';
const { user } = await shell();
const cfg = await api('config').catch(() => ({ crisis_resources: [] }));
$('#crisis-list').innerHTML = cfg.crisis_resources.map((c) => `<li><b>${esc(c.name)}:</b> ${esc(c.contact)}</li>`).join('');
$('#fee').textContent = cfg.consult_platform_pct ?? 15;
if (new URLSearchParams(location.search).get('paid')) toast('Booked — your session link is under My sessions 💛', 'ok');
if (!user) { $('#signed-out').classList.remove('hidden'); }
else {
  $('#signed-in').classList.remove('hidden');
  const { practitioners } = await api('wellness/practitioners');
  const min = new Date(Date.now() + 2 * 36e5); min.setMinutes(0, 0, 0);
  const minStr = new Date(min - min.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
  $('#pracs').innerHTML = practitioners.map((p) => `<form class="card" data-p="${p.id}"><span class="chip ok">PRC ${esc(p.prc_license)}</span>
    <h3 style="margin-top:.8rem">${esc(p.name)}</h3><p class="muted small">${esc(p.specialty)} · ${esc(p.availability || 'By appointment')}</p><p class="small">${esc(p.bio || '')}</p>
    <p class="price">${peso(p.rate)}<span class="muted small"> / session</span></p>
    <label>Date &amp; time</label><input type="datetime-local" name="scheduled_at" min="${minStr}" value="${minStr}" required>
    <label>What would you like to talk about? <span class="faint">(optional, private)</span></label><textarea name="concern" style="min-height:80px"></textarea>
    <button class="btn block" style="margin-top:1rem">Book &amp; pay</button></form>`).join('') || '<div class="empty">Our first practitioners are being verified. Check back soon.</div>';
  $('#pracs').onsubmit = (e) => { e.preventDefault(); const f = e.target; const d = Object.fromEntries(new FormData(f));
    busy(e.submitter, async () => { try { const r = await api('wellness/book', { body: { practitioner_id: f.dataset.p, scheduled_at: new Date(d.scheduled_at).toISOString(), concern: d.concern } });
      if (handlePayment(r, 'Booked 💛')) loadMine(); } catch (err) { toast(err.message, 'err'); } }); };
  async function loadMine() { const { consultations } = await api('wellness/mine');
    $('#mine').innerHTML = consultations.map((c) => `<li><div><b>${esc(c.with)}</b><div class="muted small">${when(c.when)}</div>${c.concern ? `<div class="faint small">${esc(c.concern)}</div>` : ''}</div>
      <a class="btn sm" href="${esc(c.room)}" target="_blank" rel="noopener">Join call</a></li>`).join('') || '<li class="muted">No sessions yet.</li>'; }
  loadMine();
  $('#apply').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { await api('wellness/apply', { body: Object.fromEntries(new FormData(e.target)) }); say($('#am'), 'Thank you! We will verify your PRC license and reach out.', 'ok'); } catch (err) { say($('#am'), err.message); } }); };
}
</script>
</body></html>
