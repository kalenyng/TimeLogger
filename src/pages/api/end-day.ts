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

  const log = logs[0] as any;

  // Calculate total elapsed time
  let totalSeconds = log.total_seconds || 0;
  
  if (!log.pause_time) {
    // Still running, add current elapsed time
    const startTime = new Date(log.start_time).getTime();
    const nowTime = Date.now();
    totalSeconds += Math.floor((nowTime - startTime) / 1000);
  }

  const { error } = await (supabase
    .from('work_logs')
    .update as any)({
      end_time: new Date().toISOString(),
      total_seconds: totalSeconds
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

