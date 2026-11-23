[README.md](https://github.com/user-attachments/files/35304186/README.md)
# The Virtual Circle
**Keep the Virtual Circle Glowing ✨**

The social home built only for virtual assistants (launching first in the Philippines, built in English for a worldwide circle): a verified, scam-proof "Facebook for VAs", with learning, jobs, wellbeing, comedy and earning built in. Every feature carries the **Circle** name.

| Guide | What's in it |
|---|---|
| **[DEPLOY.md](DEPLOY.md)** | Step-by-step setup in your own GitHub + Cloudflare + Google accounts (no coding needed) |
| **[EARNING.md](EARNING.md)** | Membership tiers, every earning option, what's passive, and the order to switch them on |
| **[LAUNCH.md](LAUNCH.md)** | The 90-day launch playbook: Circle Hosts (labeled AI), Founding Ambassadors, weekly rhythm, what to measure |
| **[RECRUITING.md](RECRUITING.md)** | 50 internal recruitment personas: who to invite, where to find them, honest outreach messages (planning notes, never accounts) |
| **README.md** (this file) | What's in the platform and how it's built |

## The Circle, feature by feature

### Community
| Feature | Page | What it does |
|---|---|---|
| **Circle Feed** | `feed.html` | Posts (💬 post · 🏆 win · ❓ question · 💭 struggle · 💡 tip), 5 reactions, comments, #hashtags, hub tags, paid boosts |
| **Circle Hubs** | `hubs.html` | #luzon-vas, #visayas-vas, #mindanao-vas, #baguio-vas, #manila-vas, #cebu-vas, #davao-vas, Night Shift Lounge, anonymous Vent Room |
| **Circle Chat** | `messages.html` | Private messages between connections, Circle BFF matches, clients and job applicants |
| **Circle Connections** & **Circle Profile** | `connections.html`, `profile.html` | Connect / accept, suggestions by hub and tier; profiles with rank, badges, certificates and posts |
| **Circle BFF** | `bff.html` | Opt-in "going through / been through" topics; automatic matching with a VA who's been there (also offered from 💭 Struggle posts) |
| **Circle Laughs 😂** | `comedy.html` | Meme cards (time tracker, Client vs Me, Expectation vs Reality, Nobody:, POV, starter pack, story), weekly prompt, Hall of Fame, **Circle Writers** columns, **Circle Laughs Podcast** by VA comedians |
| **Circle Hosts 🤖** | posts on Feed, Hubs and Laughs | Eight openly labeled **AI hosts** (Luna, Glow, Coach Sage, Shield, Punchline, Aurora, Coral, Summit) post a 90-day calendar of conversation starters, welcome new members privately, and reply when nobody has answered a question after 3 hours. They never DM, connect, join BFF, apply for jobs or appear in Talent, and they step back automatically as the circle gets busy. Managed in Circle Ops → Hosts |
| **Founding Ambassadors 🌟** | `ambassador.html` | Up to 50 real VAs who welcome, answer and invite during the first 90 days, in exchange for 90 days of free Tier 2, a badge and the founding leaderboard |
| Notifications | 🔔 in the top bar | Reactions, comments, connections, BFF matches, bookings, applications, certificates, rank changes |

### Growth & work
| Feature | Page | What it does |
|---|---|---|
| **Circle Academy** | `learn.html`, `cms.html` | Lesson decks, knowledge checks, printable certificates, 3 practical simulators (inbox triage, time zones, data entry); **Circle Academy editor** for Senior VAs and staff |
| **Circle Bestie** | `academy.html` | AI role-play clients scored on communication, technical skill and crisis handling (rules-based without a Gemini key) |
| **Circle Mentors** | `mentor.html` | Teaching gigs (1:1 mentoring, upskilling, resume reviews, mock interviews) and training modules by Proven VAs on Tier 2 |
| **Circle Jobs** | `jobs.html` | Clients pay to post jobs (scam patterns blocked); VAs apply free; collected job feeds with safety ratings |
| **Circle Talent** | `talent.html` | Verified VAs with ranks, badges and practice scores; paid chat unlock for clients; sourcing terminal and pipeline board |
| **Circle Squads** | `squads.html` | Managed teams: Pod Leader + VAs on $1,500–$5,000/month retainers with automatic splits |
| **Circle Studio** | `studio.html` | Build My Platform: $1.5k MVP to $12k Enterprise projects |

### Safety & wellbeing
| Feature | Page | What it does |
|---|---|---|
| **Circle Verified** | `join.html`, dashboard, Circle Ops → KYC | Aspiring VAs: Government ID + selfie. Tenured VAs: + proof of work. Ranks 1–4 unlock privileges. Phone code, device check, 18+ |
| **Circle Scam-Buster** | `scambuster.html` | Instant job-offer scan, community intel board, company red-flag registry |
| **Circle Wellness** | `wellness.html` | PRC-verified practitioners, paid video sessions, crisis lines |
| **Circle Rage Room** | `rage.html` | 🫖 Simmer (free daily) · 🔥 Boiling (₱50 pack) · 🌋 Volcano (₱99 pack). Your words never leave the device; cool-down breathing and free support links at every level |
| Behaviour guard | everywhere | Hides phone numbers, emails and Telegram/WhatsApp links; penalty points → warn → 24h mute → suspend → ban; reports go to Circle Ops |

### Membership & money
| Feature | Page | What it does |
|---|---|---|
| **Circle Membership** | `pro.html` | Tier 1 · Circle Member (free) · **Glow Keeper** (any contribution from ₱20, Glow Wall) · Tier 2 · **Circle Pro** (₱149/30 days) |
| **Circle Founders Cohort** | `index.html` | 20 Newbie + 30 Seasoned founding slots, claimed at ID approval |
| Payments & payouts | Circle Ops → Finance | PayMongo/Xendit with signed webhooks, referral share, daily payouts with withholding tax and BIR 2307 PDFs. Teaching-gig earnings are held until the session happens, with cancel, refund and dispute handling |
| **Circle Ops** | `admin.html` | Mon pulse · Wed escalations · Fri strategy · KYC · Finance · Sourcing feeds · People · Creators · Settings |
| Privacy | `privacy.html` | RA 10173 notice (draft), data requests, full data export |

In the top bar, features show their short name (Feed, Hubs, Chat, Academy, BFF, Jobs, Laughs, Talent) next to The Virtual Circle logo. Full Circle names are used in page titles, headings and the **More** menu.

## How it's built
```
GitHub repo ──(auto build on every push)──► Cloudflare Pages project (free tier)
                                              ├─ public/                  the website (plain HTML/CSS/JS, no build step)
                                              ├─ functions/api/[[path]]   the API + payment webhooks (code in src/)
                                              └─ D1 database (binding DB) tables are created automatically on first visit
Paperwork (KYC photos, proof of work, BIR 2307 PDFs) ──► the Founder's own Google Drive, private folder "The Virtual Circle (private)"
```
| Folder / file | Purpose |
|---|---|
| `public/` | All pages; `css/tokens.css` (Nocturnal Sanctuary design), `js/app.js` (navigation, helpers) |
| `functions/api/[[path]].js` | Cloudflare Pages Function entry; hands every `/api/*` request to `src/api.js` |
| `src/api.js` | Request handling, automatic database setup, background jobs, webhooks |
| `src/routes.js` · `social.js` · `membership.js` · `comedy.js` · `hosts.js` | API routes (core · community & academy · membership, Rage Room, gigs & ambassadors · Circle Laughs · Circle Hosts) |
| `src/host-calendar.js` | The Circle Hosts' 90-day launch calendar (rebuild with `node dev/build-host-calendar.mjs`, which checks every post against the host rules) |
| `src/payments.js` · `storage.js` · `ingest.js` · `services.js` · `schema.js` | Payments & payouts · Google Drive · job feeds · anti-scam & AI · database schema |
| `dev/` | Local test harness only (end-to-end test, fake Google server); never deployed |

**Background jobs** (Pages has no scheduler, so ordinary traffic starts them, once each): daily payouts and 2307s after 2:00am Manila, gig earnings release, job-feed ingestion every 6 hours, Circle Hosts every 10 minutes, and cleanup.

**First run:** after deploying, open `/setup.html`. It checks the deployment (API, database, secrets) and lets the owner claim Founder access once with the `SETUP_CODE` secret.

## Before launch
- In Circle Ops → Settings, set `site_url`, `countdown_ends_at`, `company_tin` and `company_address`, and **verify every number** in `crisis_resources`.
- Have a CPA confirm `ewt_rate_default` and the 2307 tax codes.
- Have a privacy lawyer or DPO review `privacy.html` and KYC retention. Telehealth must follow DOH–NPC telemedicine rules.
- Check each sourcing feed's terms of service (profile scraping carries RA 10173 risk).
- File IPOPHL trademark applications for "The Virtual Circle" and the Circle feature names you want to protect.

## Local testing (optional, for developers)
```bash
cp .dev.vars.example .dev.vars
npm run dev                         # http://localhost:8787 with a local database
node dev/mock-google.mjs &          # fake Google sign-in + Drive on :8790 (local tests only)
node dev/e2e.mjs shots/             # 231 end-to-end checks + screenshots (needs Playwright)
node dev/hosts-sim.mjs              # Circle Hosts in production mode (real background tick, simulated clock)
node dev/setup-sim.mjs              # first-run setup in production mode (no SMS provider, Founder claim)
```
`DEV_MODE=true` exists only in `.dev.vars` for local testing: payments complete instantly and test helpers answer on localhost only. **Never add `DEV_MODE` in Cloudflare.**
