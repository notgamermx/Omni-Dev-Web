// GET /api/releases - Get releases from Supabase (cached)
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

    // Fetch from Supabase with caching
    const res = await fetch(`${supabaseUrl}/rest/v1/releases?select=*&order=published_at.desc`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      // Cache for 5 minutes at edge
      cf: { cacheTtl: 300, cacheEverything: true },
    });

    if (!res.ok) {
      console.error('Supabase error:', await res.text());
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to fetch' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    const releases = await res.json();

    return addCorsHeaders(new Response(JSON.stringify({ releases }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    }));
  } catch (e) {
    console.error('Releases error:', e);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }));
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