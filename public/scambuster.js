<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Scam-Buster — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle Scam-Buster</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Check it before you trust it</h1>
    <p class="muted">Paste a job offer, agency pitch or chat message. We scan it instantly for upfront fees, crypto payouts, unrealistic rates and off-platform pressure.</p></div>
    <div class="tabs"><button class="tab on" data-tab="scan">Scanner</button><button class="tab" data-tab="board">Intel board</button><button class="tab" data-tab="reg">Company red-flag board</button></div></div>

  <div data-panel="scan" class="split">
    <form class="card" id="scanf"><label for="txt" style="margin-top:0">Paste the full message or job post</label>
      <textarea id="txt" name="text" style="min-height:220px" placeholder="Hi! We are hiring data-entry VAs, $45/hr, no experience needed. Pay a refundable ₱1,500 training fee via GCash and message HR on Telegram…" required></textarea>
      <div class="field-row"><div><label for="s-title">Title <span class="faint">(to share)</span></label><input id="s-title" name="title" placeholder="Fake data-entry job"></div>
        <div><label for="s-co">Company / agency named</label><input id="s-co" name="company"></div></div>
      <div class="row" style="margin-top:1.25rem"><button class="btn" data-act="scan">Scan for red flags</button><button class="btn ghost" data-act="report" id="share">Scan &amp; share with the circle</button></div>
      <div class="msg" id="sm"></div></form>
    <div class="card glow hidden" id="result" aria-live="polite"></div>
  </div>

  <div data-panel="board" class="hidden"><div class="grid g2" id="reports"></div></div>

  <div data-panel="reg" class="hidden">
    <div class="split rev">
      <form class="card soft" id="cof"><h3>Report a company or agency</h3>
        <label for="c-name">Name</label><input id="c-name" name="name" required>
        <label for="c-web">Website or page</label><input id="c-web" name="website" placeholder="https://">
        <label for="c-issue">What happened?</label><select id="c-issue" name="issue"><option value="fake_agency">Fake agency</option><option value="withheld_wages">Withheld wages</option>
          <option value="exploitative">Exploitative terms</option><option value="upfront_fees">Upfront fees</option><option value="harassment">Harassment</option><option value="other">Other</option></select>
        <label for="c-det">Details</label><textarea id="c-det" name="details" placeholder="Dates, amounts, what they promised. No personal info about other VAs please."></textarea>
        <button class="btn block" style="margin-top:1rem">Submit report</button><div class="msg" id="cm"></div></form>
      <div class="table-wrap"><table><thead><tr><th>Company</th><th>Risk</th><th>Flags</th><th>Reports</th><th></th></tr></thead><tbody id="cos"></tbody></table></div>
    </div>
  </div>
</main>
<script type="module">
import { api, $, esc, shell, toast, ratingChip, chip, tabs, say, ago, busy } from '/js/app.js';
const { user } = await shell();
const active = user && user.status === 'active';
if (!active) $('#share').classList.add('hidden');
const locked = '<div class="empty" style="grid-column:1/-1">The intel board is for verified members. <a href="/join.html">Join the circle →</a></div>';

const showScan = (s) => { $('#result').innerHTML = `<div class="row between"><div class="eyebrow">Safety rating</div>${ratingChip(s.rating)}</div>
  <div class="score">${s.score}<span class="muted small"> / 100 risk</span></div><div class="meter" style="margin:1rem 0"><i style="width:${s.score}%"></i></div>
  <p>${esc(s.summary)}</p>${s.flags.length ? `<ul>${s.flags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
  <p class="faint small">Engine: ${s.engine === 'gemini' ? 'Gemini AI + rules' : 'Rules'}. Legit employers never ask you to pay to work.</p>`; $('#result').classList.remove('hidden'); };
$('#scanf').onsubmit = (e) => { e.preventDefault(); const act = e.submitter.dataset.act; const body = Object.fromEntries(new FormData(e.target));
  busy(e.submitter, async () => { try {
    if (act === 'report') { const r = await api('scam/report', { body }); showScan(r.scan); toast('Shared to the intel board. Thank you for protecting the circle 💛', 'ok'); }
    else showScan(await api('scam/scan', { body }));
  } catch (err) { say($('#sm'), err.message); } }); };

async function board() {
  if (!active) return ($('#reports').innerHTML = locked);
  const { reports } = await api('scam/reports');
  $('#reports').innerHTML = reports.map((r) => `<div class="card"><div class="card-head"><h3 style="margin:0">${esc(r.title)}</h3>${ratingChip(r.rating)}</div>
    <p class="faint small">${ago(r.ts)}${r.company ? ' · ' + esc(r.company) : ''} ${r.status === 'verified' ? chip('Community verified', 'bad') : ''}</p>
    <p class="muted small">${esc(r.summary)}</p><details><summary class="small" style="cursor:pointer">Original text</summary><pre class="small faint" style="margin-top:.5rem">${esc(r.text)}</pre></details>
    <div class="chips" style="margin:.8rem 0">${r.flags.map((f) => chip(f, 'warn')).join('')}</div>
    <div class="row"><button class="btn sm ${r.my_vote > 0 ? '' : 'quiet'}" data-v="1" data-id="${r.id}">👍 Seen this scam · ${r.up}</button><button class="btn sm quiet" data-v="-1" data-id="${r.id}">Looks legit · ${r.down}</button></div></div>`).join('')
    || '<div class="empty" style="grid-column:1/-1">No reports yet.</div>';
}
$('#reports').onclick = async (e) => { const b = e.target.closest('[data-v]'); if (!b) return;
  try { await api('scam/vote', { body: { id: b.dataset.id, value: Number(b.dataset.v) } }); board(); } catch (err) { toast(err.message, 'err'); } };

async function reg() {
  if (!active) { $('#cof').classList.add('hidden'); return ($('#cos').innerHTML = `<tr><td colspan="5">${locked}</td></tr>`); }
  const { companies } = await api('scam/companies');
  $('#cos').innerHTML = companies.map((c) => `<tr><td><b>${esc(c.name)}</b>${c.website ? `<br><span class="faint small">${esc(c.website)}</span>` : ''}</td>
    <td><b class="${c.risk >= 70 ? '' : 'amber'}" style="${c.risk >= 70 ? 'color:var(--bad)' : ''}">${c.risk}</b><br>${chip(c.status.replace('_', ' '), c.status === 'watch' ? 'warn' : 'bad')}</td>
    <td><div class="chips">${c.flags.map((f) => chip(f)).join('')}</div></td><td>${c.reports} · ▲${c.upvotes}</td>
    <td><button class="btn quiet sm" data-up="${c.id}" ${c.voted ? 'disabled' : ''}>▲ Me too</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">No companies reported yet.</td></tr>';
}
$('#cos').onclick = async (e) => { const id = e.target.dataset.up; if (!id) return; try { await api('scam/company_vote', { body: { id } }); reg(); } catch (err) { toast(err.message, 'err'); } };
$('#cof').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { await api('scam/company', { body: Object.fromEntries(new FormData(e.target)) }); e.target.reset(); say($('#cm'), 'Reported. Thank you.', 'ok'); reg(); } catch (err) { say($('#cm'), err.message); } }); };
tabs(document, (id) => { if (id === 'board') board().catch((e) => toast(e.message, 'err')); if (id === 'reg') reg().catch((e) => toast(e.message, 'err')); });
</script>
</body></html>
