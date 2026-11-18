// POST /api/webhook-github - GitHub webhook handler for release sync
// Cloudflare Pages Function

import { handleCors, addCorsHeaders } from '../utils/cors';

export async function onRequestPost(context: { request: Request; env: Env }) {
  // Note: We don't use handleCors here because GitHub doesn't send OPTIONS
  // We verify the webhook signature instead

  try {
    const signature = context.request.headers.get('X-Hub-Signature-256');
    const event = context.request.headers.get('X-GitHub-Event');
    const payload = await context.request.text();

    // Verify webhook signature
    const secret = context.env.GITHUB_WEBHOOK_SECRET;
    if (secret && signature) {
      const isValid = await verifySignature(payload, signature, secret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Only handle release events
    if (event !== 'release') {
      return new Response(JSON.stringify({ ignored: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const releaseData = JSON.parse(payload);
    const release = releaseData.release;

    // Only process published releases (not drafts)
    if (releaseData.action === 'published' || releaseData.action === 'created') {
      await syncReleaseToSupabase(context.env, release);
    } else if (releaseData.action === 'deleted') {
      await deleteReleaseFromSupabase(context.env, release.tag_name);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  // signature format: "sha256=<hash>"
  const expectedSig = 'sha256=' + await hmacSha256(secret, payload);

  // Timing-safe comparison
  if (signature.length !== expectedSig.length) return false;

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return result === 0;
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function syncReleaseToSupabase(env: Env, release: any) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase not configured');
    return;
  }

  // Transform GitHub release to our schema
  const releaseData = {
    version: release.tag_name,
    tag_name: release.tag_name,
    source: 'github',
    published_at: release.published_at,
    body: release.body,
    html_url: release.html_url,
    assets: release.assets.map((a: any) => ({
      name: a.name,
      size: a.size,
      download_count: a.download_count,
      browser_download_url: a.browser_download_url,
      content_type: a.content_type,
    })),
    is_prerelease: release.prerelease,
    is_latest: !release.prerelease, // Non-prerelease becomes latest
    synced_at: new Date().toISOString(),
  };

  // Upsert release
  const upsertRes = await fetch(`${supabaseUrl}/rest/v1/releases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(releaseData),
  });

  if (!upsertRes.ok) {
    console.error('Failed to upsert release:', await upsertRes.text());
    return;
  }

  // If this is a non-prerelease, update other releases to not be latest
  if (!release.prerelease) {
    await fetch(`${supabaseUrl}/rest/v1/releases?tag_name=neq.${release.tag_name}&is_latest=eq.true`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ is_latest: false }),
    });
  }

  // Invalidate Cloudflare Pages cache for relevant pages
  // This would typically be done via Cloudflare API or purge tags
  console.log(`Synced release ${release.tag_name} to Supabase`);
}

async function deleteReleaseFromSupabase(env: Env, tagName: string) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) return;

  await fetch(`${supabaseUrl}/rest/v1/releases?tag_name=eq.${tagName}`, {
    method: 'DELETE',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
  });

  console.log(`Deleted release ${tagName} from Supabase`);
}

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GITHUB_TOKEN: string;
  GITHUB_WEBHOOK_SECRET: string;
}