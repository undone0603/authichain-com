import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Milestone definitions — keyed by trigger type and threshold
const MILESTONES = [
  // Product authentication milestones
  { id: 'first_product', category: 'product', threshold: 1, metric: 'products_registered', title: 'First Product Authenticated!', message: 'You just put your first product on the blockchain. Counterfeits beware.', icon: '🔐', reward: null, badge: 'Authenticator' },
  { id: 'ten_products', category: 'product', threshold: 10, metric: 'products_registered', title: '10 Products Authenticated', message: 'Your catalog is taking shape. 10 products protected.', icon: '📦', reward: null, badge: 'Catalog Builder' },
  { id: 'hundred_products', category: 'product', threshold: 100, metric: 'products_registered', title: '100 Products — Triple Digits!', message: 'Serious scale. 100 products verified on-chain.', icon: '💯', reward: { type: 'discount', percent: 10, description: '10% off your next billing cycle' }, badge: 'Scale Operator' },
  { id: 'thousand_products', category: 'product', threshold: 1000, metric: 'products_registered', title: '1,000 Products Authenticated', message: 'You are building something real. 1,000 blockchain certificates issued.', icon: '🏆', reward: { type: 'credit', amount: 50, description: '$50 account credit' }, badge: 'Enterprise Grade' },
  // Scan milestones
  { id: 'first_scan', category: 'scan', threshold: 1, metric: 'scans_total', title: 'First Scan!', message: 'Someone just verified your product. The chain is live.', icon: '📱', reward: null, badge: 'Verified' },
  { id: 'hundred_scans', category: 'scan', threshold: 100, metric: 'scans_total', title: '100 Scans!', message: 'Your products are being verified 100 times. Trust is building.', icon: '🔍', reward: null, badge: 'Trusted Brand' },
  { id: 'thousand_scans', category: 'scan', threshold: 1000, metric: 'scans_total', title: '1,000 Scans — You Are Live!', message: 'Real consumers are verifying your products at scale.', icon: '🚀', reward: { type: 'credit', amount: 25, description: '$25 account credit' }, badge: 'Market Presence' },
  { id: 'ten_thousand_scans', category: 'scan', threshold: 10000, metric: 'scans_total', title: '10,000 Scans — Brand Authority', message: 'Your brand authentication is a consumer touchpoint at scale.', icon: '⚡', reward: { type: 'upgrade', description: 'Free upgrade to next plan tier for 1 month' }, badge: 'Authority Brand' },
  // Revenue / subscription milestones
  { id: 'first_payment', category: 'revenue', threshold: 1, metric: 'payments_made', title: 'First Payment — Welcome!', message: 'You are now an AuthiChain paying customer. Let us protect your brand.', icon: '💳', reward: { type: 'bonus_scans', amount: 500, description: '500 bonus scans' }, badge: 'Paying Customer' },
  { id: 'three_months', category: 'retention', threshold: 90, metric: 'days_active', title: '3 Months Strong!', message: 'Three months of authentic products. Your brand reputation is growing.', icon: '📅', reward: { type: 'discount', percent: 15, description: '15% off annual plan upgrade' }, badge: '3-Month Loyalist' },
  { id: 'one_year', category: 'retention', threshold: 365, metric: 'days_active', title: 'One Year of AuthiChain!', message: 'A full year protecting your products. You are the standard.', icon: '🎉', reward: { type: 'credit', amount: 100, description: '$100 account credit' }, badge: 'Founding Brand' },
  // NFT milestones
  { id: 'first_nft', category: 'nft', threshold: 1, metric: 'nfts_minted', title: 'First NFT Certificate Minted!', message: 'Your product now has an immutable blockchain certificate. Luxury-grade authenticity.', icon: '🎨', reward: null, badge: 'NFT Issuer' },
  { id: 'fifty_nfts', category: 'nft', threshold: 50, metric: 'nfts_minted', title: '50 NFT Certificates', message: '50 luxury-grade blockchain certificates issued. Your catalog is elite.', icon: '💎', reward: { type: 'feature_unlock', feature: 'custom_nft_art', description: 'Custom NFT artwork unlocked' }, badge: 'NFT Curator' },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    // Return all milestones with user achievement status
    const { data: achieved } = await supabase
      .from('milestone_achievements')
      .select('*')
      .eq('user_id', user.id);

    const achievedIds = (achieved || []).map(a => a.milestone_id);

    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const enriched = MILESTONES.map(m => {
      const isAchieved = achievedIds.includes(m.id);
      const current = stats?.[m.metric] || 0;
      const progress_percent = Math.min(100, Math.round((current / m.threshold) * 100));
      const achieved_at = (achieved || []).find(a => a.milestone_id === m.id)?.achieved_at || null;
      return {
        ...m,
        achieved: isAchieved,
        achieved_at,
        current_value: current,
        progress_percent,
        remaining: isAchieved ? 0 : Math.max(0, m.threshold - current)
      };
    });

    const total_achieved = achievedIds.length;
    const next_milestone = enriched.find(m => !m.achieved && m.progress_percent > 0) || enriched.find(m => !m.achieved);

    return res.status(200).json({
      success: true,
      total_milestones: MILESTONES.length,
      total_achieved,
      completion_percent: Math.round((total_achieved / MILESTONES.length) * 100),
      milestones: enriched,
      next_milestone: next_milestone || null
    });
  }

  if (req.method === 'POST') {
    // Trigger milestone check — called after key user actions
    const { metric, new_value } = req.body;
    if (!metric || new_value === undefined) return res.status(400).json({ error: 'metric and new_value are required' });

    const triggered = MILESTONES.filter(m => m.metric === metric && new_value >= m.threshold);
    if (!triggered.length) return res.status(200).json({ success: true, newly_achieved: [] });

    const { data: existing } = await supabase
      .from('milestone_achievements')
      .select('milestone_id')
      .eq('user_id', user.id);

    const existingIds = (existing || []).map(e => e.milestone_id);
    const newlyAchieved = triggered.filter(m => !existingIds.includes(m.id));

    if (newlyAchieved.length > 0) {
      const inserts = newlyAchieved.map(m => ({
        user_id: user.id,
        milestone_id: m.id,
        metric,
        value_at_achievement: new_value,
        reward: m.reward || null,
        achieved_at: new Date().toISOString()
      }));
      await supabase.from('milestone_achievements').insert(inserts);
    }

    return res.status(200).json({
      success: true,
      newly_achieved: newlyAchieved.map(m => ({
        id: m.id,
        title: m.title,
        message: m.message,
        icon: m.icon,
        badge: m.badge,
        reward: m.reward,
        celebrate: true
      }))
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
