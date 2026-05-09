export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric') || 'verifications';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const period = url.searchParams.get('period') || 'alltime';

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_ANON_KEY }
    });
    if (!userRes.ok) return Response.json({ error: 'Invalid token' }, { status: 401 });
    const { id: userId } = await userRes.json();

    let dateFilter = '';
    if (period === 'week') {
      const d = new Date(Date.now() - 7 * 86400000).toISOString();
      dateFilter = `&created_at=gte.${d}`;
    } else if (period === 'month') {
      const d = new Date(Date.now() - 30 * 86400000).toISOString();
      dateFilter = `&created_at=gte.${d}`;
    }

    const orderCol = metric === 'milestones' ? 'milestone_count'
      : metric === 'streak' ? 'streak_days'
      : 'total_verifications';

    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_stats?select=user_id,total_verifications,total_certs,streak_days,milestone_count&order=${orderCol}.desc&limit=${limit}${dateFilter}`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const rows = await res.json();

    const leaderboard = (rows || []).map((row, i) => ({
      rank: i + 1,
      user_id: row.user_id,
      score: metric === 'milestones' ? row.milestone_count
           : metric === 'streak' ? row.streak_days
           : metric === 'certs' ? row.total_certs
           : row.total_verifications,
      is_you: row.user_id === userId,
    }));

    return Response.json({ leaderboard, metric, period });
  }
};
