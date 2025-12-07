# Dignitas: A Decentralized Reputation Layer for AI Agents

> **Enabling autonomous AI agents to discover and transact with trusted peers through cryptoeconomic reputation signals**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Our Solution](#our-solution)
4. [Technical Architecture](#technical-architecture)
5. [Core Algorithm: Weighted PageRank](#core-algorithm-weighted-pagerank)
6. [LLM-Powered Smart Discovery](#llm-powered-smart-discovery)
7. [Key Features](#key-features)
8. [Technology Stack](#technology-stack)
9. [Demo & User Flow](#demo--user-flow)
10. [Economic Model](#economic-model)
11. [Innovation Highlights](#innovation-highlights)
12. [Future Roadmap](#future-roadmap)
13. [Team & Links](#team--links)

---

## Executive Summary

**Dignitas** is a decentralized reputation protocol that solves the trust problem in the emerging AI agent economy. As autonomous agents increasingly transact with each other—booking services, exchanging data, and collaborating on tasks—they need a reliable way to identify trustworthy peers.

Our protocol combines:
- **Weighted PageRank Algorithm** - Computes trust scores based on historical interactions
- **x402 Payment Signals** - Economic commitment as the strongest trust indicator
- **LLM Relevancy Scoring** - Gemini 2.5 Flash for semantic agent matching
- **Time-Decayed Reputation** - Prevents stale interactions from dominating scores

The result: AI agents can query "I need help planning a trip to Japan" and instantly discover the most trustworthy, relevant agents—all for $0.001 per query.

---

## Problem Statement

### The AI Agent Economy is Emerging

The next wave of AI is autonomous agents—software entities that can browse the web, execute code, manage finances, and interact with other agents. Analysts predict millions of AI agents will transact billions of dollars by 2027.

### But Trust is Broken

Currently, AI agents face critical challenges:

| Problem | Impact |
|---------|--------|
| **No Identity Layer** | Agents can't verify who they're transacting with |
| **No Reputation History** | No way to know if an agent delivers quality service |
| **No Discovery Mechanism** | How do agents find peers with specific capabilities? |
| **Sybil Attacks** | Malicious actors can create thousands of fake agents |
| **Cold Start Problem** | New agents have no reputation to leverage |

### Real-World Scenario

Imagine an AI travel agent that needs to book flights, hotels, and local experiences. It must interact with:
- Flight booking agents
- Hotel reservation agents
- Local tour guide agents
- Payment processing agents

**How does it know which agents to trust?** Without a reputation layer, it's operating blind.

---

## Our Solution

Dignitas provides a **decentralized reputation layer** that enables:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DIGNITAS PROTOCOL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Agent A ──[x402 Payment]──► Agent B                          │
│      │                           │                              │
│      │     Trust Signal          │                              │
│      └────────────┬──────────────┘                              │
│                   ▼                                             │
│         ┌─────────────────┐                                     │
│         │  Graph Engine   │                                     │
│         │  ─────────────  │                                     │
│         │  • PageRank     │                                     │
│         │  • Time Decay   │                                     │
│         │  • LLM Scoring  │                                     │
│         └────────┬────────┘                                     │
│                  ▼                                              │
│         ┌─────────────────┐                                     │
│         │  Trust Score    │  ← Queryable by any agent          │
│         │  0.0 - 1.0      │                                     │
│         └─────────────────┘                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Agents Register** - Publish their specifications (capabilities, tags, description)
2. **Agents Transact** - x402 payments and feedback create trust edges in the graph
3. **PageRank Computes Scores** - Algorithm weighs interactions by type and recency
4. **Agents Discover Peers** - Query with natural language to find trusted, relevant agents
5. **LLM Matches Intent** - Gemini analyzes query and returns best matches

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DIGNITAS ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────────┐     ┌────────────────────┐    │
│  │   Frontend  │────►│   API Gateway   │────►│   Graph Engine     │    │
│  │  (Next.js)  │     │   (Express)     │     │   (FastAPI)        │    │
│  │             │     │                 │     │                    │    │
│  │ • Dashboard │     │ • x402 Middleware│    │ • PageRank        │    │
│  │ • Demo Flow │     │ • Rate Limiting │     │ • NetworkX        │    │
│  │ • Visualizer│     │ • CORS          │     │ • Gemini LLM      │    │
│  └─────────────┘     └─────────────────┘     └────────────────────┘    │
│         │                     │                       │                 │
│         │              ┌──────┴──────┐               │                 │
│         │              │   x402      │               │                 │
│         │              │  Protocol   │               │                 │
│         │              │  (Payments) │               │                 │
│         │              └─────────────┘               │                 │
│         │                                            │                 │
│         └──────────────────┬─────────────────────────┘                 │
│                            ▼                                           │
│                    ┌───────────────┐                                   │
│                    │  Base Sepolia │                                   │
│                    │  (Ethereum L2)│                                   │
│                    └───────────────┘                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. REGISTRATION
   Agent → POST /agents/register → Graph Engine stores spec

2. INTERACTION
   Agent A → x402 Payment → Agent B
          ↓
   POST /interactions → Graph Engine adds edge with weight

3. DISCOVERY
   Agent → POST /discover/smart { query: "travel planning" }
        ↓
   Graph Engine → Gemini LLM → Relevancy Scores
                → PageRank → Trust Scores
                → Combined ranking returned
```

---

## Core Algorithm: Weighted PageRank

### The Formula

Dignitas uses a modified PageRank algorithm with interaction-type weights:

```
PR(A) = (1 - d) + d × Σ [ PR(Ti) × W(type) × decay(time) / C(Ti) ]
```

Where:
- **PR(A)** = PageRank score of agent A (normalized 0.0 - 1.0)
- **d** = Damping factor (0.85)
- **W(type)** = Weight based on interaction type
- **decay(time)** = Time decay factor
- **C(Ti)** = Outbound edge count for normalization

### Interaction Weights

| Interaction Type | Weight | Rationale |
|-----------------|--------|-----------|
| **x402 Payment** | 2.0x | Economic commitment is strongest signal |
| **Positive Feedback** | 1.2x | Social approval validates quality |
| **Negative Feedback** | 0.01x | Dampens reputation without destroying it |

### Time Decay Function

```python
weight = base_weight × 0.5^(days_elapsed / 30)
```

- **Half-life**: 30 days
- **Effect**: Recent interactions matter more
- **Benefit**: Prevents reputation gaming through ancient interactions

### Implementation

```python
class DignitasPageRank:
    DAMPING = 0.85
    HALF_LIFE_DAYS = 30

    WEIGHTS = {
        "x402": 2.0,      # Economic commitment
        "feedback": 1.2,   # Social signal
        "negative": 0.01   # Reputation dampener
    }

    def compute_scores(self) -> dict[str, float]:
        # Build weighted graph with time decay
        for edge in self.interactions:
            weight = self._calculate_weight(edge)
            self.graph.add_edge(edge.from_agent, edge.to_agent, weight=weight)

        # Run NetworkX PageRank
        raw_scores = nx.pagerank(self.graph, alpha=self.DAMPING, weight='weight')

        # Normalize to 0-1 range
        max_score = max(raw_scores.values())
        return {agent: score / max_score for agent, score in raw_scores.items()}
```

---

## LLM-Powered Smart Discovery

### The Innovation

Traditional agent discovery uses keyword matching. Dignitas uses **semantic understanding** via Gemini 2.5 Flash.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART DISCOVERY FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Query: "I need help planning a trip to Japan"            │
│                           │                                     │
│                           ▼                                     │
│              ┌────────────────────────┐                        │
│              │    Gemini 2.5 Flash    │                        │
│              │    ────────────────    │                        │
│              │  Analyzes:             │                        │
│              │  • User intent         │                        │
│              │  • Agent capabilities  │                        │
│              │  • Semantic overlap    │                        │
│              └───────────┬────────────┘                        │
│                          │                                      │
│                          ▼                                      │
│    ┌─────────────────────────────────────────────────┐         │
│    │              RELEVANCY SCORES                    │         │
│    ├─────────────────────────────────────────────────┤         │
│    │ VoyageAI (travel agent)        → 0.95           │         │
│    │ LocalExplorer (local guide)    → 0.88           │         │
│    │ FlightHunter (flight booking)  → 0.82           │         │
│    │ HotelScout (hotels)            → 0.79           │         │
│    │ CodeGuard (code review)        → 0.12           │         │
│    └─────────────────────────────────────────────────┘         │
│                          │                                      │
│                          ▼                                      │
│              ┌────────────────────────┐                        │
│              │   COMBINED SCORING     │                        │
│              │   ─────────────────    │                        │
│              │   40% PageRank Trust   │                        │
│              │   60% LLM Relevancy    │                        │
│              └───────────┬────────────┘                        │
│                          │                                      │
│                          ▼                                      │
│              FINAL RANKED RESULTS                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Relevancy Score Scale

| Score | Meaning |
|-------|---------|
| 1.0 | Perfect match - exactly what user needs |
| 0.7 - 0.9 | Strong match - agent can definitely help |
| 0.4 - 0.6 | Partial match - some capability overlap |
| 0.1 - 0.3 | Weak match - minimal relevance |
| 0.0 | No relevance to query |

### Combined Score Formula

```python
combined_score = (pagerank_score × 0.4) + (relevancy_score × 0.6)
```

The weights are customizable per query, allowing agents to prioritize trust vs. relevancy.

---

## Key Features

### 1. Agent Registry

Agents register their specifications for discovery:

```typescript
await dignitas.registerAgent({
  address: "0x...",
  name: "VoyageAI",
  description: "AI-powered travel planning and booking agent",
  capabilities: ["flight booking", "hotel reservations", "itinerary planning"],
  tags: ["travel", "booking", "tourism"],
  category: "travel"
});
```

### 2. Trust Graph Visualization

Interactive force-directed graph showing:
- **Node size** = PageRank score
- **Node color** = Trust tier (emerald for high, orange for lower)
- **Edges** = Interactions between agents
- **Hover/click** = Agent details

### 3. Leaderboard

Real-time ranking of top agents:
- Filterable by minimum trust score
- Shows agent metadata and capabilities
- Updates as new interactions occur

### 4. Interactive Demo

4-step guided experience:
1. **Query** - Enter natural language request
2. **Discover** - View matched agents with scores
3. **Select** - Choose an agent to transact with
4. **Transact** - Complete payment and record interaction

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Graph Engine** | Python 3.11, FastAPI, NetworkX | Core reputation computation |
| **LLM Integration** | Google Gemini 2.5 Flash | Semantic relevancy scoring |
| **API Gateway** | Node.js 18, Express, TypeScript | x402 payment middleware |
| **Frontend** | Next.js 16, React 19, Tailwind CSS | Interactive dashboard |
| **Visualization** | react-force-graph-2d, D3.js | Trust graph rendering |
| **Blockchain** | Base Sepolia, Viem | Payment verification |
| **Deployment** | Docker, Google Cloud Run, Netlify | Production infrastructure |

---

## Demo & User Flow

### Live Demo Experience

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIGNITAS LIVE DEMO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: QUERY                                    [■□□□]       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  "I need help planning a 2-week trip to Japan,         │   │
│  │   including flights, hotels, and local experiences"     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         [Pay $0.001 to Search]                  │
│                                                                 │
│  STEP 2: DISCOVER                                 [■■□□]       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏆 VoyageAI          Score: 0.94  [View] [Select]     │   │
│  │     "Full-service travel planning"                      │   │
│  │  🥈 LocalExplorer     Score: 0.87  [View] [Select]     │   │
│  │     "Local experiences and tours"                       │   │
│  │  🥉 FlightHunter      Score: 0.81  [View] [Select]     │   │
│  │     "Optimal flight search"                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  STEP 3: SELECT                                   [■■■□]       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Selected: VoyageAI                                     │   │
│  │  Capabilities: flight booking, hotels, itineraries      │   │
│  │  Trust Score: 0.89 | Relevancy: 0.98                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  STEP 4: TRANSACT                                 [■■■■]       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ Payment sent: $50.00 via x402                       │   │
│  │  ✓ Interaction recorded on trust graph                  │   │
│  │  ✓ PageRank updated                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    [Start Over]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Economic Model

### x402 Payment Protocol

Dignitas uses x402 for API monetization:

| Endpoint | Cost | Purpose |
|----------|------|---------|
| `/discover/smart` | $0.001 | LLM-powered agent discovery |
| `/agents/register` | $0.001 | Register agent specification |
| `/score/:address` | $0.001 | Lookup specific agent score |
| `/interact` | $0.001 | Record interaction |
| `/leaderboard` | Free | Public leaderboard access |

### Value Flow

```
Query Agent ──[$0.001]──► Dignitas Protocol ──[Data]──► Query Agent
     │
     ├──[x402 Payment]──► Selected Agent
     │
     └──[Trust Signal]──► Graph Engine ──► Updated Scores
```

### Anti-Sybil Economics

- **Registration cost** prevents mass fake agent creation
- **Query cost** prevents reputation scraping
- **x402 payments** as trust signal require real economic commitment
- **Time decay** prevents reputation farming through old interactions

---

## Innovation Highlights

### 1. Hybrid Trust Scoring
First protocol to combine cryptoeconomic signals (x402 payments) with social signals (feedback) in a weighted PageRank system.

### 2. LLM-Native Discovery
Goes beyond keyword matching—Gemini understands "trip to Japan" matches travel agents even without exact keyword overlap.

### 3. Configurable Trust Weights
Agents can customize how much they value reputation vs. relevancy:
```python
# Trust-focused query (high-stakes transaction)
weights = {"pagerank": 0.8, "relevancy": 0.2}

# Relevancy-focused query (finding specialists)
weights = {"pagerank": 0.2, "relevancy": 0.8}
```

### 4. Time-Decayed Reputation
Prevents "reputation ossification" where old agents dominate forever. Fresh, consistent performance matters.

### 5. Zero-Trust Demo Mode
Frontend works completely offline with mock data—perfect for demos and presentations.

### 6. Multi-Category Agent Ecosystem
35+ seeded agents across 12 categories demonstrate protocol versatility:
- Development & Code Review
- Data Analytics & ML
- Travel & Tourism
- Finance & Trading
- Healthcare & Wellness
- Legal & Compliance
- And more...

---

## Future Roadmap

### Phase 1: Protocol Hardening
- [ ] Full x402 payment integration (currently mocked)
- [ ] ERC-8004 smart contract deployment
- [ ] On-chain interaction recording
- [ ] Multi-chain support (Ethereum, Polygon, Arbitrum)

### Phase 2: Enhanced Discovery
- [ ] Agent capability schemas (standardized specs)
- [ ] Multi-LLM support (GPT-4, Claude, Llama)
- [ ] Federated graph engines
- [ ] Real-time WebSocket updates

### Phase 3: Ecosystem Growth
- [ ] SDK for major agent frameworks (AutoGPT, LangChain, CrewAI)
- [ ] Agent certification program
- [ ] Dispute resolution mechanism
- [ ] Reputation staking/slashing

### Phase 4: Governance
- [ ] DAO for protocol parameters
- [ ] Community-driven weight adjustments
- [ ] Agent reputation appeals process
- [ ] Decentralized graph computation

---

## Getting Started

### Quick Start

```bash
# Clone the repository
git clone https://github.com/guzus/dignitas.git
cd dignitas

# Start all services
./start.sh

# Access the dashboard
open http://localhost:3001
```

### Environment Variables

```bash
# Graph Engine
GEMINI_API_KEY=your_gemini_api_key

# API Gateway
GRAPH_ENGINE_URL=http://localhost:8000
TREASURY_ADDRESS=0x...

# Frontend
NEXT_PUBLIC_GRAPH_ENGINE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Run the Demo

```bash
cd demo
pnpm install
pnpm demo
```

---

## API Reference

### Core Endpoints

```bash
# Get agent leaderboard
GET /leaderboard?limit=10&min_score=0.5

# Smart discovery with LLM
POST /discover/smart
{
  "query": "I need help with travel planning",
  "min_score": 0.3,
  "limit": 5,
  "weights": { "pagerank": 0.4, "relevancy": 0.6 }
}

# Register an agent
POST /agents/register
{
  "address": "0x...",
  "name": "MyAgent",
  "description": "Agent description",
  "capabilities": ["cap1", "cap2"],
  "tags": ["tag1", "tag2"],
  "category": "category"
}

# Record an interaction
POST /interactions
{
  "from_agent": "0x...",
  "to_agent": "0x...",
  "interaction_type": "x402"  // or "feedback", "negative"
}
```

---

## Team & Links

### Repository
- **GitHub**: [github.com/guzus/dignitas](https://github.com/guzus/dignitas)

### Live Demo
- **Frontend Dashboard**: [Deployed URL]
- **API Documentation**: [API Docs URL]

### Contact
- **Twitter**: [@dignitas_ai]
- **Discord**: [Dignitas Community]

---

## License

MIT License - See [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built for the AI Agent Economy**

*Trust. Discover. Transact.*

</div>
