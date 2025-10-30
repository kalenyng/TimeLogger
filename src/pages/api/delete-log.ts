import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect, url }) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const logId = url.searchParams.get('id');
  if (!logId) {
    return new Response(JSON.stringify({ error: 'Missing log ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Delete tasks first (foreign key constraint)
  await supabase
    .from('tasks')
    .delete()
    .eq('work_log_id', Number(logId));

  // Delete the work log
  const { error } = await supabase
    .from('work_logs')
    .delete()
    .eq('id', Number(logId))
    .eq('user_id', user.id); // Ensure user owns this log

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return redirect('/history');
};

