CREATE TABLE IF NOT EXISTS invites (
  ref TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL,
  owner_dev TEXT NOT NULL,
  owner_sig TEXT NOT NULL,
  created INTEGER NOT NULL,
  opened_at INTEGER,
  opener_sig TEXT
);
CREATE INDEX IF NOT EXISTS invites_owner ON invites(owner_sig, created);
