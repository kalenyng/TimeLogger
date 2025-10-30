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
  
  if (log.pause_time) {
    return redirect('/'); // Already paused
  }

  // Calculate elapsed time
  const startTime = new Date(log.start_time).getTime();
  const nowTime = Date.now();
  const elapsed = Math.floor((nowTime - startTime) / 1000) + (log.total_seconds || 0);

  const { error } = await supabase
    .from('work_logs')
    .update({
      pause_time: new Date().toISOString(),
      total_seconds: elapsed
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

