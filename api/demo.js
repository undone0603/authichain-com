// AuthiChain /api/demo - Enterprise demo request and sandbox access
import { Resend } from 'resend';

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
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Send email with sandbox credentials
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'onboarding@authichain.com',
      to: email,
      subject: `🔐 Your AuthiChain Demo Access is Ready`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #00d4ff, #7c3aed); padding: 30px; border-radius: 8px; color: white; text-align: center; }
              .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin-top: 20px; }
              .credentials { background: white; padding: 20px; border-left: 4px solid #00d4ff; font-family: 'Courier New', monospace; margin: 20px 0; }
              .label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
              .value { font-size: 14px; color: #0f172a; word-break: break-all; }
              .footer { color: #64748b; font-size: 12px; margin-top: 30px; text-align: center; }
              .button { background: #00d4ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 20px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">AuthiChain Demo Ready</h1>
                <p style="margin: 10px 0 0 0;">Your sandbox environment is activated</p>
              </div>
              
              <div class="content">
                <p>Hello,</p>
                <p>Thank you for your interest in AuthiChain! Your enterprise demo sandbox has been created and is ready to use.</p>
                
                <p><strong>Company:</strong> ${company}</p>
                
                <h3 style="color: #00d4ff; margin-top: 30px;">Your Sandbox Credentials</h3>
                
                <div class="credentials">
                  <div class="label">Demo ID</div>
                  <div class="value">${demo_id}</div>
                </div>
                
                <div class="credentials">
                  <div class="label">Sandbox API Key</div>
                  <div class="value">${sandbox_key}</div>
                </div>
                
                <div class="credentials">
                  <div class="label">Expires At</div>
                  <div class="value">${expires_at.toUTCString()}</div>
                </div>
                
                <h3 style="color: #1e293b; margin-top: 30px;">Available Features</h3>
                <ul style="color: #475569;">
                  <li>Batch verification (up to 100 products/request)</li>
                  <li>NFT certificate minting (Polygon testnet)</li>
                  <li>QR code generation and scanning</li>
                  <li>Supply chain provenance tracking</li>
                  <li>METRC cannabis compliance (StrainChain)</li>
                  <li>Government contract verification (GovChain)</li>
                  <li>Full analytics dashboard</li>
                </ul>
                
                <p style="margin-top: 30px;">
                  <strong>Rate Limits:</strong>
                  <ul style="color: #475569; margin: 10px 0;">
                    <li>1,000 verifications per day</li>
                    <li>100 NFT mints per day</li>
                  </ul>
                </p>
                
                <a href="https://authichain.com/sandbox?demo_id=${demo_id}" class="button">Access Your Sandbox →</a>
                
                <h3 style="color: #1e293b; margin-top: 30px;">Next Steps</h3>
                <ol style="color: #475569;">
                  <li>Log in to your sandbox at https://authichain.com/sandbox</li>
                  <li>Review the API documentation at https://authichain.com/docs</li>
                  <li>Try authenticating a sample product</li>
                  <li>Schedule a technical walkthrough with our team</li>
                </ol>
                
                <p style="margin-top: 30px; color: #64748b;">
                  <strong>Questions?</strong> Reply to this email or contact us at <a href="mailto:support@authichain.com" style="color: #00d4ff; text-decoration: none;">support@authichain.com</a>
                </p>
              </div>
              
              <div class="footer">
                <p>© 2026 AuthiChain. All rights reserved.</p>
                <p>This demo sandbox will expire on ${expires_at.toLocaleDateString()}. Contact support for extensions.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });
  } catch (emailErr) {
    console.error('Failed to send demo credentials email:', emailErr);
    // Continue with response even if email fails - user still gets credentials
  }

  return res.status(200).json({
    success: true,
    message: 'Demo account created - check your email for access details',
    demo_id,
    company,
    email,
    sandbox_key,
    expires_at: expires_at.toISOString(),
    features: ['batch_verify', 'nft_mint', 'qr_generate', 'analytics'],
    limits: { verifications_per_day: 1000, nft_mints_per_day: 100 },
    protocol: 'AuthiChain'
  });
}
