export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { company_name, contact_name, email, industry, partner_type, message } = req.body || {};
    if (!company_name || !email || !partner_type) {
      return res.status(400).json({ error: 'company_name, email, and partner_type are required' });
    }
    return res.status(201).json({
      success: true,
      application_id: 'PART-' + Date.now(),
      status: 'under_review',
      message: 'Your partnership application has been received. Our team will contact you within 3 business days.',
      estimated_review: '3 business days',
      next_steps: [
        'Application review by partnerships team',
        'Technical integration call scheduled',
        'Partnership agreement sent',
        'API credentials provisioned'
      ]
    });
  }

  // GET - list partner programs and current partners
  const programs = [
    {
      id: 'prog_001',
      name: 'Technology Integration Partner',
      type: 'technology',
      description: 'For ERP, WMS, and supply chain platforms integrating AuthiChain verification APIs',
      benefits: [
        'Co-branded verification badges',
        'Revenue share up to 20%',
        'Priority API support',
        'Joint go-to-market opportunities',
        'Listed in AuthiChain partner directory'
      ],
      requirements: ['Minimum 100 mutual customers', 'Technical integration certification', 'NDA required'],
      revenue_share: 0.20,
      tier: 'silver'
    },
    {
      id: 'prog_002',
      name: 'Reseller Partner',
      type: 'reseller',
      description: 'For value-added resellers, consultants, and system integrators selling AuthiChain to end customers',
      benefits: [
        'Reseller discount 30-40%',
        'Sales training and certification',
        'Deal registration protection',
        'Co-marketing funds',
        'Dedicated channel manager'
      ],
      requirements: ['Certified sales representative', 'Minimum annual commitment $50K', 'Business plan submission'],
      revenue_share: 0.35,
      tier: 'gold'
    },
    {
      id: 'prog_003',
      name: 'Brand Enterprise Partner',
      type: 'enterprise_brand',
      description: 'For luxury, pharmaceutical, and consumer brands deploying AuthiChain at scale',
      benefits: [
        'Custom blockchain deployment',
        'Dedicated success manager',
        'White-label options',
        'SLA guarantee 99.99%',
        'On-site integration support'
      ],
      requirements: ['10,000+ SKUs minimum', 'Executive sponsor', 'Pilot program commitment'],
      revenue_share: null,
      tier: 'platinum'
    }
  ];

  const featured_partners = [
    { name: 'SAP', type: 'technology', logo: '/partners/sap.png', integration: 'SAP S/4HANA connector' },
    { name: 'Oracle', type: 'technology', logo: '/partners/oracle.png', integration: 'Oracle SCM Cloud integration' },
    { name: 'Salesforce', type: 'technology', logo: '/partners/salesforce.png', integration: 'Salesforce AppExchange app' }
  ];

  return res.status(200).json({
    success: true,
    programs,
    featured_partners,
    total_programs: programs.length,
    partner_types: ['technology', 'reseller', 'enterprise_brand', 'consulting', 'logistics'],
    contact_email: 'partners@authichain.com'
  });
}
