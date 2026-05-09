// AuthiChain - Enterprise Client Management API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ENTERPRISE_TIERS = [
    {
      id: 'enterprise_starter',
      name: 'Enterprise Starter',
      price_monthly: 999,
      price_annual: 9990,
      products_limit: 10000,
      scan_limit_monthly: 500000,
      team_members: 10,
      custom_domain: true,
      white_label: false,
      dedicated_support: false,
      sla: '99.9%',
    },
    {
      id: 'enterprise_pro',
      name: 'Enterprise Pro',
      price_monthly: 2500,
      price_annual: 25000,
      products_limit: 100000,
      scan_limit_monthly: 5000000,
      team_members: 50,
      custom_domain: true,
      white_label: true,
      dedicated_support: true,
      sla: '99.95%',
    },
    {
      id: 'enterprise_unlimited',
      name: 'Enterprise Unlimited',
      price_monthly: null,
      price_annual: null,
      products_limit: -1,
      scan_limit_monthly: -1,
      team_members: -1,
      custom_domain: true,
      white_label: true,
      dedicated_support: true,
      sla: '99.99%',
    },
  ];

  if (req.method === 'GET') {
    const { enterprise_id, include_usage } = req.query;

    if (!enterprise_id) {
      return res.status(200).json({
        success: true,
        tiers: ENTERPRISE_TIERS,
        features: [
          'Blockchain-backed product authentication',
          'NFT certificate generation per product',
          'QR code generation with custom styling',
          'Real-time scan analytics and geo-tracking',
          'METRC / supply chain integrations',
          'White-label verification portal',
          'API access with dedicated rate limits',
          'Custom webhook endpoints',
          'SOC 2 compliance reports',
          'Dedicated account manager',
          'Priority SLA and 24/7 support',
        ],
        contact_sales: 'enterprise@authichain.com',
      });
    }

    const enterprise = {
      enterprise_id,
      company_name: 'Example Enterprise Corp',
      tier: 'enterprise_pro',
      status: 'active',
      contract_start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contract_end: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      account_manager: 'AuthiChain Enterprise Team',
      domains: ['verify.enterprise.com'],
      team_member_count: 8,
      api_key_count: 3,
      webhook_count: 2,
    };

    const usage = include_usage === 'true' ? {
      products_registered: 4200,
      products_limit: 100000,
      scans_this_month: 128000,
      scan_limit_monthly: 5000000,
      certificates_issued: 4200,
      api_calls_today: 8400,
    } : undefined;

    return res.status(200).json({
      success: true,
      enterprise,
      ...(usage ? { usage } : {}),
    });
  }

  if (req.method === 'POST') {
    const { company_name, contact_email, contact_name, tier_id, use_case, estimated_products } = req.body || {};

    if (!company_name || !contact_email) {
      return res.status(400).json({ error: 'company_name and contact_email are required' });
    }

    const valid_tiers = ENTERPRISE_TIERS.map((t) => t.id);
    if (tier_id && !valid_tiers.includes(tier_id)) {
      return res.status(422).json({ error: `Invalid tier_id. Must be one of: ${valid_tiers.join(', ')}` });
    }

    const inquiry_id = `ENT-${Date.now()}`;

    return res.status(201).json({
      success: true,
      inquiry_id,
      company_name,
      contact_email,
      contact_name: contact_name || null,
      tier_id: tier_id || 'enterprise_pro',
      use_case: use_case || null,
      estimated_products: estimated_products || null,
      status: 'inquiry_received',
      next_steps: 'An AuthiChain enterprise specialist will contact you within 1 business day.',
      created_at: new Date().toISOString(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
