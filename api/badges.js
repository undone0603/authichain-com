const BADGE_CATALOG = [
  { id: 'first_verify', name: 'Authenticator', description: 'First product verified on blockchain', icon: '🔒', category: 'verification' },
  { id: 'verify_100', name: 'Verification Pro', description: '100 products verified', icon: '✅', category: 'verification' },
  { id: 'verify_1000', name: 'Chain Guardian', description: '1,000 verifications processed', icon: '🛡️', category: 'verification' },
  { id: 'first_cert', name: 'Certified', description: 'First certificate issued', icon: '🏅', category: 'certification' },
  { id: 'cert_50', name: 'Certificate Master', description: '50 certificates issued', icon: '🎓', category: 'certification' },
  { id: 'enterprise', name: 'Enterprise Partner', description: 'Activated enterprise plan', icon: '🏗️', category: 'subscription' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day verification streak', icon: '📅', category: 'streak' },
  { id: 'streak_30', name: 'Monthly Guardian', description: '30-day streak achieved', icon: '🎯', category: 'streak' },
  { id: 'referral', name: 'Chain Builder', description: 'First referral signup', icon: '🤝', category: 'growth' },
  { id: 'nft_issued', name: 'NFT Creator', description: 'First NFT certificate issued', icon: '💻', category: 'blockchain' },
];

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

    if (request.method === 'POST') {
      const { badge_id } = await request.json();
      const badge = BADGE_CATALOG.find(b => b.id === badge_id);
      if (!badge) return Response.json({ error: 'Badge not found' }, { status: 404 });

      const checkRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/user_badges?user_id=eq.${userId}&badge_id=eq.${badge_id}&select=id`,
        { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
      );
      const existing = await checkRes.json();
      if (existing.length > 0) return Response.json({ message: 'Already earned', badge });

      await fetch(`${env.SUPABASE_URL}/rest/v1/user_badges`, {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, badge_id, earned_at: new Date().toISOString() }),
      });

      return Response.json({ success: true, badge, message: `You earned the ${badge.name} badge!` });
    }

    const earnedRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_badges?user_id=eq.${userId}&select=badge_id,earned_at`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const earned = await earnedRes.json();
    const earnedMap = Object.fromEntries((earned || []).map(b => [b.badge_id, b.earned_at]));

    const badges = BADGE_CATALOG.map(b => ({
      ...b,
      earned: b.id in earnedMap,
      earned_at: earnedMap[b.id] || null,
    }));

    return Response.json({ badges, total: BADGE_CATALOG.length, earned_count: Object.keys(earnedMap).length });
  }
};
