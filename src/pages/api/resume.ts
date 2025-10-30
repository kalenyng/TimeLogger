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

  // Get current active work log
  const { data: logs, error: fetchError } = await supabase
    .from('work_logs')
    .select('*')
    .eq('user_id', user.id)
    .is('end_time', null)
    .order('id', { ascending: false })
    .limit(1);

  if (fetchError || !logs || logs.length === 0) {
    return redirect('/');
  }

  const log = logs[0];
  
  if (!log.pause_time) {
    return redirect('/'); // Not paused
  }

  // Reset start_time to now, keeping total_seconds
  const { error } = await supabase
    .from('work_logs')
    .update({
      start_time: new Date().toISOString(),
      pause_time: null
    })
    .eq('id', log.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return redirect('/');
};

