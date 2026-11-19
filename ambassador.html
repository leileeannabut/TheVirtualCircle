<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Founding Ambassadors — The Virtual Circle</title></head><body>
<main class="wrap page">
  <section class="hero" style="padding-top:2rem"><div class="eyebrow">🌟 Founding Ambassadors</div><h1>Help build the circle you wish you'd had</h1>
    <p class="lead">Founding Ambassadors are real VAs who welcome, invite and encourage others during our first 90 days. In return you get Tier 2 · Circle Pro free, a badge, and a place on the founding leaderboard.</p></section>

  <div class="split">
    <div class="stack">
      <div class="card" id="state"></div>
      <div class="card"><h3>Your weekly playbook</h3><p class="muted small">About 30 minutes a week. Real conversations from real people are what make the circle worth joining.</p>
        <ol class="steps" style="margin-top:1rem">
          <li><b>Welcome 3 new members.</b> Reply to their first post on Circle Feed, or say hi in their Circle Hub.</li>
          <li><b>Answer 2 questions</b> with your real experience. If a Circle Host (🤖 AI) replied first, add what actually worked for you.</li>
          <li><b>Share one win, tip or honest struggle</b> on Circle Feed. Vulnerability makes it safe for others.</li>
          <li><b>Invite VAs you trust</b> with your referral link. Only invite people who'd genuinely benefit, and never spam groups.</li>
          <li><b>Post or react on Circle Laughs</b> once. Laughter is what brings people back.</li>
          <li><b>Report anything scammy</b> with the 🚩 button or Circle Scam-Buster.</li>
        </ol></div>
      <div class="card soft"><h3>Ambassador honesty rules</h3><ul class="muted small" style="margin:0;padding-left:1.2rem">
        <li>Always speak as yourself. One account per person, never fake accounts or fake reviews.</li>
        <li>When inviting, tell people you're a Founding Ambassador.</li>
        <li>Never promise jobs, income or results.</li>
        <li>Keep conversations and payments on-platform.</li></ul></div>
    </div>
    <aside class="stack">
      <div class="card glow"><h3>Perks</h3><ul class="list"><li>Tier 2 · Circle Pro<span id="days">90 days free</span></li><li>🌟 Founding Ambassador badge<span>✓</span></li>
        <li>Founding leaderboard<span>✓</span></li><li>First invites to new features<span>✓</span></li></ul><p class="faint small" id="spots"></p></div>
      <div class="card"><h3>Founding leaderboard</h3><p class="muted small">Ranked by invited members who completed verification.</p><div id="board"></div></div>
    </aside>
  </div>
</main>
<script type="module">
import { api, $, esc, shell, toast, avatar, busy, say, when } from '/js/app.js';
await shell({ auth: true, needActive: true });
async function load() {
  const b = await api('ambassadors/board');
  $('#days').textContent = b.days + ' days free'; $('#spots').textContent = b.spots_left + ' Founding Ambassador spots left.';
  const link = location.origin + '/join.html?ref=' + b.referral_code;
  $('#state').innerHTML = b.ambassador
    ? `<div class="eyebrow">You're a Founding Ambassador 🌟</div><h3>Thank you for building the circle</h3><p class="muted small">Your free Tier 2 runs until ${when(b.until)}.</p>
       <label>Your invite link</label><div class="row"><input id="link" readonly value="${esc(link)}" style="flex:1"><button class="btn quiet sm" id="copy">Copy</button></div>
       <p class="small" style="margin-top:.8rem">Invited: <b>${b.referrals.total}</b> · Verified: <b class="amber">${b.referrals.active}</b></p>`
    : !b.eligible ? '<h3>For VAs</h3><p class="muted small">Founding Ambassadors are verified VAs. Clients can help by posting real jobs on Circle Jobs.</p>'
    : b.application && b.application.status === 'pending' ? '<h3>Application received 🙌</h3><p class="muted small">The Circle team will review it soon. You\'ll get a notification.</p>'
    : `<h3>Apply to be a Founding Ambassador</h3>${b.application && b.application.status === 'declined' ? '<p class="notice warn small">Your last application wasn\'t approved. You\'re welcome to try again.</p>' : ''}
       <form id="apf"><label>Why do you want to help grow the circle?</label><textarea name="bio" required style="min-height:90px" placeholder="Your VA journey, who you'd love to bring in, how you'd help them feel at home…"></textarea>
       <label>Where would you invite VAs from? <span class="faint">(optional)</span></label><input name="pitch" placeholder="e.g. my old call-center team, my VA course batchmates">
       <button class="btn block" style="margin-top:1rem">Apply</button><div class="msg" id="am"></div></form>`;
  $('#copy')?.addEventListener('click', () => { navigator.clipboard.writeText(link); toast('Invite link copied', 'ok'); });
  $('#apf')?.addEventListener('submit', (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
    busy(e.submitter, async () => { try { await api('creators/apply', { body: { kind: 'ambassador', ...d } }); toast('Application sent 🌟', 'ok'); load(); } catch (err) { say($('#am'), err.message); } }); });
  $('#board').innerHTML = b.leaderboard.map((x, i) => `<div class="person"><b class="amber">#${i + 1}</b>${avatar(x.name, 34)}<div class="grow"><a href="/profile.html?id=${x.id}">${esc(x.name)}</a><div class="faint small">${x.hub ? '#' + esc(x.hub) : ''}</div></div><b>${x.active}</b></div>`).join('')
    || '<p class="muted small">The first Founding Ambassadors appear here soon.</p>';
}
load();
</script>
</body></html>
