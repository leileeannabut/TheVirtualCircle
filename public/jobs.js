<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Jobs — The Virtual Circle</title></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle Jobs</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Real jobs from verified clients</h1>
    <p class="muted">Direct posts come from ID-verified clients, and VAs apply free. Collected listings from other sites are auto-scanned for scam red flags.</p></div>
    <div class="tabs"><button class="tab on" data-tab="board">Job board</button><button class="tab hidden" data-tab="post">Post a job</button><button class="tab hidden" data-tab="mine">My job posts</button></div></div>

  <div data-panel="board"><input id="q" placeholder="Search roles, companies, skills…" aria-label="Search jobs" style="margin-bottom:1rem"><div id="jobs" class="stack"></div></div>

  <div data-panel="post" class="hidden"><form class="card glow" id="pf" style="max-width:760px"><h3>Post a job</h3><p class="muted small">Reach verified VAs. Applicants message you on-platform. Fee: <b id="fee">₱299</b> for 30 days.</p>
    <div class="field-row"><div><label>Job title</label><input name="title" required></div><div><label>Company</label><input name="company"></div></div>
    <div class="field-row"><div><label>Rate</label><input name="rate" placeholder="$6–8/hr"></div><div><label>Location / hours</label><input name="location" placeholder="Remote · US EST hours"></div></div>
    <label>Skills (comma separated)</label><input name="tags" placeholder="Shopify, customer support, Canva">
    <label>Description</label><textarea name="description" required placeholder="Responsibilities, hours, tools, how you'll pay…"></textarea>
    <p class="faint small">Job posts asking VAs to pay fees, use crypto, or move to Telegram/WhatsApp are removed and the account is flagged.</p>
    <button class="btn">Publish job</button><div class="msg" id="pm"></div></form></div>

  <div data-panel="mine" class="hidden"><div id="mine" class="stack"></div></div>
</main>
<script type="module">
import { api, $, $$, esc, shell, toast, chip, ratingChip, rankChip, avatar, handlePayment, tabs, busy, say, STAFF, ago } from '/js/app.js';
const { user: me } = await shell({ auth: true, needActive: true });
const isClient = ['client', 'recruiter', ...STAFF].includes(me.role);
if (isClient) $$('.tab').forEach((t) => t.classList.remove('hidden'));
const cfg = await api('config'); if (cfg.job_post_fee_php) $('#fee').textContent = '₱' + cfg.job_post_fee_php;
if (new URLSearchParams(location.search).get('paid')) toast('Your job is live ✨', 'ok');
async function board() {
  const { jobs } = await api('jobs/board?q=' + encodeURIComponent($('#q').value));
  $('#jobs').innerHTML = jobs.map((j) => `<div class="card"><div class="row between"><div><h3 style="margin:0">${esc(j.title)}</h3><span class="muted small">${esc(j.company || 'Company not listed')} · ${esc(j.location || 'Remote')}${j.rate ? ' · ' + esc(j.rate) : ''}</span></div>
    ${j.direct ? chip('✓ Verified client', 'ok') : ratingChip(j.safety)}</div>
    ${j.description ? `<p class="small" style="white-space:pre-wrap;margin-top:.8rem">${esc(j.description.slice(0, 600))}${j.description.length > 600 ? '…' : ''}</p>` : ''}
    <div class="chips" style="margin:.6rem 0">${String(j.tags || '').split(',').filter(Boolean).map((t) => chip(t.trim())).join('')}${j.flags.map((f) => chip(f, 'warn')).join('')}</div>
    ${j.direct ? (j.mine ? `<a class="btn ghost sm" href="#mine">${j.applicants} applicant(s)</a>` : j.applied ? chip('✓ Applied', 'ok')
      : `<details><summary class="btn sm">Apply</summary><form data-apply="${j.id}" style="margin-top:.8rem"><textarea name="note" placeholder="Short intro: why you're a great fit" required style="min-height:80px"></textarea><button class="btn sm" style="margin-top:.5rem">Send application</button></form></details>`)
      : j.url ? `<a class="small" href="${esc(j.url)}" target="_blank" rel="noopener nofollow">View original posting ↗</a>` : ''}</div>`).join('') || '<div class="empty">No jobs yet.</div>';
}
let t; $('#q').oninput = () => { clearTimeout(t); t = setTimeout(board, 300); };
$('#jobs').onsubmit = async (e) => { e.preventDefault(); const id = e.target.dataset.apply; if (!id) return;
  try { await api('jobs/apply', { body: { job_id: id, note: e.target.note.value } }); toast('Application sent ✨ The client can now message you.', 'ok'); board(); } catch (err) { toast(err.message, 'err'); } };
$('#pf').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { if (handlePayment(await api('jobs/create', { body: Object.fromEntries(new FormData(e.target)) }), 'Your job is live ✨')) { e.target.reset(); location.hash = 'mine'; showTab('mine'); } } catch (err) { say($('#pm'), err.message); } }); };
async function mine() {
  const { jobs } = await api('jobs/mine');
  $('#mine').innerHTML = (await Promise.all(jobs.map(async (j) => { const a = j.status === 'live' ? (await api('jobs/applicants?job_id=' + j.id)).applicants : [];
    return `<div class="card"><div class="row between"><h3 style="margin:0">${esc(j.title)}</h3>${chip(j.status.replace('_', ' '), j.status === 'live' ? 'ok' : 'warn')}</div>
      ${a.map((p) => `<div class="person">${avatar(p.name, 40)}<div class="grow"><a href="/profile.html?id=${p.id}">${esc(p.name)}</a> ${p.pro ? chip('✨ Tier 2', 'amber') : ''}
        <div class="faint small">${esc(p.rank_name)} · practice score ${p.sim_score || '—'} · applied ${ago(p.applied_at)}</div><p class="small" style="margin:.3rem 0 0">${esc(p.note || '')}</p></div>
        <a class="btn sm" href="/messages.html#${encodeURIComponent(p.channel)}">Message</a></div>`).join('') || '<p class="muted small">No applicants yet.</p>'}</div>`; }))).join('') || '<div class="empty">You have no job posts yet.</div>';
}
const showTab = tabs(document, (id) => (id === 'board' ? board() : id === 'mine' ? mine() : null)?.catch?.((e) => toast(e.message, 'err')));
if (location.hash === '#mine' && isClient) showTab('mine');
</script>
</body></html>
