-- The Virtual Circle · Phase 1 schema (Cloudflare D1)
CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL UNIQUE,
  pw_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','moderator','admin')),
  status TEXT NOT NULL DEFAULT 'pending_otp' CHECK (status IN ('pending_otp','pending_kyc','in_review','active','suspended')),
  cohort_tier TEXT NOT NULL CHECK (cohort_tier IN ('newbie','seasoned')),
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  device_hash TEXT,
  mobile_verified INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_device ON users(device_hash);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kyc_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_type TEXT NOT NULL,
  id_hash TEXT NOT NULL,          -- HMAC of ID number; raw number is never stored
  id_key TEXT NOT NULL,           -- R2 object keys (private bucket)
  selfie_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  note TEXT,
  reviewed_by TEXT,
  reviewed_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_kyc_idhash ON kyc_submissions(id_hash);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline TEXT, bio TEXT, region TEXT, timezone TEXT, avatar_key TEXT, updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS skills (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS profile_skills (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id), PRIMARY KEY (user_id, skill_id)
);
CREATE TABLE IF NOT EXISTS badges (id TEXT PRIMARY KEY, label TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS user_badges (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id), awarded_at INTEGER NOT NULL, PRIMARY KEY (user_id, badge_id)
);

-- Community (endpoints ship in Part 2)
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT,
  kind TEXT NOT NULL DEFAULT 'hub' CHECK (kind IN ('hub','niche','sanctuary')),
  anonymous_posts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS group_members (
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', joined_at INTEGER NOT NULL, PRIMARY KEY (group_id, user_id)
);
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY, author_id TEXT NOT NULL REFERENCES users(id),
  group_id TEXT REFERENCES groups(id), body TEXT NOT NULL, image_key TEXT,
  alias TEXT,                      -- anonymous alias shown instead of author (admins can trace via author_id)
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','hidden','removed')),
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts(group_id, created_at DESC);
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id), body TEXT NOT NULL, alias TEXT,
  status TEXT NOT NULL DEFAULT 'visible', created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at);
CREATE TABLE IF NOT EXISTS reactions (
  user_id TEXT NOT NULL, target_type TEXT NOT NULL CHECK (target_type IN ('post','comment')),
  target_id TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'like', created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, target_type, target_id)
);
CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL, followee_id TEXT NOT NULL, created_at INTEGER NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);
CREATE TABLE IF NOT EXISTS blocks (
  blocker_id TEXT NOT NULL, blocked_id TEXT NOT NULL, created_at INTEGER NOT NULL,
  PRIMARY KEY (blocker_id, blocked_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, data TEXT, read INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read, created_at DESC);

-- Moderation & safety
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY, reporter_id TEXT NOT NULL, target_type TEXT NOT NULL, target_id TEXT NOT NULL,
  reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','actioned','dismissed')),
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS mod_actions (
  id TEXT PRIMARY KEY, moderator_id TEXT NOT NULL, action TEXT NOT NULL,
  target_type TEXT NOT NULL, target_id TEXT NOT NULL, note TEXT, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS escalation_logs (
  id TEXT PRIMARY KEY, user_id TEXT, kind TEXT NOT NULL, detail TEXT, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY, actor_id TEXT, action TEXT NOT NULL, target TEXT, detail TEXT, created_at INTEGER NOT NULL
);
