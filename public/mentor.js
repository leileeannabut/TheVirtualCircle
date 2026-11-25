<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Mentors — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle Mentors · teaching gigs</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Learn from VAs who've been there</h1>
    <p class="muted">Book 1:1 mentoring, upskilling sessions, resume reviews and mock interviews with Proven VAs, or buy their training modules. Teachers earn a commission on every session, paid out daily with a BIR 2307 certificate.</p></div>
    <div class="tabs"><button class="tab on" data-tab="gigs">Teaching gigs</button><button class="tab" data-tab="shop">Modules</button><button class="tab" data-tab="learning">My sessions</button><button class="tab" data-tab="coach">My teaching</button></div></div>

  <div data-panel="gigs">
    <div class="row" style="margin-bottom:1rem"><select id="g-kind" style="max-width:240px" aria-label="Gig type"><option value="">All gig types</option></select><input id="g-q" placeholder="Search topic or mentor…" style="flex:1;min-width:200px"></div>
    <div class="grid g3" id="gigs"></div>
  </div>

  <div data-panel="learning" class="hidden"><div id="learning" class="stack"></div></div>

  <div data-panel="shop"><div class="grid g3" id="mods"></div></div>

  <div data-panel="coach" class="hidden">
    <div class="notice warn hidden" id="gate" style="margin-bottom:1.5rem"></div>
    <div class="split" id="teach-area">
    <div class="stack">
      <div class="card"><div class="row between"><h3 style="margin:0">My teaching gigs</h3><span class="faint small" id="pctnote"></span></div>
        <div class="table-wrap" style="margin-top:1rem"><table><thead><tr><th>Gig</th><th>Price</th><th>Booked</th><th>Rating</th><th></th></tr></thead><tbody id="mygigs"></tbody></table></div></div>
      <form class="card" id="gigf"><h3 id="gigf-title">New teaching gig</h3><input type="hidden" name="gid">
        <div class="field-row"><div><label>Title</label><input name="title" required placeholder="Land your first client in 30 days"></div><div><label>Type</label><select name="kind" id="gf-kind"></select></div></div>
        <div class="field-row"><div><label>Price (₱)</label><input name="price" type="number" min="100" required></div><div><label>Duration (minutes)</label><input name="duration_min" type="number" min="15" max="480" value="60" required></div></div>
        <label>What will they learn?</label><textarea name="description" placeholder="Agenda, who it's for, what to prepare…"></textarea>
        <label class="inline"><input type="checkbox" name="active" checked> Open for booking</label>
        <button class="btn">Save gig</button><div class="msg" id="gm"></div></form>
      <div class="card"><h3>Sessions I'm teaching</h3><div id="teaching"></div></div>
      <div class="grid g2" id="earn"></div>
      <div class="card"><h3>My modules</h3><div class="table-wrap" style="margin-top:1rem"><table><thead><tr><th>Module</th><th>Price</th><th>My split</th><th>Sales</th><th></th></tr></thead><tbody id="mine"></tbody></table></div></div>
      <form class="card hidden" id="modf"><h3 id="modf-title">New module</h3><input type="hidden" name="mid">
        <label for="m-title">Title</label><input id="m-title" name="title" required>
        <div class="field-row"><div><label for="m-price">Price (₱)</label><input id="m-price" name="price" type="number" min="100" required></div>
          <div><label for="m-split">My split: <b id="splitv"></b>%</label><input id="m-split" name="mentor_split_pct" type="range" step="1"></div></div>
        <p class="faint small" id="splitnote"></p>
        <label for="m-desc">Description</label><textarea id="m-desc" name="description"></textarea>
        <label class="inline"><input type="checkbox" name="active" checked> Listed for sale</label>
        <button class="btn">Save module</button><div class="msg" id="mm"></div></form>
    </div>
    <form class="card" id="pf"><h3>Coach profile</h3>
      <label for="c-rate">Hourly coaching rate (₱)</label><input id="c-rate" name="hourly_rate" type="number" min="100" max="50000" required>
      <label for="c-bio">Bio</label><textarea id="c-bio" name="bio"></textarea>
      <button class="btn block" style="margin-top:1rem">Save profile</button><div class="msg" id="pm"></div></form>
  </div></div>
</main>
<script type="module">
import { api, $, esc, shell, toast, peso, handlePayment, tabs, say, busy, when, avatar, chip, rankChip } from '/js/app.js';
const { user: viewer } = await shell({ auth: true, needActive: true });
if (new URLSearchParams(location.search).get('paid')) toast(new URLSearchParams(location.search).get('for') === 'shop' ? 'Purchased ✨ Your mentor will send the materials.' : 'Booked ✨ Your session is under My sessions.', 'ok');
const minLocal = () => { const d = new Date(Date.now() + 4 * 36e5); d.setMinutes(0, 0, 0); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); };
const stars = (r) => (r == null ? '<span class="faint small">New</span>' : `<span class="amber">★ ${r}</span>`);
let gigData;
async function gigs() {
  gigData = await api('gigs/list?' + new URLSearchParams({ kind: $('#g-kind').value, q: $('#g-q').value }));
  if ($('#g-kind').options.length === 1) $('#g-kind').innerHTML += Object.entries(gigData.kinds).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  $('#gigs').innerHTML = gigData.gigs.map((g) => `<div class="card"><div class="row between"><span class="chip amber">${esc(g.kind_label)}</span>${stars(g.rating)}</div>
    <h3 style="margin-top:.8rem">${esc(g.title)}</h3><div class="row" style="gap:.5rem;margin-bottom:.6rem">${avatar(g.mentor.name, 30)}<a href="/profile.html?id=${g.mentor.id}" style="color:var(--text)">${esc(g.mentor.name)}</a>${rankChip(g.mentor.rank_name, 2)}</div>
    <p class="muted small">${esc(g.description || '')}</p><div class="row between"><span class="price">${peso(g.price)}</span><span class="faint small">${g.duration_min} min · ${g.bookings} booked</span></div>
    ${g.mine ? '<p class="faint small">This is your gig.</p>' : `<details style="margin-top:.6rem"><summary class="btn sm">Book a session</summary><form data-book="${g.id}" style="margin-top:.8rem">
      <label>Date &amp; time</label><input type="datetime-local" name="scheduled_at" min="${minLocal()}" value="${minLocal()}" required>
      <label>What do you want help with?</label><textarea name="note" style="min-height:70px"></textarea><button class="btn sm block" style="margin-top:.6rem">Book &amp; pay ${peso(g.price)}</button></form></details>`}</div>`).join('')
    || '<div class="empty" style="grid-column:1/-1">No teaching gigs yet. Proven VAs on Tier 2 can offer the first one →</div>';
}
let gt; $('#g-q').oninput = () => { clearTimeout(gt); gt = setTimeout(gigs, 300); }; $('#g-kind').onchange = gigs;
$('#gigs').onsubmit = (e) => { e.preventDefault(); const f = e.target; const d = Object.fromEntries(new FormData(f));
  busy(e.submitter, async () => { try { if (handlePayment(await api('gigs/book', { body: { gig_id: f.dataset.book, scheduled_at: new Date(d.scheduled_at).toISOString(), note: d.note } }), 'Booked ✨')) showTab('learning'); } catch (err) { toast(err.message, 'err'); } }); };
let mine;
async function learning() {
  mine = await api('gigs/mine');
  const ST = { confirmed: ['Booked', 'info'], completed: ['Done', 'ok'], cancelled: ['Cancelled · refund due', 'warn'], disputed: ['Under review', 'warn'], refunded: ['Refunded', 'warn'] };
  $('#learning').innerHTML = mine.learning.map((b) => `<div class="card" data-bk="${b.id}"><div class="row between"><div><h3 style="margin:0">${esc(b.title)}</h3><span class="muted small">${esc(b.kind_label)} with <a href="/profile.html?id=${b.mentor.id}">${esc(b.mentor.name)}</a> · ${when(b.when)} · ${b.duration_min} min</span></div>${chip(...(ST[b.status] || [b.status, 'info']))}</div>
    ${['confirmed'].includes(b.status) ? `<div class="row" style="margin-top:.8rem"><a class="btn sm" href="${esc(b.room)}" target="_blank" rel="noopener">Join video call</a><a class="btn ghost sm" href="/messages.html?to=${b.mentor.id}">Message</a>
      ${b.can_cancel_mentee ? '<button class="btn quiet sm" data-cancel>Cancel &amp; refund</button>' : ''}${b.can_dispute ? '<button class="btn danger sm" data-dispute>Report a problem</button>' : ''}</div>` : ''}
    ${b.can_rate ? `<form class="row" data-rate="${b.id}" style="margin-top:.8rem"><select name="rating" style="width:auto">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${'★'.repeat(n)}</option>`).join('')}</select>
      <input name="review" placeholder="How was it? (optional)" style="flex:1;min-width:180px"><button class="btn quiet sm">It happened · rate it</button></form>
      <p class="faint small" style="margin:.4rem 0 0">Your mentor is paid after you confirm, or automatically ${mine.release_days} days after the session if you don't report a problem.</p>` : ''}
    ${b.rating ? `<p class="small amber" style="margin-top:.6rem">${'★'.repeat(b.rating)} ${esc(b.review || '')}</p>` : ''}
    ${b.status === 'confirmed' && !b.can_cancel_mentee && b.when > Date.now() ? `<p class="faint small" style="margin:.4rem 0 0">Free cancellation closes ${mine.cancel_hours} hours before the session. Message your mentor to reschedule.</p>` : ''}</div>`).join('')
    || '<div class="empty">No sessions yet. Browse Teaching gigs to book your first one.</div>';
}
$('#learning').addEventListener('click', async (e) => {
  const card = e.target.closest('[data-bk]'); if (!card) return; const id = card.dataset.bk;
  try {
    if (e.target.dataset.cancel !== undefined) { if (!confirm('Cancel this session? You will be refunded in full.')) return; await api('gigs/cancel', { body: { booking_id: id } }); toast('Cancelled. Your refund is on its way.', 'ok'); learning(); }
    if (e.target.dataset.dispute !== undefined) { const reason = prompt('What went wrong? (e.g. mentor did not show up)'); if (!reason) return; await api('gigs/dispute', { body: { booking_id: id, reason } }); toast('Reported. The Circle team will review it and contact you.', 'ok'); learning(); }
  } catch (err) { toast(err.message, 'err'); }
});
$('#learning').onsubmit = async (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
  try { await api('gigs/complete', { body: { booking_id: e.target.dataset.rate, ...d } }); toast('Thanks for rating ✨', 'ok'); learning(); } catch (err) { toast(err.message, 'err'); } };
async function shop() { const { modules } = await api('mentor/modules');
  $('#mods').innerHTML = modules.map((m) => `<div class="card"><span class="chip amber">by ${esc(m.mentor)}</span><h3 style="margin-top:.8rem">${esc(m.title)}</h3>
    <p class="muted small">${esc(m.description)}</p><div class="row between"><span class="price">${peso(m.price)}</span><button class="btn sm" data-buy="${m.id}">Get module</button></div>
    <p class="faint small" style="margin-top:.6rem">1:1 coaching: ${peso(m.hourly_rate)}/hr</p></div>`).join('') || '<div class="empty" style="grid-column:1/-1">No modules yet. Become the first coach →</div>'; }
$('#mods').onclick = async (e) => { const id = e.target.dataset.buy; if (!id) return; try { handlePayment(await api('mentor/buy', { body: { module_id: id } }), 'Purchased ✨'); } catch (err) { toast(err.message, 'err'); } };

let me;
async function coach() {
  mine = await api('gigs/mine');
  const gate = $('#gate');
  const hasHistory = mine.gigs.length || mine.teaching.length;
  if (!mine.can_teach) {
    gate.innerHTML = (!mine.rank_ok ? '🎓 Teaching unlocks at <b>Proven VA</b> rank, so aspiring VAs learn from people who have done the job. <a href="/app.html">Raise your rank with proof of work →</a>'
      : '✨ Earning from teaching is part of <b>Tier 2 · Circle Pro</b>. <a href="/pro.html">Upgrade on the Circle Membership page →</a>')
      + (hasHistory ? '<br><span class="small">You can still teach the sessions already booked, see your earnings, and pause your gigs and modules below.</span>' : '');
    gate.classList.remove('hidden');
    $('#teach-area').classList.toggle('hidden', !hasHistory);
  } else gate.classList.add('hidden'), $('#teach-area').classList.remove('hidden');
  ['#gigf', '#pf'].forEach((sel) => $(sel).classList.toggle('hidden', !mine.can_teach));
  $('#pctnote').textContent = `You earn ${mine.mentor_pct}% of every booking · held until the session happens`;
  $('#gf-kind').innerHTML = Object.entries(mine.kinds).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  $('#gigf').elements.price.min = mine.min_price;
  $('#mygigs').innerHTML = mine.gigs.map((g) => `<tr><td>${esc(g.title)} ${g.active ? '' : chip('paused')}</td><td>${peso(g.price)}</td><td>${g.bookings}</td><td>${stars(g.rating)}</td><td>${mine.can_teach ? `<button class="btn quiet sm" data-gedit="${g.id}">Edit</button>` : ''}${g.active ? `<button class="btn quiet sm" data-gpause="${g.id}">Pause</button>` : ''}</td></tr>`).join('')
    || '<tr><td colspan="5" class="muted">No gigs yet. Create your first one below.</td></tr>';
  $('#teaching').innerHTML = `<p class="small">Earnings: <b>${peso(mine.earnings.held)}</b> held until sessions happen · <b>${peso(mine.earnings.unpaid)}</b> ready for the next daily payout · <b>${peso(mine.earnings.paid)}</b> paid out</p>`
    + (mine.teaching.map((b) => `<div class="person" data-bk="${b.id}"><div class="grow"><b>${esc(b.title)}</b> ${chip(b.status, b.status === 'completed' ? 'ok' : b.status === 'confirmed' ? 'info' : 'warn')}<div class="faint small">${esc(b.mentee.name)} · ${when(b.when)} · ${peso(b.amount)}${b.note ? ' · “' + esc(b.note) + '”' : ''}</div>
    ${b.rating ? `<div class="small amber">${'★'.repeat(b.rating)} ${esc(b.review || '')}</div>` : ''}</div>${b.status === 'confirmed' ? `<a class="btn sm" href="${esc(b.room)}" target="_blank" rel="noopener">Join</a>` : ''}${b.can_cancel_mentor ? '<button class="btn quiet sm" data-mcancel>Cancel</button>' : ''}</div>`).join('') || '<p class="muted small">No bookings yet.</p>');
  me = await api('mentor/me');
  $('#earn').innerHTML = `<div class="card stat"><b>${peso(me.earnings.unpaid)}</b><span>Pending (paid out daily)</span></div><div class="card stat"><b>${peso(me.earnings.paid)}</b><span>Paid out</span></div>`;
  const s = $('#m-split'); s.min = me.split_min; s.max = me.split_max; if (!s.value || +s.value < me.split_min) s.value = Math.round((me.split_min + me.split_max) / 2);
  $('#splitnote').textContent = `You keep ${me.split_min}–${me.split_max}% of each sale; the rest funds the platform.`; $('#splitv').textContent = s.value;
  if (me.mentor) { $('#c-rate').value = me.mentor.hourly_rate; $('#c-bio').value = me.mentor.bio || ''; $('#modf').classList.toggle('hidden', !mine.can_teach); }
  $('#mine').innerHTML = me.modules.map((m) => `<tr><td>${esc(m.title)}${m.active ? '' : ' <span class="chip">hidden</span>'}</td><td>${peso(m.price)}</td><td>${m.mentor_split_pct}%</td><td>${m.sales}</td>
    <td>${mine.can_teach ? `<button class="btn quiet sm" data-edit="${m.id}">Edit</button>` : ''}${m.active ? `<button class="btn quiet sm" data-mpause="${m.id}">Pause</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="5" class="muted">${me.mentor ? 'No modules yet — add one below.' : 'Save your coach profile first.'}</td></tr>`;
}
$('#teaching').addEventListener('click', async (e) => { if (e.target.dataset.mcancel === undefined) return; const id = e.target.closest('[data-bk]').dataset.bk;
  if (!confirm('Cancel this session? The mentee is refunded in full and you will not be paid for it.')) return;
  try { await api('gigs/cancel', { body: { booking_id: id } }); toast('Cancelled; the mentee will be refunded.', 'ok'); coach(); } catch (err) { toast(err.message, 'err'); } });
$('#mygigs').addEventListener('click', async (e) => { const id = e.target.dataset.gpause; if (!id) return; try { await api('gigs/save', { body: { id, active: false } }); coach(); } catch (err) { toast(err.message, 'err'); } });
$('#mine').addEventListener('click', async (e) => { const id = e.target.dataset.mpause; if (!id) return; try { await api('mentor/module/pause', { body: { id } }); coach(); } catch (err) { toast(err.message, 'err'); } });
$('#mygigs').onclick = (e) => { const g = mine.gigs.find((x) => x.id === e.target.dataset.gedit); if (!g) return; const f = $('#gigf'); const el = (n) => f.elements[n];
  el('gid').value = g.id; el('title').value = g.title; el('kind').value = g.kind; el('price').value = g.price; el('duration_min').value = g.duration_min; el('description').value = g.description; el('active').checked = g.active;
  $('#gigf-title').textContent = 'Edit gig'; f.scrollIntoView({ behavior: 'smooth' }); };
$('#gigf').onsubmit = (e) => { e.preventDefault(); const f = e.target; const d = Object.fromEntries(new FormData(f)); d.active = f.elements.active.checked; if (d.gid) d.id = d.gid; delete d.gid;
  busy(e.submitter, async () => { try { await api('gigs/save', { body: d }); say($('#gm'), 'Saved ✨', 'ok'); f.reset(); f.elements.gid.value = ''; $('#gigf-title').textContent = 'New teaching gig'; coach(); } catch (err) { say($('#gm'), err.message); } }); };
$('#m-split').oninput = (e) => ($('#splitv').textContent = e.target.value);
$('#mine').onclick = (e) => { const m = me.modules.find((x) => x.id === e.target.dataset.edit); if (!m) return; const f = $('#modf');
  const el = (n) => f.elements[n];
  el('mid').value = m.id; el('title').value = m.title; el('price').value = m.price; el('mentor_split_pct').value = m.mentor_split_pct; $('#splitv').textContent = m.mentor_split_pct;
  el('description').value = m.description; el('active').checked = m.active; $('#modf-title').textContent = 'Edit module'; f.scrollIntoView({ behavior: 'smooth' }); };
$('#pf').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { await api('mentor/save', { body: Object.fromEntries(new FormData(e.target)) }); say($('#pm'), 'Saved ✨', 'ok'); coach(); } catch (err) { say($('#pm'), err.message); } }); };
$('#modf').onsubmit = (e) => { e.preventDefault(); const f = e.target; const d = Object.fromEntries(new FormData(f)); d.active = f.elements.active.checked; if (d.mid) d.id = d.mid; delete d.mid;
  busy(e.submitter, async () => { try { await api('mentor/module', { body: d }); say($('#mm'), 'Saved ✨', 'ok'); f.reset(); f.elements.mid.value = ''; $('#modf-title').textContent = 'New module'; coach(); } catch (err) { say($('#mm'), err.message); } }); };
const showTab = tabs(document, (id) => ({ gigs, shop, learning, coach }[id])().catch((e) => toast(e.message, 'err')));
const route = () => { const h = location.hash.slice(1); if (h === 'teaching' || h === 'gigs') showTab('coach'); else if (h === 'learning') showTab('learning'); else if (h === 'shop') showTab('shop'); };
const forTab = new URLSearchParams(location.search).get('for'); if (forTab && ['learning', 'shop'].includes(forTab)) showTab(forTab);
window.addEventListener('hashchange', route); route();
</script>
</body></html>
