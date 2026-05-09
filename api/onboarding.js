import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const STEPS = [
  { step: 1, key: 'add_first_product', label: 'Add Your First Product', description: 'Register a product with a unique serial number for blockchain authentication.' },
  { step: 2, key: 'generate_qr', label: 'Generate Authentication QR', description: 'Create a scannable QR code linked to your product\'s blockchain certificate.' },
  { step: 3, key: 'first_scan', label: 'Test Your First Scan', description: 'Scan the QR code to verify the authentication flow works end-to-end.' },
  { step: 4, key: 'invite_team', label: 'Invite a Team Member', description: 'Add team members to collaborate on product authentication.' },
  { step: 5, key: 'connect_integration', label: 'Connect an Integration', description: 'Connect AuthiChain to your existing inventory or ERP system.' },
  { step: 6, key: 'select_plan', label: 'Select a Plan', description: 'Upgrade to unlock bulk authentication, NFT certificates, and enterprise features.' }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    const { data: progress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const completed = progress?.completed_steps || [];
    const steps = STEPS.map(s => ({
      ...s,
      completed: completed.includes(s.key),
      is_current: !completed.includes(s.key) && completed.length === s.step - 1
    }));

    const percent = Math.round((completed.length / STEPS.length) * 100);
    const next_step = steps.find(s => !s.completed) || null;
    const is_complete = completed.length === STEPS.length;

    return res.status(200).json({
      success: true,
      percent_complete: percent,
      is_complete,
      steps,
      next_step,
      show_upgrade_prompt: completed.length >= 3 && !is_complete
    });
  }

  if (req.method === 'POST') {
    const { step_key } = req.body;
    if (!step_key) return res.status(400).json({ error: 'step_key is required' });
    if (!STEPS.find(s => s.key === step_key)) return res.status(400).json({ error: 'Invalid step_key' });

    const { data: existing } = await supabase
      .from('onboarding_progress')
      .select('completed_steps')
      .eq('user_id', user.id)
      .single();

    const completed = existing?.completed_steps || [];
    if (!completed.includes(step_key)) completed.push(step_key);

    const { error: upsertErr } = await supabase
      .from('onboarding_progress')
      .upsert({ user_id: user.id, completed_steps: completed, updated_at: new Date().toISOString() });

    if (upsertErr) return res.status(500).json({ error: upsertErr.message });

    return res.status(200).json({
      success: true,
      step_completed: step_key,
      percent_complete: Math.round((completed.length / STEPS.length) * 100),
      show_upgrade_prompt: completed.length >= 3
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
