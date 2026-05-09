export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { period = '30d', brand_id, category } = req.query;

  const periodMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  const days = periodMap[period] || 30;

  const analytics = {
    period,
    summary: {
      total_scans: 14832,
      authentic_verifications: 14601,
      counterfeit_flags: 231,
      authenticity_rate: 98.44,
      unique_products: 3421,
      active_brands: 47,
      new_products_registered: 284,
      nfts_minted: 284
    },
    scan_trends: [
      { date: '2024-03-01', scans: 412, authentic: 405, flagged: 7 },
      { date: '2024-03-08', scans: 489, authentic: 480, flagged: 9 },
      { date: '2024-03-15', scans: 534, authentic: 528, flagged: 6 },
      { date: '2024-03-22', scans: 601, authentic: 591, flagged: 10 },
      { date: '2024-03-29', scans: 672, authentic: 662, flagged: 10 }
    ],
    geo_distribution: [
      { country: 'US', country_name: 'United States', scan_count: 5821, pct: 39.2 },
      { country: 'FR', country_name: 'France', scan_count: 2341, pct: 15.8 },
      { country: 'JP', country_name: 'Japan', scan_count: 1893, pct: 12.8 },
      { country: 'DE', country_name: 'Germany', scan_count: 1205, pct: 8.1 },
      { country: 'GB', country_name: 'United Kingdom', scan_count: 987, pct: 6.7 },
      { country: 'OTHER', country_name: 'Other', scan_count: 2585, pct: 17.4 }
    ],
    top_categories: [
      { category: 'handbags', scans: 4231, authenticity_rate: 98.1 },
      { category: 'watches', scans: 3812, authenticity_rate: 99.2 },
      { category: 'pharmaceuticals', scans: 2901, authenticity_rate: 99.9 },
      { category: 'spirits', scans: 1543, authenticity_rate: 96.8 },
      { category: 'electronics', scans: 1201, authenticity_rate: 97.5 }
    ],
    device_breakdown: {
      mobile: { count: 11245, pct: 75.8 },
      desktop: { count: 2841, pct: 19.2 },
      tablet: { count: 746, pct: 5.0 }
    },
    scan_method: {
      qr_code: { count: 10382, pct: 70.0 },
      nfc: { count: 3891, pct: 26.2 },
      manual_entry: { count: 559, pct: 3.8 }
    },
    counterfeit_hotspots: [
      { country: 'CN', country_name: 'China', flagged: 89, category: 'handbags' },
      { country: 'TR', country_name: 'Turkey', flagged: 43, category: 'watches' },
      { country: 'IN', country_name: 'India', flagged: 31, category: 'pharmaceuticals' }
    ],
    revenue_protected: 12850000,
    currency: 'USD'
  };

  return res.status(200).json({
    success: true,
    analytics,
    generated_at: new Date().toISOString(),
    periods_available: ['7d', '30d', '90d', '1y']
  });
}
