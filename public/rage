<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0a1024"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/css/tokens.css">
<title>Circle Rage Room — The Virtual Circle</title>
<style>
  .levels{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))}
  .level{cursor:pointer;text-align:left;font:inherit;color:inherit;transition:transform .15s,border-color .15s}
  .level:hover{transform:translateY(-2px)}.level.on{border-color:var(--amber);box-shadow:0 0 0 2px rgba(242,182,74,.35)}
  .level .big{font-size:2.2rem;line-height:1}.level[data-l="2"].on{border-color:#ff8a3d}.level[data-l="3"].on{border-color:#ff4d2e;box-shadow:0 0 30px -6px rgba(255,77,46,.6)}
  .thermo{height:10px;border-radius:99px;background:linear-gradient(90deg,#7fd8a8,#f6c66b 50%,#ff4d2e);position:relative;margin:.4rem 0 1rem}
  .thermo b{position:absolute;top:-6px;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--bg);transform:translateX(-50%);transition:left .3s}
  .wall-wrap{position:relative;border-radius:20px;overflow:hidden;border:1px solid var(--line-2);touch-action:manipulation;user-select:none}
  .wall-wrap.shake{animation:shake .25s}@keyframes shake{25%{transform:translate(-6px,3px)}50%{transform:translate(5px,-4px)}75%{transform:translate(-3px,2px)}}
  canvas#wall{display:block;width:100%;height:min(60vh,540px);cursor:crosshair}
  .ammo{display:flex;gap:.4rem;flex-wrap:wrap}.ammo button{font-size:1.35rem;padding:.35rem .75rem}
  .overlay{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,16,36,.82);text-align:center;padding:1.5rem}
  .breathe{width:140px;height:140px;border-radius:50%;margin:1rem auto;background:radial-gradient(circle,#9fd6ff,#3a6fb0);box-shadow:0 0 40px rgba(143,180,255,.5);animation:breathe 8s ease-in-out infinite}
  @keyframes breathe{0%,100%{transform:scale(.6)}45%,55%{transform:scale(1)}}
  @media (prefers-reduced-motion:reduce){.wall-wrap.shake{animation:none}.breathe{animation:none}}
</style></head><body>
<main class="wrap page">
  <div class="page-head"><div><div class="eyebrow">Circle Rage Room 🧯</div><h1 style="font-size:clamp(2rem,4vw,2.8rem)">How frustrated are you?</h1>
    <p class="muted">Pick your level, write what's bugging you on the wall (a name, a task, "that 3am email"), and throw. <b>What you write stays on your device.</b> Nothing is saved, posted or sent.</p></div></div>

  <div class="thermo" aria-hidden="true"><b id="thermo" style="left:16%"></b></div>
  <div class="levels" id="levels"></div>

  <div class="card" style="margin:1.5rem 0 1rem"><div class="row between">
    <div class="row" style="flex:1;min-width:240px"><input id="target" maxlength="40" placeholder="Write on the wall… (stays on your screen only)" aria-label="Text on the wall" style="flex:1"><button class="btn quiet" id="write">Write</button></div>
    <div class="ammo" id="ammo" role="radiogroup" aria-label="What to throw"></div></div></div>
  <div class="wall-wrap" id="wrap"><canvas id="wall" aria-label="Throwing wall. Click or tap to throw."></canvas><div class="overlay hidden" id="overlay"></div></div>
  <div class="row between" style="margin-top:1rem"><span class="muted small" id="hand">—</span>
    <div class="row"><button class="btn ghost sm" id="sound">🔊 Sound on</button><button class="btn quiet sm" id="clean">🧽 Clean the wall</button><button class="btn quiet sm" id="cool">🫧 Cool down</button></div></div>
  <div class="notice hidden" id="care" style="margin-top:1.25rem">🌋 Really hot day? You don't have to carry it alone. <a href="/bff.html">Find a Circle BFF who's been there</a> (free) · <a href="/wellness.html#crisis">crisis lines</a> (free) · <a href="/wellness.html">book a licensed practitioner</a> (Circle Wellness).</div>
  <p class="muted small" id="care-all" style="margin-top:1rem">Want to talk instead of throw? <a href="/bff.html">Circle BFF</a> (free) · <a href="/hubs.html#vent-room">The Vent Room</a> (free, anonymous) · <a href="/wellness.html">Circle Wellness</a> (licensed practitioners).</p>
  <p class="faint small" style="margin-top:1.5rem">If anger turns into thoughts of hurting yourself or someone else, please reach out now: <a href="/wellness.html#crisis">crisis lines</a>.</p>
</main>
<script type="module">
import { api, shell, $, $$, esc, toast, handlePayment } from '/js/app.js';
await shell({ auth: true });
const qp = new URLSearchParams(location.search);
const EMOJI = { egg: '🥚', plate: '🍽️', ball: '⚽', slime: '🟢', dirt: '🟤', knife: '🔪', tomato: '🍅' };
let st, tier, ammo = 'egg', pending = 0, sending = 0, throws = 0, sound = true, audio, outTimer = null;
try { st = await api('rage/status'); }
catch (e) { $('#levels').innerHTML = `<div class="empty" style="grid-column:1/-1">The Circle Rage Room couldn't load (${esc(e.message)}). Please refresh. Need to talk now? <a href="/bff.html">Circle BFF</a> · <a href="/wellness.html#crisis">crisis lines</a></div>`; throw e; }
tier = st.tiers[0];
const left = () => Math.max(0, tier.owned - pending - sending); // throws you can still throw in this tier

// Report throws to the server in small batches (never ahead of time), so nothing is lost on refresh, tier switch or leaving.
async function flush() {
  if (!pending || sending) return;
  const t = tier, n = Math.min(pending, 50); sending = n; pending -= n;
  try { const r = await api('rage/spend', { body: { tier: t.id, count: n } }); t.owned = r.left ?? Math.max(0, t.owned - (r.spent || 0)); }
  catch (e) { pending += n; toast(e.message, 'err'); }
  finally { sending = 0; drawLevels(); }
  if (pending >= 5) flush();
}
function flushOnExit() {
  if (!pending) return;
  fetch('/api/rage/spend', { method: 'POST', keepalive: true, credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tier: tier.id, count: Math.min(pending, 50) }) });
  pending = 0;
}
addEventListener('pagehide', flushOnExit);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushOnExit(); });
let idle; const scheduleFlush = () => { clearTimeout(idle); if (pending >= 5) flush(); else idle = setTimeout(flush, 1500); };

function drawLevels() {
  $('#levels').innerHTML = st.tiers.map((t) => { const n = t.id === tier.id ? left() : t.owned;
    return `<button class="card level ${t.id === tier.id ? 'on' : ''}" data-t="${esc(t.id)}" data-l="${Number(t.level) || 1}">
    <div class="row between"><span class="big">${esc(t.emoji)}</span>${t.price ? `<span class="chip ${n ? 'ok' : 'amber'}">${n ? n + ' throws left' : '₱' + Number(t.price) + ' · ' + Number(t.throws) + ' throws'}</span>` : `<span class="chip ok">Free · ${n} left today</span>`}</div>
    <h3 style="margin:.6rem 0 .2rem">${esc(t.name)}</h3><p class="muted small" style="margin:0">${esc(t.desc)}</p>
    <div style="margin-top:.6rem;font-size:1.2rem">${t.items.map((i) => EMOJI[i] || '').join(' ')}</div></button>`; }).join('');
  $('#thermo').style.left = ({ 1: 16, 2: 50, 3: 86 })[tier.level] + '%';
  $('#ammo').innerHTML = tier.items.filter((i) => EMOJI[i]).map((i) => `<button class="btn ${i === ammo ? '' : 'quiet'}" data-a="${i}" title="${i}">${EMOJI[i]}</button>`).join('');
  $('#care').classList.toggle('hidden', tier.level < 3);
  $('#hand').textContent = `${left()} ${tier.price ? 'throws left in your ' + tier.name + ' pack' : 'free throws left today'}${st.supporter && !tier.price ? ' (Glow Keeper bonus included ✨)' : ''}`;
}
async function selectTier(t) {
  clearTimeout(outTimer); clearTimeout(idle);
  if (pending) await flush(); // settle the previous tier first
  tier = t; if (!t.items.includes(ammo)) ammo = t.items[0];
  drawLevels();
  if (t.price && !left()) return buyPrompt(t);
  overlay('');
}
function overlay(html) { $('#overlay').innerHTML = html; $('#overlay').classList.toggle('hidden', !html); }
function buyPrompt(t) {
  overlay(`<div><div style="font-size:3rem">${esc(t.emoji)}</div><h2>${esc(t.name)} pack</h2><p class="muted">${Number(t.throws)} throws · ${t.items.map((i) => EMOJI[i] || '').join(' ')}</p>
    <button class="btn" data-buy="${esc(t.id)}">Get it for ₱${Number(t.price)}</button><p class="faint small" style="margin-top:1rem">Or stay at 🫖 Simmer for free. Need to talk instead? <a href="/bff.html">Circle BFF</a> · <a href="/wellness.html">Circle Wellness</a></p></div>`);
}
function outPrompt() {
  const others = st.tiers.filter((t) => t.id !== tier.id);
  overlay(`<div><h2>${tier.price ? 'Pack empty' : "That's today's free throws"}</h2><p class="muted">Feeling any lighter? Try a minute of cool-down breathing or talk it out. If you still need to throw:</p>
    <div class="row" style="justify-content:center"><button class="btn quiet" data-cool>🫧 Cool down (free)</button><a class="btn quiet" href="/bff.html">💛 Talk to a Circle BFF (free)</a></div>
    <div class="row" style="justify-content:center;margin-top:.6rem">${others.map((t) => (t.owned > 0
      ? `<button class="btn ghost sm" data-switch="${esc(t.id)}">${esc(t.emoji)} Use ${esc(t.name)} (${t.owned} left)</button>`
      : t.price ? `<button class="btn ghost sm" data-buy="${esc(t.id)}">${esc(t.emoji)} ${esc(t.name)} · ₱${Number(t.price)}</button>` : '')).join('')}${tier.price ? `<button class="btn ghost sm" data-buy="${esc(tier.id)}">${esc(tier.emoji)} Another ${esc(tier.name)} pack · ₱${Number(tier.price)}</button>` : ''}</div>
    ${!st.supporter ? '<p class="faint small" style="margin-top:1rem">Glow Keepers get extra free throws every day. <a href="/pro.html">Keep the Circle Glowing ✨</a></p>' : ''}
    <p class="faint small">Overwhelmed? <a href="/wellness.html#crisis">Crisis lines</a> are always free.</p></div>`);
}
function coolDown() {
  overlay(`<div><h2>Breathe with the circle</h2><div class="breathe"></div><p class="muted">In as it grows · hold · out as it shrinks. Four slow breaths.</p><button class="btn quiet" data-close>I'm calmer</button></div>`);
}
async function refreshAndSelect(id, tries = 1) { // after a purchase: wait for the pack to be credited (webhooks can take a few seconds)
  for (let i = 0; i < tries; i++) {
    st = await api('rage/status'); const t = st.tiers.find((x) => x.id === id);
    if (t && t.owned > 0) return selectTier(t);
    if (i < tries - 1) { overlay('<div><h2>Adding your pack…</h2><p class="muted">Payment received. This takes a few seconds.</p></div>'); await new Promise((r) => setTimeout(r, 1500)); }
  }
  const t = st.tiers.find((x) => x.id === id); if (t) { tier = t; drawLevels(); overlay('<div><h2>Payment received</h2><p class="muted">Your pack will appear in a minute. Refresh this page if it doesn\'t.</p><button class="btn quiet" data-close>OK</button></div>'); }
}
$('#levels').onclick = (e) => { const b = e.target.closest('[data-t]'); if (b) selectTier(st.tiers.find((t) => t.id === b.dataset.t)); };
$('#overlay').onclick = async (e) => {
  if (e.target.dataset.close !== undefined) { overlay(''); return; } // never bounce back to a sales prompt after calming down
  if (e.target.dataset.switch) { const t = st.tiers.find((x) => x.id === e.target.dataset.switch); if (t) selectTier(t); return; }
  if (e.target.dataset.cool !== undefined) return coolDown();
  const id = e.target.dataset.buy; if (!id) return; e.target.disabled = true;
  try {
    const r = await api('rage/buy', { body: { tier: id } });
    if (r.checkout_url) { await flush(); location.href = r.checkout_url; return; }
    if (r.paid) { toast('Pack added. Let it out 🔥', 'ok'); await refreshAndSelect(id); }
  } catch (err) { toast(err.message, 'err'); e.target.disabled = false; }
};
$('#ammo').onclick = (e) => { const a = e.target.closest('[data-a]'); if (a) { ammo = a.dataset.a; drawLevels(); } };
$('#cool').onclick = coolDown;

// ───────── The wall ─────────
const cv = $('#wall'), ctx = cv.getContext('2d');
let W, H, words = [], marks = [], flying = [], cracks = [], embers = [];
const fit = () => { const r = cv.getBoundingClientRect(); const d = devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); W = r.width; H = r.height; };
fit(); addEventListener('resize', fit);
$('#write').onclick = () => { const t = $('#target').value.trim(); if (!t) return; words.push({ t, x: W * (0.25 + Math.random() * 0.5), y: H * (0.25 + Math.random() * 0.4), r: (Math.random() - 0.5) * 0.25 }); $('#target').value = ''; };
$('#target').onkeydown = (e) => { if (e.key === 'Enter') $('#write').click(); };
$('#clean').onclick = () => { marks = []; cracks = []; };
$('#sound').onclick = () => { sound = !sound; $('#sound').textContent = sound ? '🔊 Sound on' : '🔇 Sound off'; };

function noise(kind) { // synthesized impact sounds; louder and deeper at higher levels
  if (!sound) return; audio = audio || new AudioContext();
  const len = { plate: 0.5, knife: 0.25, ball: 0.15 }[kind] || 0.2; const buf = audio.createBuffer(1, audio.sampleRate * len, audio.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) { const t = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, kind === 'plate' ? 2 : 4) * (kind === 'knife' ? Math.sin(i / 3) : 1); }
  const src = audio.createBufferSource(); src.buffer = buf; const f = audio.createBiquadFilter(); f.type = kind === 'plate' || kind === 'knife' ? 'highpass' : 'lowpass';
  f.frequency.value = kind === 'plate' ? 2500 : kind === 'knife' ? 3000 : kind === 'ball' ? 300 : 900 - tier.level * 150;
  const g = audio.createGain(); g.gain.value = 0.6 + tier.level * 0.25; src.connect(f).connect(g).connect(audio.destination); src.start();
}
cv.addEventListener('pointerdown', (e) => {
  if (!$('#overlay').classList.contains('hidden')) return;
  if (left() <= 0) { tier.price ? buyPrompt(tier) : outPrompt(); return; }
  const r = cv.getBoundingClientRect(); const tx = e.clientX - r.left, ty = e.clientY - r.top;
  flying.push({ kind: ammo, x: W / 2 + (Math.random() - 0.5) * 80, y: H + 30, tx, ty, t: 0, spin: Math.random() * 6 });
  pending++; throws++; drawLevels(); scheduleFlush();
  if (left() === 0) { clearTimeout(outTimer); outTimer = setTimeout(() => { flush(); tier.price ? buyPrompt(tier) : outPrompt(); }, 900); }
});
function impact(f) {
  noise(f.kind);
  const scale = 0.85 + tier.level * 0.2;
  const m = { kind: f.kind, x: f.tx, y: f.ty, seed: Math.random(), rot: Math.random() * Math.PI * 2, drip: 0, scale };
  if (f.kind === 'plate') m.shards = Array.from({ length: 9 + tier.level * 3 }, () => ({ a: Math.random() * Math.PI * 2, d: 10 + Math.random() * 45 * scale, s: 6 + Math.random() * 10 }));
  if (f.kind === 'ball') { m.bounce = 1; m.vy = -6; m.vx = (Math.random() - 0.5) * 6; }
  if (f.kind === 'tomato') m.seeds = Array.from({ length: 10 }, () => [Math.random() * Math.PI * 2, 10 + Math.random() * 30]);
  marks.push(m); if (marks.length > 200) marks.shift();
  if (tier.level >= 3) { // Volcano: cracks, shake, embers
    cracks.push({ x: f.tx, y: f.ty, segs: Array.from({ length: 5 }, () => { let a = Math.random() * Math.PI * 2, x = 0, y = 0; return Array.from({ length: 4 }, () => { a += (Math.random() - 0.5) * 0.9; x += Math.cos(a) * (14 + Math.random() * 16); y += Math.sin(a) * (14 + Math.random() * 16); return [x, y]; }); }) });
    if (cracks.length > 40) cracks.shift();
    $('#wrap').classList.remove('shake'); void $('#wrap').offsetWidth; $('#wrap').classList.add('shake');
    for (let i = 0; i < 14; i++) embers.push({ x: f.tx, y: f.ty, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 5, life: 1 });
  }
}
function blob(x, y, r, color, seed, n = 9) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; const rr = r * (0.75 + 0.45 * Math.abs(Math.sin(seed * 9 + i * 1.7))); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function drawMark(m) {
  const s = m.seed, k = m.scale;
  if (m.kind === 'egg') { blob(m.x, m.y, 34 * k, 'rgba(255,248,225,.92)', s, 12); blob(m.x + 4, m.y - 2, 13 * k, '#f6b21c', s * 2); ctx.fillStyle = 'rgba(255,248,225,.9)'; ctx.fillRect(m.x - 3, m.y + 20 * k, 6, Math.min(70, m.drip)); }
  if (m.kind === 'tomato') { blob(m.x, m.y, 36 * k, 'rgba(214,40,40,.9)', s, 14); ctx.fillStyle = 'rgba(255,220,120,.9)'; m.seeds.forEach(([a, d]) => { ctx.beginPath(); ctx.ellipse(m.x + Math.cos(a) * d * k, m.y + Math.sin(a) * d * k, 2.5, 4, a, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = 'rgba(214,40,40,.85)'; for (let i = 0; i < 3; i++) ctx.fillRect(m.x - 20 + i * 18, m.y + 18 * k, 6, Math.min(50 + i * 15, m.drip * (0.7 + i * 0.2))); }
  if (m.kind === 'slime') { blob(m.x, m.y, 40 * k, 'rgba(110,230,120,.85)', s, 14); ctx.fillStyle = 'rgba(110,230,120,.85)'; for (let i = 0; i < 4; i++) ctx.fillRect(m.x - 30 + i * 18 + s * 6, m.y + 15, 8, Math.min(30 + i * 22, m.drip * (0.6 + i * 0.25))); }
  if (m.kind === 'dirt') { for (let i = 0; i < 14; i++) blob(m.x + Math.cos(i * 2.4 + s * 5) * (8 + i * 3) * k, m.y + Math.sin(i * 2.4 + s * 5) * (8 + i * 3) * k, 4 + (i % 4) * 4, 'rgba(110,72,40,.9)', s + i, 7); }
  if (m.kind === 'plate') { ctx.strokeStyle = 'rgba(230,236,250,.55)'; ctx.lineWidth = 1.5; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(m.x, m.y); const a = s * 7 + i; ctx.lineTo(m.x + Math.cos(a) * 45 * k, m.y + Math.sin(a) * 45 * k); ctx.stroke(); }
    ctx.fillStyle = 'rgba(240,244,255,.9)'; m.shards.forEach((sh) => { ctx.save(); ctx.translate(m.x + Math.cos(sh.a) * sh.d, m.y + Math.sin(sh.a) * sh.d); ctx.rotate(sh.a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sh.s, sh.s / 3); ctx.lineTo(sh.s / 4, sh.s); ctx.closePath(); ctx.fill(); ctx.restore(); }); }
  if (m.kind === 'knife') { ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.rot); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke(); ctx.font = '42px serif'; ctx.textAlign = 'center'; ctx.fillText('🔪', 0, -6); ctx.restore(); }
  if (m.kind === 'ball') { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(m.x, m.y, 18, 18, 0, 0, Math.PI * 2); ctx.fill(); if (m.bounce) { ctx.font = '30px serif'; ctx.textAlign = 'center'; ctx.fillText('⚽', m.bx ?? m.x, (m.by ?? m.y) + 10); } }
}
const WALLS = { 1: ['#2a3355', '#1b2242', 'rgba(255,255,255,.05)'], 2: ['#4a2a2a', '#2a1a22', 'rgba(255,170,120,.08)'], 3: ['#3a1410', '#1a0806', 'rgba(255,90,40,.14)'] };
let tick = 0;
function frame() {
  tick++; const [top, bot, mortar] = WALLS[tier.level] || WALLS[1];
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (tier.level >= 2) { const heat = ctx.createRadialGradient(W / 2, H * 1.1, 10, W / 2, H * 1.1, H * (tier.level === 3 ? 1.1 : 0.8));
    heat.addColorStop(0, tier.level === 3 ? `rgba(255,${90 + 20 * Math.sin(tick / 20)},30,.45)` : 'rgba(255,140,60,.22)'); heat.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = heat; ctx.fillRect(0, 0, W, H); }
  ctx.strokeStyle = mortar; ctx.lineWidth = 2; for (let y = 0; y < H; y += 32) for (let x = (y / 32) % 2 ? 0 : -40; x < W; x += 80) ctx.strokeRect(x, y, 80, 32);
  words.forEach((w) => { ctx.save(); ctx.translate(w.x, w.y); ctx.rotate(w.r); ctx.font = `600 ${Math.max(22, Math.min(46, W / 16))}px Fraunces, Georgia, serif`;
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,230,190,.9)'; ctx.fillText(w.t, 0, 0); ctx.restore(); });
  cracks.forEach((c) => { ctx.strokeStyle = 'rgba(255,120,40,.85)'; ctx.shadowColor = '#ff5a1e'; ctx.shadowBlur = 8; ctx.lineWidth = 2;
    c.segs.forEach((seg) => { ctx.beginPath(); ctx.moveTo(c.x, c.y); seg.forEach(([x, y]) => ctx.lineTo(c.x + x, c.y + y)); ctx.stroke(); }); ctx.shadowBlur = 0; });
  marks.forEach((m) => { m.drip = Math.min(90, m.drip + 0.35); if (m.bounce) { m.bx = (m.bx ?? m.x) + m.vx; m.by = (m.by ?? m.y) + m.vy; m.vy += 0.5; if (m.by > H) m.bounce = 0; } drawMark(m); });
  embers = embers.filter((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.02; ctx.fillStyle = `rgba(255,${120 + 80 * p.life},40,${p.life})`; ctx.fillRect(p.x, p.y, 3, 3); return p.life > 0; });
  flying = flying.filter((f) => { f.t += 0.06 + tier.level * 0.012; const t = Math.min(1, f.t); const x = f.x + (f.tx - f.x) * t, y = f.y + (f.ty - f.y) * t - Math.sin(t * Math.PI) * 120;
    ctx.save(); ctx.translate(x, y); ctx.rotate(f.spin * t * 4); ctx.font = `${44 - t * 14}px serif`; ctx.textAlign = 'center'; ctx.fillText(EMOJI[f.kind], 0, 12); ctx.restore();
    if (t >= 1) { impact(f); return false; } return true; });
  requestAnimationFrame(frame);
}
frame();
const want = qp.get('tier') && st.tiers.find((t) => t.id === qp.get('tier'));
if (want && qp.get('paid')) { toast('Payment received. Let it out 🔥', 'ok'); await refreshAndSelect(want.id, 8); }
else await selectTier(want || st.tiers[0]);
</script>
</body></html>
