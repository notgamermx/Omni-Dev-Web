// GitHub API helpers for release synchronization

import type { GitHubRelease, GitHubRepo } from '../types';

const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = import.meta.env.REPO_OWNER || 'notgamermx';
const REPO_NAME = import.meta.env.REPO_NAME || 'omnidev';

interface GitHubClientOptions {
  token?: string;
}

function getHeaders(options: GitHubClientOptions = {}): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  return headers;
}

export async function fetchGitHubReleases(token?: string): Promise<GitHubRelease[]> {
  const url = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/releases?per_page=100`;
  const response = await fetch(url, { headers: getHeaders({ token }) });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchGitHubRepo(token?: string): Promise<GitHubRepo> {
  const url = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}`;
  const response = await fetch(url, { headers: getHeaders({ token }) });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function transformGitHubRelease(ghRelease: GitHubRelease): {
  version: string;
  tag_name: string;
  source: 'github';
  published_at: string;
  body: string | null;
  html_url: string;
  assets: { name: string; size: number; download_count: number; browser_download_url: string; content_type: string }[];
  is_prerelease: boolean;
} {
  return {
    version: ghRelease.tag_name,
    tag_name: ghRelease.tag_name,
    source: 'github',
    published_at: ghRelease.published_at,
    body: ghRelease.body,
    html_url: ghRelease.html_url,
    assets: ghRelease.assets.map((a) => ({
      name: a.name,
      size: a.size,
      download_count: a.download_count,
      browser_download_url: a.browser_download_url,
      content_type: a.content_type,
    })),
    is_prerelease: ghRelease.prerelease,
  };
}

// Verify GitHub webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Timing-safe comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}