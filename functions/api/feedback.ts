// POST /api/feedback - Submit feedback to Supabase
// Cloudflare Pages Function

import { handleCors, addCorsHeaders } from '../utils/cors';

export async function onRequestPost(context: { request: Request; env: Env }) {
  const corsResponse = handleCors(context.request);
  if (corsResponse) return addCorsHeaders(corsResponse);

  try {
    const { type, title, body } = await context.request.json();

    if (!type || !title || !body) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    // Validate type
    const validTypes = ['Bug Report', 'Feature Request', 'General Feedback'];
    if (!validTypes.includes(type)) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    // Get client info
    const userAgent = context.request.headers.get('User-Agent') || '';
    const cfConnectingIp = context.request.headers.get('CF-Connecting-IP') || '';
    // Hash IP for privacy
    const ipHash = cfConnectingIp ? await hashIp(cfConnectingIp) : null;

    // Insert into Supabase
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseAnonKey = context.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase not configured');
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/feedback_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        type,
        title,
        body,
        user_agent: userAgent,
        ip_hash: ipHash,
        status: 'new',
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Supabase error:', error);
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Failed to submit' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));
    }

    return addCorsHeaders(new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch (e) {
    console.error('Feedback error:', e);
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'omnidev-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// Handle OPTIONS
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