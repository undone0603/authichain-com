import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const REWARDS = {
  referrer: { credit: 30, description: '$30 credit per paying referral' },
  referred: { discount_percent: 20, months: 3, description: '20% off first 3 months' }
};

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
    let { data: ref } = await supabase.from('referrals').select('*').eq('referrer_id', user.id).single();

    if (!ref) {
      const code = 'AUTH' + randomBytes(4).toString('hex').toUpperCase();
      const { data: newRef, error } = await supabase
        .from('referrals')
        .insert({ referrer_id: user.id, code, status: 'active', created_at: new Date().toISOString() })
        .select().single();
      if (error) return res.status(500).json({ error: error.message });
      ref = newRef;
    }

    const { data: convs } = await supabase.from('referral_conversions').select('*').eq('referral_id', ref.id);
    const converted = (convs || []).filter(c => c.status === 'paid').length;

    return res.status(200).json({
      success: true,
      referral_code: ref.code,
      referral_url: `https://authichain.com/signup?ref=${ref.code}`,
      rewards: REWARDS,
      stats: { total: (convs || []).length, converted, earned: converted * REWARDS.referrer.credit },
      share_message: `Use my code ${ref.code} to get 20% off AuthiChain - blockchain product authentication. Perfect for luxury brands and pharma.`
    });
  }

  if (req.method === 'POST') {
    const { referral_code } = req.body;
    if (!referral_code) return res.status(400).json({ error: 'referral_code is required' });

    const { data: ref, error } = await supabase.from('referrals').select('*').eq('code', referral_code.toUpperCase()).single();
    if (error || !ref) return res.status(404).json({ error: 'Invalid referral code' });
    if (ref.referrer_id === user.id) return res.status(400).json({ error: 'Cannot use your own code' });

    const { data: existing } = await supabase.from('referral_conversions').select('id').eq('referred_id', user.id).single();
    if (existing) return res.status(200).json({ success: true, already_applied: true });

    const { error: insertErr } = await supabase.from('referral_conversions')
      .insert({ referral_id: ref.id, referred_id: user.id, status: 'pending', created_at: new Date().toISOString() });
    if (insertErr) return res.status(500).json({ error: insertErr.message });

    return res.status(200).json({
      success: true,
      applied: true,
      discount_percent: REWARDS.referred.discount_percent,
      months: REWARDS.referred.months,
      message: `Code applied! ${REWARDS.referred.discount_percent}% off your first ${REWARDS.referred.months} months.`
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
