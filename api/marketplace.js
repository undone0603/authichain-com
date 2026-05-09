export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { category, industry, verified_only, search, limit = 20 } = req.query;

  const listings = [
    {
      id: 'mkt_001',
      brand: 'Hermès',
      industry: 'luxury',
      category: 'handbags',
      product_name: 'Birkin 30 - Togo Leather',
      sku: 'HER-BK30-TG-BK',
      description: 'Authenticated Hermès Birkin 30 in black Togo leather with palladium hardware',
      authichain_verified: true,
      nft_token_id: 'AC-NFT-0001',
      blockchain: 'polygon',
      contract_address: '0xABC123...',
      authenticity_score: 99.8,
      chain_of_custody: ['Hermès Paris', 'Authorized Retailer', 'Current Owner'],
      asking_price: 18500,
      currency: 'USD',
      condition: 'excellent',
      seller_verified: true,
      listed_at: '2024-03-01T00:00:00Z'
    },
    {
      id: 'mkt_002',
      brand: 'Rolex',
      industry: 'luxury',
      category: 'watches',
      product_name: 'Submariner Date 116610LN',
      sku: 'ROL-SUB-116610LN',
      description: 'Rolex Submariner Date with full authentication history on AuthiChain',
      authichain_verified: true,
      nft_token_id: 'AC-NFT-0002',
      blockchain: 'polygon',
      contract_address: '0xDEF456...',
      authenticity_score: 100,
      chain_of_custody: ['Rolex Geneva', 'Official Dealer', 'First Owner', 'Current Owner'],
      asking_price: 14200,
      currency: 'USD',
      condition: 'like_new',
      seller_verified: true,
      listed_at: '2024-03-05T00:00:00Z'
    },
    {
      id: 'mkt_003',
      brand: 'Pfizer',
      industry: 'pharmaceutical',
      category: 'medications',
      product_name: 'Eliquis 5mg (90 tablets)',
      sku: 'PFZ-ELQ-5MG-90',
      description: 'FDA-registered pharmaceutical with full supply chain verification',
      authichain_verified: true,
      nft_token_id: 'AC-NFT-0003',
      blockchain: 'base',
      contract_address: '0xGHI789...',
      authenticity_score: 100,
      chain_of_custody: ['Pfizer Manufacturing', 'FDA Registered Distributor', 'Licensed Pharmacy'],
      asking_price: null,
      currency: 'USD',
      condition: 'sealed',
      seller_verified: true,
      listed_at: '2024-02-20T00:00:00Z'
    }
  ];

  let filtered = listings;
  if (category) filtered = filtered.filter(l => l.category === category);
  if (industry) filtered = filtered.filter(l => l.industry === industry);
  if (verified_only === 'true') filtered = filtered.filter(l => l.authichain_verified);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.brand.toLowerCase().includes(q) ||
      l.product_name.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  }
  filtered = filtered.slice(0, parseInt(limit));

  return res.status(200).json({
    success: true,
    listings: filtered,
    total: filtered.length,
    industries: ['luxury', 'pharmaceutical', 'electronics', 'automotive', 'art', 'collectibles'],
    categories: ['handbags', 'watches', 'jewelry', 'medications', 'spirits', 'sneakers']
  });
}
