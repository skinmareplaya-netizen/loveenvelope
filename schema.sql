CREATE TABLE IF NOT EXISTS envelopes (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL,
  theme TEXT NOT NULL,
  recipient TEXT NOT NULL DEFAULT '',
  sender TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  signature TEXT NOT NULL DEFAULT '',
  music TEXT NOT NULL DEFAULT 'off',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_envelopes_created_at ON envelopes(created_at);
