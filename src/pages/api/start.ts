import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { getUserSettings } from '../../lib/data-cache';

export const POST: APIRoute = async ({ request, redirect }) => {
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

  const { error } = await supabase
    .from('work_logs')
    .insert({
      user_id: user.id,
      start_time: new Date().toISOString(),
      total_seconds: 0,
      hourly_rate_at_time: currentRate
    } as any);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return redirect('/');
};

