<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Join the Circle — The Virtual Circle</title></head><body>
<main class="wrap page" style="max-width:620px">
  <div class="center" style="margin-bottom:2rem"><div class="eyebrow">Circle Founders Cohort is open</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Step into the circle</h1>
    <p class="muted" id="intro">Four short steps keep every member real: account, mobile code, ID + selfie, and a quick human review.</p></div>

  <div class="card" id="auth">
    <div class="tabs" style="margin-bottom:1.5rem"><button class="tab on" data-tab="reg">Create account</button><button class="tab" data-tab="login">Sign in</button></div>
    <form id="reg" data-panel="reg">
      <label>I am joining as</label>
      <div class="tabs" id="type"><button type="button" class="tab on" data-v="va">A virtual assistant</button><button type="button" class="tab" data-v="client">A client / recruiter</button></div>
      <div class="field-row"><div><label for="r-name">Full name</label><input id="r-name" name="name" required autocomplete="name"></div>
        <div><label for="r-mobile">PH mobile</label><input id="r-mobile" name="mobile" required inputmode="tel" placeholder="09XXXXXXXXX" autocomplete="tel"></div></div>
      <label for="r-email">Email</label><input id="r-email" name="email" type="email" required autocomplete="email">
      <label for="r-pw">Password <span class="faint">(10+ characters)</span></label><input id="r-pw" name="password" type="password" minlength="10" required autocomplete="new-password">
      <div id="va-only">
        <label>Experience</label>
        <div class="field-row">
          <label class="inline card soft" style="margin:0;padding:1rem"><input type="radio" name="tier" value="newbie" checked><span><b>Aspiring</b><br><span class="muted small">New or under 1 year · Government ID</span></span></label>
          <label class="inline card soft" style="margin:0;padding:1rem"><input type="radio" name="tier" value="seasoned"><span><b>Tenured</b><br><span class="muted small">1+ years · ID + proof of work</span></span></label>
        </div>
      </div>
      <div class="field-row"><div><label for="r-region">Region</label><select id="r-region" name="region"><option>Luzon</option><option>Visayas</option><option>Mindanao</option></select></div>
        <div><label for="r-hub">Home hub</label><select id="r-hub" name="hub"></select></div></div>
      <label for="r-ref">Referral code <span class="faint">(optional)</span></label><input id="r-ref" name="ref" maxlength="12" autocomplete="off">
      <label class="inline"><input type="checkbox" name="adult" required><span class="small">I am 18 years old or older.</span></label>
      <label class="inline"><input type="checkbox" name="consent" required><span class="small">I agree to the <a href="/privacy.html" target="_blank">Privacy Notice</a> and consent to identity verification under the Data Privacy Act of 2012 (RA 10173).</span></label>
      <button class="btn block">Create my account</button><div class="msg" id="rm"></div>
    </form>
    <form id="login" data-panel="login" class="hidden">
      <label for="l-email">Email</label><input id="l-email" name="email" type="email" required autocomplete="email">
      <label for="l-pw">Password</label><input id="l-pw" name="password" type="password" required autocomplete="current-password">
      <button class="btn block" style="margin-top:1.5rem">Sign in</button><div class="msg" id="lm"></div>
    </form>
  </div>

  <div class="card hidden" id="otp">
    <div class="eyebrow">Step 2 of 4</div><h2>Check your phone</h2><p class="muted">We sent a 6-digit code to <b id="otp-to"></b>. It expires in 5 minutes.</p>
    <form id="otpf"><label for="code">Code</label><input id="code" name="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required style="font-size:1.4rem;letter-spacing:.4em;text-align:center">
      <button class="btn block" style="margin-top:1.25rem">Verify</button></form>
    <p class="center" style="margin-top:1rem"><button class="btn ghost sm" id="resend">Resend code</button></p><div class="msg" id="om"></div>
  </div>

  <div class="card hidden" id="kyc">
    <div class="eyebrow" id="kyc-step">Step 3 of 4</div><h2>Verify your identity</h2>
    <p class="muted">Everyone proves who they are. <b>Aspiring VAs</b>: Government ID + selfie. <b>Tenured VAs</b>: the same, plus proof of work experience, so we can rank you and unlock the right privileges. Files go to a private vault only our verification team can open, and we store a one-way hash of your ID number, never the number itself.</p>
    <div class="notice warn hidden" id="kyc-note"></div>
    <form id="kycf">
      <div class="field-row"><div><label for="k-type">ID type</label><select id="k-type" name="id_type"><option>PhilSys National ID</option><option>Passport</option><option>Driver's License</option><option>UMID</option><option>SSS ID</option><option>PRC ID</option><option>Postal ID</option></select></div>
        <div><label for="k-no">ID number</label><input id="k-no" name="id_number" required autocomplete="off"></div></div>
      <label for="k-id">Photo of your ID <span class="faint">(JPG/PNG, under 5 MB)</span></label><input id="k-id" name="id_file" type="file" accept="image/jpeg,image/png,image/webp" required>
      <label for="k-selfie">Selfie holding your ID</label><input id="k-selfie" name="selfie_file" type="file" accept="image/jpeg,image/png,image/webp" capture="user" required>
      <div id="tenured" class="hidden"><hr class="divider"><h3>Proof of experience (tenured VAs)</h3>
        <p class="muted small">Tenured VAs are ranked by proven work, so we can give you the right privileges (coaching, mentoring, leading squads). Upload what you have: certificate of employment, contract, payslip, or a client reference letter. Hide salary figures if you like.</p>
        <div class="field-row"><div><label for="k-years">Years as a VA</label><input id="k-years" name="years" type="number" min="1" max="40" step="0.5"></div>
          <div><label for="k-emp">Clients / employers</label><input id="k-emp" name="employers" placeholder="e.g. US real estate team, AU e-commerce store"></div></div>
        <label for="k-roles">Your roles and main tasks</label><textarea id="k-roles" name="roles" style="min-height:80px" placeholder="Executive assistant: inbox, calendar, travel. Customer support on Zendesk…"></textarea>
        <label for="k-ref">Reference contact <span class="faint">(optional; staff only)</span></label><input id="k-ref" name="reference" placeholder="Name and company of someone who can confirm your work">
        <label>Proof documents <span class="faint">(1–3 files · JPG, PNG or PDF · under 5 MB each)</span></label>
        <input name="proof_1" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><input name="proof_2" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style="margin-top:.4rem"><input name="proof_3" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style="margin-top:.4rem"></div>
      <button class="btn block" style="margin-top:1.5rem">Submit for review</button><div class="msg" id="km"></div>
    </form>
  </div>

  <div class="card glow hidden center" id="review">
    <div class="eyebrow" id="review-step">Step 4 of 4</div><div class="moon" style="width:72px;height:72px;margin:1rem auto 1.5rem"></div>
    <h2>You're in the queue ✨</h2><p class="muted">A real person reviews every submission, usually within 24 hours. We'll let you know as soon as you're verified. Then the hubs, academy and marketplace open up.</p>
    <a class="btn ghost" href="/app.html">Go to my dashboard</a>
  </div>
  <p class="center faint small" style="margin-top:2rem">Setting up this site? <a href="/setup.html">Open the setup checklist</a> to claim Founder access.</p>
</main>
<script type="module">
import { api, $, $$, say, fingerprint, shell, tabs, busy } from '/js/app.js';
const data = await shell();
const cfg = await api('config').catch(() => ({ hubs: [], sms: true }));
if (cfg.sms === false) { // no SMS provider yet: the mobile-code step is skipped
  $('#intro').textContent = 'Three short steps keep every member real: account, ID + selfie, and a quick human review.';
  $('#kyc-step').textContent = 'Step 2 of 3'; $('#review-step').textContent = 'Step 3 of 3';
}
const want = new URLSearchParams(location.search).get('next') || '';
const next = /^\/(?![\/\\])[\w\-./?=&#%]*$/.test(want) ? want : '/feed.html'; // same-site paths only
const ref = new URLSearchParams(location.search).get('ref'); if (ref) $('#r-ref').value = ref;

const fillHubs = () => { const r = $('#r-region').value;
  $('#r-hub').innerHTML = cfg.hubs.filter((h) => h.region === r && h.kind === 'hub').map((h) => `<option value="${h.id}">${h.name}</option>`).join(''); };
$('#r-region').onchange = fillHubs; fillHubs();
const showTab = tabs($('#auth'));
if (new URLSearchParams(location.search).get('mode') === 'login') showTab('login');
let type = 'va';
$$('#type .tab').forEach((b) => b.onclick = () => { type = b.dataset.v; $$('#type .tab').forEach((x) => x.classList.toggle('on', x === b)); $('#va-only').classList.toggle('hidden', type !== 'va'); });

function step(u, kyc) {
  ['auth', 'otp', 'kyc', 'review'].forEach((id) => $('#' + id).classList.add('hidden'));
  if (!u) return $('#auth').classList.remove('hidden');
  if (/^\/setup(\.html)?$/.test(next)) return location.replace(next); // the site owner is claiming Founder access
  if (u.status === 'active') return location.replace(next);
  if (u.status === 'pending_otp') { $('#otp-to').textContent = u.mobile; return $('#otp').classList.remove('hidden'); }
  if (u.status === 'kyc_review') return $('#review').classList.remove('hidden');
  if (kyc && kyc.status === 'rejected') { $('#kyc-note').textContent = 'Your last submission was not approved' + (kyc.note ? ': ' + kyc.note : '.') + ' Please try again with clearer photos.'; $('#kyc-note').classList.remove('hidden'); }
  const tenured = u.account_type === 'va' && u.tier === 'seasoned';
  $('#tenured').classList.toggle('hidden', !tenured); ['k-years', 'k-roles'].forEach((id) => ($('#' + id).required = tenured)); $('[name=proof_1]').required = tenured;
  $('#kyc').classList.remove('hidden');
}
const refresh = async () => { const d = await api('me'); step(d.user, d.kyc); };
step(data.user, data.kyc);

$('#reg').onsubmit = (e) => { e.preventDefault(); const f = new FormData(e.target);
  busy(e.submitter, async () => { try {
    await api('auth/register', { body: { ...Object.fromEntries(f), account_type: type, consent: !!f.get('consent'), adult: !!f.get('adult'), fingerprint: await fingerprint() } });
    await refresh();
  } catch (err) { say($('#rm'), err.message); } }); };
$('#login').onsubmit = (e) => { e.preventDefault();
  busy(e.submitter, async () => { try { await api('auth/login', { body: Object.fromEntries(new FormData(e.target)) }); location.reload(); } catch (err) { say($('#lm'), err.message); } }); };
$('#otpf').onsubmit = (e) => { e.preventDefault();
  busy(e.submitter, async () => { try { await api('otp/verify', { body: { code: $('#code').value.trim() } }); await refresh(); } catch (err) { say($('#om'), err.message); } }); };
$('#resend').onclick = async () => { try { await api('otp/send', { body: {} }); say($('#om'), 'New code sent.', 'ok'); } catch (err) { say($('#om'), err.message); } };
$('#kycf').onsubmit = (e) => { e.preventDefault(); const f = new FormData(e.target);
  busy(e.submitter, async () => { try { f.append('fingerprint', await fingerprint()); await api('kyc/submit', { form: f }); await refresh(); } catch (err) { say($('#km'), err.message); } }); };
</script>
</body></html>
