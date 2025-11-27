import axios from 'axios';
import { createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
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

export interface Agent {
  address: string;
  score: number;
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

  // PAID: Get specific agent's score
  async getScore(address: string): Promise<number> {
    const { data } = await this.client.get(`/paid/score/${address}`);
    return data.score;
  }

  // PAID: Record interaction
  async recordInteraction(
    toAgent: string,
    type: 'x402' | 'feedback'
  ): Promise<void> {
    await this.client.post('/paid/interact', {
      from_agent: this.client.defaults.headers?.['x-wallet-address'],
      to_agent: toAgent,
      interaction_type: type
    });
  }
}
