// AuthiChain /api/demo - Enterprise demo request and sandbox access
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    // Return demo environment details
    return res.status(200).json({
      success: true,
      environment: 'sandbox',
      protocol: 'AuthiChain',
      demo: {
        description: 'AuthiChain Enterprise Demo Environment',
        features: [
          'Blockchain product verification',
          'NFT minting for authenticated products',
          'Batch verification (up to 100 products)',
          'QR code generation and scanning',
          'Supply chain provenance tracking',
          'METRC cannabis compliance (StrainChain)',
          'Government contract verification (GovChain)'
        ],
        sandbox_products: [
          { id: 'DEMO-001', name: 'Luxury Watch Alpha', brand: 'Demo Brand', verified: true },
          { id: 'DEMO-002', name: 'Premium Handbag Beta', brand: 'Demo Brand', verified: true },
          { id: 'DEMO-003', name: 'Pharmaceutical Sample', brand: 'Demo Pharma', verified: true }
        ],
        api_base: 'https://authichain.com/api',
        docs: 'https://authichain.com/docs'
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, name, email, use_case, volume } = req.body || {};

  if (!email || !company) {
    return res.status(400).json({ error: 'email and company are required' });
  }

  // Create demo account
  const demo_id = `DEMO-${Date.now()}`;
  const sandbox_key = `sk_sandbox_${Buffer.from(email + demo_id).toString('base64').slice(0, 32)}`;

  return res.status(200).json({
    success: true,
    message: 'Demo account created - check your email for access details',
    demo_id,
    company,
    email,
    sandbox_key,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    features: ['batch_verify', 'nft_mint', 'qr_generate', 'analytics'],
    limits: { verifications_per_day: 1000, nft_mints_per_day: 100 },
    protocol: 'AuthiChain'
  });
}
