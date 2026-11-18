// GET/POST/PUT/DELETE /api/cms - Admin CMS operations
// Cloudflare Pages Function (requires admin auth)

import { handleCors, addCorsHeaders } from '../utils/cors';

const VALID_CONTENT_KEYS = ['announcement', 'hero_title', 'hero_subtitle', 'fallback_version'];

export async function onRequestGet(context: { request: Request; env: Env }) {
  const corsResponse = handleCors(context.request);
  if (corsResponse) return addCorsHeaders(corsResponse);

  const authHeader = context.request.headers.get('Authorization');
  if (!await verifyAdmin(context.env, authHeader)) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
  }

  try {
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseServiceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;

    // Fetch all content
    const contentRes = await fetch(`${supabaseUrl}/rest/v1/site_content?select=*`, {
      headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` },
    });
    const content = await contentRes.json();

    const releasesRes = await fetch(`${supabaseUrl}/rest/v1/releases?select=*&order=published_at.desc`, {
      headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` },
    });
    const releases = await releasesRes.json();

    const roadmapRes = await fetch(`${supabaseUrl}/rest/v1/roadmap_items?select=*&order=display_order.asc,created_at.desc`, {
      headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` },
    });
    const roadmap = await roadmapRes.json();

    return addCorsHeaders(new Response(JSON.stringify({ content, releases, roadmap }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    }));
  } catch (e) {
    console.error('CMS GET error:', e);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const corsResponse = handleCors(context.request);
  if (corsResponse) return addCorsHeaders(corsResponse);

  const authHeader = context.request.headers.get('Authorization');
  if (!await verifyAdmin(context.env, authHeader)) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
  }

  try {
    const { action, ...data } = await context.request.json();
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseServiceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;

    let result;

    switch (action) {
      case 'update_content': {
        const { key, value } = data;
        if (!VALID_CONTENT_KEYS.includes(key)) {
          return addCorsHeaders(new Response(JSON.stringify({ error: 'Invalid content key' }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
        }
        const res = await fetch(`${supabaseUrl}/rest/v1/site_content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}`, 'Prefer': 'return=representation' },
          body: JSON.stringify({ key, value, updated_by: (await getUserId(context.env, authHeader!)) }),
        });
        result = await res.json();
        break;
      }
      case 'create_release': {
        const res = await fetch(`${supabaseUrl}/rest/v1/releases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}`, 'Prefer': 'return=representation' },
          body: JSON.stringify({ ...data, source: 'cms' }),
        });
        result = await res.json();
        break;
      }
      case 'create_roadmap': {
        const res = await fetch(`${supabaseUrl}/rest/v1/roadmap_items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}`, 'Prefer': 'return=representation' },
          body: JSON.stringify({ ...data, created_by: await getUserId(context.env, authHeader!) }),
        });
        result = await res.json();
        break;
      }
      default:
        return addCorsHeaders(new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
    }

    return addCorsHeaders(new Response(JSON.stringify({ success: true, data: result }), { status: 201, headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {
    console.error('CMS POST error:', e);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
}

export async function onRequestPut(context: { request: Request; env: Env }) {
  const corsResponse = handleCors(context.request);
  if (corsResponse) return addCorsHeaders(corsResponse);

  const authHeader = context.request.headers.get('Authorization');
  if (!await verifyAdmin(context.env, authHeader)) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
  }

  try {
    const { action, id, ...data } = await context.request.json();
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseServiceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;

    let res: Response;

    switch (action) {
      case 'update_release':
        res = await fetch(`${supabaseUrl}/rest/v1/releases?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}`, 'Prefer': 'return=representation' },
          body: JSON.stringify(data),
        });
        break;
      case 'update_roadmap':
        res = await fetch(`${supabaseUrl}/rest/v1/roadmap_items?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}`, 'Prefer': 'return=representation' },
          body: JSON.stringify(data),
        });
        break;
      default:
        return addCorsHeaders(new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
    }

    const result = await res.json();
    return addCorsHeaders(new Response(JSON.stringify({ success: true, data: result }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {
    console.error('CMS PUT error:', e);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  const corsResponse = handleCors(context.request);
  if (corsResponse) return addCorsHeaders(corsResponse);

  const authHeader = context.request.headers.get('Authorization');
  if (!await verifyAdmin(context.env, authHeader)) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
  }

  try {
    const url = new URL(context.request.url);
    const action = url.searchParams.get('action');
    const id = url.searchParams.get('id');
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseServiceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;

    let res: Response;

    switch (action) {
      case 'delete_release':
        res = await fetch(`${supabaseUrl}/rest/v1/releases?id=eq.${id}`, {
          method: 'DELETE',
          headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` },
        });
        break;
      case 'delete_roadmap':
        res = await fetch(`${supabaseUrl}/rest/v1/roadmap_items?id=eq.${id}`, {
          method: 'DELETE',
          headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` },
        });
        break;
      default:
        return addCorsHeaders(new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
    }

    return addCorsHeaders(new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {
    console.error('CMS DELETE error:', e);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
}

async function verifyAdmin(env: Env, authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);

  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const user = await res.json();
    const userId = user.id;

    const adminRes = await fetch(`${env.SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${userId}&select=role`, {
      headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const admins = await adminRes.json();
    return admins.length > 0;
  } catch {
    return false;
  }
}

async function getUserId(env: Env, authHeader: string): Promise<string | null> {
  const token = authHeader.slice(7);
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user.id;
  } catch {
    return null;
  }
}

export async function onRequestOptions() {
  return handleCors(new Request('http://localhost')) || new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
}

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GITHUB_TOKEN: string;
  GITHUB_WEBHOOK_SECRET: string;
}