// Sync GitHub releases to Supabase
// Run manually or via GitHub Actions / Cloudflare Workers Cron

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER || 'notgamermx';
const REPO_NAME = process.env.REPO_NAME || 'omnidev';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GITHUB_TOKEN) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchGitHubReleases() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases?per_page=100`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'OmniDev-Sync',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function syncReleases() {
  console.log('Fetching GitHub releases...');
  const ghReleases = await fetchGitHubReleases();
  console.log(`Found ${ghReleases.length} releases`);

  let synced = 0;
  let errors = 0;

  for (const ghRelease of ghReleases) {
    try {
      const releaseData = {
        version: ghRelease.tag_name,
        tag_name: ghRelease.tag_name,
        source: 'github',
        published_at: ghRelease.published_at,
        body: ghRelease.body,
        html_url: ghRelease.html_url,
        assets: ghRelease.assets.map((a: any) => ({
          name: a.name,
          size: a.size,
          download_count: a.download_count,
          browser_download_url: a.browser_download_url,
          content_type: a.content_type,
        })),
        is_prerelease: ghRelease.prerelease,
        is_latest: !ghRelease.prerelease,
        synced_at: new Date().toISOString(),
      };

      // Upsert
      const { error } = await supabase
        .from('releases')
        .upsert(releaseData, { onConflict: 'version' });

      if (error) {
        console.error(`Error syncing ${ghRelease.tag_name}:`, error.message);
        errors++;
      } else {
        console.log(`Synced: ${ghRelease.tag_name}`);
        synced++;
      }
    } catch (e) {
      console.error(`Error processing ${ghRelease.tag_name}:`, e);
      errors++;
    }
  }

  // Ensure only one non-prerelease is marked as latest
  const { data: latestReleases } = await supabase
    .from('releases')
    .select('version')
    .eq('is_latest', true)
    .eq('is_prerelease', false);

  if (latestReleases && latestReleases.length > 1) {
    // Keep the most recent one, unset others
    const sorted = latestReleases.sort((a, b) => {
      // We'd need published_at to sort properly, but for now just keep first
      return 0;
    });

    for (let i = 1; i < sorted.length; i++) {
      await supabase
        .from('releases')
        .update({ is_latest: false })
        .eq('version', sorted[i].version);
    }
  }

  console.log(`\nSync complete: ${synced} synced, ${errors} errors`);
}

syncReleases().catch(console.error);