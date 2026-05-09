export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { name, email, company, subject, message, priority, category } = req.body || {};
    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'email, subject, and message are required' });
    }
    const ticket_id = 'TKT-' + Date.now();
    return res.status(200).json({
      success: true,
      ticket_id,
      status: 'open',
      message: 'Support ticket created. Our team will respond within 24 hours.',
      estimated_response: priority === 'urgent' ? '2 hours' : priority === 'high' ? '8 hours' : '24 hours'
    });
  }

  // GET - return FAQ and support resources
  const faqs = [
    {
      id: 'faq_001',
      category: 'verification',
      question: 'How does AuthiChain verify product authenticity?',
      answer: 'AuthiChain uses blockchain technology to create an immutable digital twin of each product. Each item receives a unique NFT token containing its full provenance history, which can be verified by scanning the QR code or NFC tag.',
      helpful_votes: 142
    },
    {
      id: 'faq_002',
      category: 'integration',
      question: 'How do I integrate AuthiChain with my existing ERP system?',
      answer: 'AuthiChain provides REST APIs and webhooks compatible with major ERP platforms including SAP, Oracle, and Salesforce. Our SDK supports Node.js, Python, and Java. Contact enterprise@authichain.com for guided integration.',
      helpful_votes: 89
    },
    {
      id: 'faq_003',
      category: 'billing',
      question: 'What happens if I exceed my monthly scan limit?',
      answer: 'When you exceed your plan limit, additional scans are billed at $0.05 per scan on Starter, $0.03 on Professional, and $0.01 on Enterprise plans. You will receive an email alert at 80% and 100% usage.',
      helpful_votes: 67
    },
    {
      id: 'faq_004',
      category: 'security',
      question: 'Is my product data secure on the blockchain?',
      answer: 'AuthiChain uses Polygon and Base networks for token storage. Sensitive product details are encrypted off-chain with AES-256, while only hashed identifiers appear on-chain. All data is SOC2 Type II compliant.',
      helpful_votes: 95
    },
    {
      id: 'faq_005',
      category: 'getting_started',
      question: 'How long does it take to onboard my product catalog?',
      answer: 'Most customers complete catalog onboarding within 1-3 business days. Our bulk import tool supports CSV uploads of up to 100,000 SKUs. Enterprise customers receive a dedicated onboarding specialist.',
      helpful_votes: 53
    }
  ];

  const { category } = req.query;
  const filtered = category ? faqs.filter(f => f.category === category) : faqs;

  return res.status(200).json({
    success: true,
    faqs: filtered,
    total: filtered.length,
    categories: ['verification', 'integration', 'billing', 'security', 'getting_started', 'compliance'],
    contact: {
      email: 'support@authichain.com',
      enterprise: 'enterprise@authichain.com',
      response_times: { urgent: '2 hours', high: '8 hours', normal: '24 hours' }
    },
    docs_url: 'https://docs.authichain.com',
    status_page: 'https://status.authichain.com'
  });
}
