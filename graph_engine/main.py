from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import random

from pagerank import DignitasPageRank

app = FastAPI(title="Dignitas Graph Engine")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

engine = DignitasPageRank()

# --- Seed with demo data on startup ---
@app.on_event("startup")
def seed_demo_data():
    """Create realistic demo graph."""
    agents = [
        "0x1111111111111111111111111111111111111111",  # High trust
        "0x2222222222222222222222222222222222222222",  # High trust
        "0x3333333333333333333333333333333333333333",  # Medium
        "0x4444444444444444444444444444444444444444",  # Medium
        "0x5555555555555555555555555555555555555555",  # Low
        "0x6666666666666666666666666666666666666666",  # Low
        "0x7777777777777777777777777777777777777777",  # New
        "0x8888888888888888888888888888888888888888",  # New
        "0x9999999999999999999999999999999999999999",  # Sybil
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",  # Sybil
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",  # Sybil
        "0xcccccccccccccccccccccccccccccccccccccccc",  # Sybil
        "0xdddddddddddddddddddddddddddddddddddddddd",  # Sybil
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",  # Sybil
        "0xffffffffffffffffffffffffffffffffffffffff",  # Sybil
    ]
    
    # Simulate realistic interaction patterns
    interactions = [
        # High-trust agents get lots of x402 payments
        (agents[2], agents[0], "x402"),
        (agents[3], agents[0], "x402"),
        (agents[4], agents[0], "x402"),
        (agents[5], agents[0], "feedback"),
        (agents[2], agents[1], "x402"),
        (agents[3], agents[1], "x402"),
        (agents[4], agents[1], "feedback"),
        # Medium agents
        (agents[0], agents[2], "x402"),
        (agents[1], agents[2], "feedback"),
        (agents[0], agents[3], "feedback"),
        # Cross-endorsements between top agents
        (agents[0], agents[1], "x402"),
        (agents[1], agents[0], "x402"),
        # Negative feedback (Sybil attack attempt)
        (agents[0], agents[8], "negative_feedback"),
        (agents[1], agents[9], "negative_feedback"),
        # Sybil cluster (interacting with each other but isolated)
        (agents[8], agents[9], "x402"),
        (agents[9], agents[10], "x402"),
        (agents[10], agents[8], "x402"),
    ]
    
    # Generate more random interactions
    for _ in range(150):
        src = random.choice(agents) 
        dst = random.choice(agents)
        if src != dst:
            interactions.append((src, dst, random.choice(["x402", "feedback"])))

    for from_a, to_a, itype in interactions:
        days_ago = random.randint(1, 25)
        ts = datetime.utcnow() - timedelta(days=days_ago)
        engine.add_interaction(from_a.lower(), to_a.lower(), itype, ts)
    
    print(f"Seeded {len(interactions)} interactions")

# --- API Endpoints ---

class InteractionRequest(BaseModel):
    from_agent: str
    to_agent: str
    interaction_type: str  # 'x402' or 'feedback'

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/scores")
def get_all_scores():
    """Get all agent scores."""
    scores = engine.compute_scores()
    return {"scores": scores, "count": len(scores)}

@app.get("/scores/{agent}")
def get_agent_score(agent: str):
    """Get score for specific agent."""
    score = engine.get_score(agent)
    return {"agent": agent.lower(), "score": round(score, 4)}

@app.get("/leaderboard")
def get_leaderboard(limit: int = 10, min_score: float = 0):
    """Get top agents."""
    top = engine.get_top_agents(limit * 2)  # Get extra to filter
    filtered = [(a, s) for a, s in top if s >= min_score][:limit]
    return {
        "agents": [{"address": a, "score": round(s, 4)} for a, s in filtered]
    }

@app.get("/discover")
def discover_agents(
    min_score: float = 0,
    limit: int = 10
):
    """Discover agents above threshold."""
    top = engine.get_top_agents(50)
    filtered = [(a, s) for a, s in top if s >= min_score][:limit]
    return {
        "agents": [{"address": a, "score": round(s, 4)} for a, s in filtered],
        "total_agents": len(engine.graph.nodes())
    }

@app.post("/interactions")
def add_interaction(req: InteractionRequest):
    """Record new interaction."""
    engine.add_interaction(
        req.from_agent.lower(),
        req.to_agent.lower(),
        req.interaction_type
    )
    return {"status": "ok"}
