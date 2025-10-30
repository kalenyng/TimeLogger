import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
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
    return new Response(JSON.stringify({ error: 'No active log' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const log = logs[0] as any;
  
  if (log.pause_time) {
    return new Response(JSON.stringify({ error: 'Already paused' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Calculate elapsed time
  const startTime = new Date(log.start_time).getTime();
  const nowTime = Date.now();
  const elapsed = Math.floor((nowTime - startTime) / 1000) + (log.total_seconds || 0);

  const { data: updatedLog, error } = await (supabase
    .from('work_logs')
    .update as any)({
      pause_time: new Date().toISOString(),
      total_seconds: elapsed
    })
    .eq('id', log.id)
    .select('id, start_time, pause_time, end_time, total_seconds, hourly_rate_at_time')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ log: updatedLog }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

