-- 0001_initial.sql
-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  password_hash TEXT,
  google_sub    TEXT UNIQUE,
  role          TEXT NOT NULL DEFAULT 'peserta' CHECK (role IN ('peserta','panitia')),
  avatar_url    TEXT,
  institution   TEXT,
  phone         TEXT,
  domicile      TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- KOMPETISI
CREATE TABLE IF NOT EXISTS competitions (
  id                   TEXT PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  description          TEXT NOT NULL DEFAULT '',
  guidebook_url        TEXT,
  logo_url             TEXT,
  total_prize_pool_idr INTEGER,
  max_team_members     INTEGER NOT NULL DEFAULT 5,
  is_published         INTEGER NOT NULL DEFAULT 1,
  created_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS competition_batches (
  id             TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  opens_at       TEXT NOT NULL,
  closes_at      TEXT NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS competition_prizes (
  id             TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  label          TEXT NOT NULL,
  amount_idr     INTEGER NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS competition_timeline_items (
  id                TEXT PRIMARY KEY,
  competition_id    TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  label             TEXT NOT NULL,
  occurs_at         TEXT NOT NULL,
  show_in_calendar  INTEGER NOT NULL DEFAULT 1,
  sort_order        INTEGER NOT NULL DEFAULT 0
);

-- TIM
CREATE TABLE IF NOT EXISTS teams (
  id             TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  batch_id       TEXT NOT NULL REFERENCES competition_batches(id),
  name           TEXT NOT NULL,
  code           TEXT NOT NULL UNIQUE,
  visibility     TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  leader_user_id TEXT NOT NULL REFERENCES users(id),
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id        TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  role           TEXT NOT NULL CHECK (role IN ('leader','member')),
  joined_at      TEXT NOT NULL,
  PRIMARY KEY (team_id, user_id),
  UNIQUE (competition_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_teams_comp_vis ON teams(competition_id, visibility);

-- REGISTRATION REQUIREMENTS
CREATE TABLE IF NOT EXISTS requirement_templates (
  id               TEXT PRIMARY KEY,
  competition_id   TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('group','individual')),
  due_at           TEXT NOT NULL,
  instructions     TEXT NOT NULL DEFAULT '',
  accepted_formats TEXT NOT NULL DEFAULT '["jpg","png"]',
  sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS requirement_submissions (
  id               TEXT PRIMARY KEY,
  template_id      TEXT NOT NULL REFERENCES requirement_templates(id) ON DELETE CASCADE,
  team_id          TEXT REFERENCES teams(id) ON DELETE CASCADE,
  user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  file_key         TEXT,
  file_name        TEXT,
  file_size        INTEGER,
  file_mime        TEXT,
  rejection_reason TEXT,
  submitted_at     TEXT,
  reviewed_by      TEXT REFERENCES users(id),
  reviewed_at      TEXT,
  updated_at       TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sub_group      ON requirement_submissions(template_id, team_id) WHERE team_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_sub_individual ON requirement_submissions(template_id, user_id) WHERE team_id IS NULL;

-- EVENT
CREATE TABLE IF NOT EXISTS events (
  id                     TEXT PRIMARY KEY,
  slug                   TEXT NOT NULL UNIQUE,
  name                   TEXT NOT NULL,
  description            TEXT NOT NULL DEFAULT '',
  starts_at              TEXT,
  registration_closes_at TEXT NOT NULL,
  quota                  INTEGER,
  is_paid                INTEGER NOT NULL DEFAULT 0,
  price_idr              INTEGER,
  is_published           INTEGER NOT NULL DEFAULT 1,
  created_at             TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_speakers (
  id         TEXT PRIMARY KEY,
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  session_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id                 TEXT PRIMARY KEY,
  event_id           TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type       TEXT NOT NULL CHECK (session_type IN ('seminar','workshop')),
  speaker_id         TEXT REFERENCES event_speakers(id),
  phone              TEXT NOT NULL,
  line_id            TEXT,
  institution        TEXT NOT NULL,
  domicile           TEXT NOT NULL,
  cv_key             TEXT,
  payment_proof_key  TEXT,
  created_at         TEXT NOT NULL,
  UNIQUE (event_id, user_id)
);

-- PENDUKUNG
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  payload    TEXT NOT NULL,
  read_at    TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
  id             TEXT PRIMARY KEY,
  competition_id TEXT REFERENCES competitions(id) ON DELETE CASCADE,
  body           TEXT NOT NULL,
  created_by     TEXT NOT NULL REFERENCES users(id),
  created_at     TEXT NOT NULL
);
