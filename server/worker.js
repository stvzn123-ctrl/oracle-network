// 오라클 네트워크 공용 API (Cloudflare Worker + D1)
// 초대 기록 및 카카오 로그인 회원의 명시적으로 저장한 출생 정보를 다룬다.
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
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
const json = (req, env, body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors(req, env) } });

// 같은 사람이 시크릿 창으로 다시 여는 경우를 거르기 위한 값(IP + 브라우저 정보의 해시, 원문은 저장하지 않음)
const sigOf = req => sha((req.headers.get("CF-Connecting-IP") || "") + "|" + (req.headers.get("User-Agent") || ""));

// 카카오 토큰은 저장하지 않는다. 자체 세션은 SHA-256 해시로만 D1에 보관한다.
const SITE = "https://stvzn123-ctrl.github.io/oracle-network/";
const authHash = async value => [...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,"0")).join("");
const authRandom = () => [...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,"0")).join("");
const redirectSite = (key,value) => new Response(null,{status:303,headers:{Location:SITE+"#"+new URLSearchParams({[key]:value}),"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
async function authBody(req){if(!req.headers.get("Content-Type")?.startsWith("application/json"))throw new Error("input");const text=await req.text();if(text.length>8192)throw new Error("input");return JSON.parse(text)}
function validProfile(v){
  if(!v||typeof v!=="object")return null;
  const safeText=(x,n)=>typeof x==="string"&&x.trim().length>0&&x.length<=n&&!/[<>\u0000-\u001f]/.test(x);
  if(!safeText(v.name,80)||!safeText(v.roman,120)||!/[a-z]/i.test(v.roman)||!['m','f'].includes(v.sex)||!['s','l'].includes(v.cal)||typeof v.notime!=="boolean"||typeof v.leap!=="boolean")return null;
  const dateOK=x=>{if(typeof x!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const d=new Date(x+"T00:00:00Z");return Number.isFinite(+d)&&d.toISOString().slice(0,10)===x&&+x.slice(0,4)>=1920&&+x.slice(0,4)<=2026};
  if(!dateOK(v.date)||typeof v.time!=="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time))return null;
  if(!Number.isInteger(v.ly)||v.ly<1920||v.ly>2026||!Number.isInteger(v.lm)||v.lm<1||v.lm>12||!Number.isInteger(v.ld)||v.ld<1||v.ld>(v.cal==='l'?30:31))return null;
  const p=v.place;if(!p||typeof p!=="object"||!safeText(p.name,120)||typeof p.kr!=="boolean")return null;
  let place;
  if(p.none===true)place={name:"출생지 미선택",lat:null,lon:127.5,tz:9,kr:true,none:true};
  else{if(!Number.isFinite(p.lat)||Math.abs(p.lat)>90||!Number.isFinite(p.lon)||Math.abs(p.lon)>180||!Number.isFinite(p.tz)||p.tz< -12||p.tz>14)return null;
    place={name:p.name.trim(),lat:p.lat,lon:p.lon,tz:p.tz,kr:p.kr,sidoOnly:p.sidoOnly===true};for(const k of ['ki','ci','wi'])if(p[k]!==undefined){if(!Number.isInteger(p[k])||p[k]<0||p[k]>10000)return null;place[k]=p[k]}
  }
  return {name:v.name.trim(),roman:v.roman.trim(),sex:v.sex,cal:v.cal,ly:v.ly,lm:v.lm,ld:v.ld,leap:v.cal==='l'&&v.leap,date:v.date,time:v.time,notime:v.notime,place};
}
async function member(req,env){const token=req.headers.get("Authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];if(!token)return null;return env.DB.prepare("SELECT users.id,users.kakao_id,users.nickname,users.profile,users.profile_updated FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires>?").bind(await authHash(token),Date.now()).first()}
async function authRoute(req,env,url,ctx){
  const path=url.pathname.replace(/\/+$/,"");
  if(!path.startsWith('/auth/')&&path!=="/me"&&path!=="/profile")return null;
  if(req.method!=="GET"&&req.method!=="POST")return json(req,env,{error:"method"},405);
  const now=Date.now(),origin=req.headers.get('Origin');
  // 카카오 설정에서 연결을 끊은 회원은 서버의 세션과 출생 정보도 정리한다.
  if(req.method==='POST'&&path==='/auth/kakao/unlink'){
    if(!env.KAKAO_ADMIN_KEY||req.headers.get('Authorization')!=='KakaoAK '+env.KAKAO_ADMIN_KEY)return json(req,env,{error:'unauthorized'},401);
    const body=await req.text();if(body.length>4096)return json(req,env,{error:'input'},400);const p=new URLSearchParams(body),uid=p.get('user_id');
    if(p.get('app_id')!=='1636031'||!uid||! /^\d{1,24}$/.test(uid))return json(req,env,{error:'input'},400);
    await env.DB.prepare('DELETE FROM users WHERE kakao_id=?').bind(uid).run();return json(req,env,{ok:true});
  }
  if(req.method==='POST'&&origin!==ORIGINS[0])return json(req,env,{error:'origin'},403);
  if(req.method==='GET'&&path==='/auth/config')return json(req,env,{enabled:!!env.KAKAO_CLIENT_ID});
  if(req.method==='POST'&&path==='/auth/start'){
    if(!env.KAKAO_CLIENT_ID)return json(req,env,{error:'login_not_configured'},503);
    const {challenge}=await authBody(req);if(typeof challenge!=='string'||! /^[a-f0-9]{64}$/.test(challenge))return json(req,env,{error:'input'},400);
    const sig=await sigOf(req);const recent=await env.DB.prepare('SELECT COUNT(*) AS n FROM auth_flows WHERE sig=? AND created>?').bind(sig,now-3600000).first();if(recent.n>=30)return json(req,env,{error:'too_many'},429);
    const state=authRandom();await env.DB.prepare('INSERT INTO auth_flows(state_hash,challenge,sig,created,expires) VALUES(?,?,?,?,?)').bind(await authHash(state),challenge,sig,now,now+600000).run();
    ctx.waitUntil(env.DB.batch([env.DB.prepare('DELETE FROM auth_flows WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM auth_grants WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(now)]));
    const authorize=new URL('https://kauth.kakao.com/oauth/authorize');authorize.search=new URLSearchParams({client_id:env.KAKAO_CLIENT_ID,redirect_uri:url.origin+'/auth/kakao/callback',response_type:'code',state}).toString();return json(req,env,{url:authorize.toString()});
  }
  if(req.method==='GET'&&path==='/auth/kakao/callback'){
    const state=url.searchParams.get('state');if(!state||! /^[a-f0-9]{64}$/.test(state))return redirectSite('oracle_error','login');
    const flow=await env.DB.prepare('DELETE FROM auth_flows WHERE state_hash=? AND expires>? RETURNING challenge').bind(await authHash(state),now).first();
    const code=url.searchParams.get('code');if(!flow||!code||url.searchParams.has('error'))return redirectSite('oracle_error','login');
    const body=new URLSearchParams({grant_type:'authorization_code',client_id:env.KAKAO_CLIENT_ID,redirect_uri:url.origin+'/auth/kakao/callback',code});if(env.KAKAO_CLIENT_SECRET)body.set('client_secret',env.KAKAO_CLIENT_SECRET);
    const tr=await fetch('https://kauth.kakao.com/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(10000)});const token=await tr.json();if(!tr.ok||!token.access_token)return redirectSite('oracle_error','login');
    const ur=await fetch('https://kapi.kakao.com/v2/user/me',{headers:{Authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(10000)});const user=await ur.json();if(!ur.ok||!user.id)return redirectSite('oracle_error','login');
    const id=authRandom();const nickname=String(user.kakao_account?.profile?.nickname||'회원').replace(/[<>\u0000-\u001f]/g,'').slice(0,80);
    await env.DB.prepare('INSERT INTO users(id,kakao_id,nickname,created) VALUES(?,?,?,?) ON CONFLICT(kakao_id) DO UPDATE SET nickname=excluded.nickname').bind(id,String(user.id),nickname,now).run();
    const row=await env.DB.prepare('SELECT id FROM users WHERE kakao_id=?').bind(String(user.id)).first();const grant=authRandom();await env.DB.prepare('INSERT INTO auth_grants(code_hash,user_id,challenge,expires) VALUES(?,?,?,?)').bind(await authHash(grant),row.id,flow.challenge,now+120000).run();return redirectSite('oracle_code',grant);
  }
  if(req.method==='POST'&&path==='/auth/exchange'){
    const {code,verifier}=await authBody(req);if(typeof code!=='string'||! /^[a-f0-9]{64}$/.test(code)||typeof verifier!=='string'||! /^[a-f0-9]{64}$/.test(verifier))return json(req,env,{error:'input'},400);
    const row=await env.DB.prepare('DELETE FROM auth_grants WHERE code_hash=? AND challenge=? AND expires>? RETURNING user_id').bind(await authHash(code),await authHash(verifier),now).first();if(!row)return json(req,env,{error:'login_expired'},401);
    const session=authRandom();await env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)').bind(await authHash(session),row.user_id,now+7*86400000).run();return json(req,env,{token:session,expires:now+7*86400000});
  }
  const user=await member(req,env);if(!user)return json(req,env,{error:'unauthorized'},401);
  if(req.method==='GET'&&path==='/me')return json(req,env,{nickname:user.nickname,profile:user.profile?JSON.parse(user.profile):null,updated:user.profile_updated,id:user.id,isAdmin:isAdmin(user,env)});
  if(req.method==='POST'&&path==='/profile'){
    const b=await authBody(req);if(b.action==='delete'){await env.DB.prepare('UPDATE users SET profile=NULL,profile_updated=NULL,consent_at=NULL WHERE id=?').bind(user.id).run();return json(req,env,{ok:true})}
    const profile=validProfile(b.profile);if(!profile||b.consent!==true)return json(req,env,{error:'invalid_profile'},400);
    await env.DB.prepare('UPDATE users SET profile=?,profile_updated=?,consent_at=? WHERE id=?').bind(JSON.stringify(profile),now,now,user.id).run();return json(req,env,{ok:true,updated:now});
  }
  if(req.method==='POST'&&path==='/auth/logout'){const t=req.headers.get('Authorization').slice(7);await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await authHash(t)).run();return json(req,env,{ok:true})}
  return json(req,env,{error:'not_found'},404);
}


const REPORT_KEYS=["comprehensive","money","marry","love","reunion","work","match","study","employment","move","invest","property","business","exam","cert"];
function isAdmin(user,env){return !!user&&(env.ADMIN_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean).includes(user.id)}
async function accessRoute(req,env,url){
 const path=url.pathname.replace(/\/+$/,'');if(!path.startsWith('/admin/')&&path!='/access'&&path!='/reports')return null;
 const user=await member(req,env);if(!user)return json(req,env,{error:'unauthorized'},401);
 if(req.method!=='GET'&&req.method!=='POST')return json(req,env,{error:'method'},405);
 if(req.method==='POST'&&req.headers.get('Origin')!==ORIGINS[0])return json(req,env,{error:'origin'},403);
 const admin=isAdmin(user,env);
 if(path==='/access'&&req.method==='GET'){const rows=await env.DB.prepare('SELECT report_key FROM report_entitlements WHERE user_id=? AND revoked_at IS NULL').bind(user.id).all();return json(req,env,{id:user.id,isAdmin:admin,reports:rows.results.map(x=>x.report_key),checkoutEnabled:false});}
 if(path==='/reports'&&req.method==='GET'){
  const key=url.searchParams.get('key');if(!REPORT_KEYS.includes(key))return json(req,env,{error:'input'},400);
  if(!admin){const grant=await env.DB.prepare('SELECT report_key FROM report_entitlements WHERE user_id=? AND revoked_at IS NULL AND report_key IN (?,?) LIMIT 1').bind(user.id,key,'all').first();if(!grant)return json(req,env,{error:'payment_required'},403);}
  const report=await env.DB.prepare('SELECT title,body,updated FROM private_reports WHERE user_id=? AND report_key=?').bind(user.id,key).first();if(!report)return json(req,env,{error:'report_pending'},404);return json(req,env,report);
 }
 if(!path.startsWith('/admin/'))return json(req,env,{error:'not_found'},404);
 if(!admin)return json(req,env,{error:'forbidden'},403);
 if(path==='/admin/users'&&req.method==='GET'){
  const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));const rows=await env.DB.prepare('SELECT id,nickname,profile_updated,created FROM users ORDER BY created DESC LIMIT 25 OFFSET ?').bind(offset).all();return json(req,env,{users:rows.results,nextOffset:rows.results.length===25?offset+25:null});
 }
 if(path==='/admin/user'&&req.method==='GET'){
  const id=url.searchParams.get('id');if(typeof id!=='string'||! /^[a-f0-9]{64}$/.test(id))return json(req,env,{error:'input'},400);
  const target=await env.DB.prepare('SELECT id,nickname,profile,profile_updated,created FROM users WHERE id=?').bind(id).first();if(!target)return json(req,env,{error:'not_found'},404);
  const grants=await env.DB.prepare('SELECT report_key,granted_at,revoked_at FROM report_entitlements WHERE user_id=?').bind(id).all();await env.DB.prepare('INSERT INTO admin_audit(actor_id,target_id,action,report_key,created) VALUES(?,?,?,?,?)').bind(user.id,id,'view_profile',null,Date.now()).run();return json(req,env,{...target,profile:target.profile?JSON.parse(target.profile):null,grants:grants.results});
 }
 if(req.method==='POST'&&(path==='/admin/permission'||path==='/admin/report')){
  const raw=await req.text();if(raw.length>150000)return json(req,env,{error:'input'},400);let b;try{b=JSON.parse(raw)}catch{return json(req,env,{error:'input'},400)}
  if(typeof b.userId!=='string'||! /^[a-f0-9]{64}$/.test(b.userId)||!REPORT_KEYS.concat('all').includes(b.key))return json(req,env,{error:'input'},400);
  if(!await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(b.userId).first())return json(req,env,{error:'not_found'},404);
  const now=Date.now();let op;
  if(path==='/admin/permission'){
   if(!['grant','revoke'].includes(b.action))return json(req,env,{error:'input'},400);
   if(b.action==='revoke'&&b.key!=='all'){const all=await env.DB.prepare("SELECT report_key FROM report_entitlements WHERE user_id=? AND report_key='all' AND revoked_at IS NULL").bind(b.userId).first();if(all)return json(req,env,{error:'revoke_all_first'},409);}
   op=b.action==='grant'?env.DB.prepare('INSERT INTO report_entitlements(user_id,report_key,granted_at,granted_by,revoked_at) VALUES(?,?,?,?,NULL) ON CONFLICT(user_id,report_key) DO UPDATE SET granted_at=excluded.granted_at,granted_by=excluded.granted_by,revoked_at=NULL').bind(b.userId,b.key,now,user.id):env.DB.prepare('UPDATE report_entitlements SET revoked_at=? WHERE user_id=? AND report_key=?').bind(now,b.userId,b.key);
  }else{
   if(b.key==='all'||typeof b.title!=='string'||!b.title.trim()||b.title.length>150||typeof b.body!=='string'||b.body.trim().length<20||b.body.length>100000)return json(req,env,{error:'input'},400);
   op=env.DB.prepare('INSERT INTO private_reports(user_id,report_key,title,body,updated) VALUES(?,?,?,?,?) ON CONFLICT(user_id,report_key) DO UPDATE SET title=excluded.title,body=excluded.body,updated=excluded.updated').bind(b.userId,b.key,b.title.trim(),b.body,now);
  }
  await env.DB.batch([op,env.DB.prepare('INSERT INTO admin_audit(actor_id,target_id,action,report_key,created) VALUES(?,?,?,?,?)').bind(user.id,b.userId,path==='/admin/report'?'publish_report':b.action,b.key,now)]);return json(req,env,{ok:true});
 }
 return json(req,env,{error:'not_found'},404);
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req, env) });
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, "");
    try {
      const access=await accessRoute(req,env,url);if(access)return access;
      const auth=await authRoute(req,env,url,ctx);if(auth)return auth;
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

