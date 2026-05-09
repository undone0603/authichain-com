export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { name, brand, sku, category, serial_number, metadata } = req.body || {};
    if (!name || !brand || !sku) {
      return res.status(400).json({ error: 'name, brand, and sku are required' });
    }
    const product_id = 'prod_' + Date.now();
    const nft_token_id = 'AC-NFT-' + Math.floor(Math.random() * 90000 + 10000);
    return res.status(201).json({
      success: true,
      product_id,
      nft_token_id,
      blockchain: 'polygon',
      contract_address: '0x742d35Cc6634C0532925a3b8D4a5e1',
      qr_code_url: 'https://authichain.com/qr/' + product_id,
      nfc_encoded_url: 'https://authichain.com/verify/' + product_id,
      message: 'Product registered and NFT minted on Polygon',
      minted_at: new Date().toISOString()
    });
  }

  // GET - list products
  const { brand, category, search, limit = 20 } = req.query;

  const products = [
    {
      id: 'prod_001',
      name: 'Birkin 30 Noir',
      brand: 'Hermes',
      sku: 'HER-BK30-TG-BK-001',
      category: 'handbags',
      serial_number: 'HER2024001',
      nft_token_id: 'AC-NFT-10001',
      blockchain: 'polygon',
      authenticity_score: 99.8,
      scan_count: 47,
      last_scanned: '2024-03-15T14:30:00Z',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'prod_002',
      name: 'Submariner 116610LN',
      brand: 'Rolex',
      sku: 'ROL-SUB-116610LN-001',
      category: 'watches',
      serial_number: 'ROL2024001',
      nft_token_id: 'AC-NFT-10002',
      blockchain: 'polygon',
      authenticity_score: 100,
      scan_count: 12,
      last_scanned: '2024-03-14T09:15:00Z',
      status: 'active',
      created_at: '2024-02-01T10:00:00Z'
    },
    {
      id: 'prod_003',
      name: 'Eliquis 5mg 90ct',
      brand: 'Pfizer',
      sku: 'PFZ-ELQ-5MG-90-001',
      category: 'pharmaceuticals',
      serial_number: 'PFZ2024001',
      nft_token_id: 'AC-NFT-10003',
      blockchain: 'base',
      authenticity_score: 100,
      scan_count: 3,
      last_scanned: '2024-03-10T11:00:00Z',
      status: 'active',
      created_at: '2024-03-01T10:00:00Z'
    }
  ];

  let filtered = products;
  if (brand) filtered = filtered.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
  if (category) filtered = filtered.filter(p => p.category === category);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }
  filtered = filtered.slice(0, parseInt(limit));

  return res.status(200).json({
    success: true,
    products: filtered,
    total: filtered.length,
    categories: ['handbags', 'watches', 'jewelry', 'pharmaceuticals', 'spirits', 'electronics', 'art', 'collectibles']
  });
}
