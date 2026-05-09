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

    const since = new Date(Date.now() - 7 * 86400000).toISOString();

    const [verifRes, certsRes, statsRes] = await Promise.all([
      fetch(`${env.SUPABASE_URL}/rest/v1/verifications?user_id=eq.${userId}&created_at=gte.${since}&select=id,product_name,status`, {
        headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
      }),
      fetch(`${env.SUPABASE_URL}/rest/v1/certificates?user_id=eq.${userId}&created_at=gte.${since}&select=id,title,issued_at`, {
        headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
      }),
      fetch(`${env.SUPABASE_URL}/rest/v1/user_stats?user_id=eq.${userId}&select=streak_days,total_verifications,total_certs,milestone_count`, {
        headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
      }),
    ]);

    const [verifications, certs, statsArr] = await Promise.all([
      verifRes.json(), certsRes.json(), statsRes.json()
    ]);
    const stats = statsArr[0] || {};

    const digest = {
      period: 'weekly',
      generated_at: new Date().toISOString(),
      user_id: userId,
      summary: {
        verifications_this_week: (verifications || []).length,
        certs_this_week: (certs || []).length,
        current_streak: stats.streak_days || 0,
        total_verifications: stats.total_verifications || 0,
        total_certs: stats.total_certs || 0,
        milestones_earned: stats.milestone_count || 0,
      },
      recent_verifications: (verifications || []).slice(0, 5),
      recent_certs: (certs || []).slice(0, 5),
      action_items: [
        ...(stats.streak_days === 0 ? [{ type: 'streak', message: 'Resume your daily verification streak for rewards' }] : []),
        ...((verifications || []).filter(v => v.status === 'pending').length > 0
          ? [{ type: 'verification', message: `${(verifications || []).filter(v => v.status === 'pending').length} verifications awaiting review` }]
          : []),
        ...((!stats.total_verifications || stats.total_verifications < 10)
          ? [{ type: 'upgrade', message: 'Upgrade to Pro to batch-verify products and issue NFT certificates', cta_url: '/pricing' }]
          : []),
      ],
    };

    return Response.json(digest);
  }
};
