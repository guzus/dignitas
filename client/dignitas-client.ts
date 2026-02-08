import axios from 'axios';
import {
  createWalletClient,
  createPublicClient,
  http,
  formatEther,
  getAddress,
} from 'viem';
import { baseSepolia, mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { normalize } from 'viem/ens';
import { DIGNITAS_PROTOCOL_ABI, DEPLOYMENTS, QUERY_PRICE_WEI } from '../contracts/abi';

export interface Agent {
  address: string;
  score: number;
  ensName?: string;
}

export class DignitasClient {
  private api: ReturnType<typeof axios.create>;
  private wallet;
  private publicClient;
  private mainnetClient;
  private account;
  private treasuryAddress: `0x${string}`;
  private contractAddress: `0x${string}`;

  constructor(
    privateKey: string,
    apiUrl: string = 'http://localhost:3000',
    options?: {
      treasuryAddress?: string;
      contractAddress?: string;
      rpcUrl?: string;
    }
  ) {
    this.account = privateKeyToAccount(privateKey as `0x${string}`);

    this.wallet = createWalletClient({
      account: this.account,
      chain: baseSepolia,
      transport: http(options?.rpcUrl || DEPLOYMENTS.baseSepolia.rpcUrl),
    });

    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(options?.rpcUrl || DEPLOYMENTS.baseSepolia.rpcUrl),
    });

    this.mainnetClient = createPublicClient({
      chain: mainnet,
      transport: http('https://cloudflare-eth.com'),
    });

    this.treasuryAddress = (options?.treasuryAddress || DEPLOYMENTS.baseSepolia.treasury) as `0x${string}`;
    this.contractAddress = (options?.contractAddress || DEPLOYMENTS.baseSepolia.contractAddress) as `0x${string}`;

    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'x-wallet-address': this.account.address,
      },
    });
  }

  get address(): string {
    return this.account.address;
  }

  // ============ BLOCKCHAIN OPERATIONS ============

  /** Send real ETH to treasury on Base Sepolia. Returns tx hash. */
  async payForQuery(value: bigint = QUERY_PRICE_WEI): Promise<string> {
    const hash = await this.wallet.sendTransaction({
      to: this.treasuryAddress,
      value,
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /** Send real ETH to a specific agent. Supports ENS names. */
  async payAgent(toAddress: string, value: bigint): Promise<string> {
    let to = toAddress as `0x${string}`;
    if (toAddress.endsWith('.eth')) {
      const resolved = await this.resolveEns(toAddress);
      if (resolved) {
        to = resolved as `0x${string}`;
      } else {
        throw new Error(`Could not resolve ENS name: ${toAddress}`);
      }
    }

    const hash = await this.wallet.sendTransaction({ to, value });
    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /** Record an interaction on-chain via the Dignitas contract. */
  async recordInteractionOnChain(toAddress: string, interactionType: string): Promise<string> {
    let to = toAddress as `0x${string}`;
    if (toAddress.endsWith('.eth')) {
      const resolved = await this.resolveEns(toAddress);
      if (resolved) to = resolved as `0x${string}`;
    }

    const hash = await this.wallet.writeContract({
      address: this.contractAddress,
      abi: DIGNITAS_PROTOCOL_ABI,
      functionName: 'recordInteraction',
      args: [to, interactionType],
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /** Register agent on-chain via the Dignitas contract. */
  async registerAgentOnChain(name: string, description: string): Promise<string> {
    const hash = await this.wallet.writeContract({
      address: this.contractAddress,
      abi: DIGNITAS_PROTOCOL_ABI,
      functionName: 'registerAgent',
      args: [name, description],
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /** Get wallet ETH balance on Base Sepolia. */
  async getBalance(): Promise<string> {
    const balance = await this.publicClient.getBalance({
      address: this.account.address,
    });
    return formatEther(balance);
  }

  // ============ ENS OPERATIONS ============

  /** Resolve ENS name to address (mainnet). */
  async resolveEns(name: string): Promise<string | null> {
    try {
      const address = await this.mainnetClient.getEnsAddress({
        name: normalize(name),
      });
      return address || null;
    } catch {
      return null;
    }
  }

  /** Reverse-resolve address to ENS name (mainnet). */
  async getEnsName(address: string): Promise<string | null> {
    try {
      const name = await this.mainnetClient.getEnsName({
        address: getAddress(address),
      });
      return name || null;
    } catch {
      return null;
    }
  }

  // ============ API OPERATIONS (with real payment) ============

  /** Make a paid API call: sends real ETH, then includes tx hash in header. */
  private async paidRequest<T>(
    method: 'get' | 'post',
    url: string,
    data?: any,
    params?: any
  ): Promise<T> {
    const txHash = await this.payForQuery();

    const config = {
      headers: {
        'x-payment-txhash': txHash,
        'x-wallet-address': this.account.address,
      },
      params,
    };

    const response = method === 'get'
      ? await this.api.get(url, config)
      : await this.api.post(url, data, config);

    return response.data;
  }

  // FREE: Get leaderboard
  async getLeaderboard(): Promise<Agent[]> {
    const { data } = await this.api.get('/leaderboard');
    return data.agents;
  }

  // PAID: Discover agents (sends real ETH)
  async discover(minScore: number = 0, limit: number = 10): Promise<Agent[]> {
    const result = await this.paidRequest<any>('get', '/paid/discover', undefined, {
      min_score: minScore,
      limit,
    });
    return result.agents;
  }

  // PAID: Get agent score (supports ENS names)
  async getScore(addressOrEns: string): Promise<number> {
    const result = await this.paidRequest<any>('get', `/paid/score/${addressOrEns}`);
    return result.score;
  }

  // PAID: Record interaction (sends real ETH + records on-chain)
  async recordInteraction(
    toAgent: string,
    type: 'x402' | 'feedback'
  ): Promise<{ paymentTxHash: string; interactionTxHash?: string }> {
    const paymentTxHash = await this.payForQuery();

    let interactionTxHash: string | undefined;
    if (this.contractAddress !== '0x0000000000000000000000000000000000000000') {
      try {
        interactionTxHash = await this.recordInteractionOnChain(toAgent, type);
      } catch {
        // Contract not deployed or call failed; API-only recording
      }
    }

    await this.api.post('/paid/interact', {
      from_agent: this.account.address,
      to_agent: toAgent,
      interaction_type: type,
      tx_hash: interactionTxHash || paymentTxHash,
    }, {
      headers: {
        'x-payment-txhash': paymentTxHash,
        'x-wallet-address': this.account.address,
      },
    });

    return { paymentTxHash, interactionTxHash };
  }

  // PAID: Smart discovery with LLM relevancy (sends real ETH)
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
    payment: { txHash: string; verified: boolean; explorer: string | null };
  }> {
    return this.paidRequest('post', '/paid/discover/smart', {
      query,
      min_score: options.minScore ?? 0,
      limit: options.limit ?? 10,
      pagerank_weight: options.pagerankWeight ?? 0.4,
      relevancy_weight: options.relevancyWeight ?? 0.6,
    });
  }

  // PAID: Register agent specification (sends real ETH)
  async registerAgent(spec: {
    address: string;
    name: string;
    description?: string;
    capabilities?: string[];
    tags?: string[];
    category?: string;
    ens_name?: string;
  }): Promise<void> {
    await this.paidRequest('post', '/paid/agents/register', spec);
  }

  // PAID: Get agent specification (supports ENS names)
  async getAgentSpec(addressOrEns: string): Promise<{
    name: string;
    description: string;
    capabilities: string[];
    tags: string[];
    category: string;
    ensName?: string;
  }> {
    const result = await this.paidRequest<any>('get', `/paid/agents/${addressOrEns}/spec`);
    return result.spec;
  }

  // FREE: Resolve ENS name via API
  async resolveEnsViaApi(nameOrAddress: string): Promise<{
    address: string | null;
    ensName: string | null;
  }> {
    const { data } = await this.api.get(`/ens/resolve/${nameOrAddress}`);
    return data;
  }

  // FREE: Verify a Base Sepolia transaction
  async verifyTransaction(txHash: string): Promise<{
    hash: string;
    from: string;
    to: string;
    value: string;
    status: string;
    explorer: string;
  }> {
    const { data } = await this.api.get(`/tx/${txHash}`);
    return data;
  }
}
