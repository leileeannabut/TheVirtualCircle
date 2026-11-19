// Builds src/host-calendar.js (the Circle Hosts 90-day calendar) from a JSON list of items, after checking every item
// against the host rules. Use it if you rewrite the calendar in bulk; for small changes, edit or skip posts in Circle Ops → Hosts.
//   node dev/build-host-calendar.mjs calendar.json
// calendar.json: [{ id, day, time, host, channel: feed|hub|laughs, hub?, kind, format?, text?, body? }, …] (or { calendar: [...] })
import fs from 'node:fs';

const HOSTS = ['luna', 'glow', 'sage', 'shield', 'punchline', 'aurora', 'coral', 'summit'];
const HUBS = ['luzon-vas', 'manila-vas', 'baguio-vas', 'visayas-vas', 'cebu-vas', 'mindanao-vas', 'davao-vas', 'night-shift-lounge'];
const LIMITS = { feed: 1000, hub: 500, laughs_prompt: 200 };
// Words that suggest the AI is claiming a human life, a non-English phrase, or a real brand in a joke: printed for a human to check
const HUMAN = /\b(when I was|my (client|clients|boss|kids?|husband|wife|mom|family|shift|laptop)|I used to|I remember|I couldn't sleep|I had (coffee|a client)|as a VA myself|back when I)\b/i;
const TAGALOG = /\b(po|naman|kasi|talaga|grabe|sana|ako|ikaw|mga|kayo|tayo|ang|ng|lang|na lang|ba|diba|sige|salamat|kumain|ingat)\b/i;
const BRANDS = /\b(Upwork|Fiverr|OnlineJobs|Hubstaff|Time Doctor|Toggl|Facebook|TikTok|Instagram|Kopiko|Nescafe|Zoom|Slack|Gmail|Meralco|PLDT|Globe|Smart|Converge|Jollibee|Grab|Shopee|Lazada)\b/;
// Real contact details are never allowed. App names are fine in Shield's scam tips ("moving you to Telegram is a red flag").
const CONTACT = /(wa\.me|t\.me\/|discord\.gg|(\+?63|0)\s?9\d{2}[\s-]?\d{3}[\s-]?\d{4}|\+?\d[\d\s-]{8,}\d|[\w.+-]+@[\w-]+\.[\w.]+|@[a-z0-9_]{3,})/i;
const APPS = /\b(whats\s?app|telegram|viber|signal\s?app|wechat|skype|discord)\b/i;

const clip = (s, n) => String(s ?? '').trim().slice(0, n);
const errors = [], warnings = [];
function texts(i) { return i.kind === 'meme' ? JSON.stringify(i.body) : i.text; }

function meme(i) {
  const b = i.body && typeof i.body === 'object' ? i.body : {};
  switch (i.format) {
    case 'tracker': return { activity: Math.max(0, Math.min(100, Math.round(Number(b.activity) || 0))), timer: clip(b.timer, 12) || '00:00:00', caption: clip(b.caption, 200), punchline: clip(b.punchline, 300) };
    case 'dialog': return { lines: (Array.isArray(b.lines) ? b.lines : []).slice(0, 10).map((l) => ({ who: clip(l && l.who, 30) || 'Me', text: clip(l && l.text, 240) })).filter((l) => l.text) };
    case 'expectation': return { expectation: clip(b.expectation, 300), reality: clip(b.reality, 300) };
    case 'nobody': return { who: clip(b.who, 60), text: clip(b.text, 300) };
    case 'pov': return { text: clip(b.text, 300) };
    case 'starter': return { title: clip(b.title, 80), items: (Array.isArray(b.items) ? b.items : []).map((x) => clip(x, 80)).filter(Boolean).slice(0, 9) };
    case 'story': return { text: clip(b.text, 1500) };
    default: return null;
  }
}
function memeOk(f, b) {
  if (!b) return false;
  if (f === 'dialog') return b.lines.length >= 2;
  if (f === 'starter') return b.title && b.items.length >= 3;
  const main = { story: 'text', expectation: 'reality', nobody: 'text', pov: 'text', tracker: 'caption' }[f];
  return (b[main] || '').length >= 2;
}

const src = JSON.parse(fs.readFileSync(process.argv[2] || 'calendar.json', 'utf8'));
const list = Array.isArray(src) ? src : src.calendar;
const seen = new Set(); const out = [];
for (const r of list) {
  const i = { id: clip(r.id, 40), day: Number(r.day), time: clip(r.time, 5), host: r.host, channel: r.channel, hub: r.hub || '', kind: r.kind, format: r.format || '', text: '', body: {} };
  const where = `${i.id || '(no id)'}`;
  if (!i.id || seen.has(i.id)) { errors.push(`${where}: missing or duplicate id`); continue; }
  seen.add(i.id);
  if (!(i.day >= 1 && i.day <= 90) || !/^\d{2}:\d{2}$/.test(i.time)) errors.push(`${where}: day must be 1–90 and time HH:MM`);
  if (!HOSTS.includes(i.host)) errors.push(`${where}: unknown host "${i.host}"`);
  if (i.channel === 'hub' && !HUBS.includes(i.hub)) errors.push(`${where}: unknown hub "${i.hub}"`);
  if (i.kind === 'meme') {
    i.body = meme({ ...r, format: i.format });
    if (!memeOk(i.format, i.body)) errors.push(`${where}: ${i.format} meme is missing its funny part`);
  } else {
    const max = LIMITS[i.kind === 'laughs_prompt' ? 'laughs_prompt' : i.channel] || 1000;
    i.text = clip(r.text, max);
    if ((r.text || '').trim().length > max) warnings.push(`${where}: text cut to ${max} characters`);
    if (i.text.length < 10) errors.push(`${where}: text missing`);
  }
  const t = texts(i) || '';
  if (CONTACT.test(t)) errors.push(`${where}: contains contact details or a handle → "${t.match(CONTACT)[0]}"`);
  if (APPS.test(t) && i.host !== 'shield') warnings.push(`${where}: mentions a chat app outside a Shield scam tip → "${t.match(APPS)[0]}"`);
  if (/https?:\/\/|www\./i.test(t)) errors.push(`${where}: contains a URL`);
  if (HUMAN.test(t)) warnings.push(`${where}: may claim a human experience → "${t.match(HUMAN)[0]}"`);
  if (TAGALOG.test(t)) warnings.push(`${where}: possible non-English word → "${t.match(TAGALOG)[0]}"`);
  if (i.kind === 'meme' && BRANDS.test(t)) warnings.push(`${where}: brand name in a joke → "${t.match(BRANDS)[0]}"`);
  out.push(i);
}
out.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
for (const w of warnings) console.log('  ⚠ ' + w);
for (const e of errors) console.log('  ✘ ' + e);
if (errors.length) { console.log(`\n${errors.length} error(s): fix them and run again. Nothing was written.`); process.exit(1); }
const head = `// Circle Hosts: the 90-day launch calendar (generated by dev/build-host-calendar.mjs, checked against the host rules).
// Times are Manila time (UTC+8). Day 1 is set in Circle Ops → Hosts. Edit or skip upcoming posts there; changes here only
// affect items that are not in the database yet.
// kinds: question / post / tip (Circle Feed or a Circle Hub), laughs_prompt (the weekly Circle Laughs prompt), meme (Circle Laughs)
`;
fs.writeFileSync(new URL('../src/host-calendar.js', import.meta.url), head + 'export const CALENDAR = [\n' + out.map((i) => JSON.stringify(i)).join(',\n') + '\n];\n');
const by = out.reduce((m, i) => ((m[i.kind] = (m[i.kind] || 0) + 1), m), {});
console.log(`\nWrote ${out.length} items (${Object.entries(by).map(([k, n]) => `${n} ${k}`).join(', ')}) with ${warnings.length} warning(s) to review.`);
