<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Laughs — The Virtual Circle</title>
<style>
  .fmt{display:flex;gap:.35rem;flex-wrap:wrap}
  .meme{border-radius:16px;background:#0e1530;border:1px solid var(--line-2);padding:1.1rem 1.2rem;margin:.6rem 0 .8rem;overflow:hidden}
  .meme .big{font-family:var(--display);font-size:clamp(1.25rem,2.6vw,1.6rem);line-height:1.3;white-space:pre-wrap;overflow-wrap:anywhere}
  .meme .lbl{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--faint);font-weight:600}
  .meme .chatline{display:flex;margin:.35rem 0}.meme .chatline span{max-width:80%;padding:.5rem .8rem;border-radius:14px 14px 14px 4px;background:var(--surface-2);overflow-wrap:anywhere}
  .meme .chatline b{display:block;font-size:.72rem;color:var(--amber)}.meme .chatline.me{justify-content:flex-end}.meme .chatline.me span{border-radius:14px 14px 4px 14px;background:rgba(242,182,74,.14)}
  .meme .vs{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}.meme .vs>div{border-radius:12px;padding:.8rem;background:var(--surface-2)}.meme .vs>div:last-child{background:rgba(255,143,143,.1)}
  .meme .pack{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;margin-top:.6rem}.meme .pack div{background:var(--surface-2);border-radius:10px;padding:.7rem .5rem;text-align:center;font-size:.88rem;min-height:64px;display:grid;place-items:center;overflow-wrap:anywhere}
  .tracker{border-radius:12px;overflow:hidden;border:1px solid #3a4a7a;background:#101a36;font-family:ui-monospace,Menlo,Consolas,monospace}
  .tracker .bar{background:#1f2b55;padding:.4rem .7rem;font-size:.78rem;display:flex;justify-content:space-between}.tracker .body{padding:.8rem}
  .tracker .act{height:10px;border-radius:99px;background:#2a3560;overflow:hidden;margin:.3rem 0 .7rem}.tracker .act i{display:block;height:100%;background:linear-gradient(90deg,#ff6b6b,#f6c66b,#7fd8a8)}
  .tracker .shot{border-radius:8px;background:repeating-linear-gradient(45deg,#1b2548,#1b2548 10px,#202c55 10px,#202c55 20px);min-height:90px;display:grid;place-items:center;font-size:.85rem;color:#c9d3f1;text-align:center;padding:.5rem;filter:saturate(.9)}
  @media(max-width:560px){.meme .vs{grid-template-columns:1fr}.meme .pack{grid-template-columns:repeat(2,1fr)}}
  .embed{position:relative;width:100%;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#000}
  .embed iframe{width:100%;border:0;display:block}
  article.essay{white-space:pre-wrap;font-size:1.05rem;line-height:1.8;overflow-wrap:anywhere}
</style></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle Laughs 😂</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">The funny side of VA life</h1>
    <p class="muted">Time trackers, "quick tasks", 3am Slack pings, the client who replies "noted". If it happened to you, it happened to all of us. Laugh it out.</p></div>
    <div class="tabs"><button class="tab on" data-tab="laugh">Laugh Feed</button><button class="tab" data-tab="writers">Circle Writers</button><button class="tab" data-tab="podcast">Podcast &amp; creators</button><button class="tab" data-tab="hall">Hall of Fame</button></div></div>
  <p class="notice warn small" id="rules" style="margin-bottom:1.5rem"></p>

  <div data-panel="laugh" class="split">
    <div class="stack" style="min-width:0">
      <div class="card glow hidden" id="prompt"></div>
      <form class="card" id="compose"><h3>Make the circle laugh</h3>
        <div class="fmt" id="fmts" role="radiogroup" aria-label="Format"></div>
        <div id="fields" style="margin-top:.6rem"></div>
        <div class="lbl faint small" style="margin-top:1rem">Preview</div><div id="preview"></div>
        <div class="row" style="gap:1rem"><label class="inline" style="margin:.4rem 0"><input type="checkbox" name="anonymous"> Post anonymously</label>
          <label class="inline" style="margin:.4rem 0"><input type="checkbox" name="podcast_ok"> OK to read on the Circle Laughs podcast (anonymously)</label>
          <label class="inline hidden" style="margin:.4rem 0" id="for-prompt"><input type="checkbox" name="use_prompt" checked> Entry for this week's prompt</label></div>
        <button class="btn">Post 😂</button><div class="msg" id="cm"></div></form>
      <div class="row between"><div class="tabs" id="sort"><button class="tab on" data-s="new">New</button><button class="tab" data-s="top">Funniest this week</button></div>
        <select id="ffilter" style="width:auto;min-height:40px" aria-label="Filter by format"><option value="">All formats</option></select></div>
      <div id="posts" class="stack"></div><button class="btn ghost block hidden" id="older">More laughs</button>
    </div>
    <aside class="stack">
      <div class="card"><h3>Why Circle Laughs?</h3><p class="muted small">Because sometimes the healthiest thing after a 12-hour shift is laughing at the time tracker that called you idle while you were on the phone with the client.</p></div>
      <div class="card soft"><div class="eyebrow">🎙️ The Circle Laughs Podcast</div><h3>Got a story?</h3><p class="muted small">Tick "OK to read on the podcast" and our VA comedians might read it on the show, always anonymously.</p><button class="btn ghost sm" data-goto="podcast">Listen &amp; apply</button></div>
      <div class="card soft"><div class="eyebrow">Still steaming?</div><h3>🧯 Circle Rage Room</h3><p class="muted small">Some days you laugh, some days you throw eggs.</p><a class="btn ghost sm" href="/rage.html">Open the Circle Rage Room</a></div>
    </aside>
  </div>

  <div data-panel="writers" class="hidden">
    <div id="articles"></div><div id="article" class="hidden"></div>
    <form class="card hidden" id="write" style="margin-top:2rem"><h3>Write a column</h3><p class="muted small">Satire, "Dear Client" letters, listicles, glossaries of VA-speak… Keep it kind: punch at situations, not people.</p>
      <input type="hidden" name="aid"><label>Title</label><input name="title" required maxlength="140" placeholder="A Field Guide to the Words 'Quick Task'">
      <label>Your column</label><textarea name="body" required style="min-height:280px" placeholder="At least 200 characters…"></textarea>
      <button class="btn" style="margin-top:1rem">Publish</button><div class="msg" id="wm"></div></form>
  </div>

  <div data-panel="podcast" class="hidden">
    <div class="split">
      <div class="stack" style="min-width:0"><h2 style="font-size:1.6rem">🎙️ The Circle Laughs Podcast</h2><div id="episodes" class="stack"></div>
        <form class="card hidden" id="epf"><h3>Publish an episode</h3><p class="muted small">Upload to YouTube, Spotify for Podcasters or SoundCloud first (free), then paste the link here.</p>
          <div class="field-row"><div><label>Episode title</label><input name="title" required></div><div><label>Episode #</label><input name="number" type="number" min="1" placeholder="auto"></div></div>
          <label>Link (YouTube / Spotify / SoundCloud)</label><input name="media_url" required placeholder="https://www.youtube.com/watch?v=…">
          <label>Description</label><textarea name="description" style="min-height:80px"></textarea>
          <label>Co-host user IDs <span class="faint">(optional, comma separated)</span></label><input name="co_host_ids">
          <button class="btn" style="margin-top:1rem">Publish episode</button><div class="msg" id="em"></div></form>
        <div class="card hidden" id="stories"><h3>Listener stories (OK to read on air)</h3><div id="storylist"></div></div>
      </div>
      <aside class="stack" id="apply">
        <div class="card glow"><h3>Join the Circle Laughs crew</h3><p class="muted small">VA comedians host the podcast. VA writers publish columns in the Circle Writers. Both get a creator badge.</p><div id="mycreator"></div>
          <form id="apf"><label>I want to be a</label><select name="kind"><option value="comedian">🎙️ Podcast comedian / host</option><option value="writer">✍️ Comedy writer</option></select>
            <label>Stage or pen name</label><input name="stage_name" maxlength="60"><label>About your comedy</label><textarea name="bio" required style="min-height:80px" placeholder="Your style, what VA life topics you'd roast…"></textarea>
            <label>Sample link <span class="faint">(optional: TikTok, YouTube, blog)</span></label><input name="sample_url" placeholder="https://"><label>Pitch an episode or column</label><textarea name="pitch" style="min-height:70px"></textarea>
            <button class="btn block" style="margin-top:1rem">Apply</button><div class="msg" id="am"></div></form></div>
      </aside>
    </div>
  </div>

  <div data-panel="hall" class="hidden"><div class="split"><div class="stack" style="min-width:0"><h2 style="font-size:1.6rem">🏆 Funniest this week</h2><div id="hallposts" class="stack"></div></div>
    <aside class="card"><h3>Top Laughs creators</h3><div id="hallcreators"></div></aside></div></div>
</main>
<script type="module">
import { api, $, $$, esc, shell, toast, ago, avatar, chip, rankChip, ambassadorChip, hostChip, safeDecode, tabs, busy, say, STAFF } from '/js/app.js';
const { user: me } = await shell({ auth: true, needActive: true });
const cfg = await api('config').catch(() => ({}));
$('#rules').textContent = '🧡 House rules: ' + (cfg.comedy_rules || 'Joke about situations, not people. Never name real clients, companies or coworkers.');
const REACTS = [['tawa', '😂', 'LOL'], ['dead', '💀', 'Dead'], ['relate', '🫠', 'Relate'], ['real', '🎯', 'Too real']];
const FIELDS = {
  story: [['text', 'textarea', 'Tell it like you tell your VA friends…']],
  dialog: [['lines', 'lines']],
  expectation: [['expectation', 'input', 'Expectation: "I\'ll work from the beach"'], ['reality', 'input', 'Reality: phone hotspot on the bus, 2 bars']],
  nobody: [['who', 'input', 'The client at 4:59pm'], ['text', 'input', '"Quick task before you log off 😊"']],
  pov: [['text', 'textarea', 'POV: the time tracker screenshots you mid-yawn for the third time']],
  starter: [['title', 'input', 'Graveyard-shift VA'], ['items', 'items']],
  tracker: [['activity', 'number', 'Activity %'], ['timer', 'input', '07:59:58'], ['caption', 'input', 'Screenshot: me googling "how to look busy"'], ['punchline', 'input', 'The one minute I opened Facebook.']],
};
let fmt = 'tracker', draft = {};
const LABELS = { tracker: '⏱️ Time tracker', dialog: '💬 Client vs Me', expectation: '🌴 Expectation vs Reality', nobody: '🙃 Nobody:', pov: '👀 POV', starter: '🧰 Starter pack', story: '📖 Story' };
$('#fmts').innerHTML = Object.entries(LABELS).map(([k, l]) => `<button type="button" class="btn sm ${k === fmt ? '' : 'quiet'}" data-f="${k}">${l}</button>`).join('');
$('#ffilter').innerHTML += Object.entries(LABELS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('');

// ───── meme card renderer (shared by preview, feed and hall) ─────
function card(f, b) {
  b = b || {};
  if (f === 'story') return `<div class="meme"><div class="big" style="font-family:var(--font);font-size:1.05rem">${esc(b.text || '…')}</div></div>`;
  if (f === 'pov') return `<div class="meme"><div class="lbl">POV</div><div class="big">${esc(b.text || '…')}</div></div>`;
  if (f === 'nobody') return `<div class="meme"><div class="big" style="font-size:1.1rem"><span class="faint">Nobody:</span>\n<span class="faint">Absolutely no one:</span>\n<b>${esc(b.who || '…')}:</b> ${esc(b.text || '')}</div></div>`;
  if (f === 'expectation') return `<div class="meme"><div class="vs"><div><div class="lbl">Expectation</div><div class="big" style="font-size:1.1rem">${esc(b.expectation || '…')}</div></div><div><div class="lbl">Reality</div><div class="big" style="font-size:1.1rem">${esc(b.reality || '…')}</div></div></div></div>`;
  if (f === 'dialog') return `<div class="meme">${(b.lines || []).filter((l) => l.text).map((l) => `<div class="chatline ${/^me\b/i.test(l.who || 'Me') ? 'me' : ''}"><span><b>${esc(l.who || 'Me')}</b>${esc(l.text)}</span></div>`).join('') || '<span class="faint">Add lines…</span>'}</div>`;
  if (f === 'starter') return `<div class="meme"><div class="big">${esc(b.title || '…')} <span class="faint" style="font-size:.9rem">starter pack</span></div><div class="pack">${(b.items || []).filter(Boolean).map((i) => `<div>${esc(i)}</div>`).join('')}</div></div>`;
  if (f === 'tracker') { const a = Math.max(0, Math.min(100, Number(b.activity) || 0));
    return `<div class="meme"><div class="tracker"><div class="bar"><span>⏱️ TrackerBot 3000™</span><span>● REC</span></div><div class="body">
      <div class="row between small"><span>Today</span><b>${esc(b.timer || '00:00:00')}</b></div><div class="small">Activity: <b style="color:${a < 30 ? 'var(--bad)' : a < 70 ? 'var(--warn)' : 'var(--ok)'}">${a}%</b>${a < 30 ? ' · ⚠️ Are you still there?' : ''}</div>
      <div class="act"><i style="width:${a}%"></i></div><div class="shot">📸 ${esc(b.caption || 'Screenshot captured')}</div></div></div>${b.punchline ? `<div class="big" style="font-size:1.1rem;margin-top:.8rem">${esc(b.punchline)}</div>` : ''}</div>`; }
  return '';
}
function readDraft() {
  const d = {}; const box = $('#fields');
  for (const [k, kind] of FIELDS[fmt]) {
    if (kind === 'lines') d.lines = $$('[data-line]', box).map((r) => ({ who: r.querySelector('[data-who]').value, text: r.querySelector('[data-text]').value }));
    else if (kind === 'items') d.items = $$('[data-item]', box).map((i) => i.value);
    else d[k] = box.querySelector(`[name="f_${k}"]`).value;
  }
  return d;
}
function drawFields() {
  $$('#fmts [data-f]').forEach((b) => b.classList.toggle('quiet', b.dataset.f !== fmt));
  $('#fields').innerHTML = FIELDS[fmt].map(([k, kind, ph]) => {
    if (kind === 'lines') return `<div id="lines">${[['Client', '"Can you do a quick task?"'], ['Me', '"Sure! What is it?"'], ['Client', '"Rebuild the website 🙂"']].map(([w, t]) => lineRow(w, t)).join('')}</div><button type="button" class="btn quiet sm" id="addline">+ Line</button>`;
    if (kind === 'items') return `<div class="field-row">${['Third coffee', 'Ring light', 'Two phones', 'Sleep mask at 8am', 'Time tracker anxiety', 'Fan on max'].map((p) => `<input data-item placeholder="${esc(p)}">`).join('')}</div>`;
    if (kind === 'textarea') return `<textarea name="f_${k}" placeholder="${esc(ph)}" style="min-height:90px"></textarea>`;
    if (kind === 'number') return `<label>${esc(ph)}: <b id="actv">3</b>%</label><input name="f_${k}" type="range" min="0" max="100" value="3">`;
    return `<input name="f_${k}" placeholder="${esc(ph)}" style="margin-top:.4rem">`;
  }).join('');
  preview();
}
const lineRow = (w, t) => `<div class="row" data-line style="margin:.3rem 0"><input data-who value="${esc(w)}" style="width:110px" aria-label="Who"><input data-text placeholder=${JSON.stringify(t)} style="flex:1" aria-label="Line"></div>`;
const withPlaceholders = (d) => { // preview uses placeholders so the card never looks empty
  const box = $('#fields'); const o = structuredClone(d);
  if (o.lines) o.lines = o.lines.map((l, i) => ({ who: l.who, text: l.text || $$('[data-text]', box)[i]?.placeholder.replace(/^"|"$/g, '') }));
  if (o.items) o.items = o.items.map((v, i) => v || $$('[data-item]', box)[i]?.placeholder);
  for (const [k, kind, ph] of FIELDS[fmt]) if (!['lines', 'items', 'number'].includes(kind) && !o[k]) o[k] = ph.replace(/^(Expectation|Reality): /, '').replace(/^"|"$/g, '');
  return o;
};
function preview() { draft = readDraft(); if ($('#actv')) $('#actv').textContent = draft.activity; $('#preview').innerHTML = card(fmt, withPlaceholders(draft)); }
$('#fmts').onclick = (e) => { const b = e.target.closest('[data-f]'); if (!b) return; fmt = b.dataset.f; drawFields(); };
$('#fields').addEventListener('input', preview);
$('#fields').addEventListener('click', (e) => { if (e.target.id === 'addline') { $('#lines').insertAdjacentHTML('beforeend', lineRow('Me', '…')); preview(); } });
drawFields();

// ───── weekly prompt ─────
const pr = await api('comedy/prompts');
if (pr.active) { $('#prompt').classList.remove('hidden'); $('#for-prompt').classList.remove('hidden');
  $('#prompt').innerHTML = `<div class="eyebrow">This week's prompt${pr.active.by_host ? ` · set by ${esc(pr.active.by_host.name)} ${hostChip()}` : ''}</div><h3 style="margin:.2rem 0">${esc(pr.active.text)}</h3><p class="muted small" style="margin:0">${pr.active.entries} entr${pr.active.entries === 1 ? 'y' : 'ies'} so far · <a href="#" id="seeprompt">see them</a></p>`;
  $('#seeprompt').onclick = (e) => { e.preventDefault(); promptFilter = pr.active.id; load(true); };
  if (STAFF.includes(me.role)) $('#prompt').insertAdjacentHTML('beforeend', `<form class="row" id="newprompt" style="margin-top:.8rem"><input name="text" placeholder="New weekly prompt (staff)" style="flex:1"><button class="btn quiet sm">Set</button></form>`);
}
document.addEventListener('submit', async (e) => { if (e.target.id !== 'newprompt') return; e.preventDefault();
  try { await api('admin/comedy/prompt', { body: { text: e.target.text.value } }); location.reload(); } catch (err) { toast(err.message, 'err'); } });

// ───── feed ─────
let sort = 'new', next = null, promptFilter = ''; const byId = new Map();
const who = (a) => a.anonymous ? `${avatar('?', 40)}<div><b>Anonymous VA</b><div class="faint small">Member</div></div>`
  : `${avatar(a.name, 40)}<div><a href="/profile.html?id=${a.id}" style="color:var(--text);font-weight:600;text-decoration:none">${esc(a.name)}</a>
    <div class="row" style="gap:.3rem">${rankChip(a.rank_name, 1)}${ambassadorChip(a)}${(a.creator || []).map((r) => chip(r === 'comedian' ? '🎙️ Comedian' : '✍️ Writer', 'amber')).join('')}</div></div>`;
const reactBar = (p) => `<div class="post-actions">${REACTS.map(([k, e, l]) => `<button class="react ${p.my_reaction === k ? 'on' : ''}" data-react="${k}" title="${l}">${e} ${p.reactions?.[k] || ''}</button>`).join('')}
  <button class="react" data-comments style="margin-left:auto">💬 ${p.comments}</button>
  ${p.mine || STAFF.includes(me.role) ? '<button class="react" data-remove title="Delete">🗑️</button>' : '<button class="react" data-report title="Report">🚩</button>'}</div><div class="comments hidden"></div>`;
const postCard = (p) => { byId.set(p.id, p); return `<article class="card post" id="${p.id}" data-id="${p.id}"><div class="post-head">${who(p.author)}<span class="faint small" style="margin-left:auto">${ago(p.ts)}</span>
  ${p.featured ? chip('⭐ Featured', 'amber') : ''}${p.podcast_ok ? chip('🎙️ Podcast OK', 'info') : ''}</div>${card(p.format, p.body)}${reactBar(p)}</article>`; };
async function load(reset) {
  if (reset) { next = null; $('#posts').innerHTML = ''; }
  const q = new URLSearchParams({ sort }); if (next) q.set('before', next); if ($('#ffilter').value) q.set('format', $('#ffilter').value); if (promptFilter) q.set('prompt', promptFilter);
  const r = await api('comedy/feed?' + q);
  $('#posts').insertAdjacentHTML('beforeend', r.posts.map(postCard).join(''));
  if (reset && !r.posts.length) $('#posts').innerHTML = '<div class="empty">No laughs here yet. Be the first 😂</div>';
  next = r.next; $('#older').classList.toggle('hidden', !next);
}
$('#older').onclick = () => load(false); $('#ffilter').onchange = () => load(true);
$$('#sort .tab').forEach((b) => (b.onclick = () => { sort = b.dataset.s; promptFilter = ''; $$('#sort .tab').forEach((x) => x.classList.toggle('on', x === b)); load(true); }));
$('#compose').onsubmit = (e) => { e.preventDefault(); const f = e.target.elements;
  busy(e.submitter, async () => { try {
    await api('comedy/post', { body: { format: fmt, body: readDraft(), anonymous: f.anonymous.checked, podcast_ok: f.podcast_ok.checked, prompt_id: pr.active && f.use_prompt.checked && !$('#for-prompt').classList.contains('hidden') ? pr.active.id : '' } });
    drawFields(); f.anonymous.checked = f.podcast_ok.checked = false; say($('#cm'), 'Posted 😂', 'ok'); sort = 'new'; load(true);
  } catch (err) { say($('#cm'), err.message); } }); };

// shared actions for posts, articles and episodes
async function act(e) {
  const art = e.target.closest('[data-id]'); if (!art) return; const id = art.dataset.id;
  try {
    const rb = e.target.closest('[data-react]');
    if (rb) { const r = await api('comedy/react', { body: { id, type: rb.dataset.react } }); const p = byId.get(id) || {}; p.reactions = r.reactions; p.my_reaction = r.my_reaction;
      art.querySelectorAll('[data-react]').forEach((b) => { const k = b.dataset.react; b.classList.toggle('on', r.my_reaction === k); b.textContent = REACTS.find((x) => x[0] === k)[1] + ' ' + (r.reactions[k] || ''); }); return; }
    if (e.target.closest('[data-comments]')) return comments(art);
    if (e.target.closest('[data-remove]')) { if (!confirm('Delete this?')) return; await api('comedy/remove', { body: { id } }); art.remove(); return; }
    if (e.target.closest('[data-report]')) { const reason = prompt('What is wrong with it? (e.g. names a real client, hurtful, private screenshot)'); if (reason === null) return;
      await api('comedy/report', { body: { id, reason } }); toast('Thanks. Our moderators will take a look.', 'ok'); }
  } catch (err) { toast(err.message, 'err'); }
}
async function comments(art) {
  const box = art.querySelector('.comments'); if (box.classList.toggle('hidden')) return;
  const { comments } = await api('comedy/comments?id=' + art.dataset.id);
  box.innerHTML = comments.map((c) => `<div class="comment">${avatar(c.author.name, 30)}<div><b class="small">${esc(c.author.name)}</b>${c.author.host ? ' ' + hostChip() : ''}<span class="faint small"> · ${ago(c.ts)}</span><p>${esc(c.text)}</p></div></div>`).join('')
    + `<form class="row" data-cform style="margin-top:.6rem"><input name="text" placeholder="Add to the joke…" required style="flex:1"><button class="btn sm">Reply</button></form>`;
  box.querySelector('[data-cform]').onsubmit = async (e) => { e.preventDefault(); try { await api('comedy/comment', { body: { id: art.dataset.id, text: e.target.text.value } }); box.classList.add('hidden'); comments(art); } catch (err) { toast(err.message, 'err'); } };
}
['#posts', '#hallposts', '#article', '#episodes'].forEach((s) => $(s).addEventListener('click', act));

// ───── Circle Writers ─────
let canWrite = false;
async function writers() {
  $('#article').classList.add('hidden'); $('#articles').classList.remove('hidden');
  const r = await api('comedy/articles'); canWrite = r.can_write; $('#write').classList.toggle('hidden', !canWrite);
  $('#articles').innerHTML = `<div class="grid g2">${r.articles.map((a) => `<a class="card" href="#article=${a.id}" style="color:inherit;text-decoration:none">${a.featured ? chip('⭐ Featured', 'amber') : ''}<h3 style="margin-top:.6rem">${esc(a.title)}</h3>
    <p class="muted small">${esc(a.excerpt)}…</p><div class="row between"><span class="small">✍️ ${esc(a.author.name)}</span><span class="faint small">😂 ${a.laughs} · 💬 ${a.comments} · ${ago(a.ts)}</span></div></a>`).join('')
    || `<div class="empty" style="grid-column:1/-1">No columns yet. ${canWrite ? 'Write the first one below ✍️' : 'Funny writer? Apply on the Podcast &amp; creators tab.'}</div>`}</div>`;
}
async function readArticle(id) {
  showTab('writers');
  const { article: a } = await api('comedy/article?id=' + encodeURIComponent(id)); byId.set(a.id, a);
  $('#articles').classList.add('hidden'); $('#article').classList.remove('hidden');
  $('#article').innerHTML = `<a href="#writers" class="small">← All columns</a><div class="card post" data-id="${a.id}" style="margin-top:1rem;max-width:820px"><div class="eyebrow">Circle Writers</div><h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">${esc(a.title)}</h1>
    <div class="post-head">${who(a.author)}<span class="faint small" style="margin-left:auto">${ago(a.ts)}</span></div><article class="essay">${esc(a.body)}</article>${reactBar(a)}</div>`;
}
$('#write').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); if (d.aid) d.id = d.aid; delete d.aid;
  busy(e.submitter, async () => { try { const r = await api('comedy/article', { body: d }); e.target.reset(); location.hash = 'article=' + r.id; } catch (err) { say($('#wm'), err.message); } }); };

// ───── Podcast & creators ─────
function embed(url) {
  let m;
  if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/))) return `<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" height="315" title="Episode video" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  if ((m = url.match(/open\.spotify\.com\/(episode|show)\/(\w+)/))) return `<div class="embed"><iframe src="https://open.spotify.com/embed/${m[1]}/${m[2]}" height="152" title="Episode audio" allow="encrypted-media" loading="lazy"></iframe></div>`;
  if (/soundcloud\.com\//.test(url)) return `<div class="embed"><iframe src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f2b64a" height="166" title="Episode audio" loading="lazy"></iframe></div>`;
  return `<a class="btn ghost sm" href="${esc(url)}" target="_blank" rel="noopener">▶ Listen</a>`;
}
async function podcast() {
  const [ep, cr] = await Promise.all([api('podcast/episodes'), api('creators/me')]);
  $('#episodes').innerHTML = ep.episodes.map((e) => { byId.set(e.id, e); return `<div class="card post" data-id="${e.id}" id="${e.id}"><div class="eyebrow">Episode ${e.number}</div><h3>${esc(e.title)}</h3>
    <p class="faint small">with ${e.hosts.map((h) => `<a href="/profile.html?id=${h.id}">${esc(h.name)}</a>`).join(', ')} · ${ago(e.ts)}</p>${embed(e.media_url)}<p class="muted small" style="margin-top:.8rem;white-space:pre-wrap">${esc(e.description)}</p>${reactBar(e)}</div>`; }).join('')
    || '<div class="empty">The first episode is coming soon. Funny on the mic? Apply to host →</div>';
  $('#epf').classList.toggle('hidden', !ep.can_publish); $('#stories').classList.toggle('hidden', !ep.can_publish);
  if (ep.can_publish) { const s = await api('comedy/feed?stories=1');
    $('#storylist').innerHTML = s.posts.map((p) => `<div style="border-top:1px solid var(--line);padding-top:.6rem">${card(p.format, p.body)}<p class="faint small">😂 ${p.laughs} · ${ago(p.ts)} · read anonymously</p></div>`).join('') || '<p class="muted small">No stories submitted yet.</p>'; }
  $('#mycreator').innerHTML = (cr.roles.length ? `<p>${cr.roles.map((r) => chip(r === 'comedian' ? '🎙️ Comedian' : '✍️ Writer', 'amber')).join(' ')} You're on the crew!</p>` : '')
    + cr.applications.filter((a) => a.status === 'pending' && a.kind !== 'ambassador').map((a) => `<p class="notice small">Your ${esc(a.kind)} application is being reviewed.</p>`).join('');
}
$('#apf').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { await api('creators/apply', { body: Object.fromEntries(new FormData(e.target)) }); e.target.reset(); say($('#am'), 'Application sent 🎉 The team will reply via notifications.', 'ok'); podcast(); } catch (err) { say($('#am'), err.message); } }); };
$('#epf').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { await api('podcast/episode', { body: Object.fromEntries(new FormData(e.target)) }); e.target.reset(); say($('#em'), 'Episode published 🎙️', 'ok'); podcast(); } catch (err) { say($('#em'), err.message); } }); };

// ───── Hall of Fame ─────
async function hall() {
  const h = await api('comedy/hall');
  $('#hallposts').innerHTML = h.posts.map((p, i) => postCard({ ...p, author: p.author }).replace('<div class="post-head">', `<div class="post-head"><span class="score" style="font-size:1.6rem;margin-right:.3rem">#${i + 1}</span>`)).join('') || '<div class="empty">No laughs this week yet.</div>';
  $('#hallcreators').innerHTML = h.creators.map((c, i) => `<div class="person"><b class="amber">#${i + 1}</b>${avatar(c.name, 36)}<div class="grow"><a href="/profile.html?id=${c.id}">${esc(c.name)}</a><div class="faint small">😂 ${c.laughs} laughs · ${c.posts} posts</div></div></div>`).join('') || '<p class="muted small">Post something funny to get on the board.</p>';
}

const showTab = tabs(document, (id) => ({ laugh: () => load(true), writers, podcast, hall }[id])().catch((err) => toast(err.message, 'err')));
document.querySelectorAll('[data-goto]').forEach((b) => (b.onclick = () => showTab(b.dataset.goto)));
async function route() {
  const h = safeDecode(location.hash.slice(1));
  if (h.startsWith('article=')) return readArticle(h.slice(8));
  if (h === 'writers' || h === 'podcast' || h === 'hall') return showTab(h);
  if (h === 'apply') return showTab('podcast');
  if (h && document.getElementById(h)) return document.getElementById(h).scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (h) { try { await readArticle(h); } catch { /* a post further down the feed, or removed */ } }
}
window.addEventListener('hashchange', () => route().catch(() => {}));
route().catch(() => {});
</script>
</body></html>
