// GET /api/roadmap - Get roadmap items
// POST /api/roadmap - Add roadmap item (admin only)
// Cloudflare Pages Function

import { handleCors, addCorsHeaders } from '../utils/cors';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const corsResponse = handleCors(context.request);
  if (corsResponse) return addCorsHeaders(corsResponse);

  try {
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseAnonKey = context.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/roadmap_items?select=*&order=display_order.asc,created_at.desc`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      cf: { cacheTtl: 300, cacheEverything: true },
    });

    if (!res.ok) {
      console.error('Supabase error:', await res.text());
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to fetch' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    const items = await res.json();

    return addCorsHeaders(new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    }));
  } catch (e) {
    console.error('Roadmap error:', e);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const corsResponse = handleCors(context.request);
  if (corsResponse) return addCorsHeaders(corsResponse);

  // Verify admin auth
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }));
  }

  const token = authHeader.slice(7);
  const isAdmin = await verifyAdminToken(context.env, token);
  if (!isAdmin) {
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }));
  }

  try {
    const { title, description, status = 'planned', display_order = 0 } = await context.request.json();

    if (!title) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Title required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseServiceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/roadmap_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ title, description, status, display_order }),
    });

    if (!res.ok) {
      console.error('Supabase error:', await res.text());
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to create' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    const item = await res.json();

    return addCorsHeaders(new Response(JSON.stringify({ item }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch (e) {
    console.error('Roadmap POST error:', e);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
}

async function verifyAdminToken(env: Env, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) return false;

    const user = await res.json();
    const userId = user.id;

    // Check if user is in admin_users table
    const adminRes = await fetch(`${env.SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${userId}&select=role`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!adminRes.ok) return false;
    const admins = await adminRes.json();
    return admins.length > 0;
  } catch {
    return false;
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