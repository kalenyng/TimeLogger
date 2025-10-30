import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Load current active log
  const { data: activeLog, error: activeErr } = await supabase
    .from('work_logs')
    .select('id, start_time, pause_time, end_time, total_seconds, hourly_rate_at_time')
    .eq('user_id', user.id)
    .is('end_time', null)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeErr) {
    return new Response(JSON.stringify({ error: activeErr.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let tasks: any[] = [];
  if (activeLog?.id) {
    const { data: fetchedTasks, error: tasksErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('work_log_id', activeLog.id)
      .order('created_at', { ascending: true });

    if (tasksErr) {
      return new Response(JSON.stringify({ error: tasksErr.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    tasks = fetchedTasks || [];
  }

  return new Response(JSON.stringify({ log: activeLog ?? null, tasks }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};


