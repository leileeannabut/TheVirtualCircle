<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Talent — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle Talent</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Verified VAs, nationwide</h1>
    <p class="muted">Every profile here passed OTP, Government ID, selfie and device checks. Scores come from Circle Bestie simulations.</p></div>
    <div class="tabs" id="tabbar"><button class="tab on" data-tab="market">Marketplace</button><button class="tab hidden" data-tab="source">Sourcing terminal</button><button class="tab hidden" data-tab="pipe">Pipeline</button></div></div>

  <div data-panel="market">
    <form class="card soft" id="mf" style="margin-bottom:1.5rem;padding:1.2rem"><div class="field-row">
      <div><label for="m-skill">Skill</label><input id="m-skill" name="skill" placeholder="e.g. Shopify"></div>
      <div><label for="m-region">Region</label><select id="m-region" name="region"><option value="">All regions</option><option>Luzon</option><option>Visayas</option><option>Mindanao</option></select></div>
      <div><label for="m-tier">Tier</label><select id="m-tier" name="tier"><option value="">Any</option><option value="newbie">Newbie</option><option value="seasoned">Seasoned</option></select></div>
      <div><label for="m-score">Min. sim score</label><select id="m-score" name="min_score"><option value="0">Any</option><option>60</option><option>70</option><option>80</option><option>90</option></select></div>
    </div></form>
    <div class="grid g3" id="market"></div>
  </div>

  <div data-panel="source" class="hidden">
    <form class="card soft" id="sf" style="margin-bottom:1.5rem;padding:1.2rem"><div class="field-row">
      <div><label for="s-q">Keyword</label><input id="s-q" name="q" placeholder="Name or headline"></div>
      <div><label for="s-skill">Skill tag</label><input id="s-skill" name="skill"></div>
      <div><label for="s-region">Region</label><select id="s-region" name="region"><option value="">All</option><option>Luzon</option><option>Visayas</option><option>Mindanao</option></select></div>
      <div><label for="s-hub">Hub</label><select id="s-hub" name="hub"><option value="">All hubs</option></select></div>
      <div><label for="s-score">Min. sim score</label><input id="s-score" name="min_score" type="number" min="0" max="100" value="0"></div>
      <div><label for="s-src">Source</label><select id="s-src" name="source"><option value="">Members + ingested</option><option value="member">Members only</option><option value="ingested">Ingested only</option></select></div>
    </div></form>
    <div class="chips" id="hubcounts" style="margin-bottom:1rem"></div>
    <div class="table-wrap"><table><thead><tr><th>Name</th><th>Skills</th><th>Region / hub</th><th>Sim</th><th>Source</th><th></th></tr></thead><tbody id="srows"></tbody></table></div>
  </div>

  <div data-panel="pipe" class="hidden">
    <p class="muted small">Drag cards between stages (or use the menu on each card). Moving a member to <b>Placed</b> awards their Placed badge.</p>
    <div class="kanban" id="kanban"></div>
  </div>
</main>
<script type="module">
import { api, $, $$, esc, shell, toast, chip, handlePayment, tabs, SOURCING, peso } from '/js/app.js';
const { user: me } = await shell({ auth: true, needActive: true });
const canSource = SOURCING.includes(me.role);
if (canSource) $$('#tabbar .tab').forEach((t) => t.classList.remove('hidden'));
const cfg = await api('config');
$('#s-hub').innerHTML += cfg.hubs.filter((h) => h.kind === 'hub').map((h) => `<option value="${h.id}">${esc(h.name)}</option>`).join('');
if (new URLSearchParams(location.search).get('paid')) toast('Unlocked — your chat is in Hubs → Client chats ✨', 'ok');

const qs = (form) => new URLSearchParams([...new FormData(form)].filter(([, v]) => v !== '')).toString();
const canUnlock = me.account_type === 'client' || canSource;

async function market() {
  const { talent, unlock_fee_php } = await api('talent/list?' + qs($('#mf')));
  $('#market').innerHTML = talent.map((t) => `<div class="card">
    <div class="card-head"><div><h3 style="margin:0">${esc(t.name)}</h3><span class="muted small">${esc(t.tier)} · ${esc(t.hub ? '#' + t.hub : t.region)}</span></div>
      <div class="center"><div class="score" style="font-size:2rem">${t.sim_score || '—'}</div><span class="faint small">sim score</span></div></div>
    <div class="chips" style="margin-bottom:.8rem">${t.badges.map((b) => chip(b, 'amber')).join('')}</div>
    <p class="muted small">${esc(t.bio || 'No bio yet.')}</p>
    <div class="chips" style="margin-bottom:1rem">${String(t.skills).split(',').filter(Boolean).map((s) => chip(s.trim())).join('')}</div>
    <div class="row between"><span class="muted small">${esc(t.rate || '')}</span>${canUnlock && t.id !== me.id ? `<button class="btn sm" data-unlock="${t.id}">Unlock chat · ${peso(unlock_fee_php)}</button>` : ''}</div></div>`).join('')
    || '<div class="empty">No verified VAs match those filters yet.</div>';
}
$('#mf').oninput = market;
$('#market').onclick = async (e) => { const id = e.target.dataset.unlock; if (!id) return; e.target.disabled = true;
  try { const r = await api('talent/unlock', { body: { va_id: id } }); if (r.already || (handlePayment(r, 'Unlocked ✨') && r.paid)) location.href = '/hubs.html#' + encodeURIComponent(r.channel); }
  catch (err) { toast(err.message, 'err'); } finally { e.target.disabled = false; } };

async function source() {
  const { results, hub_counts } = await api('sourcing/search?' + qs($('#sf')));
  $('#hubcounts').innerHTML = Object.entries(hub_counts).map(([h, n]) => chip('#' + h + ' · ' + n)).join('');
  $('#srows').innerHTML = results.map((r) => `<tr><td><b>${esc(r.name)}</b><div class="faint small">${esc((r.headline || '').slice(0, 90))}</div></td>
    <td class="small">${esc(r.skills)}</td><td class="small">${esc(r.region || '—')}${r.hub ? '<br>#' + esc(r.hub) : ''}</td><td>${r.sim_score || '—'}</td>
    <td>${r.source === 'member' ? chip(r.verified ? 'Verified member' : 'In KYC', r.verified ? 'ok' : 'warn') : chip('Ingested', 'info')}${r.url ? `<br><a class="small" href="${esc(r.url)}" target="_blank" rel="noopener nofollow">source</a>` : ''}</td>
    <td><button class="btn quiet sm" data-add="${esc(r.ref)}" data-name="${esc(r.name)}">+ Pipeline</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">No matches.</td></tr>';
}
let st; $('#sf').oninput = () => { clearTimeout(st); st = setTimeout(source, 300); };
$('#srows').onclick = async (e) => { const b = e.target.closest('[data-add]'); if (!b) return;
  try { await api('pipeline/add', { body: { ref: b.dataset.add, name: b.dataset.name } }); toast('Added to pipeline', 'ok'); } catch (err) { toast(err.message, 'err'); } };

async function pipe() {
  const { stages, cards } = await api('pipeline/list');
  $('#kanban').innerHTML = stages.map((s) => { const list = cards.filter((c) => c.stage === s);
    return `<div class="lane" data-stage="${s}"><h4><span>${s}</span><span>${list.length}</span></h4>${list.map((c) => `<div class="kcard" draggable="true" data-id="${c.id}">
      <b>${esc(c.name)}</b><span class="faint small">${esc(c.client || (c.ref.startsWith('user:') ? 'Member' : 'Ingested'))} · ${esc(c.owner || '')}</span>
      <select aria-label="Move ${esc(c.name)}" data-move="${c.id}">${stages.map((x) => `<option ${x === s ? 'selected' : ''}>${x}</option>`).join('')}</select></div>`).join('')}</div>`; }).join('');
}
const move = async (id, stage) => { try { await api('pipeline/move', { body: { id, stage } }); pipe(); } catch (err) { toast(err.message, 'err'); } };
$('#kanban').addEventListener('change', (e) => { if (e.target.dataset.move) move(e.target.dataset.move, e.target.value); });
$('#kanban').addEventListener('dragstart', (e) => { const c = e.target.closest('.kcard'); if (c) e.dataTransfer.setData('text/plain', c.dataset.id); });
$('#kanban').addEventListener('dragover', (e) => { const l = e.target.closest('.lane'); if (l) { e.preventDefault(); l.classList.add('over'); } });
$('#kanban').addEventListener('dragleave', (e) => { const l = e.target.closest('.lane'); if (l) l.classList.remove('over'); });
$('#kanban').addEventListener('drop', (e) => { const l = e.target.closest('.lane'); if (!l) return; e.preventDefault(); move(e.dataTransfer.getData('text/plain'), l.dataset.stage); });

tabs(document, (id) => (id === 'market' ? market : id === 'source' ? source : pipe)().catch((e) => toast(e.message, 'err')));
</script>
</body></html>
