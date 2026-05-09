export default {
  async fetch(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_ANON_KEY }
    });
    if (!userRes.ok) return Response.json({ error: 'Invalid token' }, { status: 401 });
    const { id: userId } = await userRes.json();

    const statsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_stats?user_id=eq.${userId}&select=streak_days,longest_streak,last_active_at`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const statsArr = await statsRes.json();
    const stats = statsArr[0] || {};

    if (request.method === 'POST') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActive = stats.last_active_at ? new Date(stats.last_active_at) : null;
      const daysSince = lastActive ? Math.floor((today.getTime() - lastActive.getTime()) / 86400000) : 999;

      let newStreak = 1;
      if (daysSince === 0) newStreak = stats.streak_days || 1;
      else if (daysSince === 1) newStreak = (stats.streak_days || 0) + 1;

      const longest = Math.max(newStreak, stats.longest_streak || 0);

      await fetch(`${env.SUPABASE_URL}/rest/v1/user_stats`, {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: userId,
          streak_days: newStreak,
          longest_streak: longest,
          last_active_at: new Date().toISOString(),
        }),
      });

      return Response.json({ streak_days: newStreak, longest_streak: longest, updated: true });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = stats.last_active_at ? new Date(stats.last_active_at) : null;
    const daysSince = lastActive ? Math.floor((today.getTime() - lastActive.getTime()) / 86400000) : 999;
    const isAlive = daysSince <= 1;

    const milestones = [
      { days: 7, label: 'Week Warrior', achieved: (stats.streak_days || 0) >= 7 },
      { days: 30, label: 'Monthly Guardian', achieved: (stats.streak_days || 0) >= 30 },
      { days: 90, label: 'Quarter Champion', achieved: (stats.streak_days || 0) >= 90 },
      { days: 365, label: 'Annual Legend', achieved: (stats.streak_days || 0) >= 365 },
    ];

    return Response.json({
      current_streak: isAlive ? (stats.streak_days || 0) : 0,
      longest_streak: stats.longest_streak || 0,
      last_active_at: stats.last_active_at || null,
      streak_alive: isAlive,
      milestones,
    });
  }
};
