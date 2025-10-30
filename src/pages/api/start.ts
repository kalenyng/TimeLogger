import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { getUserSettings } from '../../lib/data-cache';

export const POST: APIRoute = async ({ request }) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Fetch current hourly rate using cached helper
  const settings = await getUserSettings(user.id);
  const currentRate = settings.hourly_rate;

  const { data: newLog, error } = await supabase
    .from('work_logs')
    .insert({
      user_id: user.id,
      start_time: new Date().toISOString(),
      total_seconds: 0,
      hourly_rate_at_time: currentRate
    } as any)
    .select('id, start_time, pause_time, end_time, total_seconds, hourly_rate_at_time')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ log: newLog }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

