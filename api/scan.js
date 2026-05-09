export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { product_id, user_id, location, device_type, scan_type } = req.body || {};
    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }
    return res.status(200).json({
      success: true,
      scan_id: 'scan_' + Date.now(),
      product_id,
      scan_type: scan_type || 'qr_code',
      authentic: true,
      timestamp: new Date().toISOString(),
      message: 'Scan recorded successfully'
    });
  }

  // GET - scan history and analytics
  const { product_id, user_id, from_date, to_date, limit = 20 } = req.query;

  const scans = [
    {
      id: 'scan_001',
      product_id: 'prod_001',
      user_id: 'user_123',
      scan_type: 'qr_code',
      device_type: 'mobile',
      location: { country: 'US', city: 'New York', lat: 40.7128, lng: -74.0060 },
      authentic: true,
      result: 'verified',
      ip_address: '192.168.x.x',
      user_agent: 'Mozilla/5.0 iPhone',
      timestamp: '2024-03-15T14:30:00Z'
    },
    {
      id: 'scan_002',
      product_id: 'prod_001',
      user_id: null,
      scan_type: 'nfc',
      device_type: 'mobile',
      location: { country: 'FR', city: 'Paris', lat: 48.8566, lng: 2.3522 },
      authentic: true,
      result: 'verified',
      ip_address: '10.0.x.x',
      user_agent: 'Mozilla/5.0 Android',
      timestamp: '2024-03-14T09:15:00Z'
    },
    {
      id: 'scan_003',
      product_id: 'prod_002',
      user_id: 'user_456',
      scan_type: 'qr_code',
      device_type: 'desktop',
      location: { country: 'JP', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      authentic: false,
      result: 'counterfeit_flagged',
      ip_address: '172.16.x.x',
      user_agent: 'Mozilla/5.0 Windows',
      timestamp: '2024-03-13T20:00:00Z'
    }
  ];

  let filtered = scans;
  if (product_id) filtered = filtered.filter(s => s.product_id === product_id);
  if (user_id) filtered = filtered.filter(s => s.user_id === user_id);
  filtered = filtered.slice(0, parseInt(limit));

  const scan_stats = {
    total_scans: filtered.length,
    authentic_scans: filtered.filter(s => s.authentic).length,
    flagged_scans: filtered.filter(s => !s.authentic).length,
    unique_countries: [...new Set(filtered.map(s => s.location.country))].length,
    scan_types: {
      qr_code: filtered.filter(s => s.scan_type === 'qr_code').length,
      nfc: filtered.filter(s => s.scan_type === 'nfc').length
    }
  };

  return res.status(200).json({
    success: true,
    scans: filtered,
    stats: scan_stats
  });
}
