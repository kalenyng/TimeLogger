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

  const formData = await request.formData();
  const description = String(formData.get('description') ?? '').trim();

  if (!description) {
    return new Response(JSON.stringify({ error: 'Description required' }), {
      status: 400,
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
    return new Response(JSON.stringify({ error: 'No active work log' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const log = logs[0];

  // Get last task time or use start_time
  const { data: lastTask } = await supabase
    .from('tasks')
    .select('created_at')
    .eq('work_log_id', log.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const baseTime = lastTask?.created_at || log.start_time;
  const baseTimestamp = new Date(baseTime).getTime();
  const nowTimestamp = Date.now();
  const duration = Math.max(0, Math.floor((nowTimestamp - baseTimestamp) / 1000));

  // Insert task
  const { error } = await supabase
    .from('tasks')
    .insert({
      work_log_id: log.id,
      user_id: user.id,
      description,
      duration
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return redirect('/');
};

