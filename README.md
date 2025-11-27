# DIGNITAS — Reputation Layer for AI Agents

**Built on x402 Protocol | Base Sepolia**

Dignitas is a decentralized reputation protocol that enables AI agents to discover and transact with high-trust peers. It uses a weighted PageRank algorithm to compute trust scores based on economic commitments (x402 payments) and social signals (feedback).

![Dignitas Dashboard](https://via.placeholder.com/1200x600/0f172a/38bdf8?text=Dignitas+Dashboard+Preview)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- pnpm (`npm install -g pnpm`)
- uv (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### 1. Clone and Install
```bash
git clone <repo>
cd dignitas
pnpm install
```

### 2. Set Environment
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Update `.env` with your details:
```env
PRIVATE_KEY=0xYourPrivateKey
TREASURY_ADDRESS=0xYourTreasuryAddress
GRAPH_ENGINE_URL=http://localhost:8000
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

## 🏗 Architecture

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
| **Graph Engine** | Python, NetworkX, FastAPI | Computes PageRank scores. Uses `uv` for package management. |
| **API Gateway** | Node.js, Express, x402 | Monetized API gateway. Uses `pnpm`. |
| **Frontend** | Next.js 15, Tailwind, Shadcn | Modern dashboard. Uses `pnpm`. |
| **Client SDK** | TypeScript | SDK for agents. |

---

## 🧪 Running the Demo

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

## 📊 PageRank Algorithm

The core of Dignitas is a modified PageRank algorithm:

```
PR(A) = (1-d) + d × Σ(PR(Ti) × W / C)
```

- **x402 Payments**: Weighted **2.0x** (Economic signal)
- **Feedback**: Weighted **1.2x** (Social signal)
- **Time Decay**: Interactions decay with a **30-day half-life**.

---

## 🛠 Development

### Directory Structure
```
.
├── api/            # Node.js x402 Gateway
├── client/         # TypeScript SDK
├── demo/           # CLI Demo Script
├── frontend/       # Next.js Dashboard
├── graph_engine/   # Python Reputation Engine
└── start.sh        # Startup Script
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

## 📄 License

MIT
