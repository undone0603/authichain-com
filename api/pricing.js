// AuthiChain - Pricing Plans API
// Revenue-critical: powers the pricing page and checkout flow
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { billing = 'monthly' } = req.query;
  const isAnnual = billing === 'annual';

  const PLANS = [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Perfect for small brands getting started with authentication',
      price_monthly: 99,
      price_annual: 79, // per month, billed annually
      annual_savings: 240,
      stripe_price_id_monthly: 'price_authichain_starter_monthly',
      stripe_price_id_annual: 'price_authichain_starter_annual',
      popular: false,
      products_limit: 500,
      scans_per_month: 10000,
      team_members: 3,
      custom_domains: 0,
      api_access: false,
      nft_certificates: true,
      white_label: false,
      support: 'Email',
      features: [
        '500 authenticated products',
        '10,000 scans/month',
        'QR code generation & styling',
        'NFT certificate per product',
        'Basic scan analytics',
        '3 team members',
        'Email support',
      ],
      cta: 'Start Free Trial',
      trial_days: 14,
      checkout_url: 'https://authichain.com/checkout?plan=starter',
      trial_url: 'https://authichain.com/trial?plan=starter_trial',
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'For growing brands that need advanced analytics and API access',
      price_monthly: 299,
      price_annual: 239,
      annual_savings: 720,
      stripe_price_id_monthly: 'price_authichain_pro_monthly',
      stripe_price_id_annual: 'price_authichain_pro_annual',
      popular: true,
      products_limit: 5000,
      scans_per_month: 100000,
      team_members: 10,
      custom_domains: 3,
      api_access: true,
      nft_certificates: true,
      white_label: true,
      support: 'Priority Email + Chat',
      features: [
        '5,000 authenticated products',
        '100,000 scans/month',
        'Everything in Starter',
        'API access with high rate limits',
        'Advanced analytics & geo-tracking',
        'Custom domains (3)',
        'White-label verification portal',
        '10 team members',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      trial_days: 14,
      checkout_url: 'https://authichain.com/checkout?plan=pro',
      trial_url: 'https://authichain.com/trial?plan=pro_trial',
    },
    {
      id: 'business',
      name: 'Business',
      tagline: 'For established brands managing thousands of SKUs',
      price_monthly: 799,
      price_annual: 639,
      annual_savings: 1920,
      stripe_price_id_monthly: 'price_authichain_business_monthly',
      stripe_price_id_annual: 'price_authichain_business_annual',
      popular: false,
      products_limit: 50000,
      scans_per_month: 1000000,
      team_members: 25,
      custom_domains: 10,
      api_access: true,
      nft_certificates: true,
      white_label: true,
      support: 'Dedicated Slack channel',
      features: [
        '50,000 authenticated products',
        '1M scans/month',
        'Everything in Pro',
        'Dedicated Slack support channel',
        'METRC supply chain integration',
        'Custom domains (10)',
        '25 team members',
        'Quarterly business reviews',
        'Advanced webhook automations',
      ],
      cta: 'Start Free Trial',
      trial_days: 14,
      checkout_url: 'https://authichain.com/checkout?plan=business',
      trial_url: 'https://authichain.com/trial?plan=starter_trial',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'Custom pricing for luxury, pharma, and large-scale deployments',
      price_monthly: null,
      price_annual: null,
      annual_savings: null,
      stripe_price_id_monthly: null,
      stripe_price_id_annual: null,
      popular: false,
      products_limit: -1,
      scans_per_month: -1,
      team_members: -1,
      custom_domains: -1,
      api_access: true,
      nft_certificates: true,
      white_label: true,
      support: 'Dedicated account manager + 24/7 SLA',
      features: [
        'Unlimited authenticated products',
        'Unlimited scans',
        'Everything in Business',
        'Dedicated account manager',
        'Custom SLA (99.99% uptime)',
        'SOC 2 Type II compliance reports',
        'Custom blockchain deployment',
        'On-premise option available',
        'Net-30 invoicing',
      ],
      cta: 'Contact Sales',
      trial_days: 30,
      checkout_url: null,
      trial_url: 'https://authichain.com/trial?plan=enterprise_trial',
      contact_url: 'https://authichain.com/enterprise',
    },
  ];

  const plans_with_billing = PLANS.map((plan) => ({
    ...plan,
    displayed_price: plan.price_monthly
      ? isAnnual
        ? plan.price_annual
        : plan.price_monthly
      : null,
    billing_cycle: isAnnual ? 'annual' : 'monthly',
    active_stripe_price_id: isAnnual
      ? plan.stripe_price_id_annual
      : plan.stripe_price_id_monthly,
  }));

  const add_ons = [
    { id: 'extra_products_1k', name: 'Extra 1,000 products', price: 29, unit: 'month' },
    { id: 'extra_scans_100k', name: 'Extra 100,000 scans', price: 19, unit: 'month' },
    { id: 'onboarding_call', name: 'Guided onboarding call (1hr)', price: 0, unit: 'one-time', note: 'Free for all plans' },
    { id: 'white_glove_setup', name: 'White-glove product import', price: 499, unit: 'one-time' },
  ];

  return res.status(200).json({
    success: true,
    billing,
    annual_discount_percent: 20,
    plans: plans_with_billing,
    add_ons,
    faq: [
      { q: 'Do I need a credit card to start a trial?', a: 'No. All trials are free with no credit card required.' },
      { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade at any time. Proration is applied automatically.' },
      { q: 'What happens to my data if I cancel?', a: 'Your product and scan data is retained for 90 days after cancellation.' },
      { q: 'Do you offer non-profit or startup discounts?', a: 'Yes — contact us at billing@authichain.com for special pricing.' },
    ],
    contact: { sales: 'enterprise@authichain.com', billing: 'billing@authichain.com', support: 'support@authichain.com' },
  });
}
