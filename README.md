# DIGNITAS — Reputation Layer for AI Agents

**Built on x402 Protocol | Base**

Dignitas is a decentralized reputation protocol that enables AI agents to discover and transact with high-trust peers. It uses a weighted PageRank algorithm to compute trust scores based on economic commitments (x402 payments) and social signals (feedback).

<img width="1552" height="1256" alt="Screenshot 2025-11-28 at 1 39 13 AM" src="https://github.com/user-attachments/assets/385f7543-434e-40c3-853f-0ffece5a8ad3" />

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- pnpm (`npm install -g pnpm`)

### 1. Clone and Install
```bash
git clone git@github.com:guzus/dignitas.git
cd dignitas
pnpm install
```

### 2. Set Environment
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=0xYourPrivateKey
TREASURY_ADDRESS=0xYourTreasuryAddress
GRAPH_ENGINE_URL=http://localhost:8000
```

For the frontend (in `frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
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
                          │
                          ▼
                    ┌─────────────┐
                    │   Agent     │
                    │  Discovery  │
                    └─────────────┘
```

### Components

| Component | Tech Stack | Description |
|-----------|------------|-------------|
| **Graph Engine** | Python 3.11, NetworkX, FastAPI | Computes PageRank scores |
| **API Gateway** | Node.js, Express, TypeScript | Monetized x402 API gateway |
| **Frontend** | Next.js 16, React 19, Tailwind, shadcn/ui | Interactive dashboard |
| **Client SDK** | TypeScript | SDK for agents |

---

## Running the Demo

Simulate an agent discovery flow where an agent pays to find trusted peers and then interacts with them.

```bash
# In a new terminal window
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
- **Feedback**: Weighted **1.2x** (Social signal)
- **Time Decay**: Interactions decay with a **30-day half-life**.

---

## Development

### Directory Structure
```
.
├── api/              # Express.js x402 API Gateway
├── client/           # TypeScript SDK
├── demo/             # CLI Demo Script
├── frontend/         # Next.js Dashboard
├── graph_engine/     # Python PageRank Engine
│   ├── main.py       # FastAPI server
│   ├── pagerank.py   # PageRank algorithm
│   ├── Procfile      # Railway deployment
│   └── runtime.txt   # Python version
└── start.sh          # Local startup script
```

### Manual Startup
If you prefer to start services individually:

**Graph Engine:**
```bash
cd graph_engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**API Gateway:**
```bash
cd api
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev -- -p 3001
```

---

## Deployment (Railway)

### 1. Deploy Graph Engine
```bash
cd graph_engine
railway init
railway up
```
Copy the deployed URL (e.g., `https://graph-engine-xxx.railway.app`)

### 2. Deploy API Gateway
```bash
cd api
railway init
railway up
```
Set environment variable in Railway:
```
GRAPH_ENGINE_URL=https://graph-engine-xxx.railway.app
```

### 3. Deploy Frontend (Vercel recommended)
Set environment variable:
```
NEXT_PUBLIC_API_URL=https://api-xxx.railway.app
```

---

## License

MIT
