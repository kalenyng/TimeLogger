import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const form = await request.formData();
  const date = String(form.get('date') ?? ''); // yyyy-MM-dd
  if (!date) {
    return new Response(JSON.stringify({ error: 'Missing date' }), { status: 400 });
  }

  const { error } = await supabase
    .from('work_logs')
    .delete()
    .eq('user_id', user.id)
    .gte('start_time', new Date(date + 'T00:00:00.000Z').toISOString())
    .lte('start_time', new Date(date + 'T23:59:59.999Z').toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return redirect('/weekly');
};


