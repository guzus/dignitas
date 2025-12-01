from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import random

from pagerank import DignitasPageRank
from relevancy import RelevancyEngine

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
relevancy_engine = RelevancyEngine()


# --- Seed with demo data on startup ---
@app.on_event("startup")
def seed_demo_data():
    """Create realistic demo graph with deterministic data."""
    random.seed(42)  # Fixed seed for reproducible scores
    # 30 agents with diverse trust levels
    agents = [
        # Tier 1: High trust (established, many interactions)
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333",
        "0x4444444444444444444444444444444444444444",
        "0x5555555555555555555555555555555555555555",
        # Tier 2: Medium trust (growing reputation)
        "0x6666666666666666666666666666666666666666",
        "0x7777777777777777777777777777777777777777",
        "0x8888888888888888888888888888888888888888",
        "0x9999999999999999999999999999999999999999",
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        # Tier 3: Lower trust (newer agents)
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "0xcccccccccccccccccccccccccccccccccccccccc",
        "0xdddddddddddddddddddddddddddddddddddddddd",
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        "0xffffffffffffffffffffffffffffffffffffffff",
        # Additional agents for variety
        "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        "0xb2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
        "0xc3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3",
        "0xd4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4",
        "0xe5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5",
        "0xf6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6",
        "0xa7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7",
        "0xb8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8",
        "0xc9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9",
        "0xdadadadadadadadadadadadadadadadadadadada",
    ]

    # Simulate realistic interaction patterns
    interactions = [
        # Tier 1 agents receive many x402 payments (high trust)
        (agents[5], agents[0], "x402"),
        (agents[6], agents[0], "x402"),
        (agents[7], agents[0], "x402"),
        (agents[8], agents[0], "x402"),
        (agents[9], agents[0], "feedback"),
        (agents[5], agents[1], "x402"),
        (agents[6], agents[1], "x402"),
        (agents[7], agents[1], "x402"),
        (agents[8], agents[1], "feedback"),
        (agents[5], agents[2], "x402"),
        (agents[6], agents[2], "x402"),
        (agents[7], agents[2], "feedback"),
        (agents[5], agents[3], "x402"),
        (agents[6], agents[3], "feedback"),
        (agents[5], agents[4], "x402"),
        # Cross-endorsements between top agents
        (agents[0], agents[1], "x402"),
        (agents[1], agents[0], "x402"),
        (agents[0], agents[2], "x402"),
        (agents[2], agents[0], "feedback"),
        (agents[1], agents[3], "x402"),
        (agents[3], agents[1], "feedback"),
        (agents[2], agents[4], "x402"),
        (agents[4], agents[2], "feedback"),
        # Tier 2 agents building reputation
        (agents[0], agents[5], "x402"),
        (agents[1], agents[6], "x402"),
        (agents[2], agents[7], "feedback"),
        (agents[3], agents[8], "x402"),
        (agents[4], agents[9], "feedback"),
        # Tier 3 newer agents
        (agents[5], agents[10], "feedback"),
        (agents[6], agents[11], "feedback"),
        (agents[7], agents[12], "x402"),
        (agents[8], agents[13], "feedback"),
        (agents[9], agents[14], "x402"),
        # Additional agents getting some interactions
        (agents[0], agents[15], "x402"),
        (agents[1], agents[16], "feedback"),
        (agents[2], agents[17], "x402"),
        (agents[3], agents[18], "feedback"),
        (agents[4], agents[19], "x402"),
        (agents[5], agents[20], "feedback"),
        (agents[6], agents[21], "x402"),
        (agents[7], agents[22], "feedback"),
        (agents[8], agents[23], "x402"),
        (agents[9], agents[24], "feedback"),
        # Some negative feedback for bad actors
        (agents[0], agents[14], "negative_feedback"),
        (agents[1], agents[13], "negative_feedback"),
        (agents[2], agents[12], "negative_feedback"),
    ]

    # Generate more random interactions for realistic graph
    for _ in range(300):
        src = random.choice(agents)
        dst = random.choice(agents)
        if src != dst:
            # Weight towards x402 for top agents
            if dst in agents[:5]:
                itype = random.choice(["x402", "x402", "feedback"])
            else:
                itype = random.choice(["x402", "feedback"])
            interactions.append((src, dst, itype))

    for from_a, to_a, itype in interactions:
        days_ago = random.randint(1, 25)
        ts = datetime.utcnow() - timedelta(days=days_ago)
        engine.add_interaction(from_a.lower(), to_a.lower(), itype, ts)

    print(f"Seeded {len(interactions)} interactions")

    # Seed agent specifications for relevancy matching - comprehensive demo data
    agent_specs = [
        {
            "address": agents[0],
            "name": "CodeGuard Pro",
            "description": "Expert code reviewer that analyzes code quality, security vulnerabilities, and best practices. Supports 20+ programming languages including Python, JavaScript, Rust, and Solidity.",
            "capabilities": [
                "code review",
                "security audit",
                "best practices",
                "refactoring suggestions",
                "vulnerability detection",
                "code smell detection",
            ],
            "tags": ["development", "security", "quality", "audit"],
            "category": "development",
        },
        {
            "address": agents[1],
            "name": "DataMind Analytics",
            "description": "Advanced data analysis agent that processes datasets, generates actionable insights, creates beautiful visualizations, and builds predictive models using state-of-the-art ML techniques.",
            "capabilities": [
                "data analysis",
                "visualization",
                "statistics",
                "machine learning",
                "predictive modeling",
                "ETL pipelines",
                "dashboard creation",
            ],
            "tags": ["data", "analytics", "ML", "visualization", "insights"],
            "category": "analytics",
        },
        {
            "address": agents[2],
            "name": "InfraBot",
            "description": "Full-stack DevOps automation agent. Manages CI/CD pipelines, Kubernetes clusters, Terraform infrastructure, and provides 24/7 monitoring with intelligent alerting.",
            "capabilities": [
                "CI/CD",
                "infrastructure",
                "kubernetes",
                "terraform",
                "monitoring",
                "AWS",
                "GCP",
                "Azure",
                "Docker",
            ],
            "tags": ["devops", "infrastructure", "automation", "cloud"],
            "category": "operations",
        },
        {
            "address": agents[3],
            "name": "ContentCraft AI",
            "description": "Professional writing assistant for content creation, SEO optimization, copywriting, and brand voice consistency. Creates blog posts, marketing copy, and social media content.",
            "capabilities": [
                "writing",
                "editing",
                "copywriting",
                "content strategy",
                "SEO",
                "social media",
                "blog posts",
                "email campaigns",
            ],
            "tags": ["content", "writing", "marketing", "SEO", "social"],
            "category": "content",
        },
        {
            "address": agents[4],
            "name": "ResearchBot Alpha",
            "description": "Deep research agent that scours academic papers, synthesizes information, provides citations, and generates comprehensive literature reviews on any topic.",
            "capabilities": [
                "research",
                "summarization",
                "citation",
                "fact-checking",
                "literature review",
                "paper analysis",
                "knowledge synthesis",
            ],
            "tags": ["research", "academic", "knowledge", "papers"],
            "category": "research",
        },
        {
            "address": agents[5],
            "name": "SupportHero",
            "description": "AI-powered customer support agent with multi-language support. Handles inquiries, troubleshooting, ticket management, and escalation with empathy and efficiency.",
            "capabilities": [
                "customer support",
                "troubleshooting",
                "ticket management",
                "multi-language",
                "escalation",
                "FAQ automation",
            ],
            "tags": ["support", "customer service", "helpdesk"],
            "category": "support",
        },
        {
            "address": agents[6],
            "name": "AlphaTrader",
            "description": "Sophisticated trading agent for crypto and DeFi markets. Analyzes on-chain data, executes trades, manages portfolio strategies, and provides real-time market insights.",
            "capabilities": [
                "trading",
                "market analysis",
                "portfolio management",
                "DeFi",
                "on-chain analysis",
                "arbitrage",
                "yield farming",
                "risk management",
            ],
            "tags": ["finance", "trading", "crypto", "DeFi", "blockchain"],
            "category": "finance",
        },
        {
            "address": agents[7],
            "name": "LegalEagle AI",
            "description": "Legal assistant specializing in contract review, compliance checking, and legal document drafting. Supports smart contract auditing and regulatory analysis.",
            "capabilities": [
                "contract review",
                "legal research",
                "document drafting",
                "compliance",
                "smart contract audit",
                "regulatory analysis",
            ],
            "tags": ["legal", "compliance", "contracts", "regulatory"],
            "category": "legal",
        },
        {
            "address": agents[8],
            "name": "TranslateX",
            "description": "Real-time translation agent supporting 100+ languages with context-aware translations, localization, and cultural adaptation for global content.",
            "capabilities": [
                "translation",
                "localization",
                "language detection",
                "cultural adaptation",
                "document translation",
                "real-time interpretation",
            ],
            "tags": ["translation", "languages", "localization", "global"],
            "category": "content",
        },
        {
            "address": agents[9],
            "name": "DesignMuse",
            "description": "Creative design assistant that generates UI/UX mockups, brand assets, illustrations, and provides design feedback based on modern design principles.",
            "capabilities": [
                "UI design",
                "UX research",
                "brand design",
                "illustrations",
                "design feedback",
                "wireframing",
                "prototyping",
            ],
            "tags": ["design", "UI", "UX", "creative", "branding"],
            "category": "creative",
        },
        {
            "address": agents[10],
            "name": "SecuritySentinel",
            "description": "Cybersecurity agent that performs penetration testing, vulnerability assessments, threat detection, and security compliance audits for web3 and traditional systems.",
            "capabilities": [
                "penetration testing",
                "vulnerability assessment",
                "threat detection",
                "security audit",
                "compliance",
                "incident response",
            ],
            "tags": ["security", "cybersecurity", "audit", "compliance"],
            "category": "security",
        },
        {
            "address": agents[11],
            "name": "MeetingMind",
            "description": "Meeting assistant that transcribes calls, generates summaries, extracts action items, and schedules follow-ups automatically.",
            "capabilities": [
                "transcription",
                "meeting summaries",
                "action items",
                "scheduling",
                "note-taking",
                "calendar management",
            ],
            "tags": ["productivity", "meetings", "transcription", "scheduling"],
            "category": "productivity",
        },
        {
            "address": agents[12],
            "name": "NFT Curator",
            "description": "NFT specialist agent that analyzes collections, tracks floor prices, identifies trends, and provides investment recommendations for digital art and collectibles.",
            "capabilities": [
                "NFT analysis",
                "collection tracking",
                "price prediction",
                "rarity analysis",
                "market trends",
                "portfolio tracking",
            ],
            "tags": ["NFT", "crypto", "art", "collectibles", "investment"],
            "category": "finance",
        },
        {
            "address": agents[13],
            "name": "HealthBot Pro",
            "description": "Health and wellness assistant providing fitness plans, nutrition advice, symptom checking, and mental health support with evidence-based recommendations.",
            "capabilities": [
                "fitness planning",
                "nutrition advice",
                "symptom checking",
                "mental health",
                "wellness tracking",
                "habit building",
            ],
            "tags": ["health", "fitness", "wellness", "nutrition"],
            "category": "health",
        },
        {
            "address": agents[14],
            "name": "EduTutor AI",
            "description": "Personalized education agent that creates custom learning paths, explains complex concepts, provides practice problems, and tracks learning progress.",
            "capabilities": [
                "tutoring",
                "curriculum design",
                "concept explanation",
                "practice problems",
                "progress tracking",
                "adaptive learning",
            ],
            "tags": ["education", "learning", "tutoring", "teaching"],
            "category": "education",
        },
        # Additional agents (16-25)
        {
            "address": agents[15],
            "name": "TravelGenius",
            "description": "AI travel planner that creates personalized itineraries, finds best deals on flights and hotels, and provides local recommendations.",
            "capabilities": [
                "travel planning",
                "flight booking",
                "hotel search",
                "itinerary creation",
                "local guides",
                "budget optimization",
            ],
            "tags": ["travel", "planning", "booking", "tourism"],
            "category": "travel",
        },
        {
            "address": agents[16],
            "name": "SocialPulse",
            "description": "Social media management agent that schedules posts, analyzes engagement, tracks trends, and optimizes content strategy across platforms.",
            "capabilities": [
                "social media",
                "content scheduling",
                "analytics",
                "trend analysis",
                "engagement optimization",
                "hashtag research",
            ],
            "tags": ["social", "marketing", "analytics", "content"],
            "category": "marketing",
        },
        {
            "address": agents[17],
            "name": "SupplyChain AI",
            "description": "Supply chain optimization agent that forecasts demand, manages inventory, tracks shipments, and identifies cost-saving opportunities.",
            "capabilities": [
                "demand forecasting",
                "inventory management",
                "logistics",
                "cost optimization",
                "supplier management",
                "tracking",
            ],
            "tags": ["supply chain", "logistics", "inventory", "operations"],
            "category": "operations",
        },
        {
            "address": agents[18],
            "name": "HRBot Pro",
            "description": "Human resources assistant that screens resumes, schedules interviews, onboards employees, and manages HR documentation.",
            "capabilities": [
                "resume screening",
                "interview scheduling",
                "onboarding",
                "HR documentation",
                "employee management",
                "compliance",
            ],
            "tags": ["HR", "recruiting", "onboarding", "management"],
            "category": "hr",
        },
        {
            "address": agents[19],
            "name": "SalesForce AI",
            "description": "Sales automation agent that qualifies leads, manages pipelines, generates proposals, and provides sales forecasting.",
            "capabilities": [
                "lead qualification",
                "pipeline management",
                "proposal generation",
                "sales forecasting",
                "CRM integration",
                "follow-ups",
            ],
            "tags": ["sales", "CRM", "leads", "automation"],
            "category": "sales",
        },
        {
            "address": agents[20],
            "name": "VideoEdit Pro",
            "description": "AI video editor that cuts footage, adds effects, generates captions, and optimizes videos for different platforms.",
            "capabilities": [
                "video editing",
                "effects",
                "captions",
                "platform optimization",
                "thumbnail generation",
                "audio sync",
            ],
            "tags": ["video", "editing", "content", "media"],
            "category": "creative",
        },
        {
            "address": agents[21],
            "name": "EmailMaster",
            "description": "Email automation agent that writes personalized emails, manages campaigns, A/B tests subject lines, and optimizes deliverability.",
            "capabilities": [
                "email writing",
                "campaign management",
                "A/B testing",
                "deliverability",
                "personalization",
                "analytics",
            ],
            "tags": ["email", "marketing", "automation", "campaigns"],
            "category": "marketing",
        },
        {
            "address": agents[22],
            "name": "APIBuilder",
            "description": "API development agent that designs RESTful APIs, generates documentation, creates SDKs, and handles versioning.",
            "capabilities": [
                "API design",
                "documentation",
                "SDK generation",
                "versioning",
                "testing",
                "OpenAPI spec",
            ],
            "tags": ["API", "development", "documentation", "backend"],
            "category": "development",
        },
        {
            "address": agents[23],
            "name": "BugHunter",
            "description": "Automated testing agent that finds bugs, generates test cases, performs regression testing, and reports issues.",
            "capabilities": [
                "bug detection",
                "test generation",
                "regression testing",
                "issue reporting",
                "coverage analysis",
                "CI integration",
            ],
            "tags": ["testing", "QA", "bugs", "automation"],
            "category": "development",
        },
        {
            "address": agents[24],
            "name": "CryptoWallet AI",
            "description": "Crypto wallet management agent that tracks portfolios, monitors gas fees, suggests optimal transaction times, and alerts on price movements.",
            "capabilities": [
                "portfolio tracking",
                "gas optimization",
                "price alerts",
                "transaction history",
                "multi-chain support",
                "DeFi integration",
            ],
            "tags": ["crypto", "wallet", "portfolio", "blockchain"],
            "category": "finance",
        },
    ]

    for spec in agent_specs:
        relevancy_engine.register_agent(spec["address"], spec)

    print(f"Registered {len(agent_specs)} agent specifications")


# --- API Endpoints ---


class InteractionRequest(BaseModel):
    from_agent: str
    to_agent: str
    interaction_type: str  # 'x402' or 'feedback'


class AgentSpecRequest(BaseModel):
    address: str
    name: str
    description: str
    capabilities: List[str] = []
    tags: List[str] = []
    category: str = "general"


class SmartDiscoverRequest(BaseModel):
    query: str
    min_score: float = 0
    limit: int = 10
    pagerank_weight: float = 0.4
    relevancy_weight: float = 0.6


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
    """Get top agents with their specifications."""
    top = engine.get_top_agents(limit * 2)  # Get extra to filter
    filtered = [(a, s) for a, s in top if s >= min_score][:limit]
    agents = []
    for addr, score in filtered:
        agent_data = {"address": addr, "score": round(score, 4)}
        spec = relevancy_engine.get_agent_spec(addr)
        if spec:
            agent_data["name"] = spec.get("name", "Unknown Agent")
            agent_data["description"] = spec.get("description", "")
            agent_data["capabilities"] = spec.get("capabilities", [])
            agent_data["tags"] = spec.get("tags", [])
            agent_data["category"] = spec.get("category", "general")
        agents.append(agent_data)
    return {"agents": agents}


@app.get("/discover")
def discover_agents(min_score: float = 0, limit: int = 10):
    """Discover agents above threshold with their specifications."""
    top = engine.get_top_agents(50)
    filtered = [(a, s) for a, s in top if s >= min_score][:limit]
    agents = []
    for addr, score in filtered:
        agent_data = {"address": addr, "score": round(score, 4)}
        spec = relevancy_engine.get_agent_spec(addr)
        if spec:
            agent_data["name"] = spec.get("name", "Unknown Agent")
            agent_data["description"] = spec.get("description", "")
            agent_data["capabilities"] = spec.get("capabilities", [])
            agent_data["tags"] = spec.get("tags", [])
            agent_data["category"] = spec.get("category", "general")
        agents.append(agent_data)
    return {
        "agents": agents,
        "total_agents": len(engine.graph.nodes()),
    }


@app.post("/interactions")
def add_interaction(req: InteractionRequest):
    """Record new interaction."""
    engine.add_interaction(
        req.from_agent.lower(), req.to_agent.lower(), req.interaction_type
    )
    return {"status": "ok"}


# --- Agent Specification Endpoints ---


@app.post("/agents/register")
def register_agent(req: AgentSpecRequest):
    """Register or update an agent's specification."""
    relevancy_engine.register_agent(req.address, req.model_dump())
    return {"status": "registered", "address": req.address.lower()}


@app.get("/agents/{address}/spec")
def get_agent_spec(address: str):
    """Get an agent's specification."""
    spec = relevancy_engine.get_agent_spec(address)
    if not spec:
        raise HTTPException(status_code=404, detail="Agent specification not found")
    return {"address": address.lower(), "spec": spec}


@app.get("/agents/specs")
def get_all_agent_specs():
    """Get all registered agent specifications."""
    specs = relevancy_engine.get_all_specs()
    return {"agents": specs, "count": len(specs)}


# --- Smart Discovery with LLM Relevancy ---


@app.post("/discover/smart")
async def smart_discover(req: SmartDiscoverRequest):
    """
    Discover agents using combined PageRank + LLM relevancy scoring.

    This endpoint:
    1. Gets top agents by PageRank score
    2. Uses Gemini to compute relevancy to the user's query
    3. Combines scores with configurable weights
    4. Returns agents sorted by combined score
    """
    # Get top agents by PageRank
    top = engine.get_top_agents(50)
    agents = [
        {"address": a, "pagerank_score": round(s, 4)}
        for a, s in top
        if s >= req.min_score
    ]

    if not agents:
        return {"agents": [], "query": req.query, "total_agents": 0}

    # Compute relevancy scores using LLM
    agents = await relevancy_engine.compute_relevancy(req.query, agents)

    # Compute combined scores
    for agent in agents:
        agent["combined_score"] = round(
            relevancy_engine.compute_combined_score(
                agent["pagerank_score"],
                agent["relevancy_score"],
                req.pagerank_weight,
                req.relevancy_weight,
            ),
            4,
        )
        # Add agent spec info if available
        spec = relevancy_engine.get_agent_spec(agent["address"])
        if spec:
            agent["name"] = spec.get("name", "Unknown")
            agent["description"] = spec.get("description", "")
            agent["category"] = spec.get("category", "general")

    # Sort by combined score and limit
    agents = sorted(agents, key=lambda x: x["combined_score"], reverse=True)[
        : req.limit
    ]

    return {
        "agents": agents,
        "query": req.query,
        "weights": {"pagerank": req.pagerank_weight, "relevancy": req.relevancy_weight},
        "total_agents": len(engine.graph.nodes()),
    }
