<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle BFF — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle BFF</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Someone has been there too 💛</h1>
    <p class="muted">Tell us what you're going through, or what you've already overcome. Circle BFF quietly pairs you with a VA who understands, and opens a private chat for you both. Only you and your match see it.</p></div></div>
  <div class="split">
    <div class="card"><div class="row between" style="margin-bottom:1rem"><h3 style="margin:0">Topics</h3><span class="faint small">Tap to opt in · tap again to opt out</span></div>
      <div class="table-wrap"><table><thead><tr><th>Topic</th><th>I'm going through this</th><th>I've been through this</th></tr></thead><tbody id="topics"></tbody></table></div>
      <p class="faint small" style="margin-top:1rem">You can also post a 💭 Struggle on the feed: Circle BFF recognises common topics and offers to match you.</p></div>
    <aside class="stack"><div class="card glow"><h3>Your matches</h3><div id="matches"></div></div>
      <div class="card soft"><h3>Need more than a friend?</h3><p class="muted small">If you're overwhelmed, the <a href="/wellness.html">Circle Wellness</a> has licensed practitioners, and crisis lines are always listed there.</p></div></aside>
  </div>
</main>
<script type="module">
import { api, $, esc, shell, toast, avatar } from '/js/app.js';
await shell({ auth: true, needActive: true });
async function load() {
  const r = await api('bff/me');
  const on = (t, m) => r.mine.some((x) => x.topic === t && x.mode === m);
  $('#topics').innerHTML = r.topics.map((t) => `<tr><td><b>${esc(t.label)}</b></td>
    <td><button class="btn sm ${on(t.id, 'going_through') ? '' : 'quiet'}" data-t="${t.id}" data-m="going_through" data-on="${on(t.id, 'going_through')}">${on(t.id, 'going_through') ? '✓ Yes' : 'Me too'}</button> <span class="faint small">${t.going}</span></td>
    <td><button class="btn sm ${on(t.id, 'been_through') ? 'ok' : 'quiet'}" data-t="${t.id}" data-m="been_through" data-on="${on(t.id, 'been_through')}">${on(t.id, 'been_through') ? '✓ I can help' : 'I can help'}</button> <span class="faint small">${t.been}</span></td></tr>`).join('');
  $('#matches').innerHTML = r.matches.map((m) => `<div class="person">${avatar(m.with.name, 40)}<div class="grow"><a href="/profile.html?id=${m.with.id}">${esc(m.with.name)}</a>
    <div class="faint small">${esc(m.label)} · ${m.kind === 'mentor' ? (m.role === 'seeker' ? 'has been through it' : 'you can help') : 'same boat'}</div></div>
    <a class="btn sm" href="/messages.html#${encodeURIComponent(m.channel)}">Chat</a></div>`).join('') || '<p class="muted small">No matches yet. Opt in to a topic and we\'ll find your Circle BFF.</p>';
}
$('#topics').onclick = async (e) => { const b = e.target.closest('[data-t]'); if (!b) return;
  try { const r = await api('bff/set', { body: { topic: b.dataset.t, mode: b.dataset.m, on: b.dataset.on !== 'true' } });
    if (r.matched?.length) toast('💛 Matched with ' + r.matched.map((m) => m.with).join(' and ') + '. Check your matches!', 'ok');
    else if (b.dataset.on !== 'true') toast(b.dataset.m === 'been_through' ? "Thank you! We'll connect you when someone needs you." : "You're on the list. We'll notify you when a match joins.", 'ok');
    load(); } catch (err) { toast(err.message, 'err'); } };
load();
</script>
</body></html>
