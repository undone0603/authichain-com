// AuthiChain - Free Trial Activation API
// Drives first-dollar conversion by capturing high-intent leads into a 14-day trial
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TRIAL_PLANS = [
    {
      id: 'starter_trial',
      name: 'Starter Trial',
      trial_days: 14,
      converts_to: 'starter',
      price_after_trial: 99,
      products_limit: 500,
      scans_limit: 10000,
      features: ['QR generation', 'Basic analytics', 'Email support', 'Up to 500 products', 'NFT certificates'],
      credit_card_required: false,
    },
    {
      id: 'pro_trial',
      name: 'Pro Trial',
      trial_days: 14,
      converts_to: 'pro',
      price_after_trial: 299,
      products_limit: 5000,
      scans_limit: 100000,
      features: ['Everything in Starter', 'Advanced analytics', 'Custom domains', 'API access', 'Priority support', 'White-label portal'],
      credit_card_required: false,
    },
    {
      id: 'enterprise_trial',
      name: 'Enterprise Trial',
      trial_days: 30,
      converts_to: 'enterprise',
      price_after_trial: null,
      products_limit: -1,
      scans_limit: -1,
      features: ['Everything in Pro', 'Unlimited products', 'Dedicated account manager', 'SOC 2 reports', 'Custom SLA', 'METRC integration'],
      credit_card_required: false,
    },
  ];

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Start your free AuthiChain trial — no credit card required.',
      trials: TRIAL_PLANS,
      trust_signals: [
        'No credit card required',
        '14-day full-featured trial',
        'Cancel anytime',
        'Onboarding call included',
        'Data retained if you upgrade',
      ],
      cta_url: 'https://authichain.com/trial',
    });
  }

  if (req.method === 'POST') {
    const {
      email,
      name,
      company,
      plan_id = 'starter_trial',
      industry,
      product_count_estimate,
      referral_source,
    } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'email is required to start a trial' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({ error: 'Invalid email address' });
    }

    const validPlanIds = TRIAL_PLANS.map((p) => p.id);
    if (!validPlanIds.includes(plan_id)) {
      return res.status(422).json({ error: `Invalid plan_id. Must be one of: ${validPlanIds.join(', ')}` });
    }

    const plan = TRIAL_PLANS.find((p) => p.id === plan_id);
    const trial_id = `TRIAL-${Date.now()}`;
    const trial_start = new Date();
    const trial_end = new Date(trial_start.getTime() + plan.trial_days * 24 * 60 * 60 * 1000);

    // In production: create user in Supabase, send welcome email via SendGrid,
    // create Stripe customer (no charge), notify sales team via Slack webhook

    return res.status(201).json({
      success: true,
      trial_id,
      email,
      name: name || null,
      company: company || null,
      plan: plan,
      trial_start: trial_start.toISOString(),
      trial_end: trial_end.toISOString(),
      days_remaining: plan.trial_days,
      status: 'active',
      next_steps: [
        'Check your email for a verification link',
        'Log in to your AuthiChain dashboard',
        'Register your first product and generate a QR code',
        'Book your free onboarding call: https://authichain.com/onboarding-call',
      ],
      upgrade_url: `https://authichain.com/upgrade?trial=${trial_id}&plan=${plan.converts_to}`,
      dashboard_url: 'https://authichain.com/dashboard',
      message: `Your ${plan.trial_days}-day free trial of AuthiChain ${plan.name} has been activated. No credit card required.`,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
