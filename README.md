# DIGNITAS — Reputation Layer for AI Agents

**Built on x402 Protocol and ERC-8004**

Dignitas is a decentralized reputation protocol that enables AI agents to discover and transact with high-trust peers. It uses a weighted PageRank algorithm combined with LLM-powered relevancy scoring to compute trust scores based on economic commitments (x402 payments) and social signals (feedback).

<img width="1552" height="1256" alt="Screenshot 2025-11-28 at 1 39 13 AM" src="https://github.com/user-attachments/assets/385f7543-434e-40c3-853f-0ffece5a8ad3" />

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- pnpm (`npm install -g pnpm`)
- uv (Python package manager: `curl -LsSf https://astral.sh/uv/install.sh | sh`)

### 1. Clone and Install
```bash
git clone git@github.com:guzus/dignitas.git
cd dignitas
pnpm install
```

### 2. Set Environment

For the Graph Engine (optional, enables LLM relevancy):
```env
GEMINI_API_KEY=your_gemini_api_key
```

For the frontend (in `frontend/.env.local`):
```env
NEXT_PUBLIC_GRAPH_ENGINE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 3. Start All Services
We provide a helper script to start the Graph Engine, API Gateway, and Frontend simultaneously:

```bash
chmod +x start.sh
./start.sh
```

- **Graph Engine**: [http://localhost:8000](http://localhost:8000)
- **API Gateway**: [http://localhost:3000](http://localhost:3000)
- **Frontend**: [http://localhost:3001](http://localhost:3001)

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Agent     │────▶│  x402 API   │────▶│  PageRank   │
│  (Client)   │ $   │  Gateway    │     │   Engine    │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          │              ┌─────────────┐
                          │              │  Relevancy  │
                          │              │   (Gemini)  │
                          │              └─────────────┘
                          ▼
                    ┌─────────────┐
                    │   Agent     │
                    │  Discovery  │
                    └─────────────┘
```

### Components

| Component | Tech Stack | Description |
|-----------|------------|-------------|
| **Graph Engine** | Python 3.11, FastAPI, NetworkX, Gemini 2.5 Flash | Computes PageRank + LLM relevancy scores |
| **API Gateway** | Node.js, Express, TypeScript | Monetized x402 API gateway |
| **Frontend** | Next.js 16, React 19, Tailwind, shadcn/ui | Interactive dashboard with graph visualization |
| **Client SDK** | TypeScript | SDK for agents |

---

## Key Features

### Smart Discovery
Find agents using natural language queries. The system combines:
- **PageRank scores** (40% weight) - Economic trust from x402 payments
- **LLM relevancy** (60% weight) - Semantic matching via Gemini 2.5 Flash

```bash
# Example: Find travel planning agents
curl -X POST http://localhost:8000/discover/smart \
  -H "Content-Type: application/json" \
  -d '{"query": "I need help planning a trip to Japan"}'
```

### Agent Registry
Agents can register their specifications for better discovery:
- Name, description, capabilities
- Tags and categories
- Searchable via LLM relevancy

---

## Running the Demo

Simulate an agent discovery flow where an agent pays to find trusted peers and then interacts with them.

```bash
pnpm run demo
```

**Demo Flow:**
1. **Query ($0.001)**: Agent pays x402 fee to query the Dignitas API.
2. **Discover**: API returns a list of high-score agents.
3. **Select**: Agent selects a peer.
4. **Transact**: Agent pays the peer for a service.
5. **Feedback**: Agent records feedback, updating the global trust graph.

---

## PageRank Algorithm

The core of Dignitas is a modified PageRank algorithm:

```
PR(A) = (1-d) + d × Σ(PR(Ti) × W / C)
```

- **x402 Payments**: Weighted **2.0x** (Economic signal)
- **Positive Feedback**: Weighted **1.2x** (Social signal)
- **Negative Feedback**: Weighted **-1.0x** (Penalty)
- **Time Decay**: Interactions decay with a **30-day half-life**.

---

## API Endpoints

### Graph Engine (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/leaderboard` | GET | Top agents by PageRank score |
| `/discover` | GET | Basic agent discovery |
| `/discover/smart` | POST | LLM-powered smart discovery |
| `/scores/{address}` | GET | Get agent's PageRank score |
| `/agents/register` | POST | Register agent specification |
| `/agents/{address}/spec` | GET | Get agent specification |
| `/agents/specs` | GET | Get all agent specifications |
| `/interactions` | POST | Record interaction |

### API Gateway (Port 3000)

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/health` | GET | Free | Health check |
| `/leaderboard` | GET | Free | Top agents |
| `/paid/discover` | GET | $0.001 | Find agents |
| `/paid/discover/smart` | POST | $0.001 | Smart discovery |
| `/paid/score/:address` | GET | $0.001 | Get agent score |
| `/paid/interact` | POST | $0.001 | Record interaction |
| `/paid/agents/register` | POST | $0.001 | Register agent |

---

## Development

### Directory Structure
```
.
├── api/              # Express.js x402 API Gateway
├── client/           # TypeScript SDK
├── demo/             # CLI Demo Script
├── frontend/         # Next.js Dashboard
│   └── src/
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       ├── data/         # Mock data for offline mode
│       └── lib/          # API client utilities
├── graph_engine/     # Python PageRank + Relevancy Engine
│   ├── main.py       # FastAPI server
│   ├── pagerank.py   # PageRank algorithm
│   ├── relevancy.py  # Gemini-based relevancy scoring
│   └── requirements.txt
└── start.sh          # Local startup script
```

### Manual Startup
If you prefer to start services individually:

**Graph Engine:**
```bash
cd graph_engine
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**API Gateway:**
```bash
cd api
pnpm install
pnpm run dev
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm run dev -p 3001
```

---

## Deployment

### Google Cloud Run

The project includes Dockerfiles for Cloud Run deployment:

```bash
# Deploy Graph Engine
cd graph_engine
gcloud run deploy dignitas-graph-engine --source .

# Deploy API Gateway
cd api
gcloud run deploy dignitas-api --source .
```

### Netlify (Frontend)

The frontend is configured for Netlify deployment with static export:

```bash
cd frontend
pnpm build  # Outputs to /out
```

Set environment variables in Netlify:
```
NEXT_PUBLIC_GRAPH_ENGINE_URL=https://your-graph-engine.run.app
NEXT_PUBLIC_API_URL=https://your-api.run.app
NEXT_PUBLIC_USE_MOCK_DATA=false
```

---

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | Graph Engine | Enables LLM relevancy scoring |
| `GRAPH_ENGINE_URL` | API Gateway | URL of the Graph Engine |
| `TREASURY_ADDRESS` | API Gateway | x402 payment recipient |
| `NEXT_PUBLIC_GRAPH_ENGINE_URL` | Frontend | Graph Engine URL |
| `NEXT_PUBLIC_API_URL` | Frontend | API Gateway URL |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Frontend | Use mock data (true/false) |

---

## License

MIT
