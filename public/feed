<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Feed — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="split">
    <div class="stack" style="min-width:0">
      <form class="card composer-card" id="compose">
        <div class="row" style="margin-bottom:.8rem;align-items:flex-start"><span id="me-avatar"></span>
          <textarea id="text" name="text" placeholder="How was your shift? Share a win, ask a question, or let it out…" maxlength="3000" required aria-label="Write a post" style="flex:1"></textarea></div>
        <div class="row between">
          <div class="tabs" id="kinds" role="radiogroup" aria-label="Post type">
            <button type="button" class="tab on" data-k="post">💬 Post</button><button type="button" class="tab" data-k="win">🏆 Win</button>
            <button type="button" class="tab" data-k="question">❓ Question</button><button type="button" class="tab" data-k="struggle">💭 Struggle</button><button type="button" class="tab" data-k="tip">💡 Tip</button></div>
          <div class="row"><select id="hub" aria-label="Hub" style="width:auto;min-height:40px"><option value="">Everyone</option></select><button class="btn">Post</button></div>
        </div>
        <p class="faint small" style="margin:.6rem 0 0">Use #hashtags to help others find your post. Phone numbers, emails and Telegram/WhatsApp links are hidden automatically.</p>
      </form>
      <div class="card glow hidden" id="bff-suggest"></div>
      <div class="row between"><div class="tabs" id="filters"><button class="tab on" data-f="">All</button><button class="tab" data-f="win">Wins</button><button class="tab" data-f="question">Questions</button>
        <button class="tab" data-f="struggle">Struggles</button><button class="tab" data-f="tip">Tips</button></div><span class="chip amber hidden" id="tagfilter"></span></div>
      <div id="posts" class="stack"></div>
      <button class="btn ghost block hidden" id="older">Load older posts</button>
    </div>
    <aside class="stack">
      <div class="card" id="mecard"></div>
      <div class="card"><h3>People you may know</h3><div id="suggest"></div><a class="small" href="/connections.html">See all connections →</a></div>
      <div class="card soft"><div class="eyebrow">🤖 Meet the Circle Hosts</div><p class="muted small" style="margin:0">Luna, Glow, Coach Sage, Shield, Punchline, Aurora, Coral and Summit are <b>AI helpers</b> run by The Virtual Circle team. They post conversation starters and reply when nobody else has yet. Every host post carries a 🤖 label, and the hosts step back as the circle grows. The VAs replying to them are real.</p></div>
      <div class="card soft"><div class="eyebrow">🌟 Founding Ambassadors</div><h3>Help build the circle</h3><p class="muted small">Real VAs who invite and welcome others get 90 days of Tier 2 free and the Ambassador badge.</p><a class="btn ghost sm" href="/ambassador.html">Learn more</a></div>
      <div class="card glow"><div class="eyebrow">Keep the Circle Glowing ✨</div><h3>Support the circle</h3><p class="muted small">Any amount from ₱20 supports running The Virtual Circle and makes you a Glow Keeper: a glowing ring, the badge, a spot on the Glow Wall and extra Circle Rage Room throws. (Support for a business, not a tax-deductible donation.)</p><a class="btn sm" href="/pro.html">Glow with us</a></div>
      <div class="card soft"><div class="eyebrow">Circle BFF</div><h3>You're not the only one</h3><p class="muted small">Tell Circle BFF what you're going through, or what you've overcome. We quietly pair you with VAs who understand.</p><a class="btn ghost sm" href="/bff.html">Open Circle BFF</a></div>
      <div class="card soft"><div class="eyebrow">Learn</div><h3>Grow your rank</h3><p class="muted small">Finish courses for certificates, and practise in the simulators to raise your score.</p><a class="btn ghost sm" href="/learn.html">Start learning</a></div>
      <div class="card soft"><div class="eyebrow">Circle Laughs 😂</div><h3>Laugh it out</h3><p class="muted small">Time-tracker memes, Client-vs-Me chats, VA starter packs, comedy columns and the Circle Laughs podcast.</p><a class="btn ghost sm" href="/comedy.html">Open Circle Laughs</a></div>
      <div class="card soft"><div class="eyebrow">Need to vent?</div><h3>🧯 Circle Rage Room</h3><p class="muted small">Simmer 🫖, Boiling 🔥 or Volcano 🌋? Throw things at a wall, privately. Free daily throws.</p><a class="btn ghost sm" href="/rage.html">Let it out</a></div>
    </aside>
  </div>
</main>
<script type="module">
import { api, $, $$, esc, shell, toast, ago, chip, rankChip, ambassadorChip, hostChip, safeDecode, avatar, handlePayment, busy, STAFF } from '/js/app.js';
const { user: me } = await shell({ auth: true, needActive: true });
const cfg = await api('config');
if (new URLSearchParams(location.search).get('paid')) toast('Boost is live for 7 days ✨', 'ok');
$('#hub').innerHTML += cfg.hubs.map((h) => `<option value="${h.id}" ${h.id === me.hub ? '' : ''}>${esc(h.name)}</option>`).join('');
$('#me-avatar').innerHTML = avatar(me.name, 44, me.supporter);
$('#mecard').innerHTML = `<div class="row">${avatar(me.name, 52, me.supporter)}<div><a href="/profile.html?id=${me.id}" style="color:var(--text);font-weight:600;text-decoration:none">${esc(me.name)}</a>
  <div class="row" style="gap:.35rem;margin-top:.2rem">${rankChip(me.rank_name || '', me.va_rank)}${me.pro ? chip('✨ Tier 2', 'amber') : ''}${me.supporter ? chip('Glow Keeper', 'amber') : ''}</div></div></div>
  <p class="muted small" style="margin:.8rem 0 0">${esc(me.headline || 'Add a headline on your profile so people know what you do.')}</p>`;
let kind = 'post', filter = '', tag = '', next = null; const byId = new Map();
$$('#kinds .tab').forEach((b) => (b.onclick = () => { kind = b.dataset.k; $$('#kinds .tab').forEach((x) => x.classList.toggle('on', x === b)); }));
$$('#filters .tab').forEach((b) => (b.onclick = () => { filter = b.dataset.f; $$('#filters .tab').forEach((x) => x.classList.toggle('on', x === b)); load(true); }));

const KIND = { win: ['🏆 Win', 'ok'], question: ['❓ Question', 'info'], struggle: ['💭 Struggle', 'warn'], tip: ['💡 Tip', 'amber'] };
const REACTS = [['glow', '💛', 'Glow'], ['hug', '🤗', 'Hug'], ['haha', '😂', 'Haha'], ['wow', '😮', 'Wow'], ['salute', '🫡', 'Salute']];
// Link #hashtags without touching escaped characters like &#39; (an apostrophe)
const fmt = (t) => esc(t).replace(/(^|[^&\p{L}\p{N}_])#([\p{L}\p{N}_]{2,30})/gu, '$1<a href="#tag=$2">#$2</a>');
function card(p) {
  byId.set(p.id, p); const a = p.author;
  return `<article class="card post" id="${p.id}" data-id="${p.id}">
    <div class="post-head">${avatar(a.name, 42, a.supporter)}<div style="min-width:0;flex:1"><a href="/profile.html?id=${a.id}">${esc(a.name)}</a>
      <div class="row" style="gap:.35rem">${rankChip(a.rank_name, a.rank)}${ambassadorChip(a)}${a.pro ? chip('✨ Tier 2', 'amber') : ''}<span class="faint small">${ago(p.ts)}${p.hub ? ' · #' + esc(p.hub) : ''}</span></div></div>
      ${p.boosted ? chip('Boosted', 'amber') : ''}${KIND[p.kind] ? `<span class="chip ${KIND[p.kind][1]} kind">${KIND[p.kind][0]}</span>` : ''}</div>
    <p class="post-body">${fmt(p.text)}</p>
    <div class="post-actions">${REACTS.map(([k, e, l]) => `<button class="react ${p.my_reaction === k ? 'on' : ''}" data-react="${k}" title="${l}">${e} ${p.my_reaction === k ? l : ''}</button>`).join('')}
      <span class="faint small" style="align-self:center">${p.reactions} reaction${p.reactions === 1 ? '' : 's'}</span>
      <button class="react" data-comments style="margin-left:auto">💬 ${p.comments}</button>
      ${p.author.id !== me.id && !a.host ? `<a class="react" href="/messages.html?to=${a.id}">✉️</a>` : ''}
      ${p.mine && !p.boosted ? `<button class="react" data-boost title="Show this post at the top of everyone's feed for 7 days">🚀 Boost</button>` : ''}
      ${p.mine || STAFF.includes(me.role) ? '<button class="react" data-remove title="Delete">🗑️</button>' : ''}</div>
    <div class="comments hidden"></div></article>`;
}
async function load(reset) {
  if (reset) { next = null; $('#posts').innerHTML = ''; }
  const q = new URLSearchParams(); if (next) q.set('before', next); if (filter) q.set('kind', filter); if (tag) q.set('tag', tag);
  const r = await api('feed?' + q);
  if (reset && r.boosted.length) $('#posts').insertAdjacentHTML('beforeend', r.boosted.map(card).join(''));
  $('#posts').insertAdjacentHTML('beforeend', r.posts.map(card).join(''));
  if (reset && !r.posts.length && !r.boosted.length) $('#posts').innerHTML = '<div class="empty">No posts yet. Say hello to the circle 👋</div>';
  next = r.next; $('#older').classList.toggle('hidden', !next);
}
$('#older').onclick = () => load(false);
const readHash = () => { const m = location.hash.match(/^#tag=(.+)$/); tag = m ? safeDecode(m[1]) : '';
  $('#tagfilter').classList.toggle('hidden', !tag); $('#tagfilter').textContent = tag ? '#' + tag + ' ✕' : ''; };
$('#tagfilter').onclick = () => { history.replaceState(null, '', location.pathname); readHash(); load(true); };
window.addEventListener('hashchange', () => { readHash(); if (tag) load(true); });
readHash(); await load(true);
if (location.hash && !tag) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' });

$('#compose').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try {
  const r = await api('feed/post', { body: { text: $('#text').value, kind, hub: $('#hub').value } });
  $('#text').value = ''; if (r.flagged) toast('Contact details were hidden. Please keep conversations on-platform.', 'err');
  if (r.bff_suggest.length) {
    const s = $('#bff-suggest'); s.classList.remove('hidden');
    s.innerHTML = `<div class="eyebrow">Circle BFF</div><h3>Sounds like you're dealing with ${esc(r.bff_suggest.map((t) => t.label.toLowerCase()).join(' and '))}.</h3>
      <p class="muted small">Want us to pair you with a VA who has been through it? Only you two will see the match.</p>
      <div class="row">${r.bff_suggest.map((t) => `<button class="btn sm" data-bff="${t.id}">Yes, find my Circle BFF for “${esc(t.label)}”</button>`).join('')}<button class="btn ghost sm" data-bff-no>Not now</button></div>`;
  }
  load(true);
} catch (err) { toast(err.message, 'err'); } }); };
$('#bff-suggest').onclick = async (e) => {
  if (e.target.dataset.bffNo !== undefined) return $('#bff-suggest').classList.add('hidden');
  const t = e.target.dataset.bff; if (!t) return;
  const r = await api('bff/set', { body: { topic: t, mode: 'going_through' } });
  $('#bff-suggest').innerHTML = r.matched.length ? `<h3>💛 Matched with ${esc(r.matched.map((m) => m.with).join(' and '))}</h3><p class="muted small">Check <a href="/messages.html">Messages</a> to say hi.</p>`
    : `<h3>💛 You're on the list</h3><p class="muted small">We'll notify you the moment someone who's been through it joins Circle BFF.</p>`;
};

$('#posts').onclick = async (e) => {
  const art = e.target.closest('article'); if (!art) return; const id = art.dataset.id;
  const rb = e.target.closest('[data-react]');
  try {
    if (rb) { const r = await api('feed/react', { body: { post_id: id, type: rb.dataset.react } });
      const p = byId.get(id); Object.assign(p, r); const open = !art.querySelector('.comments').classList.contains('hidden'); art.outerHTML = card(p);
      if (open) toggleComments(document.getElementById(id)); return; }
    if (e.target.closest('[data-comments]')) return toggleComments(art);
    if (e.target.closest('[data-remove]')) { if (!confirm('Delete this post?')) return; await api('feed/remove', { body: { id } }); art.remove(); return; }
    if (e.target.closest('[data-boost]')) { if (!confirm(`Boost this post to the top of the feed for 7 days for ₱${cfg.boost_fee_php || 199}?`)) return; handlePayment(await api('feed/boost', { body: { post_id: id } }), 'Boost is live ✨') && load(true); }
  } catch (err) { toast(err.message, 'err'); }
};
async function toggleComments(art) {
  const box = art.querySelector('.comments');
  if (!box.classList.toggle('hidden')) {
    const { comments } = await api('feed/comments?post_id=' + art.dataset.id);
    box.innerHTML = comments.map((cm) => `<div class="comment">${avatar(cm.author.name, 32)}<div><a href="/profile.html?id=${cm.author.id}" style="color:var(--text);font-weight:600;text-decoration:none;font-size:.9rem">${esc(cm.author.name)}</a>
      ${cm.author.host ? ' ' + hostChip() : ''}<span class="faint small"> · ${ago(cm.ts)}</span><p>${fmt(cm.text)}</p></div></div>`).join('') +
      `<form class="row" data-cform style="margin-top:.6rem"><input name="text" placeholder="Write a kind reply…" required style="flex:1"><button class="btn sm">Reply</button></form>`;
    box.querySelector('[data-cform]').onsubmit = async (e) => { e.preventDefault();
      try { await api('feed/comment', { body: { post_id: art.dataset.id, text: e.target.text.value } }); box.classList.add('hidden'); await toggleComments(art);
        const n = art.querySelector('[data-comments]'); n.textContent = '💬 ' + box.querySelectorAll('.comment').length; } catch (err) { toast(err.message, 'err'); } };
  }
}

const { suggestions } = await api('connect/list');
$('#suggest').innerHTML = suggestions.slice(0, 5).map((p) => `<div class="person">${avatar(p.name, 38)}<div class="grow"><a href="/profile.html?id=${p.id}">${esc(p.name)}</a><div class="faint small">${esc(p.rank_name)}${p.hub ? ' · #' + esc(p.hub) : ''}</div></div>
  <button class="btn quiet sm" data-connect="${p.id}">Connect</button></div>`).join('') || '<p class="muted small">You\'re connected with everyone so far 🎉</p>';
$('#suggest').onclick = async (e) => { const id = e.target.dataset.connect; if (!id) return;
  try { const r = await api('connect/request', { body: { user_id: id } }); e.target.textContent = r.status === 'accepted' ? 'Connected' : 'Requested'; e.target.disabled = true; } catch (err) { toast(err.message, 'err'); } };
</script>
</body></html>
