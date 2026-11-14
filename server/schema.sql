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

CREATE TABLE IF NOT EXISTS report_entitlements(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,report_key TEXT NOT NULL,granted_at INTEGER NOT NULL,granted_by TEXT NOT NULL,revoked_at INTEGER,PRIMARY KEY(user_id,report_key));
CREATE TABLE IF NOT EXISTS private_reports(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,report_key TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,updated INTEGER NOT NULL,PRIMARY KEY(user_id,report_key));
CREATE TABLE IF NOT EXISTS admin_audit(id INTEGER PRIMARY KEY AUTOINCREMENT,actor_id TEXT NOT NULL,target_id TEXT NOT NULL,action TEXT NOT NULL,report_key TEXT,created INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS partners(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,name TEXT NOT NULL,date TEXT NOT NULL,data TEXT NOT NULL,consent_at INTEGER NOT NULL,updated INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS partners_user ON partners(user_id,updated);

CREATE TABLE IF NOT EXISTS pairs(code TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,kind TEXT NOT NULL DEFAULT 'love',created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS pair_members(code TEXT NOT NULL,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,joined INTEGER NOT NULL,allow_save INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(code,user_id));
CREATE INDEX IF NOT EXISTS pairs_owner ON pairs(owner_id,created);
CREATE TABLE IF NOT EXISTS payments(order_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,report_key TEXT NOT NULL,price INTEGER NOT NULL,status TEXT NOT NULL,mul_no TEXT,pay_type TEXT,created INTEGER NOT NULL,paid_at INTEGER,canceled_at INTEGER);
CREATE INDEX IF NOT EXISTS payments_user ON payments(user_id,created);

-- 2026-11-13 공유 혜택(계정마다 한 번, 주제 리포트 1개)
CREATE TABLE IF NOT EXISTS share_rewards(user_id TEXT PRIMARY KEY,reason TEXT NOT NULL,created INTEGER NOT NULL,used_key TEXT,used_at INTEGER);
