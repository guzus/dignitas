import axios from 'axios';
import { mockAgents, mockLeaderboard, mockGraphData, Agent } from '@/data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const GRAPH_ENGINE_URL = process.env.NEXT_PUBLIC_GRAPH_ENGINE_URL || 'http://localhost:8000';

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

const graphApi = axios.create({
  baseURL: GRAPH_ENGINE_URL,
  timeout: 30000, // LLM-based endpoints need more time
});

export interface AgentResponse {
  address: string;
  score: number;
  name?: string;
  description?: string;
  capabilities?: string[];
  tags?: string[];
  category?: string;
}

export interface SmartDiscoverResponse {
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
  total_agents: number;
}

export interface LeaderboardResponse {
  agents: AgentResponse[];
}

// Fetch leaderboard data
export async function fetchLeaderboard(): Promise<AgentResponse[]> {
  try {
    const { data } = await graphApi.get<LeaderboardResponse>('/leaderboard', {
      params: { limit: 15 }
    });
    return data.agents;
  } catch (error) {
    console.warn('API unreachable, using mock data:', error);
    return mockLeaderboard;
  }
}

// Fetch all agent specs
export async function fetchAgentSpecs(): Promise<Record<string, Agent>> {
  try {
    const { data } = await graphApi.get('/agents/specs');
    return data.agents;
  } catch (error) {
    console.warn('API unreachable, using mock data:', error);
    const specs: Record<string, Agent> = {};
    mockAgents.forEach(a => { specs[a.address.toLowerCase()] = a; });
    return specs;
  }
}

// Smart discovery with LLM relevancy
export async function smartDiscover(
  query: string,
  options: {
    minScore?: number;
    limit?: number;
    pagerankWeight?: number;
    relevancyWeight?: number;
  } = {}
): Promise<SmartDiscoverResponse> {
  try {
    const { data } = await graphApi.post<SmartDiscoverResponse>('/discover/smart', {
      query,
      min_score: options.minScore ?? 0,
      limit: options.limit ?? 10,
      pagerank_weight: options.pagerankWeight ?? 0.4,
      relevancy_weight: options.relevancyWeight ?? 0.6
    });
    return data;
  } catch (error) {
    console.warn('Smart discovery failed, using mock fallback:', error);
    // Fallback: simple keyword matching
    const queryLower = query.toLowerCase();
    const matched = mockAgents
      .filter(a => {
        const searchText = `${a.name} ${a.description} ${a.capabilities.join(' ')} ${a.tags?.join(' ')} ${a.category}`.toLowerCase();
        return searchText.includes(queryLower) || queryLower.split(' ').some(word => searchText.includes(word));
      })
      .slice(0, options.limit ?? 10);

    return {
      agents: matched.map((a, i) => ({
        address: a.address,
        pagerank_score: a.score,
        relevancy_score: 0.9 - (i * 0.1),
        combined_score: a.score * 0.4 + (0.9 - i * 0.1) * 0.6,
        name: a.name,
        description: a.description,
        category: a.category
      })),
      query,
      weights: { pagerank: 0.4, relevancy: 0.6 },
      total_agents: mockAgents.length
    };
  }
}

// Basic discovery (no LLM)
export async function discover(
  minScore: number = 0,
  limit: number = 10
): Promise<AgentResponse[]> {
  try {
    const { data } = await graphApi.get('/discover', {
      params: { min_score: minScore, limit }
    });
    return data.agents;
  } catch (error) {
    console.warn('Discovery failed, using mock data:', error);
    return mockAgents.filter(a => a.score >= minScore).slice(0, limit);
  }
}

// Get single agent score
export async function getAgentScore(address: string): Promise<number> {
  try {
    const { data } = await graphApi.get(`/scores/${address}`);
    return data.score;
  } catch (error) {
    const agent = mockAgents.find(a => a.address.toLowerCase() === address.toLowerCase());
    return agent?.score ?? 0;
  }
}

// Get agent specification
export async function getAgentSpec(address: string): Promise<Agent | null> {
  try {
    const { data } = await graphApi.get(`/agents/${address}/spec`);
    return { address, ...data.spec };
  } catch (error) {
    return mockAgents.find(a => a.address.toLowerCase() === address.toLowerCase()) ?? null;
  }
}

// Record interaction (for demo)
export async function recordInteraction(
  fromAgent: string,
  toAgent: string,
  type: 'x402' | 'feedback' | 'negative_feedback'
): Promise<void> {
  try {
    await graphApi.post('/interactions', {
      from_agent: fromAgent,
      to_agent: toAgent,
      interaction_type: type
    });
  } catch (error) {
    console.warn('Failed to record interaction:', error);
  }
}

// Get graph data for visualization
export async function fetchGraphData(): Promise<{ nodes: any[], links: any[] }> {
  try {
    const agents = await fetchLeaderboard();

    const nodes = agents.map((a: AgentResponse) => ({
      id: a.address,
      val: a.score,
      name: a.name,
      group: a.score > 0.8 ? 1 : a.score > 0.5 ? 2 : 3
    }));

    // Add Dignitas Oracle Node
    nodes.push({
      id: 'Dignitas Oracle',
      val: 1.0,
      name: 'Dignitas Oracle',
      group: 0
    });

    // Use mock links for now (would need a separate endpoint for real links)
    return { nodes, links: mockGraphData.links };
  } catch (error) {
    console.warn('Failed to fetch graph data:', error);
    return mockGraphData;
  }
}
