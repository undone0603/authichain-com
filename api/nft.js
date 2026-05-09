export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { product_id, owner_address, metadata_uri, blockchain = 'polygon' } = req.body || {};
    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }
    const token_id = Math.floor(Math.random() * 900000 + 100000);
    const tx_hash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return res.status(201).json({
      success: true,
      token_id: 'AC-NFT-' + token_id,
      product_id,
      blockchain,
      contract_address: blockchain === 'base'
        ? '0xBaseContractAddr...'
        : '0x742d35Cc6634C0532925a3b8D4a5e1',
      tx_hash,
      owner_address: owner_address || '0xAuthiChainVault...',
      metadata_uri: metadata_uri || 'ipfs://QmAuthiChain' + token_id,
      opensea_url: 'https://opensea.io/assets/matic/0x742d35/AC-NFT-' + token_id,
      minted_at: new Date().toISOString(),
      gas_used: 68420,
      status: 'confirmed'
    });
  }

  // GET - list NFTs
  const { owner_address, blockchain, product_id, limit = 20 } = req.query;

  const nfts = [
    {
      token_id: 'AC-NFT-10001',
      product_id: 'prod_001',
      product_name: 'Birkin 30 Noir',
      brand: 'Hermes',
      blockchain: 'polygon',
      contract_address: '0x742d35Cc6634C0532925a3b8D4a5e1',
      owner_address: '0xOwner1...abc',
      metadata_uri: 'ipfs://QmAuthiChain10001',
      image_url: 'https://authichain.com/nft/10001.png',
      opensea_url: 'https://opensea.io/assets/matic/0x742d35/10001',
      attributes: [
        { trait_type: 'Brand', value: 'Hermes' },
        { trait_type: 'Category', value: 'Handbags' },
        { trait_type: 'Authenticity Score', value: '99.8' },
        { trait_type: 'Country of Origin', value: 'France' }
      ],
      transfer_history: [
        { from: '0x0000...0000', to: '0xOwner1...abc', timestamp: '2024-01-15T10:00:00Z', tx_hash: '0xabc123...' }
      ],
      minted_at: '2024-01-15T10:00:00Z',
      last_transferred: '2024-01-15T10:00:00Z'
    },
    {
      token_id: 'AC-NFT-10002',
      product_id: 'prod_002',
      product_name: 'Submariner 116610LN',
      brand: 'Rolex',
      blockchain: 'polygon',
      contract_address: '0x742d35Cc6634C0532925a3b8D4a5e1',
      owner_address: '0xOwner2...def',
      metadata_uri: 'ipfs://QmAuthiChain10002',
      image_url: 'https://authichain.com/nft/10002.png',
      opensea_url: 'https://opensea.io/assets/matic/0x742d35/10002',
      attributes: [
        { trait_type: 'Brand', value: 'Rolex' },
        { trait_type: 'Category', value: 'Watches' },
        { trait_type: 'Authenticity Score', value: '100' },
        { trait_type: 'Country of Origin', value: 'Switzerland' }
      ],
      transfer_history: [
        { from: '0x0000...0000', to: '0xOwner2...def', timestamp: '2024-02-01T10:00:00Z', tx_hash: '0xdef456...' }
      ],
      minted_at: '2024-02-01T10:00:00Z',
      last_transferred: '2024-02-01T10:00:00Z'
    }
  ];

  let filtered = nfts;
  if (owner_address) filtered = filtered.filter(n => n.owner_address === owner_address);
  if (blockchain) filtered = filtered.filter(n => n.blockchain === blockchain);
  if (product_id) filtered = filtered.filter(n => n.product_id === product_id);
  filtered = filtered.slice(0, parseInt(limit));

  return res.status(200).json({
    success: true,
    nfts: filtered,
    total: filtered.length,
    supported_chains: ['polygon', 'base', 'ethereum'],
    contract_addresses: {
      polygon: '0x742d35Cc6634C0532925a3b8D4a5e1',
      base: '0xBaseContractAddr...'
    }
  });
}
