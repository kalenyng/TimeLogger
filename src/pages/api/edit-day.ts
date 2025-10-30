import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const form = await request.formData();
  const date = String(form.get('date') ?? ''); // yyyy-MM-dd
  const hours = Number(form.get('hours'));
  if (!date || !Number.isFinite(hours) || hours < 0) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }

  const start = new Date(date + 'T00:00:00.000Z').toISOString();
  const end = new Date(date + 'T23:59:59.999Z').toISOString();

  // Fetch logs for the day
  const { data: logs } = await supabase
    .from('work_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', start)
    .lte('start_time', end)
    .order('id', { ascending: true });

  const targetSeconds = Math.round(hours * 3600);
  const existingSeconds = ((logs as any[]) || []).reduce((acc, l: any) => acc + (l.total_seconds || 0), 0);

  if (!logs || logs.length === 0) {
    // No logs: create a synthetic log for that day with desired hours
    const syntheticStart = new Date(date + 'T09:00:00.000Z').toISOString();
    const { data: settings } = await supabase
      .from('user_settings')
      .select('hourly_rate')
      .eq('user_id', user.id)
      .maybeSingle();
    const currentRate = Number((settings as any)?.hourly_rate ?? 10);
    const { error: insertErr } = await supabase
      .from('work_logs')
      .insert({
        user_id: user.id,
        start_time: syntheticStart,
        end_time: syntheticStart,
        total_seconds: targetSeconds,
        description: 'Adjusted (manual)',
        hourly_rate_at_time: currentRate
      });
    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr.message }), { status: 400 });
    }
  } else {
    // Adjust the last log to match target total, keep others as-is
    const last = logs[logs.length - 1] as any;
    const othersSeconds = existingSeconds - (last.total_seconds || 0);
    const newLastSeconds = Math.max(0, targetSeconds - othersSeconds);
    const { error: updErr } = await supabase
      .from('work_logs')
      .update({ total_seconds: newLastSeconds })
      .eq('id', last.id);
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), { status: 400 });
    }
  }

  return redirect('/weekly');
};


