const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price_monthly: 49,
    price_annual: 39,
    stripe_price_id_monthly: 'price_authi_starter_mo',
    stripe_price_id_annual: 'price_authi_starter_yr',
    description: 'For brands getting started with product authentication.',
    features: [
      'Up to 500 product scans/mo',
      'QR code generation',
      'Basic blockchain verification',
      'Email support',
      '14-day free trial'
    ],
    limits: { scans_monthly: 500, products: 100, users: 1 },
    recommended: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 149,
    price_annual: 119,
    stripe_price_id_monthly: 'price_authi_pro_mo',
    stripe_price_id_annual: 'price_authi_pro_yr',
    description: 'For growing brands needing advanced authentication and NFT certificates.',
    features: [
      'Up to 5,000 scans/mo',
      'NFT certificate minting',
      'Multi-product batch registration',
      'Consumer-facing verification pages',
      'API access',
      'Priority support',
      '14-day free trial'
    ],
    limits: { scans_monthly: 5000, products: 1000, users: 5 },
    recommended: true,
    badge: 'Most Popular'
  },
  {
    id: 'business',
    name: 'Business',
    price_monthly: 399,
    price_annual: 319,
    stripe_price_id_monthly: 'price_authi_biz_mo',
    stripe_price_id_annual: 'price_authi_biz_yr',
    description: 'For established brands with high scan volume and supply chain needs.',
    features: [
      'Unlimited scans',
      'Full supply chain tracking',
      'Luxury/pharma compliance modules',
      'Custom verification pages',
      'Webhook integrations',
      'Dedicated account manager',
      '14-day free trial'
    ],
    limits: { scans_monthly: -1, products: -1, users: 15 },
    recommended: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: null,
    price_annual: null,
    stripe_price_id_monthly: null,
    stripe_price_id_annual: null,
    description: 'Custom authentication infrastructure for large enterprises.',
    features: [
      'Custom scan volume',
      'White-label solution',
      'On-premise deployment option',
      'SLA guarantee',
      'Custom blockchain network',
      'Dedicated support team',
      '30-day trial'
    ],
    limits: { scans_monthly: -1, products: -1, users: -1 },
    recommended: false,
    contact_required: true,
    contact_url: 'https://authichain.com/enterprise'
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { billing = 'monthly' } = req.query;
  const annual_discount_percent = 20;

  const enriched = PLANS.map(plan => ({
    ...plan,
    displayed_price: billing === 'annual' ? plan.price_annual : plan.price_monthly,
    active_stripe_price_id: billing === 'annual' ? plan.stripe_price_id_annual : plan.stripe_price_id_monthly,
    billing_cycle: billing,
    annual_savings: plan.price_monthly ? `Save $${(plan.price_monthly - plan.price_annual) * 12}/yr` : null
  }));

  return res.status(200).json({
    success: true,
    billing,
    annual_discount_percent,
    plans: enriched,
    faq: [
      { q: 'What counts as a scan?', a: 'Each time a consumer or partner scans your product QR code counts as one scan.' },
      { q: 'Can I mint NFT certificates?', a: 'Yes, NFT minting is available on Pro and above.' },
      { q: 'Is there a free trial?', a: 'Yes, all paid plans include a 14-day free trial with no credit card required.' },
      { q: 'Do you support luxury brands?', a: 'Yes, our Business and Enterprise plans include luxury and pharma compliance modules.' }
    ],
    contact: { sales: 'sales@authichain.com', support: 'support@authichain.com' }
  });
}
