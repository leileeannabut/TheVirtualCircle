<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Bestie — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">AI Role Simulations Academy</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Practice with Circle Bestie</h1>
    <p class="muted">Real workplace moments, played by an AI client. You're scored on communication, technical aptitude and crisis management — score 80+ to earn the skill badge.</p></div></div>
  <div class="notice warn hidden" id="offline" style="margin-bottom:1.5rem">Offline practice mode: the AI client and grading use simple rules until a Gemini API key is added.</div>

  <div id="pick"><div class="grid g3" id="scenarios"></div>
    <h3 style="margin-top:3rem">Your results</h3><div class="table-wrap"><table><thead><tr><th>When</th><th>Scenario</th><th>Comm.</th><th>Tech.</th><th>Crisis</th><th>Overall</th></tr></thead><tbody id="results"></tbody></table></div></div>

  <div id="play" class="split hidden">
    <section class="card thread" style="height:min(72vh,720px);margin:0">
      <header class="row between"><div><b id="sc-title"></b><p class="muted small" id="sc-brief"></p></div><button class="btn ghost sm" id="quit">Exit</button></header>
      <div class="msgs" id="conv" aria-live="polite"></div>
      <form class="composer" id="say"><textarea id="reply" placeholder="Reply as the VA…" aria-label="Your reply" required></textarea><button class="btn">Send</button></form>
    </section>
    <aside class="stack">
      <div class="card"><h3>How it works</h3><ol class="steps" style="margin-top:1rem"><li>Read the client's message.</li><li>Reply as you would at work — calm, specific, with next steps.</li><li>After 2+ replies, ask for your score.</li></ol>
        <button class="btn block" id="grade">Score my performance</button></div>
      <div class="card glow hidden" id="score"></div>
    </aside>
  </div>
</main>
<script type="module">
import { api, $, esc, shell, toast, when, busy } from '/js/app.js';
await shell({ auth: true, needActive: true });
const { scenarios, ai } = await api('academy/scenarios');
if (!ai) $('#offline').classList.remove('hidden');
$('#scenarios').innerHTML = scenarios.map((s) => `<div class="card"><span class="chip amber">${esc(s.skill)}</span><h3 style="margin-top:.9rem">${esc(s.title)}</h3>
  <p class="muted small">${esc(s.brief)}</p><button class="btn ghost sm" data-start="${s.id}">Start simulation</button></div>`).join('');
const names = Object.fromEntries(scenarios.map((s) => [s.id, s.title]));
async function results() { const { results } = await api('academy/mine');
  $('#results').innerHTML = results.map((r) => `<tr><td class="small">${when(r.ts)}</td><td>${esc(names[r.scenario] || r.scenario)}</td><td>${r.communication}</td><td>${r.technical}</td><td>${r.crisis}</td><td><b class="amber">${r.overall}</b></td></tr>`).join('')
    || '<tr><td colspan="6" class="muted">No simulations yet — pick one above.</td></tr>'; }
results();

let sc, history = [];
const add = (role, text) => { history.push({ role, text });
  $('#conv').insertAdjacentHTML('beforeend', `<div class="bubble ${role === 'va' ? 'mine' : ''}"><span class="who">${role === 'va' ? 'You' : 'Client'}</span><p>${esc(text)}</p></div>`);
  $('#conv').scrollTop = $('#conv').scrollHeight; };
$('#scenarios').onclick = async (e) => { const id = e.target.dataset.start; if (!id) return;
  sc = scenarios.find((s) => s.id === id); history = []; $('#conv').innerHTML = ''; $('#score').classList.add('hidden');
  $('#sc-title').textContent = sc.title; $('#sc-brief').textContent = sc.brief;
  $('#pick').classList.add('hidden'); $('#play').classList.remove('hidden');
  const { reply } = await api('academy/turn', { body: { scenario_id: id, history: [] } }); add('client', reply); $('#reply').focus(); };
$('#say').onsubmit = (e) => { e.preventDefault(); const t = $('#reply').value.trim(); if (!t) return; $('#reply').value = ''; add('va', t);
  busy(e.submitter, async () => { try { const { reply } = await api('academy/turn', { body: { scenario_id: sc.id, history } }); add('client', reply); } catch (err) { toast(err.message, 'err'); } }); };
$('#reply').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#say').requestSubmit(); } };
$('#grade').onclick = (e) => busy(e.currentTarget, async () => { try {
  const { scores, average, badge } = await api('academy/grade', { body: { scenario_id: sc.id, history } });
  $('#score').innerHTML = `<div class="eyebrow">Your score</div><div class="score">${scores.overall}</div>
    <ul class="list" style="margin:1rem 0"><li>Communication<b>${scores.communication}</b></li><li>Technical aptitude<b>${scores.technical}</b></li><li>Crisis management<b>${scores.crisis}</b></li></ul>
    <pre class="muted small">${esc(scores.feedback)}</pre><hr class="divider"><p class="small">Average across all simulations: <b class="amber">${average}</b></p>
    ${badge ? `<p class="chip amber">✦ Badge earned: ${esc(badge)}</p>` : '<p class="faint small">Score 80+ to earn this skill badge.</p>'}`;
  $('#score').classList.remove('hidden'); results();
} catch (err) { toast(err.message, 'err'); } });
$('#quit').onclick = () => { $('#play').classList.add('hidden'); $('#pick').classList.remove('hidden'); };
</script>
</body></html>
