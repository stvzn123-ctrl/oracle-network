-- 궁합 상대 저장(2026-11-05). 한 번만 실행: npx wrangler d1 execute <DB이름> --remote --file=server/partners-migration.sql
CREATE TABLE IF NOT EXISTS partners(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,name TEXT NOT NULL,date TEXT NOT NULL,data TEXT NOT NULL,consent_at INTEGER NOT NULL,updated INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS partners_user ON partners(user_id,updated);
