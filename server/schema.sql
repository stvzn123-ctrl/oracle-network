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


CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, kakao_id TEXT NOT NULL UNIQUE, nickname TEXT NOT NULL DEFAULT '', profile TEXT, profile_updated INTEGER, consent_at INTEGER, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE TABLE IF NOT EXISTS auth_flows (state_hash TEXT PRIMARY KEY, challenge TEXT NOT NULL, sig TEXT NOT NULL, created INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS auth_flows_rate ON auth_flows(sig,created);
CREATE INDEX IF NOT EXISTS auth_flows_expiry ON auth_flows(expires);
CREATE TABLE IF NOT EXISTS auth_grants (code_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, challenge TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS auth_grants_expiry ON auth_grants(expires);
