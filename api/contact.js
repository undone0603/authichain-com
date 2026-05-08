// Vercel Serverless Function: /api/contact
// AuthiChain enterprise contact/lead capture
// POST { name, email, company, message, plan? }
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://authichain.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, email, company, message, plan } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const leadId = `AC-${Date.now()}`;
  const timestamp = new Date().toISOString();
  // Store lead in Supabase
  if (supabaseUrl && supabaseKey) {
    await fetch(`${supabaseUrl}/rest/v1/authichain_leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ lead_id: leadId, name, email, company: company || '', message: message || '', plan: plan || 'enterprise', status: 'new', created_at: timestamp }),
    });
  }
  // Send notification email via Resend
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'leads@authichain.com',
        to: ['authichain@gmail.com'],
        subject: `New Enterprise Lead: ${name} from ${company || 'Unknown'}`,
        html: `<h2>New AuthiChain Enterprise Lead</h2><p><strong>Lead ID:</strong> ${leadId}</p><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Company:</strong> ${company || 'N/A'}</p><p><strong>Plan Interest:</strong> ${plan || 'Enterprise'}</p><p><strong>Message:</strong> ${message || 'N/A'}</p><p><strong>Submitted:</strong> ${timestamp}</p>`,
      }),
    });
  }
  return res.status(200).json({ success: true, leadId, message: 'Thank you! Our team will contact you within 24 hours.' });
}
