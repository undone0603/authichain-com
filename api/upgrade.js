import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const PLAN_HIERARCHY = ['starter', 'pro', 'business', 'enterprise'];
const PLAN_PRICES = {
  starter: { monthly: 49, annual: 39, stripe_monthly: 'price_authi_starter_mo', stripe_annual: 'price_authi_starter_yr' },
  pro: { monthly: 149, annual: 119, stripe_monthly: 'price_authi_pro_mo', stripe_annual: 'price_authi_pro_yr' },
  business: { monthly: 399, annual: 319, stripe_monthly: 'price_authi_biz_mo', stripe_annual: 'price_authi_biz_yr' },
  enterprise: { monthly: null, annual: null, contact: true }
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

  if (req.method === 'POST') {
    const { to_plan, billing_cycle = 'monthly', promo_code } = req.body;
    if (!to_plan || !PLAN_PRICES[to_plan]) return res.status(400).json({ error: 'Invalid to_plan' });

    const plan = PLAN_PRICES[to_plan];
    if (plan.contact) {
      return res.status(200).json({
        success: true,
        contact_required: true,
        message: 'Contact sales@authichain.com for Enterprise pricing.',
        contact_url: 'https://authichain.com/enterprise'
      });
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const from_plan = sub?.plan_id || 'free';
    const from_idx = PLAN_HIERARCHY.indexOf(from_plan);
    const to_idx = PLAN_HIERARCHY.indexOf(to_plan);

    let amount = billing_cycle === 'annual' ? plan.annual : plan.monthly;
    let discount = 0;
    if (promo_code === 'AUTHI20') discount = 20;
    if (promo_code === 'LAUNCH15') discount = 15;
    const final_amount = amount - Math.floor(amount * discount / 100);

    const price_id = billing_cycle === 'annual' ? plan.stripe_annual : plan.stripe_monthly;

    const { data: record, error: recErr } = await supabase
      .from('upgrades')
      .insert({
        user_id: user.id,
        from_plan,
        to_plan,
        billing_cycle,
        price_id,
        amount: final_amount,
        discount_percent: discount,
        promo_code: promo_code || null,
        is_upgrade: to_idx > from_idx,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (recErr) return res.status(500).json({ error: recErr.message });

    return res.status(200).json({
      success: true,
      upgrade_id: record.id,
      from_plan,
      to_plan,
      billing_cycle,
      amount: final_amount,
      discount_percent: discount,
      price_id,
      checkout_url: `/api/checkout?upgrade_id=${record.id}`
    });
  }

  if (req.method === 'GET') {
    const { data } = await supabase
      .from('upgrades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return res.status(200).json({ success: true, upgrades: data || [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
