// Vercel Serverless Function: /api/webhook
// AuthiChain Stripe webhook handler for subscription lifecycle
export const config = { api: { bodyParser: false } };
async function buffer(r) { const c = []; for await (const chunk of r) c.push(typeof chunk==='string'?Buffer.from(chunk):chunk); return Buffer.concat(c); }
async function dbUpsert(table, data, url, key) { return (await fetch(`${url}/rest/v1/${table}`, { method:'POST', headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${key}`,'Prefer':'resolution=merge-duplicates'}, body:JSON.stringify(data) })).ok; }
async function dbUpdate(table, match, data, url, key) { const p=new URLSearchParams(Object.entries(match).map(([k,v])=>[k,`eq.${v}`])); return (await fetch(`${url}/rest/v1/${table}?${p}`, { method:'PATCH', headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${key}`}, body:JSON.stringify(data) })).ok; }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!webhookSecret) return res.status(500).json({ error: 'Webhook secret not configured' });
  let event;
  try {
    const raw = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const crypto = await import('crypto');
    const parts = sig.split(',');
    const ts = parts.find(p=>p.startsWith('t=')).split('=')[1];
    const hash = parts.find(p=>p.startsWith('v1=')).split('=').slice(1).join('=');
    const expected = crypto.default.createHmac('sha256',webhookSecret).update(`${ts}.${raw}`).digest('hex');
    if (expected !== hash) return res.status(400).json({ error: 'Invalid signature' });
    event = JSON.parse(raw.toString());
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  if (!supabaseUrl || !supabaseKey) { console.log('Stripe event (no DB):', event.type); return res.status(200).json({ received: true }); }
  try {
    const now = new Date().toISOString();
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      await dbUpsert('authichain_subscriptions', { stripe_customer_id:s.customer, stripe_subscription_id:s.subscription, email:s.customer_details?.email||s.customer_email, plan:s.metadata?.plan||'professional', status:'active', activated_at:now, updated_at:now }, supabaseUrl, supabaseKey);
    } else if (event.type === 'customer.subscription.updated') {
      const s = event.data.object;
      await dbUpdate('authichain_subscriptions', { stripe_subscription_id:s.id }, { status:s.status, plan:s.items?.data?.[0]?.price?.nickname||'professional', updated_at:now }, supabaseUrl, supabaseKey);
    } else if (event.type === 'customer.subscription.deleted') {
      const s = event.data.object;
      await dbUpdate('authichain_subscriptions', { stripe_subscription_id:s.id }, { status:'cancelled', cancelled_at:now, updated_at:now }, supabaseUrl, supabaseKey);
    } else if (event.type === 'invoice.payment_failed') {
      const inv = event.data.object;
      await dbUpdate('authichain_subscriptions', { stripe_subscription_id:inv.subscription }, { status:'past_due', updated_at:now }, supabaseUrl, supabaseKey);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Processing error' });
  }
  return res.status(200).json({ received: true });
}
