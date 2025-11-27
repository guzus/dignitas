// Mock data for standalone frontend deployment (hackathon demo)
// This data is pre-computed based on the PageRank algorithm from the backend

export interface Agent {
  address: string;
  score: number;
  name: string;
  description: string;
  capabilities: string[];
}

export interface GraphNode {
  id: string;
  val: number;
  group: number; // 0=Oracle, 1=High(>0.8), 2=Medium(>0.5), 3=Low
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'x402' | 'feedback' | 'negative_feedback';
}

// Pre-calculated PageRank scores from mock interaction data
// These are real scores computed from the seeded graph data
export const mockAgents: Agent[] = [
  {
    address: "0x2222222222222222222222222222222222222222",
    score: 1.0000,
    name: "AlphaVault",
    description: "High-frequency DeFi trading strategies",
    capabilities: ["defi", "trading", "yield-optimization"]
  },
  {
    address: "0xffffffffffffffffffffffffffffffffffffffff",
    score: 0.8931,
    name: "DataOracle X",
    description: "Real-time cross-chain data feeds",
    capabilities: ["oracle", "data-feeds", "cross-chain"]
  },
  {
    address: "0x4444444444444444444444444444444444444444",
    score: 0.8863,
    name: "SentimentAI",
    description: "Social sentiment analysis engine",
    capabilities: ["sentiment", "social-analysis", "nlp"]
  },
  {
    address: "0x1111111111111111111111111111111111111111",
    score: 0.8634,
    name: "YieldOptimizer",
    description: "Auto-compounding yield farmer",
    capabilities: ["yield", "farming", "auto-compound"]
  },
  {
    address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    score: 0.8400,
    name: "BridgeBot",
    description: "Secure cross-L2 bridging service",
    capabilities: ["bridge", "l2", "cross-chain"]
  },
  {
    address: "0x5555555555555555555555555555555555555555",
    score: 0.8273,
    name: "NFT Scout",
    description: "Rare NFT sniper and valuation",
    capabilities: ["nft", "valuation", "trading"]
  },
  {
    address: "0x6666666666666666666666666666666666666666",
    score: 0.7632,
    name: "GovDelegate",
    description: "DAO governance voting automation",
    capabilities: ["governance", "dao", "voting"]
  },
  {
    address: "0x8888888888888888888888888888888888888888",
    score: 0.6712,
    name: "AuditLayer",
    description: "Smart contract security auditor",
    capabilities: ["audit", "security", "smart-contracts"]
  },
  {
    address: "0x9999999999999999999999999999999999999999",
    score: 0.6506,
    name: "MEVGuard",
    description: "MEV protection and flashbot relay",
    capabilities: ["mev", "protection", "flashbots"]
  },
  {
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    score: 0.5817,
    name: "LiquidityPro",
    description: "Automated market making strategies",
    capabilities: ["amm", "liquidity", "market-making"]
  },
  {
    address: "0xcccccccccccccccccccccccccccccccccccccccc",
    score: 0.5659,
    name: "GasOptimizer",
    description: "Transaction gas optimization engine",
    capabilities: ["gas", "optimization", "transactions"]
  },
  {
    address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    score: 0.5411,
    name: "PortfolioAI",
    description: "AI-powered portfolio rebalancing",
    capabilities: ["portfolio", "rebalancing", "ai"]
  },
  {
    address: "0x3333333333333333333333333333333333333333",
    score: 0.5160,
    name: "ArbitrageBot",
    description: "Cross-DEX arbitrage opportunities",
    capabilities: ["arbitrage", "dex", "trading"]
  },
  {
    address: "0xdddddddddddddddddddddddddddddddddddddddd",
    score: 0.4268,
    name: "RiskAnalyzer",
    description: "DeFi protocol risk assessment",
    capabilities: ["risk", "analysis", "defi"]
  },
  {
    address: "0x7777777777777777777777777777777777777777",
    score: 0.3721,
    name: "NewbieBot",
    description: "Basic transaction automation",
    capabilities: ["automation", "transactions"]
  }
];

// Convert agents to leaderboard format
export const mockLeaderboard = mockAgents.map(a => ({
  address: a.address,
  score: a.score
}));

// Pre-defined graph nodes
export const mockNodes: GraphNode[] = [
  // Oracle node (special)
  {
    id: 'Dignitas Oracle',
    val: 1.0,
    group: 0
  },
  // Agent nodes based on scores
  ...mockAgents.map(a => ({
    id: a.address,
    val: a.score,
    group: a.score > 0.8 ? 1 : a.score > 0.5 ? 2 : 3
  }))
];

// Pre-defined interactions (stable for demo)
// These simulate the trust relationships in the network
export const mockLinks: GraphLink[] = [
  // Oracle positive feedback to high-trust agents
  { source: 'Dignitas Oracle', target: '0x2222222222222222222222222222222222222222', type: 'feedback' },
  { source: 'Dignitas Oracle', target: '0xffffffffffffffffffffffffffffffffffffffff', type: 'feedback' },
  { source: 'Dignitas Oracle', target: '0x4444444444444444444444444444444444444444', type: 'feedback' },
  { source: 'Dignitas Oracle', target: '0x1111111111111111111111111111111111111111', type: 'feedback' },
  { source: 'Dignitas Oracle', target: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', type: 'feedback' },

  // Oracle negative feedback to low-trust agents
  { source: 'Dignitas Oracle', target: '0x7777777777777777777777777777777777777777', type: 'negative_feedback' },
  { source: 'Dignitas Oracle', target: '0xdddddddddddddddddddddddddddddddddddddddd', type: 'negative_feedback' },

  // x402 payments (economic signals)
  { source: '0x1111111111111111111111111111111111111111', target: '0x2222222222222222222222222222222222222222', type: 'x402' },
  { source: '0x4444444444444444444444444444444444444444', target: '0x2222222222222222222222222222222222222222', type: 'x402' },
  { source: '0x5555555555555555555555555555555555555555', target: '0xffffffffffffffffffffffffffffffffffffffff', type: 'x402' },
  { source: '0x6666666666666666666666666666666666666666', target: '0x4444444444444444444444444444444444444444', type: 'x402' },
  { source: '0x8888888888888888888888888888888888888888', target: '0x1111111111111111111111111111111111111111', type: 'x402' },
  { source: '0x9999999999999999999999999999999999999999', target: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', type: 'x402' },
  { source: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', target: '0x5555555555555555555555555555555555555555', type: 'x402' },
  { source: '0xcccccccccccccccccccccccccccccccccccccccc', target: '0x6666666666666666666666666666666666666666', type: 'x402' },
  { source: '0x3333333333333333333333333333333333333333', target: '0x8888888888888888888888888888888888888888', type: 'x402' },

  // Positive feedback (social signals)
  { source: '0x2222222222222222222222222222222222222222', target: '0xffffffffffffffffffffffffffffffffffffffff', type: 'feedback' },
  { source: '0x2222222222222222222222222222222222222222', target: '0x4444444444444444444444444444444444444444', type: 'feedback' },
  { source: '0xffffffffffffffffffffffffffffffffffffffff', target: '0x1111111111111111111111111111111111111111', type: 'feedback' },
  { source: '0x4444444444444444444444444444444444444444', target: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', type: 'feedback' },
  { source: '0x1111111111111111111111111111111111111111', target: '0x5555555555555555555555555555555555555555', type: 'feedback' },
  { source: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', target: '0x6666666666666666666666666666666666666666', type: 'feedback' },
  { source: '0x5555555555555555555555555555555555555555', target: '0x8888888888888888888888888888888888888888', type: 'feedback' },
  { source: '0x6666666666666666666666666666666666666666', target: '0x9999999999999999999999999999999999999999', type: 'feedback' },
  { source: '0x8888888888888888888888888888888888888888', target: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', type: 'feedback' },
  { source: '0x9999999999999999999999999999999999999999', target: '0xcccccccccccccccccccccccccccccccccccccccc', type: 'feedback' },
  { source: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', target: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', type: 'feedback' },

  // Cross-tier positive interactions
  { source: '0x2222222222222222222222222222222222222222', target: '0x8888888888888888888888888888888888888888', type: 'feedback' },
  { source: '0xffffffffffffffffffffffffffffffffffffffff', target: '0xcccccccccccccccccccccccccccccccccccccccc', type: 'feedback' },
  { source: '0x4444444444444444444444444444444444444444', target: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', type: 'feedback' },

  // Negative feedback (trust penalties)
  { source: '0x2222222222222222222222222222222222222222', target: '0x7777777777777777777777777777777777777777', type: 'negative_feedback' },
  { source: '0xffffffffffffffffffffffffffffffffffffffff', target: '0x7777777777777777777777777777777777777777', type: 'negative_feedback' },
  { source: '0x1111111111111111111111111111111111111111', target: '0xdddddddddddddddddddddddddddddddddddddddd', type: 'negative_feedback' },
  { source: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', target: '0x3333333333333333333333333333333333333333', type: 'negative_feedback' },
  { source: '0x8888888888888888888888888888888888888888', target: '0x7777777777777777777777777777777777777777', type: 'negative_feedback' },
];

// Complete graph data for visualization
export const mockGraphData = {
  nodes: mockNodes,
  links: mockLinks
};

// Helper to get agent metadata by address
export function getAgentByAddress(address: string): Agent | undefined {
  return mockAgents.find(a => a.address.toLowerCase() === address.toLowerCase());
}

// Simulated discovery results for DemoPanel
export const mockDiscoveryResults = {
  defi: [
    mockAgents[0], // AlphaVault
    mockAgents[3], // YieldOptimizer
    mockAgents[9], // LiquidityPro
    mockAgents[12], // ArbitrageBot
  ],
  data: [
    mockAgents[1], // DataOracle X
    mockAgents[2], // SentimentAI
  ],
  security: [
    mockAgents[7], // AuditLayer
    mockAgents[8], // MEVGuard
    mockAgents[13], // RiskAnalyzer
  ],
  nft: [
    mockAgents[5], // NFT Scout
  ],
  governance: [
    mockAgents[6], // GovDelegate
  ],
  bridge: [
    mockAgents[4], // BridgeBot
  ],
};
