import { createClient } from 'npm:@supabase/supabase-js@2';

const repository = 'innolab-mn/innolab-mn.github.io';
const workflow = 'nextjs.yml';
const workflowUrl = `https://github.com/${repository}/actions/workflows/${workflow}`;
const api = `https://api.github.com/repos/${repository}/actions/workflows/${workflow}`;
const origins = (Deno.env.get('ALLOWED_ORIGINS') || 'https://innolab.mn,https://www.innolab.mn,http://localhost:3000,http://127.0.0.1:3000').split(',').map(value => value.trim());

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin');
  const cors = {
    'Access-Control-Allow-Origin': origin && origins.includes(origin) ? origin : origins[0],
    'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store', Vary: 'Origin',
  };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (origin && !origins.includes(origin)) return reply(403, { error: 'origin_not_allowed' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!['GET', 'POST'].includes(request.method)) return reply(405, { error: 'method_not_allowed' });
  const authorization = request.headers.get('authorization') || '';
  const jwt = authorization.match(/^Bearer (\S+)$/i)?.[1];
  if (!jwt) return reply(401, { error: 'sign_in_required' });
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key || !serviceKey) return reply(503, { error: 'not_configured' });
    const client = createClient(url, key, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    // getUser verifies the token with Auth; neither JWT metadata nor the request
    // body can grant superadmin privileges. The role is read fresh from PostgreSQL.
    const { data: auth, error: authError } = await client.auth.getUser(jwt);
    if (authError || !auth.user) return reply(401, { error: 'sign_in_required' });
    const { data: role, error: roleError } = await client.rpc('member_role');
    if (roleError) return reply(503, { error: 'unavailable' });
    if (role !== 'superadmin') return reply(403, { error: 'superadmin_required' });
    const token = Deno.env.get('GITHUB_ACTIONS_TOKEN')?.trim();
    if (!token) return reply(503, { error: 'github_not_configured' });
    const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };
    const statusResponse = await fetch(api + '/runs?branch=main&per_page=10', { headers, signal: AbortSignal.timeout(15000) });
    if (!statusResponse.ok) return reply(502, { error: 'github_unavailable' });
    const body = await statusResponse.json();
    if (!Array.isArray(body.workflow_runs)) return reply(502, { error: 'github_unavailable' });
    const safeRun = (run: any) => run ? {
      id: run.id, status: run.status, conclusion: run.conclusion || null,
      url: typeof run.html_url === 'string' && run.html_url.startsWith(`https://github.com/${repository}/actions/runs/`) ? run.html_url : workflowUrl,
    } : null;
    if (request.method === 'GET') return reply(200, { run: safeRun(body.workflow_runs[0]), workflowUrl });
    const active = body.workflow_runs.find((run: any) => run.status !== 'completed');
    if (active) return reply(409, { error: 'already_running', run: safeRun(active), workflowUrl });
    const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: allowed, error: limitError } = await service.rpc('consume_member_login_limit', { bucket: 'build:global', max_attempts: 1, window_seconds: 60 });
    if (limitError) return reply(503, { error: 'unavailable' });
    if (!allowed) return reply(429, { error: 'rate_limited' });
    // Fixed destination and branch: no caller-supplied workflow inputs.
    const dispatch = await fetch(api + '/dispatches', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: 'main' }), signal: AbortSignal.timeout(15000) });
    if (!dispatch.ok) return reply(502, { error: 'github_unavailable' });
    return reply(202, { status: 'queued', previousRunId: body.workflow_runs[0]?.id || null, workflowUrl });
  } catch {
    // Never expose tokens, provider error bodies or SDK context to clients/logs.
    return reply(503, { error: 'unavailable' });
  }
});
