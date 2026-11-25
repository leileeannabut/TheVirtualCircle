<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Connections — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle Connections</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Your circle</h1><p class="muted">Connect with VAs you trust. Connections can message each other directly.</p></div></div>
  <div class="grid g3">
    <div class="card"><h3>Requests</h3><div id="incoming"></div></div>
    <div class="card"><h3>My connections</h3><div id="mine"></div></div>
    <div class="card"><h3>People you may know</h3><div id="sugg"></div></div>
  </div>
</main>
<script type="module">
import { api, $, esc, shell, toast, avatar } from '/js/app.js';
await shell({ auth: true, needActive: true });
const row = (p, btns) => `<div class="person">${avatar(p.name, 40)}<div class="grow"><a href="/profile.html?id=${p.id}">${esc(p.name)}</a><div class="faint small">${esc(p.rank_name)}${p.hub ? ' · #' + esc(p.hub) : ''}</div></div>${btns}</div>`;
async function load() {
  const r = await api('connect/list');
  $('#incoming').innerHTML = r.incoming.map((p) => row(p, `<button class="btn ok sm" data-acc="${p.id}">Accept</button><button class="btn quiet sm" data-dec="${p.id}">✕</button>`)).join('') || '<p class="muted small">No pending requests.</p>';
  $('#mine').innerHTML = r.connections.map((p) => row(p, `<a class="btn ghost sm" href="/messages.html?to=${p.id}">Message</a>`)).join('') || '<p class="muted small">No connections yet.</p>';
  $('#sugg').innerHTML = r.suggestions.map((p) => row(p, `<button class="btn quiet sm" data-con="${p.id}">Connect</button>`)).join('') || '<p class="muted small">No suggestions right now.</p>';
}
document.querySelector('main').onclick = async (e) => {
  const d = e.target.dataset;
  try {
    if (d.acc || d.dec) { await api('connect/respond', { body: { user_id: d.acc || d.dec, accept: !!d.acc } }); load(); }
    if (d.con) { const r = await api('connect/request', { body: { user_id: d.con } }); e.target.textContent = r.status === 'accepted' ? 'Connected' : 'Requested'; e.target.disabled = true; }
  } catch (err) { toast(err.message, 'err'); }
};
load();
</script>
</body></html>
