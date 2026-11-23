<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Privacy &amp; Terms — The Virtual Circle</title></head><body>
<main class="wrap page" style="max-width:1100px">
  <div class="eyebrow">Data Privacy Act of 2012 (RA 10173)</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">Privacy Notice</h1>
  <p class="notice warn">Draft for legal review. Have a Data Protection Officer or privacy lawyer confirm this notice, retention periods and your NPC registration before launch.</p>
  <div class="card stack" style="margin-top:1.5rem">
    <div><h3>What we collect</h3><p class="muted">Name, email, PH mobile number, region and hub, profile details, a photo of your government ID and a selfie, a one-way hash of your ID number, a device fingerprint hash, messages you post, simulation transcripts and scores, bookings, payments and payout tax details (TIN and address for BIR Form 2307).</p></div>
    <div><h3>Why</h3><p class="muted">To verify that every member is a real, unique person; to keep the community free of scams (automated flagging of off-platform contact, spam and duplicate accounts); to match VAs with clients; to process payments, payouts and tax withholding; and to provide telehealth bookings with licensed practitioners.</p></div>
    <div><h3>Sensitive information</h3><p class="muted">ID photos and selfies are kept in a private store reachable only by our verification team; each view is logged. We never store your ID number in readable form. Wellness session content stays between you and your practitioner, following the DOH–NPC telemedicine guidelines.</p></div>
    <div><h3>Public job and profile data</h3><p class="muted">We collect public job postings and publicly listed professional profiles from external sites to power our job board and sourcing tools. If your public profile appears in our sourcing terminal and you want it removed, submit a <b>candidate removal</b> request below — we stop collecting it and exclude it from search.</p></div>
    <div><h3>Circle Hosts (AI helpers)</h3><p class="muted">Circle Hosts are AI helpers run by The Virtual Circle team, clearly labeled 🤖 on every post. They post conversation starters, send you a welcome notification, and may reply to a question, struggle or win that nobody has answered after a few hours. To write a reply, the text of that post may be sent to our AI provider (Google Gemini). Hosts never read private messages and never take part in Circle BFF, Jobs, Talent or payments.</p></div>
    <div><h3>Sharing</h3><p class="muted">Clients see only your profile card (name, skills, badges, scores). Payment processors (PayMongo, Xendit), SMS (Semaphore), AI scoring (Google Gemini), hosting (Cloudflare) and private document storage (Google Drive) process data on our behalf. We do not sell personal data.</p></div>
    <div><h3>Your rights</h3><p class="muted">You may access, correct, object to processing, or ask us to erase your data, and you may complain to the National Privacy Commission. Signed-in members can download their data from the dashboard at any time.</p></div>
  </div>

  <h2 id="request" style="margin-top:3rem;font-size:1.6rem">Make a privacy request</h2>
  <form class="card" id="dsr"><div class="field-row"><div><label for="d-type">Request</label><select id="d-type" name="type"><option value="access">Access my data</option><option value="correction">Correct my data</option><option value="erasure">Erase my account and data</option><option value="objection">Object to processing</option><option value="candidate_removal">Remove my public profile from sourcing</option></select></div>
    <div><label for="d-name">Full name</label><input id="d-name" name="name" required></div><div><label for="d-email">Email</label><input id="d-email" name="email" type="email" required></div></div>
    <label for="d-det">Details</label><textarea id="d-det" name="details" placeholder="For profile removal, include the name and link shown on the source site."></textarea>
    <button class="btn" style="margin-top:1rem">Submit request</button><div class="msg" id="dm"></div></form>

  <h2 id="terms" style="margin-top:3rem;font-size:1.6rem">Community terms</h2>
  <div class="card"><ul class="muted" style="margin:0;padding-left:1.2rem">
    <li>One account per person. Duplicate IDs or devices are flagged and may be closed.</li>
    <li>Keep conversations and payments on-platform. Sharing phone numbers, emails or WhatsApp/Telegram links is hidden automatically and earns penalty points: warning → 24h mute → suspension → ban.</li>
    <li>Never ask anyone to pay to work. Confirmed scams are banned immediately.</li>
    <li>Be kind in the Vent Room. It is a sanctuary, not a debate.</li>
    <li>"The Virtual Circle", "Circle Bestie", "Circle Squads" and the circle mark are trademarks of The Virtual Circle (IPOPHL application pending).</li></ul></div>
</main>
<script type="module">
import { api, $, shell, say, busy } from '/js/app.js';
const { user } = await shell();
if (user) { $('#d-name').value = user.name; $('#d-email').value = user.email; }
$('#dsr').onsubmit = (e) => { e.preventDefault(); busy(e.submitter, async () => { try { await api('privacy/request', { body: Object.fromEntries(new FormData(e.target)) }); e.target.reset(); say($('#dm'), 'Received. We respond within 15 days.', 'ok'); } catch (err) { say($('#dm'), err.message); } }); };
</script>
</body></html>
