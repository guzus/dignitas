import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import {
  createPublicClient,
  http,
  formatEther,
  getAddress,
  isAddress,
} from 'viem';
import { baseSepolia, mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;
const GRAPH_URL = process.env.GRAPH_ENGINE_URL || 'http://localhost:8000';
const QUERY_PRICE_WEI = BigInt(process.env.QUERY_PRICE_WEI || '10000000000000'); // 0.00001 ETH
const TREASURY_ADDRESS = (process.env.TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Base Sepolia public client for on-chain tx verification
const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
});

// Mainnet client for ENS name resolution (ENS names live on L1)
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.MAINNET_RPC || 'https://cloudflare-eth.com'),
});

app.use(cors());
app.use(express.json());

// ============ REAL PAYMENT VERIFICATION MIDDLEWARE ============

interface PaymentInfo {
  txHash: string;
  from: string;
  value: string;
  verified: boolean;
  blockNumber: string;
}

/**
 * Middleware that verifies a real Base Sepolia transaction.
 *
 * Clients include X-Payment-TxHash header with the hash of an ETH transfer
 * to the treasury or contract address. The middleware checks on-chain that the
 * tx exists, is to the right recipient, and has sufficient value.
 */
const verifyPayment = (minValue: bigint) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const txHash = req.headers['x-payment-txhash'] as string;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (txHash && txHash !== 'none') {
      try {
        const tx = await baseSepoliaClient.getTransaction({
          hash: txHash as `0x${string}`,
        });

        if (!tx) {
          res.status(402).json({ error: 'Transaction not found on Base Sepolia' });
          return;
        }

        // Verify the tx is to the treasury or contract address
        const validRecipient =
          tx.to?.toLowerCase() === TREASURY_ADDRESS.toLowerCase() ||
          tx.to?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase();

        if (!validRecipient) {
          res.status(402).json({
            error: 'Transaction recipient is not the Dignitas treasury or contract',
            expected: [TREASURY_ADDRESS, CONTRACT_ADDRESS],
            got: tx.to,
          });
          return;
        }

        if (tx.value < minValue) {
          res.status(402).json({
            error: 'Insufficient payment amount',
            required: formatEther(minValue) + ' ETH',
            sent: formatEther(tx.value) + ' ETH',
          });
          return;
        }

        (req as any).payment = {
          txHash,
          from: tx.from,
          value: formatEther(tx.value),
          verified: true,
          blockNumber: tx.blockNumber?.toString() || '0',
        } as PaymentInfo;
        next();
        return;
      } catch (err: any) {
        // Tx might be pending; allow with unverified flag
        console.warn(`Payment verification warning: ${err.message}`);
        (req as any).payment = {
          txHash,
          from: walletAddress || 'unknown',
          value: '0',
          verified: false,
          blockNumber: '0',
        } as PaymentInfo;
        next();
        return;
      }
    }

    // Wallet address without tx hash - unverified access (demo mode)
    if (walletAddress) {
      (req as any).payment = {
        txHash: 'none',
        from: walletAddress,
        value: '0',
        verified: false,
        blockNumber: '0',
      } as PaymentInfo;
      next();
      return;
    }

    // No payment info provided
    res.status(402).json({
      error: 'Payment required',
      message: 'Send ETH to the treasury on Base Sepolia and include the tx hash in X-Payment-TxHash header',
      queryPrice: formatEther(minValue) + ' ETH',
      treasury: TREASURY_ADDRESS,
      contract: CONTRACT_ADDRESS,
      network: 'Base Sepolia (chain ID 84532)',
    });
  };
};

// ============ ENS RESOLUTION ============

async function resolveEns(nameOrAddress: string): Promise<{
  address: string | null;
  ensName: string | null;
}> {
  try {
    if (nameOrAddress.endsWith('.eth')) {
      const address = await mainnetClient.getEnsAddress({
        name: normalize(nameOrAddress),
      });
      return { address: address || null, ensName: nameOrAddress };
    } else if (isAddress(nameOrAddress)) {
      const name = await mainnetClient.getEnsName({
        address: getAddress(nameOrAddress),
      });
      return { address: nameOrAddress, ensName: name || null };
    }
  } catch {
    // ENS resolution failed silently
  }
  return { address: null, ensName: null };
}

// ============ FREE ENDPOINTS ============

app.get('/health', async (_req, res) => {
  let blockNumber: string | null = null;
  try {
    const bn = await baseSepoliaClient.getBlockNumber();
    blockNumber = bn.toString();
  } catch {}

  res.json({
    status: 'ok',
    network: 'base-sepolia',
    chainId: baseSepolia.id,
    queryPrice: formatEther(QUERY_PRICE_WEI) + ' ETH',
    treasury: TREASURY_ADDRESS,
    contract: CONTRACT_ADDRESS,
    latestBlock: blockNumber,
  });
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

// ENS resolution endpoint
app.get('/ens/resolve/:nameOrAddress', async (req, res) => {
  const { nameOrAddress } = req.params;
  const result = await resolveEns(nameOrAddress);
  res.json(result);
});

// Batch ENS resolution
app.post('/ens/batch', async (req, res) => {
  const { addresses } = req.body;
  if (!Array.isArray(addresses)) {
    res.status(400).json({ error: 'addresses must be an array' });
    return;
  }

  const results: Record<string, string | null> = {};
  await Promise.allSettled(
    addresses.slice(0, 50).map(async (addr: string) => {
      const { ensName } = await resolveEns(addr);
      results[addr.toLowerCase()] = ensName;
    })
  );
  res.json({ names: results });
});

// Transaction verification endpoint
app.get('/tx/:hash', async (req, res) => {
  try {
    const hash = req.params.hash as `0x${string}`;
    const tx = await baseSepoliaClient.getTransaction({ hash });
    const receipt = await baseSepoliaClient.getTransactionReceipt({ hash });

    res.json({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: formatEther(tx.value),
      blockNumber: tx.blockNumber?.toString(),
      status: receipt.status,
      gasUsed: receipt.gasUsed.toString(),
      explorer: `https://sepolia.basescan.org/tx/${tx.hash}`,
    });
  } catch {
    res.status(404).json({ error: 'Transaction not found', hash: req.params.hash });
  }
});

// ============ PAID ENDPOINTS ============

app.use('/paid', verifyPayment(QUERY_PRICE_WEI));

app.get('/paid/discover', async (req: Request, res: Response) => {
  const { min_score = 0, limit = 10 } = req.query;
  const payment = (req as any).payment as PaymentInfo;

  try {
    const { data } = await axios.get(`${GRAPH_URL}/discover`, {
      params: { min_score, limit }
    });

    res.json({
      ...data,
      payment: {
        txHash: payment.txHash,
        verified: payment.verified,
        from: payment.from,
        network: 'base-sepolia',
        explorer: payment.txHash !== 'none'
          ? `https://sepolia.basescan.org/tx/${payment.txHash}`
          : null,
      },
    });
  } catch {
    res.status(500).json({ error: 'Discovery failed' });
  }
});

app.get('/paid/score/:address', async (req: Request, res: Response) => {
  let { address } = req.params;
  const payment = (req as any).payment as PaymentInfo;

  // Support ENS name lookup
  if (address.endsWith('.eth')) {
    const { address: resolved } = await resolveEns(address);
    if (resolved) {
      address = resolved;
    } else {
      res.status(404).json({ error: `Could not resolve ENS name: ${address}` });
      return;
    }
  }

  try {
    const { data } = await axios.get(`${GRAPH_URL}/scores/${address}`);
    const { ensName } = await resolveEns(address);

    res.json({
      ...data,
      ensName,
      payment: {
        txHash: payment.txHash,
        verified: payment.verified,
        network: 'base-sepolia',
      },
    });
  } catch (e: any) {
    if (e.response?.status === 404) {
      res.status(404).json({ error: 'Agent not found' });
    } else {
      res.status(500).json({ error: 'Lookup failed' });
    }
  }
});

app.post('/paid/interact', async (req: Request, res: Response) => {
  const { from_agent, to_agent, interaction_type, tx_hash } = req.body;
  const payment = (req as any).payment as PaymentInfo;

  try {
    await axios.post(`${GRAPH_URL}/interactions`, {
      from_agent,
      to_agent,
      interaction_type,
      tx_hash: tx_hash || payment.txHash,
    });

    res.json({
      status: 'recorded',
      payment: {
        txHash: payment.txHash,
        verified: payment.verified,
        network: 'base-sepolia',
      },
      interaction_tx: tx_hash || null,
    });
  } catch {
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

app.post('/paid/discover/smart', async (req: Request, res: Response) => {
  const {
    query,
    min_score = 0,
    limit = 10,
    pagerank_weight = 0.4,
    relevancy_weight = 0.6
  } = req.body;
  const payment = (req as any).payment as PaymentInfo;

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
      payment: {
        txHash: payment.txHash,
        verified: payment.verified,
        from: payment.from,
        network: 'base-sepolia',
        explorer: payment.txHash !== 'none'
          ? `https://sepolia.basescan.org/tx/${payment.txHash}`
          : null,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Smart discovery failed' });
  }
});

app.post('/paid/agents/register', async (req: Request, res: Response) => {
  const { address, name, description, capabilities, tags, category, ens_name } = req.body;

  if (!address || !name) {
    res.status(400).json({ error: 'Address and name are required' });
    return;
  }

  let resolvedAddress = address;
  let ensName = ens_name || null;
  if (address.endsWith('.eth')) {
    const resolved = await resolveEns(address);
    if (resolved.address) {
      resolvedAddress = resolved.address;
      ensName = address;
    } else {
      res.status(400).json({ error: `Could not resolve ENS name: ${address}` });
      return;
    }
  }

  try {
    const { data } = await axios.post(`${GRAPH_URL}/agents/register`, {
      address: resolvedAddress,
      name,
      description: description || '',
      capabilities: capabilities || [],
      tags: tags || [],
      category: category || 'general',
      ens_name: ensName,
    });

    res.json({
      ...data,
      ensName,
      payment: {
        txHash: (req as any).payment?.txHash,
        verified: (req as any).payment?.verified,
      },
    });
  } catch {
    res.status(500).json({ error: 'Agent registration failed' });
  }
});

app.get('/paid/agents/:address/spec', async (req: Request, res: Response) => {
  let { address } = req.params;

  if (address.endsWith('.eth')) {
    const { address: resolved } = await resolveEns(address);
    if (resolved) {
      address = resolved;
    } else {
      res.status(404).json({ error: `Could not resolve ENS name: ${req.params.address}` });
      return;
    }
  }

  try {
    const { data } = await axios.get(`${GRAPH_URL}/agents/${address}/spec`);
    const { ensName } = await resolveEns(address);

    res.json({
      ...data,
      ensName,
      payment: {
        txHash: (req as any).payment?.txHash,
        verified: (req as any).payment?.verified,
      },
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
╔═══════════════════════════════════════════════════╗
║          DIGNITAS x402 API GATEWAY                ║
╠═══════════════════════════════════════════════════╣
║  Port: ${String(PORT).padEnd(42)}║
║  Network: Base Sepolia (chain ${baseSepolia.id})              ║
║  Query Price: ${formatEther(QUERY_PRICE_WEI).padEnd(35)}║
║  Treasury: ${TREASURY_ADDRESS.slice(0, 10)}...${TREASURY_ADDRESS.slice(-4).padEnd(27)}║
║  Contract: ${CONTRACT_ADDRESS.slice(0, 10)}...${CONTRACT_ADDRESS.slice(-4).padEnd(27)}║
║  ENS: Enabled (mainnet resolution)               ║
╚═══════════════════════════════════════════════════╝

FREE ENDPOINTS:
  GET  /health                  - Health + network info
  GET  /leaderboard             - Top agents
  GET  /ens/resolve/:name       - Resolve ENS name/address
  POST /ens/batch               - Batch ENS resolution
  GET  /tx/:hash                - Verify Base Sepolia tx

PAID ENDPOINTS (${formatEther(QUERY_PRICE_WEI)} ETH/query):
  GET  /paid/discover           - Find agents
  GET  /paid/score/:address     - Get agent score (supports ENS)
  POST /paid/interact           - Record interaction
  POST /paid/discover/smart     - LLM-powered discovery
  POST /paid/agents/register    - Register agent (supports ENS)
  GET  /paid/agents/:addr/spec  - Get agent spec (supports ENS)
  `);
});
