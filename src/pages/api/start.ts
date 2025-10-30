import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Fetch current hourly rate to snapshot on the work log
  const { data: settings } = await supabase
    .from('user_settings')
    .select('hourly_rate')
    .eq('user_id', user.id)
    .maybeSingle();
  const currentRate = Number((settings as { hourly_rate?: number } | null)?.hourly_rate ?? 10);

  const { error } = await supabase
    .from('work_logs')
    .insert({
      user_id: user.id,
      start_time: new Date().toISOString(),
      total_seconds: 0,
      hourly_rate_at_time: currentRate
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return redirect('/');
};

