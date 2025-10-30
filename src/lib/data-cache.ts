import { supabase } from './supabase';
import type { Database } from './database.types';

// Server-side cache (per-request, not persistent)
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds for SSR

// Type definitions
export type WorkLog = Database['public']['Tables']['work_logs']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type UserSettings = { currency: string; hourly_rate: number };

// Cached user settings fetch
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const cacheKey = `settings:${userId}`;
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const { data } = await supabase
    .from('user_settings')
    .select('currency, hourly_rate')
    .eq('user_id', userId)
    .maybeSingle();

  const settings: UserSettings = {
    currency: data?.currency ?? 'GBP',
    hourly_rate: Number(data?.hourly_rate ?? 10)
  };

  requestCache.set(cacheKey, { data: settings, timestamp: Date.now() });
  return settings;
}

// Get current active work log
export async function getCurrentWorkLog(userId: string): Promise<WorkLog | null> {
  const cacheKey = `current-log:${userId}`;
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const { data } = await supabase
    .from('work_logs')
    .select('*')
    .eq('user_id', userId)
    .is('end_time', null)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  requestCache.set(cacheKey, { data: data ?? null, timestamp: Date.now() });
  return data ?? null;
}

// Get tasks for a work log
export async function getTasksForLog(logId: number): Promise<Task[]> {
  const cacheKey = `tasks:${logId}`;
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('work_log_id', logId)
    .order('created_at', { ascending: true });

  const tasks = data ?? [];
  requestCache.set(cacheKey, { data: tasks, timestamp: Date.now() });
  return tasks;
}

// Get work logs for a date range
export async function getWorkLogs(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<WorkLog[]> {
  const cacheKey = `logs:${userId}:${startDate}:${endDate}`;
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let query = supabase
    .from('work_logs')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });

  if (startDate) query = query.gte('start_time', startDate);
  if (endDate) query = query.lte('start_time', endDate);

  const { data } = await query;
  const logs = data ?? [];
  
  requestCache.set(cacheKey, { data: logs, timestamp: Date.now() });
  return logs;
}

// Currency symbol helper
export function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    ZAR: 'R'
  };
  return symbols[code] ?? code + ' ';
}

// Format time helper
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Format date helper
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Calculate earnings
export function calculateEarnings(seconds: number, hourlyRate: number): number {
  return (seconds / 3600) * hourlyRate;
}

