// 운명 네트워크 초대 링크 서버 (Cloudflare Worker + D1)
// 출생 정보·결과는 받지 않는다. 브라우저별 무작위 기기값(d), 초대 코드(ref), 비밀 키(key)만 다룬다.
const ORIGINS = ["https://stvzn123-ctrl.github.io"];
const ABC = "abcdefghjkmnpqrstuvwxyz23456789";

const rand = n => { const b = crypto.getRandomValues(new Uint8Array(n)); return [...b].map(x => ABC[x % ABC.length]).join(""); };
const sha = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
const okId = (s, max = 64) => typeof s === "string" && /^[a-z0-9-]{4,64}$/i.test(s) && s.length <= max;

function cors(req, env) {
  const o = req.headers.get("Origin") || "";
  const allow = ORIGINS.concat((env.EXTRA_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean));
  return {
    "Access-Control-Allow-Origin": allow.includes(o) ? o : ORIGINS[0],
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
const json = (req, env, body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors(req, env) } });

// 같은 사람이 시크릿 창으로 다시 여는 경우를 거르기 위한 값(IP + 브라우저 정보의 해시, 원문은 저장하지 않음)
const sigOf = req => sha((req.headers.get("CF-Connecting-IP") || "") + "|" + (req.headers.get("User-Agent") || ""));

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req, env) });
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, "");
    try {
      if (req.method === "POST" && path === "/invite") {
        const { d } = await req.json().catch(() => ({}));
        if (!okId(d)) return json(req, env, { error: "bad device" }, 400);
        const sig = await sigOf(req), now = Date.now();
        // 같은 기기·접속에서 하루 20개까지만 새 초대 링크를 만든다
        const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM invites WHERE owner_sig=? AND created>?").bind(sig, now - 864e5).first();
        if (n >= 20) return json(req, env, { error: "too many" }, 429);
        const ref = rand(8), key = rand(24);
        await env.DB.prepare("INSERT INTO invites(ref,key_hash,owner_dev,owner_sig,created) VALUES(?,?,?,?,?)")
          .bind(ref, await sha(key), d, sig, now).run();
        return json(req, env, { ref, key });
      }
      if (req.method === "POST" && path === "/open") {
        const { r, d } = await req.json().catch(() => ({}));
        if (!okId(r, 16) || !okId(d)) return json(req, env, { error: "bad request" }, 400);
        const row = await env.DB.prepare("SELECT owner_dev,owner_sig,opened_at FROM invites WHERE ref=?").bind(r).first();
        if (!row) return json(req, env, { counted: false, reason: "unknown" }, 404);
        if (row.opened_at) return json(req, env, { counted: true });
        const sig = await sigOf(req);
        if (d === row.owner_dev || sig === row.owner_sig) return json(req, env, { counted: false, reason: "self" });
        await env.DB.prepare("UPDATE invites SET opened_at=?, opener_sig=? WHERE ref=? AND opened_at IS NULL").bind(Date.now(), sig, r).run();
        return json(req, env, { counted: true });
      }
      if (req.method === "GET" && path === "/status") {
        const r = url.searchParams.get("r"), k = url.searchParams.get("k");
        if (!okId(r, 16) || !okId(k)) return json(req, env, { error: "bad request" }, 400);
        const row = await env.DB.prepare("SELECT key_hash,opened_at FROM invites WHERE ref=?").bind(r).first();
        if (!row || row.key_hash !== await sha(k)) return json(req, env, { error: "not found" }, 404);
        return json(req, env, { opened: !!row.opened_at });
      }
      if (path === "" || path === "/health") return json(req, env, { ok: true });
      return json(req, env, { error: "not found" }, 404);
    } catch (e) {
      return json(req, env, { error: "server" }, 500);
    }
  },
};
