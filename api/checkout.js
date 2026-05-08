// Vercel Serverless Function: /api/checkout
// AuthiChain Stripe Checkout Session creator
// POST { plan: 'starter' | 'professional' | 'enterprise', email?: string }

const PLANS = {
  starter: { name: 'AuthiChain Starter', amount: 4900, currency: 'usd', interval: 'month' },
  professional: { name: 'AuthiChain Professional', amount: 14900, currency: 'usd', interval: 'month' },
  enterprise: { name: 'AuthiChain Enterprise', amount: 49900, currency: 'usd', interval: 'month' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://authichain.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' });
  const { plan = 'professional', email } = req.body || {};
  const cfg = PLANS[plan];
  if (!cfg) return res.status(400).json({ error: 'Invalid plan' });
  try {
    const payload = {
      payment_method_types: ['card'],
      mode: 'subscription',
      metadata: { plan, source: 'authichain' },
      success_url: `https://authichain.com/?checkout=success&plan=${plan}`,
      cancel_url: 'https://authichain.com/?checkout=cancelled',
      line_items: [{ price_data: { currency: cfg.currency, product_data: { name: cfg.name }, unit_amount: cfg.amount, recurring: { interval: cfg.interval } }, quantity: 1 }],
    };
    if (email) payload.customer_email = email;
    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(flatten(payload)).toString(),
    });
    const session = await resp.json();
    if (!resp.ok) return res.status(400).json({ error: session.error?.message || 'Stripe error' });
    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function flatten(obj, prefix = '') {
  const r = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v == null) continue;
    if (typeof v === 'object' && !Array.isArray(v)) Object.assign(r, flatten(v, key));
    else if (Array.isArray(v)) v.forEach((item, i) => { if (typeof item === 'object') Object.assign(r, flatten(item, `${key}[${i}]`)); else r[`${key}[${i}]`] = item; });
    else r[key] = String(v);
  }
  return r;
}
