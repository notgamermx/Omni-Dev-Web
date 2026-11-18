// Content fetching library - server-side data access for Astro pages
// Uses Supabase with proper caching strategies

import { getSupabaseClient, getSupabaseAdmin } from './supabase';
import type {
  SiteContent,
  Release,
  RoadmapItem,
  FeedbackSubmission,
  SecurityReport,
} from '../types';

// Cache durations (in seconds)
const CACHE_DURATION = {
  siteContent: 60, // 1 minute
  releases: 300, // 5 minutes
  roadmap: 300, // 5 minutes
  github: 600, // 10 minutes
};

// In-memory cache for server-side (Astro build/dev)
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, expires: Date.now() + ttl * 1000 });
}

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_ANON_KEY);
}

// Site Content (singleton values)
export async function getSiteContent(): Promise<Record<string, string>> {
  const cacheKey = 'site-content';
  const cached = getCached<Record<string, string>>(cacheKey);
  if (cached) return cached;

  // Return defaults during build if Supabase not configured
  if (!isSupabaseConfigured()) {
    const defaults = getDefaultSiteContent();
    setCache(cacheKey, defaults, CACHE_DURATION.siteContent);
    return defaults;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value');

  if (error) {
    console.error('Error fetching site content:', error);
    return getDefaultSiteContent();
  }

  const content: Record<string, string> = {};
  data?.forEach((row) => {
    content[row.key] = row.value;
  });

  // Merge with defaults for any missing keys
  const defaults = getDefaultSiteContent();
  const result = { ...defaults, ...content };

  setCache(cacheKey, result, CACHE_DURATION.siteContent);
  return result;
}

function getDefaultSiteContent(): Record<string, string> {
  return {
    announcement: 'OmniDev Desktop & CLI — Open-Source AI Development Environment',
    hero_title: 'The AI-native workbench built for developers who want control.',
    hero_subtitle: 'An open-source Tauri 2, React, and FastAPI workbench with autonomous coding agents, multi-provider LLM orchestration, and explicit permission gates.',
    fallback_version: 'main-dev',
  };
}

// Releases
export async function getReleases(): Promise<Release[]> {
  const cacheKey = 'releases';
  const cached = getCached<Release[]>(cacheKey);
  if (cached) return cached;

  // Return empty array during build if Supabase not configured
  if (!isSupabaseConfigured()) {
    setCache(cacheKey, [], CACHE_DURATION.releases);
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching releases:', error);
    return [];
  }

  const releases = (data || []) as Release[];
  setCache(cacheKey, releases, CACHE_DURATION.releases);
  return releases;
}

export async function getLatestRelease(): Promise<Release | null> {
  const releases = await getReleases();
  return releases.find(r => r.is_latest) || releases[0] || null;
}

// Roadmap
export async function getRoadmapItems(): Promise<RoadmapItem[]> {
  const cacheKey = 'roadmap';
  const cached = getCached<RoadmapItem[]>(cacheKey);
  if (cached) return cached;

  // Return empty array during build if Supabase not configured
  if (!isSupabaseConfigured()) {
    setCache(cacheKey, [], CACHE_DURATION.roadmap);
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('roadmap_items')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching roadmap:', error);
    return [];
  }

  const items = (data || []) as RoadmapItem[];
  setCache(cacheKey, items, CACHE_DURATION.roadmap);
  return items;
}

// Feedback
export async function submitFeedback(feedback: Omit<FeedbackSubmission, 'id' | 'created_at' | 'status' | 'github_issue_number'>): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('feedback_submissions')
    .insert({
      ...feedback,
      status: 'new',
    });

  if (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: error.message };
  }

  // Invalidate cache if needed
  return { success: true };
}

// Security Reports
export async function submitSecurityReport(report: Omit<SecurityReport, 'id' | 'created_at' | 'status' | 'resolved_at'>): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('security_reports')
    .insert({
      ...report,
      status: 'open',
    });

  if (error) {
    console.error('Error submitting security report:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Admin functions (require service role key)
export async function adminGetAllReleases(): Promise<Release[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Admin error fetching releases:', error);
    return [];
  }
  return (data || []) as Release[];
}

export async function adminUpsertRelease(release: Partial<Release> & { version: string }): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('releases')
    .upsert(release, { onConflict: 'version' });

  if (error) {
    console.error('Admin error upserting release:', error);
    return { success: false, error: error.message };
  }

  // Invalidate cache
  cache.delete('releases');
  return { success: true };
}

export async function adminDeleteRelease(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('releases')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Admin error deleting release:', error);
    return { success: false, error: error.message };
  }

  cache.delete('releases');
  return { success: true };
}

export async function adminUpsertRoadmapItem(item: Partial<RoadmapItem> & { title: string }): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('roadmap_items')
    .upsert(item, { onConflict: 'id' });

  if (error) {
    console.error('Admin error upserting roadmap item:', error);
    return { success: false, error: error.message };
  }

  cache.delete('roadmap');
  return { success: true };
}

export async function adminDeleteRoadmapItem(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('roadmap_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Admin error deleting roadmap item:', error);
    return { success: false, error: error.message };
  }

  cache.delete('roadmap');
  return { success: true };
}

export async function adminUpdateSiteContent(key: SiteContent['key'], value: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) {
    console.error('Admin error updating site content:', error);
    return { success: false, error: error.message };
  }

  cache.delete('site-content');
  return { success: true };
}

export async function adminGetFeedback(): Promise<FeedbackSubmission[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('feedback_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin error fetching feedback:', error);
    return [];
  }
  return (data || []) as FeedbackSubmission[];
}

export async function adminGetSecurityReports(): Promise<SecurityReport[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('security_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin error fetching security reports:', error);
    return [];
  }
  return (data || []) as SecurityReport[];
}

// Clear all caches (useful after mutations)
export function clearContentCache(): void {
  cache.clear();
}