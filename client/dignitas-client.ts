import axios from 'axios';
import { createWalletClient, createPublicClient, http, normalize } from 'viem';
import { baseSepolia, mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Mock x402Axios
const x402Axios = (wallet: any, config: any) => {
  const instance = axios.create(config);
  // Add interceptor to simulate payment headers if needed
  instance.interceptors.request.use(async (cfg) => {
    // In real x402, this would sign a payment
    if (cfg.headers) {
      cfg.headers['x-wallet-address'] = wallet.account.address;
    }
    return cfg;
  });
  return instance;
};

// ENS public client for resolving .eth names to addresses
const ensPublicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com'),
});

export interface Agent {
  address: string;
  score: number;
  ens_name?: string;
}

export class DignitasClient {
  private client: ReturnType<typeof axios.create>;

  constructor(privateKey: string, apiUrl: string = 'http://localhost:3000') {
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const wallet = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http()
    });

    this.client = x402Axios(wallet, { baseURL: apiUrl });
  }

  // Resolve an ENS name to an address using mainnet ENS registry
  async resolveEns(ensName: string): Promise<string | null> {
    const address = await ensPublicClient.getEnsAddress({ name: normalize(ensName) });
    return address ? address.toLowerCase() : null;
  }

  // Reverse-resolve an address to its primary ENS name
  async lookupEns(address: string): Promise<string | null> {
    const name = await ensPublicClient.getEnsName({ address: address as `0x${string}` });
    return name;
  }

  // Resolve ENS name or return address as-is
  private async resolveNameOrAddress(nameOrAddress: string): Promise<string> {
    if (nameOrAddress.endsWith('.eth')) {
      const resolved = await this.resolveEns(nameOrAddress);
      if (!resolved) throw new Error(`Could not resolve ENS name: ${nameOrAddress}`);
      return resolved;
    }
    return nameOrAddress;
  }

  // FREE: Get leaderboard
  async getLeaderboard(): Promise<Agent[]> {
    const { data } = await this.client.get('/leaderboard');
    return data.agents;
  }

  // PAID: Discover agents
  async discover(minScore: number = 0, limit: number = 10): Promise<Agent[]> {
    const { data } = await this.client.get('/paid/discover', {
      params: { min_score: minScore, limit }
    });
    return data.agents;
  }

  // PAID: Get specific agent's score — accepts ENS name or address
  async getScore(nameOrAddress: string): Promise<number> {
    const address = await this.resolveNameOrAddress(nameOrAddress);
    const { data } = await this.client.get(`/paid/score/${address}`);
    return data.score;
  }

  // PAID: Record interaction — accepts ENS names or addresses for both agents
  async recordInteraction(
    toAgent: string,
    type: 'x402' | 'feedback'
  ): Promise<void> {
    const resolvedTo = await this.resolveNameOrAddress(toAgent);
    await this.client.post('/paid/interact', {
      from_agent: this.client.defaults.headers?.['x-wallet-address'],
      to_agent: resolvedTo,
      interaction_type: type
    });
  }

  // PAID: Smart discovery with LLM relevancy
  async smartDiscover(
    query: string,
    options: {
      minScore?: number;
      limit?: number;
      pagerankWeight?: number;
      relevancyWeight?: number;
    } = {}
  ): Promise<{
    agents: Array<{
      address: string;
      pagerank_score: number;
      relevancy_score: number;
      combined_score: number;
      name?: string;
      description?: string;
      category?: string;
    }>;
    query: string;
    weights: { pagerank: number; relevancy: number };
  }> {
    const { data } = await this.client.post('/paid/discover/smart', {
      query,
      min_score: options.minScore ?? 0,
      limit: options.limit ?? 10,
      pagerank_weight: options.pagerankWeight ?? 0.4,
      relevancy_weight: options.relevancyWeight ?? 0.6
    });
    return data;
  }

  // PAID: Register agent specification
  async registerAgent(spec: {
    address: string;
    name: string;
    description?: string;
    capabilities?: string[];
    tags?: string[];
    category?: string;
  }): Promise<void> {
    await this.client.post('/paid/agents/register', spec);
  }

  // PAID: Get agent specification — accepts ENS name or address
  async getAgentSpec(nameOrAddress: string): Promise<{
    name: string;
    description: string;
    capabilities: string[];
    tags: string[];
    category: string;
    ens_name?: string;
  }> {
    const address = await this.resolveNameOrAddress(nameOrAddress);
    const { data } = await this.client.get(`/paid/agents/${address}/spec`);
    return data.spec;
  }

  // Resolve ENS for the API gateway endpoint
  async resolveEnsViaApi(nameOrAddress: string): Promise<{ address: string; ens_name: string | null }> {
    const { data } = await this.client.get(`/ens/resolve/${nameOrAddress}`);
    return data;
  }
}
