// Mock data for standalone frontend deployment (hackathon demo)
// This data mirrors the graph_engine seed data for offline/fallback use

export interface Agent {
  address: string;
  score: number;
  name: string;
  description: string;
  capabilities: string[];
  tags?: string[];
  category?: string;
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
// Synced with graph_engine/main.py seed data
export const mockAgents: Agent[] = [
  {
    address: "0x1111111111111111111111111111111111111111",
    score: 1.0000,
    name: "CodeGuard Pro",
    description: "Expert code reviewer that analyzes code quality, security vulnerabilities, and best practices. Supports 20+ programming languages including Python, JavaScript, Rust, and Solidity.",
    capabilities: ["code review", "security audit", "best practices", "refactoring suggestions", "vulnerability detection", "code smell detection"],
    tags: ["development", "security", "quality", "audit"],
    category: "development"
  },
  {
    address: "0x2222222222222222222222222222222222222222",
    score: 0.9500,
    name: "DataMind Analytics",
    description: "Advanced data analysis agent that processes datasets, generates actionable insights, creates beautiful visualizations, and builds predictive models using state-of-the-art ML techniques.",
    capabilities: ["data analysis", "visualization", "statistics", "machine learning", "predictive modeling", "ETL pipelines", "dashboard creation"],
    tags: ["data", "analytics", "ML", "visualization", "insights"],
    category: "analytics"
  },
  {
    address: "0x3333333333333333333333333333333333333333",
    score: 0.8800,
    name: "InfraBot",
    description: "Full-stack DevOps automation agent. Manages CI/CD pipelines, Kubernetes clusters, Terraform infrastructure, and provides 24/7 monitoring with intelligent alerting.",
    capabilities: ["CI/CD", "infrastructure", "kubernetes", "terraform", "monitoring", "AWS", "GCP", "Azure", "Docker"],
    tags: ["devops", "infrastructure", "automation", "cloud"],
    category: "operations"
  },
  {
    address: "0x4444444444444444444444444444444444444444",
    score: 0.8200,
    name: "ContentCraft AI",
    description: "Professional writing assistant for content creation, SEO optimization, copywriting, and brand voice consistency. Creates blog posts, marketing copy, and social media content.",
    capabilities: ["writing", "editing", "copywriting", "content strategy", "SEO", "social media", "blog posts", "email campaigns"],
    tags: ["content", "writing", "marketing", "SEO", "social"],
    category: "content"
  },
  {
    address: "0x5555555555555555555555555555555555555555",
    score: 0.7600,
    name: "ResearchBot Alpha",
    description: "Deep research agent that scours academic papers, synthesizes information, provides citations, and generates comprehensive literature reviews on any topic.",
    capabilities: ["research", "summarization", "citation", "fact-checking", "literature review", "paper analysis", "knowledge synthesis"],
    tags: ["research", "academic", "knowledge", "papers"],
    category: "research"
  },
  {
    address: "0x6666666666666666666666666666666666666666",
    score: 0.7100,
    name: "SupportHero",
    description: "AI-powered customer support agent with multi-language support. Handles inquiries, troubleshooting, ticket management, and escalation with empathy and efficiency.",
    capabilities: ["customer support", "troubleshooting", "ticket management", "multi-language", "escalation", "FAQ automation"],
    tags: ["support", "customer service", "helpdesk"],
    category: "support"
  },
  {
    address: "0x7777777777777777777777777777777777777777",
    score: 0.6500,
    name: "AlphaTrader",
    description: "Sophisticated trading agent for crypto and DeFi markets. Analyzes on-chain data, executes trades, manages portfolio strategies, and provides real-time market insights.",
    capabilities: ["trading", "market analysis", "portfolio management", "DeFi", "on-chain analysis", "arbitrage", "yield farming", "risk management"],
    tags: ["finance", "trading", "crypto", "DeFi", "blockchain"],
    category: "finance"
  },
  {
    address: "0x8888888888888888888888888888888888888888",
    score: 0.6000,
    name: "LegalEagle AI",
    description: "Legal assistant specializing in contract review, compliance checking, and legal document drafting. Supports smart contract auditing and regulatory analysis.",
    capabilities: ["contract review", "legal research", "document drafting", "compliance", "smart contract audit", "regulatory analysis"],
    tags: ["legal", "compliance", "contracts", "regulatory"],
    category: "legal"
  },
  {
    address: "0x9999999999999999999999999999999999999999",
    score: 0.5500,
    name: "TranslateX",
    description: "Real-time translation agent supporting 100+ languages with context-aware translations, localization, and cultural adaptation for global content.",
    capabilities: ["translation", "localization", "language detection", "cultural adaptation", "document translation", "real-time interpretation"],
    tags: ["translation", "languages", "localization", "global"],
    category: "content"
  },
  {
    address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    score: 0.5000,
    name: "DesignMuse",
    description: "Creative design assistant that generates UI/UX mockups, brand assets, illustrations, and provides design feedback based on modern design principles.",
    capabilities: ["UI design", "UX research", "brand design", "illustrations", "design feedback", "wireframing", "prototyping"],
    tags: ["design", "UI", "UX", "creative", "branding"],
    category: "creative"
  },
  {
    address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    score: 0.4500,
    name: "SecuritySentinel",
    description: "Cybersecurity agent that performs penetration testing, vulnerability assessments, threat detection, and security compliance audits for web3 and traditional systems.",
    capabilities: ["penetration testing", "vulnerability assessment", "threat detection", "security audit", "compliance", "incident response"],
    tags: ["security", "cybersecurity", "audit", "compliance"],
    category: "security"
  },
  {
    address: "0xcccccccccccccccccccccccccccccccccccccccc",
    score: 0.4000,
    name: "MeetingMind",
    description: "Meeting assistant that transcribes calls, generates summaries, extracts action items, and schedules follow-ups automatically.",
    capabilities: ["transcription", "meeting summaries", "action items", "scheduling", "note-taking", "calendar management"],
    tags: ["productivity", "meetings", "transcription", "scheduling"],
    category: "productivity"
  },
  {
    address: "0xdddddddddddddddddddddddddddddddddddddddd",
    score: 0.3500,
    name: "NFT Curator",
    description: "NFT specialist agent that analyzes collections, tracks floor prices, identifies trends, and provides investment recommendations for digital art and collectibles.",
    capabilities: ["NFT analysis", "collection tracking", "price prediction", "rarity analysis", "market trends", "portfolio tracking"],
    tags: ["NFT", "crypto", "art", "collectibles", "investment"],
    category: "finance"
  },
  {
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    score: 0.3000,
    name: "HealthBot Pro",
    description: "Health and wellness assistant providing fitness plans, nutrition advice, symptom checking, and mental health support with evidence-based recommendations.",
    capabilities: ["fitness planning", "nutrition advice", "symptom checking", "mental health", "wellness tracking", "habit building"],
    tags: ["health", "fitness", "wellness", "nutrition"],
    category: "health"
  },
  {
    address: "0xffffffffffffffffffffffffffffffffffffffff",
    score: 0.2500,
    name: "EduTutor AI",
    description: "Personalized education agent that creates custom learning paths, explains complex concepts, provides practice problems, and tracks learning progress.",
    capabilities: ["tutoring", "curriculum design", "concept explanation", "practice problems", "progress tracking", "adaptive learning"],
    tags: ["education", "learning", "tutoring", "teaching"],
    category: "education"
  }
];

// Convert agents to leaderboard format
export const mockLeaderboard = mockAgents.map(a => ({
  address: a.address,
  score: a.score,
  name: a.name,
  description: a.description,
  capabilities: a.capabilities,
  tags: a.tags,
  category: a.category
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
export const mockLinks: GraphLink[] = [
  // Oracle positive feedback to high-trust agents
  { source: 'Dignitas Oracle', target: '0x1111111111111111111111111111111111111111', type: 'feedback' },
  { source: 'Dignitas Oracle', target: '0x2222222222222222222222222222222222222222', type: 'feedback' },
  { source: 'Dignitas Oracle', target: '0x3333333333333333333333333333333333333333', type: 'feedback' },

  // x402 payments (economic signals)
  { source: '0x3333333333333333333333333333333333333333', target: '0x1111111111111111111111111111111111111111', type: 'x402' },
  { source: '0x4444444444444444444444444444444444444444', target: '0x1111111111111111111111111111111111111111', type: 'x402' },
  { source: '0x5555555555555555555555555555555555555555', target: '0x1111111111111111111111111111111111111111', type: 'x402' },
  { source: '0x3333333333333333333333333333333333333333', target: '0x2222222222222222222222222222222222222222', type: 'x402' },
  { source: '0x4444444444444444444444444444444444444444', target: '0x2222222222222222222222222222222222222222', type: 'x402' },
  { source: '0x1111111111111111111111111111111111111111', target: '0x3333333333333333333333333333333333333333', type: 'x402' },
  { source: '0x2222222222222222222222222222222222222222', target: '0x3333333333333333333333333333333333333333', type: 'feedback' },
  { source: '0x1111111111111111111111111111111111111111', target: '0x2222222222222222222222222222222222222222', type: 'x402' },
  { source: '0x2222222222222222222222222222222222222222', target: '0x1111111111111111111111111111111111111111', type: 'x402' },

  // Cross-tier interactions
  { source: '0x6666666666666666666666666666666666666666', target: '0x5555555555555555555555555555555555555555', type: 'feedback' },
  { source: '0x7777777777777777777777777777777777777777', target: '0x6666666666666666666666666666666666666666', type: 'x402' },
  { source: '0x8888888888888888888888888888888888888888', target: '0x7777777777777777777777777777777777777777', type: 'feedback' },
  { source: '0x9999999999999999999999999999999999999999', target: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', type: 'x402' },
  { source: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', target: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', type: 'x402' },
  { source: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', target: '0x9999999999999999999999999999999999999999', type: 'x402' },

  // Negative feedback (Sybil detection)
  { source: '0x1111111111111111111111111111111111111111', target: '0x9999999999999999999999999999999999999999', type: 'negative_feedback' },
  { source: '0x2222222222222222222222222222222222222222', target: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', type: 'negative_feedback' },
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

// Simulated discovery results by category
export const mockDiscoveryResults: Record<string, Agent[]> = {
  development: mockAgents.filter(a => a.category === 'development'),
  analytics: mockAgents.filter(a => a.category === 'analytics'),
  operations: mockAgents.filter(a => a.category === 'operations'),
  content: mockAgents.filter(a => a.category === 'content'),
  research: mockAgents.filter(a => a.category === 'research'),
  support: mockAgents.filter(a => a.category === 'support'),
  finance: mockAgents.filter(a => a.category === 'finance'),
  legal: mockAgents.filter(a => a.category === 'legal'),
  creative: mockAgents.filter(a => a.category === 'creative'),
  security: mockAgents.filter(a => a.category === 'security'),
  productivity: mockAgents.filter(a => a.category === 'productivity'),
  health: mockAgents.filter(a => a.category === 'health'),
  education: mockAgents.filter(a => a.category === 'education'),
};
