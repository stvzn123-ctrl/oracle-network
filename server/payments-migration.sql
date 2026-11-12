-- 페이앱 결제 주문 (2026-11-12). D1 콘솔에서 한 번 실행한다.
CREATE TABLE IF NOT EXISTS payments(order_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,report_key TEXT NOT NULL,price INTEGER NOT NULL,status TEXT NOT NULL,mul_no TEXT,pay_type TEXT,created INTEGER NOT NULL,paid_at INTEGER,canceled_at INTEGER);
CREATE INDEX IF NOT EXISTS payments_user ON payments(user_id,created);
