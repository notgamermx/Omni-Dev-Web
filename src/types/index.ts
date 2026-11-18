// TypeScript interfaces for Supabase data

export interface SiteContent {
  id: string;
  key: 'announcement' | 'hero_title' | 'hero_subtitle' | 'fallback_version';
  value: string;
  updated_at: string;
  updated_by: string | null;
}

export interface Release {
  id: string;
  version: string;
  tag_name: string | null;
  source: 'github' | 'cms';
  published_at: string | null;
  body: string | null;
  html_url: string | null;
  assets: ReleaseAsset[];
  is_prerelease: boolean;
  is_latest: boolean;
  created_at: string;
  synced_at: string;
}

export interface ReleaseAsset {
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  content_type: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  status: 'planned' | 'in-progress' | 'completed';
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface FeedbackSubmission {
  id: string;
  type: 'Bug Report' | 'Feature Request' | 'General Feedback';
  title: string;
  body: string;
  user_agent: string | null;
  ip_hash: string | null;
  status: 'new' | 'triaged' | 'in-progress' | 'closed';
  github_issue_number: number | null;
  created_at: string;
}

export interface SecurityReport {
  id: string;
  component: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  details: string;
  reporter_email: string | null;
  status: 'open' | 'investigating' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at: string | null;
}

export interface AdminUser {
  user_id: string;
  role: 'admin' | 'editor';
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

// GitHub API types
export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  html_url: string;
  assets: GitHubAsset[];
  author: {
    login: string;
  };
}

export interface GitHubAsset {
  id: number;
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  content_type: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  license: {
    spdx_id: string;
    name: string;
  } | null;
  html_url: string;
}