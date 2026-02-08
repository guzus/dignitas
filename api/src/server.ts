import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createPublicClient, http, isAddress, normalize } from 'viem';
import { mainnet } from 'viem/chains';
// Mock x402 for hackathon/demo purposes since package is not public
const x402Middleware = (config: any, price: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // In a real implementation, this would verify the payment
    // For demo, we just attach a fake payment ID
    (req as any).x402 = { paymentId: 'pay_' + Math.random().toString(36).substr(2, 9) };
    next();
  };
};

const createPaymentConfig = (config: any) => config;

import axios from 'axios';
import 'dotenv/config';

// ENS resolution client — uses Ethereum mainnet for ENS lookups
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com'),
});

/**
 * Resolve an ENS name to an address, or return the input if already an address.
 * Supports both "vitalik.eth" and "0x..." formats.
 */
async function resolveEnsName(nameOrAddress: string): Promise<string | null> {
  if (isAddress(nameOrAddress)) {
    return nameOrAddress.toLowerCase();
  }
  if (nameOrAddress.endsWith('.eth')) {
    try {
      const address = await ensClient.getEnsAddress({ name: normalize(nameOrAddress) });
      return address ? address.toLowerCase() : null;
    } catch {
      return null;
    }
  }
  return nameOrAddress.toLowerCase();
}

/**
 * Reverse-resolve an address to its primary ENS name.
 */
async function reverseResolveEns(address: string): Promise<string | null> {
  try {
    const ensName = await ensClient.getEnsName({ address: address as `0x${string}` });
    return ensName;
  } catch {
    return null;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const GRAPH_URL = process.env.GRAPH_ENGINE_URL || 'http://localhost:8000';
const QUERY_PRICE = '0.001'; // $0.001 per query

app.use(cors());
app.use(express.json());

// x402 payment config
const paymentConfig = createPaymentConfig({
  recipientAddress: process.env.TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000',
  network: 'base-sepolia',
  acceptedTokens: ['USDC']
});

// ============ FREE ENDPOINTS ============

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', price: QUERY_PRICE });
});

// ENS resolution endpoint — resolve ENS name to address or reverse-resolve address to ENS name
app.get('/ens/resolve/:nameOrAddress', async (req: Request, res: Response) => {
  const { nameOrAddress } = req.params;

  try {
    if (isAddress(nameOrAddress)) {
      // Reverse resolve: address -> ENS name
      const ensName = await reverseResolveEns(nameOrAddress);
      res.json({ address: nameOrAddress.toLowerCase(), ens_name: ensName });
    } else if (nameOrAddress.endsWith('.eth')) {
      // Forward resolve: ENS name -> address
      const address = await resolveEnsName(nameOrAddress);
      if (!address) {
        res.status(404).json({ error: 'ENS name not found' });
        return;
      }
      res.json({ address, ens_name: nameOrAddress });
    } else {
      res.status(400).json({ error: 'Invalid address or ENS name' });
    }
  } catch (e) {
    res.status(500).json({ error: 'ENS resolution failed' });
  }
});

app.get('/leaderboard', async (_req, res) => {
  try {
    const { data } = await axios.get(`${GRAPH_URL}/leaderboard`);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ============ PAID ENDPOINTS ============

// Apply x402 middleware to /paid routes
app.use('/paid', x402Middleware(paymentConfig, QUERY_PRICE));

// Discovery - find agents matching criteria
app.get('/paid/discover', async (req: Request, res: Response) => {
  const { min_score = 0, limit = 10 } = req.query;

  try {
    const { data } = await axios.get(`${GRAPH_URL}/discover`, {
      params: { min_score, limit }
    });

    res.json({
      ...data,
      query_cost: QUERY_PRICE,
      payment_id: (req as any).x402?.paymentId
    });
  } catch (e) {
    res.status(500).json({ error: 'Discovery failed' });
  }
});

// Score lookup - get specific agent's score (supports ENS names)
app.get('/paid/score/:address', async (req: Request, res: Response) => {
  const resolved = await resolveEnsName(req.params.address);
  if (!resolved) {
    res.status(404).json({ error: 'Could not resolve ENS name' });
    return;
  }
  const address = resolved;

  try {
    const { data } = await axios.get(`${GRAPH_URL}/scores/${address}`);

    res.json({
      ...data,
      query_cost: QUERY_PRICE,
      payment_id: (req as any).x402?.paymentId
    });
  } catch (e: any) {
    if (e.response?.status === 404) {
      res.status(404).json({ error: 'Agent not found' });
    } else {
      res.status(500).json({ error: 'Lookup failed' });
    }
  }
});

// Record interaction — supports ENS names as agent identifiers
app.post('/paid/interact', async (req: Request, res: Response) => {
  const { from_agent, to_agent, interaction_type } = req.body;

  // Resolve ENS names to addresses if needed
  const resolvedFrom = await resolveEnsName(from_agent);
  const resolvedTo = await resolveEnsName(to_agent);
  if (!resolvedFrom || !resolvedTo) {
    res.status(400).json({ error: 'Could not resolve ENS name for agent' });
    return;
  }

  try {
    await axios.post(`${GRAPH_URL}/interactions`, {
      from_agent: resolvedFrom,
      to_agent: resolvedTo,
      interaction_type
    });

    res.json({
      status: 'recorded',
      payment_id: (req as any).x402?.paymentId
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

// Smart discovery - find agents by query with LLM relevancy + PageRank
app.post('/paid/discover/smart', async (req: Request, res: Response) => {
  const {
    query,
    min_score = 0,
    limit = 10,
    pagerank_weight = 0.4,
    relevancy_weight = 0.6
  } = req.body;

  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  try {
    const { data } = await axios.post(`${GRAPH_URL}/discover/smart`, {
      query,
      min_score,
      limit,
      pagerank_weight,
      relevancy_weight
    });

    res.json({
      ...data,
      query_cost: QUERY_PRICE,
      payment_id: (req as any).x402?.paymentId
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Smart discovery failed' });
  }
});

// Register agent specification — supports ENS names as identifiers
app.post('/paid/agents/register', async (req: Request, res: Response) => {
  const { address, name, description, capabilities, tags, category, ens_name } = req.body;

  if (!address || !name) {
    res.status(400).json({ error: 'Address and name are required' });
    return;
  }

  // Resolve ENS name if provided instead of address
  const resolvedAddress = await resolveEnsName(address);
  if (!resolvedAddress) {
    res.status(400).json({ error: 'Could not resolve ENS name' });
    return;
  }

  try {
    const { data } = await axios.post(`${GRAPH_URL}/agents/register`, {
      address: resolvedAddress,
      name,
      description: description || '',
      capabilities: capabilities || [],
      tags: tags || [],
      category: category || 'general',
      ens_name: ens_name || (address.endsWith('.eth') ? address : undefined)
    });

    res.json({
      ...data,
      payment_id: (req as any).x402?.paymentId
    });
  } catch (e) {
    res.status(500).json({ error: 'Agent registration failed' });
  }
});

// Get agent specification — supports ENS name lookup
app.get('/paid/agents/:address/spec', async (req: Request, res: Response) => {
  const resolved = await resolveEnsName(req.params.address);
  if (!resolved) {
    res.status(404).json({ error: 'Could not resolve ENS name' });
    return;
  }
  const address = resolved;

  try {
    const { data } = await axios.get(`${GRAPH_URL}/agents/${address}/spec`);
    res.json({
      ...data,
      query_cost: QUERY_PRICE,
      payment_id: (req as any).x402?.paymentId
    });
  } catch (e: any) {
    if (e.response?.status === 404) {
      res.status(404).json({ error: 'Agent specification not found' });
    } else {
      res.status(500).json({ error: 'Failed to get agent spec' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║         DIGNITAS x402 API GATEWAY         ║
╠═══════════════════════════════════════════╣
║  Port: ${PORT}                               ║
║  Query Price: $${QUERY_PRICE}                      ║
║  Network: Base Sepolia                    ║
╚═══════════════════════════════════════════╝

FREE ENDPOINTS:
  GET  /health        - Health check
  GET  /leaderboard   - Top agents

PAID ENDPOINTS ($${QUERY_PRICE}/query):
  GET  /paid/discover       - Find agents
  GET  /paid/score/:address - Get agent score
  POST /paid/interact       - Record interaction
  `);
});
