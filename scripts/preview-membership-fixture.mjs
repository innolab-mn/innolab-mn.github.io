// Local UI test fixture only. Serves the real static build with a mock Auth API
// on a separate loopback origin. It never calls Supabase or sends real emails.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { renderEmailTemplate } from "./email-template-tools.mjs";
import { messages } from "../supabase/templates/messages.mjs";
const emailTemplates = new Set(["confirmation", "recovery", ...messages.map(message => message.key)]);

const root = path.resolve("out");
const port = Number(process.argv[2] || 3002);
const origin = `http://localhost:${port}`;
const captchaMock = process.argv.includes("--captcha-mock");
const captchaRequests = [];
const shopMock=process.argv.includes('--shop-mock');
let fixtureRole='superadmin';
const fixtureOrders=[];
let fixtureBuildPhase=0;
const fixtureBank={bank_name:'TEST BANK — LOCAL FIXTURE',account_number:'TEST-ACCOUNT-ONLY',account_name:'Test Maker'};
const env = await readFile(".env.local", "utf8");
const remote = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1].trim();
if (!remote) throw new Error("Build with the public Supabase URL first.");
const user = { id: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email: "fixture@example.test", email_confirmed_at: new Date().toISOString(), app_metadata: { provider: "email" }, user_metadata: {}, created_at: new Date().toISOString() };
const claims = { sub: user.id, session_id: "fixture-recovery-session", role: "authenticated", aud: "authenticated", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 };
const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.${Buffer.alloc(32).toString("base64url")}`;
const session = { access_token: token, refresh_token: "fixture-only-refresh", token_type: "bearer", expires_in: 3600, user };
const mime = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg" };
http.createServer(async (req, res) => {
  const url = new URL(req.url, origin);
  const json = (status, value) => { res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(value)); };
  try {
    if(shopMock&&url.pathname==='/functions/v1/trigger-build'){
      if(req.headers.authorization!==`Bearer ${token}`)return json(401,{error:'sign_in_required'});
      if(!['admin','superadmin'].includes(fixtureRole))return json(403,{error:'staff_required'});
      if(req.method==='POST'){
        if(fixtureBuildPhase>0&&fixtureBuildPhase<3)return json(409,{error:'already_running',run:{id:101,status:'in_progress',conclusion:null,url:'https://github.com/innolab-mn/innolab-mn.github.io/actions/workflows/nextjs.yml'}});
        fixtureBuildPhase=1;return json(202,{status:'queued',previousRunId:100});
      }
      if(fixtureBuildPhase>0)fixtureBuildPhase=Math.min(3,fixtureBuildPhase+1);
      return json(200,{run:{id:fixtureBuildPhase?101:100,status:fixtureBuildPhase===2?'in_progress':'completed',conclusion:fixtureBuildPhase===2?null:'success',url:'https://github.com/innolab-mn/innolab-mn.github.io/actions/workflows/nextjs.yml'}});
    }
    if(shopMock&&url.pathname==='/__fixture/shop'){
      if(['member','admin','superadmin'].includes(url.searchParams.get('role')))fixtureRole=url.searchParams.get('role');
      res.writeHead(200,{'content-type':'text/html'});res.end(`<h1>Local shop test fixture</h1><p>Mock data only. No real orders or accounts.</p><p>Role: ${fixtureRole}</p><a href="/products">Shop as guest</a><br><a href="/en/login">Sign in with synthetic test credentials</a>`);return;
    }
    if(shopMock&&url.pathname.startsWith('/rest/v1/')&&url.pathname!=='/rest/v1/profiles'){
      let raw='';for await(const chunk of req)raw+=chunk;const input=JSON.parse(raw||'{}');
      if(url.pathname.endsWith('/rpc/member_role'))return json(200,fixtureRole);
      if(url.pathname.endsWith('/member_contacts'))return json(200,req.method==='GET'?{phone:'99112233',address:'Test address, Ulaanbaatar'}:null);
      if(url.pathname.endsWith('/shop_payment_settings'))return json(200,fixtureBank);
      if(url.pathname.endsWith('/rpc/place_shop_order')){
        const previous=fixtureOrders.find(x=>x.id===input.request_id);if(previous)return json(200,{id:previous.id,total:previous.total});
        const order={id:input.request_id,customer_name:input.customer_name,phone:input.customer_phone,address:input.customer_address,items:input.cart.map(x=>({...x,title:'Local fixture item'})),total:input.cart.reduce((s,x)=>s+x.price*x.quantity,0),status:'pending_payment',created_at:new Date().toISOString()};fixtureOrders.push(order);return json(200,{id:order.id,total:order.total});
      }
      if(url.pathname.endsWith('/shop_orders'))return json(200,fixtureOrders);
      if(url.pathname.endsWith('/rpc/admin_members'))return json(200,[{id:user.id,username:'fixture_maker',first_name:'Test',last_name:'Maker',email:user.email,phone:'99112233',address:'Local test address',role:fixtureRole,created_at:user.created_at}]);
      if(url.pathname.endsWith('/rpc/admin_order_status')){const order=fixtureOrders.find(x=>x.id===input.order_id);if(order)order.status=input.new_status;return json(200,null);}
      if(url.pathname.endsWith('/rpc/admin_audit'))return json(200,[]);
      if(url.pathname.endsWith('/rpc/admin_save_bank')){Object.assign(fixtureBank,{bank_name:input.bank,account_number:input.account,account_name:input.holder});return json(200,null);}
      if(url.pathname.endsWith('/rpc/admin_set_role'))return json(200,null);
      return json(404,{message:'Unknown local shop fixture route'});
    }
    if (captchaMock && url.pathname === "/__fixture/captcha-status") return json(200, captchaRequests);
    if (captchaMock && url.pathname === "/__fixture/turnstile.js") {
      res.writeHead(200, { "content-type": "application/javascript", "cache-control": "no-store" });
      res.end(`(() => {
        let counter = 0; const widgets = new Map();
        window.turnstile = {
          ready(callback) { callback(); },
          render(host, options) {
            const id = String(++counter), box = document.createElement('div');
            box.style.cssText = 'padding:12px;border:1px solid #6c7d70;border-radius:5px;font-size:12px;';
            box.dataset.testTheme = options.theme;
            const label = document.createElement('p'); label.textContent = 'Local verification fixture — not a real CAPTCHA'; box.append(label);
            for (const [text, callback] of [['Expire test verification', options['expired-callback']], ['Simulate verification error', options['error-callback']]]) {
              const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.style.cssText = 'display:block;margin-top:8px;text-decoration:underline;'; button.onclick = callback; box.append(button);
            }
            host.replaceChildren(box); widgets.set(id, box);
            queueMicrotask(() => { if (widgets.has(id)) options.callback('fixture-valid-token'); });
            return id;
          },
          remove(id) { widgets.get(id)?.remove(); widgets.delete(id); }
        };
      })();`);
      return;
    }
    const emailPreview = url.pathname.match(/^\/__fixture\/email\/([a-z_]+)\/(en|mn)$/);
    if (emailPreview && emailTemplates.has(emailPreview[1])) {
      let template = await readFile(`supabase/templates/${emailPreview[1]}.html`, "utf8");
      const page = emailPreview[1] === "recovery" ? "reset-password" : "members";
      template = renderEmailTemplate(template, {
        redirectTo: `https://innolab.mn/${emailPreview[2] === "en" ? "en/" : ""}${page}`,
        locale: emailPreview[2],
        confirmationUrl: origin + "/__fixture", siteUrl: origin,
      });
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(template); return;
    }
    if (url.pathname === "/__fixture") {
      const hash = new URLSearchParams({ access_token: token, refresh_token: session.refresh_token, expires_in: "3600", token_type: "bearer", type: "recovery" });
      res.writeHead(200, { "content-type": "text/html" });
      res.end(`<h1>Local Auth UI test fixture</h1><p>No real accounts or email requests.</p><a href="/en/register">Registration</a><br><a href="/en/forgot-password">Forgot password</a><br><a href="/en/reset-password#${hash}">Open test recovery link</a>`);
      return;
    }
    if (url.pathname.startsWith("/auth/v1/")) {
      // Only synthetic local test accounts. Never log or persist credentials.
      let raw = "";
      for await (const chunk of req) raw += chunk;
      if (captchaMock && ["/auth/v1/signup", "/auth/v1/recover"].includes(url.pathname)) {
        const input = JSON.parse(raw || "{}");
        const valid = input.gotrue_meta_security?.captcha_token === "fixture-valid-token";
        captchaRequests.push({ kind: url.pathname.split("/").at(-1), verified: valid });
        if (!valid) return json(400, { code: "captcha_failed", message: "Local fixture requires verification" });
      }
      if (url.pathname === "/auth/v1/signup") return json(200, { user, session: null });
      if (url.pathname === "/auth/v1/recover") return json(200, {});
      if (url.pathname === "/auth/v1/logout") return json(200, {});
      if (url.pathname === "/auth/v1/token") return json(200, session);
      if (url.pathname === "/auth/v1/user" && req.headers.authorization === `Bearer ${token}`) return json(200, user);
      return json(401, { message: "Fixture session missing", code: "session_not_found" });
    }
    if ((captchaMock || shopMock) && url.pathname === "/functions/v1/username-login") {
      let raw = ""; for await (const chunk of req) raw += chunk;
      const valid = !captchaMock || JSON.parse(raw || "{}").captchaToken === "fixture-valid-token";
      captchaRequests.push({ kind: "username-login", verified: valid });
      return valid ? json(200, session) : json(400, { error: "captcha_failed" });
    }
    if (url.pathname === "/rest/v1/profiles") return json(200, { id: user.id, first_name: "Test", last_name: "Maker", username: "fixture_maker" });
    const pathname = decodeURIComponent(url.pathname);
    const candidate = path.resolve(root, "." + pathname);
    if (candidate !== root && !candidate.startsWith(root + path.sep)) return json(403, {});
    let file;
    for (const option of [candidate, candidate + ".html", path.join(candidate, "index.html")]) {
      try { if ((await stat(option)).isFile()) { file = option; break; } } catch { /* Next candidate. */ }
    }
    if (!file) return json(404, {});
    const ext = path.extname(file);
    let body = await readFile(file);
    if ([".js", ".html", ".txt"].includes(ext)) body = Buffer.from(body.toString("utf8").replaceAll(remote, origin));
    if (captchaMock && ext === ".js") body = Buffer.from(body.toString("utf8").replaceAll("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", origin + "/__fixture/turnstile.js"));
    res.writeHead(200, { "content-type": mime[ext] || "application/octet-stream", "cache-control": "no-store" }); res.end(body);
  } catch { json(500, { error: "fixture_failure" }); }
}).listen(port, "127.0.0.1", () => console.log(`Auth UI fixture: ${origin}/__fixture`));
