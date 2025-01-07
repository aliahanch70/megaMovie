import { createClient } from '@/lib/supabase/client';

export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number }> {
  const supabase = createClient();
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up old entries
  await supabase
    .from('rate_limits')
    .delete()
    .lt('timestamp', new Date(windowStart).toISOString());

  // Count recent requests
  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact' })
    .eq('identifier', identifier)
    .gt('timestamp', new Date(windowStart).toISOString());

  if (count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  // Add new request
  await supabase.from('rate_limits').insert({
    identifier,
    timestamp: new Date(now).toISOString()
  });

  return {
    success: true,
    remaining: maxRequests - (count + 1)
  };
}