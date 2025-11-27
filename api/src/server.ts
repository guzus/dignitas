import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
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

// Score lookup - get specific agent's score
app.get('/paid/score/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

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

// Record interaction (for demo - normally from indexer)
app.post('/paid/interact', async (req: Request, res: Response) => {
  const { from_agent, to_agent, interaction_type } = req.body;

  try {
    await axios.post(`${GRAPH_URL}/interactions`, {
      from_agent,
      to_agent,
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

// Register agent specification
app.post('/paid/agents/register', async (req: Request, res: Response) => {
  const { address, name, description, capabilities, tags, category } = req.body;

  if (!address || !name) {
    res.status(400).json({ error: 'Address and name are required' });
    return;
  }

  try {
    const { data } = await axios.post(`${GRAPH_URL}/agents/register`, {
      address,
      name,
      description: description || '',
      capabilities: capabilities || [],
      tags: tags || [],
      category: category || 'general'
    });

    res.json({
      ...data,
      payment_id: (req as any).x402?.paymentId
    });
  } catch (e) {
    res.status(500).json({ error: 'Agent registration failed' });
  }
});

// Get agent specification
app.get('/paid/agents/:address/spec', async (req: Request, res: Response) => {
  const { address } = req.params;

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
