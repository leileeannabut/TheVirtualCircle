<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Chat — The Virtual Circle</title></head><body>
<main class="wrap page" style="padding-bottom:1.5rem">
  <div class="chat">
    <aside class="card soft" style="padding:.6rem" id="side" aria-label="Conversations"></aside>
    <section class="card thread" style="margin:0">
      <header><b id="who">Circle Chat</b><p class="muted small" id="why">Pick a conversation.</p></header>
      <div class="msgs" id="msgs" aria-live="polite"><div class="empty">Your private conversations with connections, Circle BFF matches, clients and job posters appear here.</div></div>
      <form class="composer" id="comp"><textarea id="text" placeholder="Write a message…" aria-label="Message" maxlength="1200" required disabled></textarea><button class="btn" disabled id="send">Send</button></form>
    </section>
  </div>
  <p class="faint small center" style="margin-top:1rem">Keep it on-platform: contact details and payment requests are hidden and flagged automatically.</p>
</main>
<script type="module">
import { api, $, esc, shell, toast, ago, avatar, safeDecode } from '/js/app.js';
await shell({ auth: true, needActive: true });
const WHY = { connection: 'Connection', bff: 'Circle BFF match 💛', client: 'Client', job: 'Job application', chat: 'Conversation' };
let convs = [], ch = '', last = 0, timer;
async function list() {
  ({ conversations: convs } = await api('dm/list'));
  $('#side').innerHTML = '<h4>Conversations</h4>' + (convs.map((c) => `<a href="#${encodeURIComponent(c.channel)}" data-ch="${esc(c.channel)}" class="${c.channel === ch ? 'on' : ''}" style="display:flex;gap:.6rem;align-items:center">${avatar(c.user.name, 32)}
    <span style="min-width:0"><b style="display:block;font-weight:500;color:var(--text)">${esc(c.user.name)}</b><span class="faint small" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.last ? (c.last.mine ? 'You: ' : '') + esc(c.last.text) : WHY[c.why]}</span></span></a>`).join('')
    || '<p class="muted small" style="padding:.8rem">No conversations yet. <a href="/connections.html">Connect with VAs</a> to start chatting.</p>');
}
async function open(channel) {
  ch = channel; last = 0; $('#msgs').innerHTML = '';
  document.querySelectorAll('#side a').forEach((a) => a.classList.toggle('on', a.dataset.ch === ch));
  const c = convs.find((x) => x.channel === ch);
  $('#who').innerHTML = c ? `<a href="/profile.html?id=${c.user.id}" style="color:var(--text)">${esc(c.user.name)}</a>` : 'Conversation';
  $('#why').textContent = c ? `${WHY[c.why]} · ${c.user.rank_name}` : '';
  $('#text').disabled = $('#send').disabled = false;
  clearInterval(timer); await poll(); timer = setInterval(poll, 6000);
}
async function poll() {
  try {
    const { messages } = await api('hubs/messages?channel=' + encodeURIComponent(ch) + '&after=' + last);
    if (!messages.length && !last) $('#msgs').innerHTML = '<div class="empty">Say hello 👋</div>';
    if (messages.length && !last) $('#msgs').innerHTML = '';
    const box = $('#msgs');
    messages.forEach((m) => { last = Math.max(last, m.ts); box.insertAdjacentHTML('beforeend', `<div class="bubble ${m.mine ? 'mine' : ''}"><span class="who">${esc(m.mine ? 'You' : m.name)}</span><span class="when">${ago(m.ts)}</span><p>${esc(m.text)}</p></div>`); });
    if (messages.length) box.scrollTop = box.scrollHeight;
  } catch (e) { clearInterval(timer); toast(e.message, 'err'); }
}
$('#comp').onsubmit = async (e) => { e.preventDefault(); const text = $('#text').value.trim(); if (!text || !ch) return;
  try { const r = await api('hubs/post', { body: { channel: ch, text } }); $('#text').value = ''; if (r.flagged) toast('Contact details were hidden. Please keep it on-platform.', 'err'); await poll(); list(); } catch (err) { toast(err.message, 'err'); } };
$('#text').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#comp').requestSubmit(); } };
await list();
const to = new URLSearchParams(location.search).get('to');
if (to) { try { const { channel } = await api('dm/open', { body: { user_id: to } }); if (!convs.some((c) => c.channel === channel)) await list(); history.replaceState(null, '', '#' + encodeURIComponent(channel)); } catch (e) { toast(e.message, 'err'); } }
const pick = () => { const h = safeDecode(location.hash.slice(1)); if (h) open(h); };
window.onhashchange = pick; pick();
</script>
</body></html>
