/**
 * AuthiChain.com API - Single catch-all serverless function
 * Routes all /api/* requests to the correct handler.
 * Keeps Vercel Hobby plan under the 12-function limit.
 */
const url = require('url');

const handlers = {
  analytics:    () => require('./analytics'),
  badges:       () => require('./badges'),
  batch:        () => require('./batch'),
  certificate:  () => require('./certificate'),
  checkout:     () => require('./checkout'),
  contact:      () => require('./contact'),
  demo:         () => require('./demo'),
  digest:       () => require('./digest'),
  enterprise:   () => require('./enterprise'),
  leaderboard:  () => require('./leaderboard'),
  marketplace:  () => require('./marketplace'),
  milestone:    () => require('./milestone'),
  nft:          () => require('./nft'),
  onboarding:   () => require('./onboarding'),
  partner:      () => require('./partner'),
  plans:        () => require('./plans'),
  pricing:      () => require('./pricing'),
  product:      () => require('./product'),
  referral:     () => require('./referral'),
  retention:    () => require('./retention'),
  scan:         () => require('./scan'),
  streaks:      () => require('./streaks'),
  subscribe:    () => require('./subscribe'),
  support:      () => require('./support'),
  trial:        () => require('./trial'),
  upgrade:      () => require('./upgrade'),
  verify:       () => require('./verify'),
  webhook:      () => require('./webhook'),
  waitlist:     () => require('./waitlist'),
  newsletter:   () => require('./newsletter'),
  status:       () => require('./status'),
  'social-proof': () => require('./social-proof'),
  testimonials: () => require('./testimonials'),
  affiliate:    () => require('./affiliate'),
  notification: () => require('./notification'),
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://authichain.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parsed = url.parse(req.url);
  const parts = parsed.pathname.replace(/^\/api\//, '').split('/');
  const segment = parts[0];

  if (segment === 'health') {
    return res.status(200).json({ ok: true, ts: new Date().toISOString(), site: 'authichain.com' });
  }

  const loader = handlers[segment];
  if (!loader) {
    return res.status(404).json({ error: `Unknown API route: ${segment}` });
  }

  try {
    const handler = loader();
    const fn = handler.default || handler;
    return await fn(req, res);
  } catch (err) {
    console.error(`[AuthiChain API] /${segment} error:`, err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
