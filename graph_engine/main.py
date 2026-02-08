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
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when allow_origins is "*"
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
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
        # Travel agents (25-34)
        "0xT1T1T1T1T1T1T1T1T1T1T1T1T1T1T1T1T1T1T1T1",
        "0xT2T2T2T2T2T2T2T2T2T2T2T2T2T2T2T2T2T2T2T2",
        "0xT3T3T3T3T3T3T3T3T3T3T3T3T3T3T3T3T3T3T3T3",
        "0xT4T4T4T4T4T4T4T4T4T4T4T4T4T4T4T4T4T4T4T4",
        "0xT5T5T5T5T5T5T5T5T5T5T5T5T5T5T5T5T5T5T5T5",
        "0xT6T6T6T6T6T6T6T6T6T6T6T6T6T6T6T6T6T6T6T6",
        "0xT7T7T7T7T7T7T7T7T7T7T7T7T7T7T7T7T7T7T7T7",
        "0xT8T8T8T8T8T8T8T8T8T8T8T8T8T8T8T8T8T8T8T8",
        "0xT9T9T9T9T9T9T9T9T9T9T9T9T9T9T9T9T9T9T9T9",
        "0xTaTaTaTaTaTaTaTaTaTaTaTaTaTaTaTaTaTaTaTa",
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
        # Travel agents interactions (building their reputation)
        (agents[0], agents[25], "x402"),
        (agents[1], agents[25], "x402"),
        (agents[2], agents[25], "feedback"),
        (agents[3], agents[26], "x402"),
        (agents[4], agents[26], "feedback"),
        (agents[5], agents[27], "x402"),
        (agents[6], agents[27], "x402"),
        (agents[7], agents[28], "feedback"),
        (agents[8], agents[28], "x402"),
        (agents[9], agents[29], "feedback"),
        (agents[0], agents[29], "x402"),
        (agents[1], agents[30], "x402"),
        (agents[2], agents[30], "feedback"),
        (agents[3], agents[31], "x402"),
        (agents[4], agents[31], "feedback"),
        (agents[5], agents[32], "x402"),
        (agents[6], agents[32], "x402"),
        (agents[7], agents[33], "feedback"),
        (agents[8], agents[33], "x402"),
        (agents[9], agents[34], "feedback"),
        # Cross-interactions between travel agents
        (agents[25], agents[26], "x402"),
        (agents[26], agents[27], "feedback"),
        (agents[27], agents[28], "x402"),
        (agents[28], agents[29], "feedback"),
        (agents[29], agents[30], "x402"),
        (agents[30], agents[31], "feedback"),
        (agents[31], agents[32], "x402"),
        (agents[32], agents[33], "feedback"),
        (agents[33], agents[34], "x402"),
        (agents[34], agents[25], "feedback"),
        # TravelGenius (agents[15]) interacting with travel agents
        (agents[15], agents[25], "x402"),
        (agents[15], agents[26], "x402"),
        (agents[15], agents[27], "feedback"),
        (agents[25], agents[15], "x402"),
        (agents[26], agents[15], "feedback"),
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
            "ens_name": "codeguard.eth",
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
            "ens_name": "datamind.eth",
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
            "ens_name": "infrabot.eth",
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
            "ens_name": "contentcraft.eth",
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
            "ens_name": "researchbot.eth",
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
            "ens_name": "alphatrader.eth",
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
        # Travel Agents (25-34)
        {
            "address": agents[25],
            "name": "VoyageAI",
            "description": "Premium AI travel concierge that creates luxury itineraries, books exclusive experiences, and provides 24/7 travel support with real-time flight tracking.",
            "capabilities": [
                "luxury travel",
                "concierge service",
                "flight tracking",
                "exclusive bookings",
                "VIP experiences",
                "travel insurance",
            ],
            "tags": ["travel", "luxury", "concierge", "premium"],
            "category": "travel",
        },
        {
            "address": agents[26],
            "name": "FlightHunter",
            "description": "Specialized flight search agent that finds the cheapest flights, tracks price drops, alerts on deals, and optimizes multi-city routes.",
            "capabilities": [
                "flight search",
                "price tracking",
                "deal alerts",
                "multi-city routing",
                "fare comparison",
                "booking assistance",
            ],
            "tags": ["travel", "flights", "deals", "booking"],
            "category": "travel",
        },
        {
            "address": agents[27],
            "name": "HotelScout Pro",
            "description": "Hotel comparison agent that finds best rates, reads reviews, checks amenities, and books accommodations from boutique hotels to luxury resorts.",
            "capabilities": [
                "hotel search",
                "rate comparison",
                "review analysis",
                "amenity filtering",
                "loyalty programs",
                "last-minute deals",
            ],
            "tags": ["travel", "hotels", "accommodation", "booking"],
            "category": "travel",
        },
        {
            "address": agents[28],
            "name": "LocalExplorer",
            "description": "Destination expert that provides local recommendations, hidden gems, restaurant reservations, and authentic cultural experiences.",
            "capabilities": [
                "local guides",
                "restaurant booking",
                "cultural tours",
                "hidden gems",
                "local events",
                "food tours",
            ],
            "tags": ["travel", "local", "experiences", "culture"],
            "category": "travel",
        },
        {
            "address": agents[29],
            "name": "AdventureBot",
            "description": "Adventure travel specialist for outdoor activities, extreme sports, hiking trails, and expedition planning with safety assessments.",
            "capabilities": [
                "adventure planning",
                "hiking trails",
                "extreme sports",
                "expedition logistics",
                "safety assessment",
                "gear recommendations",
            ],
            "tags": ["travel", "adventure", "outdoor", "sports"],
            "category": "travel",
        },
        {
            "address": agents[30],
            "name": "BusinessTrip AI",
            "description": "Corporate travel manager that handles business trip logistics, expense tracking, meeting scheduling, and travel policy compliance.",
            "capabilities": [
                "business travel",
                "expense management",
                "meeting coordination",
                "policy compliance",
                "corporate rates",
                "itinerary optimization",
            ],
            "tags": ["travel", "business", "corporate", "expenses"],
            "category": "travel",
        },
        {
            "address": agents[31],
            "name": "FamilyVacation Pro",
            "description": "Family travel specialist that plans kid-friendly trips, finds family resorts, books theme park tickets, and ensures safe travel for all ages.",
            "capabilities": [
                "family planning",
                "kid-friendly activities",
                "theme parks",
                "family resorts",
                "travel safety",
                "group bookings",
            ],
            "tags": ["travel", "family", "kids", "vacation"],
            "category": "travel",
        },
        {
            "address": agents[32],
            "name": "CruiseMaster",
            "description": "Cruise vacation expert that compares cruise lines, finds cabin deals, plans shore excursions, and manages cruise itineraries.",
            "capabilities": [
                "cruise booking",
                "cabin selection",
                "shore excursions",
                "cruise comparison",
                "onboard activities",
                "port guides",
            ],
            "tags": ["travel", "cruise", "vacation", "ocean"],
            "category": "travel",
        },
        {
            "address": agents[33],
            "name": "VisaHelper",
            "description": "Travel documentation assistant that checks visa requirements, prepares applications, tracks processing, and ensures travel compliance.",
            "capabilities": [
                "visa requirements",
                "application assistance",
                "document preparation",
                "processing tracking",
                "travel compliance",
                "embassy info",
            ],
            "tags": ["travel", "visa", "documentation", "compliance"],
            "category": "travel",
        },
        {
            "address": agents[34],
            "name": "BudgetBackpacker",
            "description": "Budget travel expert for backpackers and solo travelers. Finds hostels, cheap eats, free activities, and budget-friendly routes.",
            "capabilities": [
                "budget planning",
                "hostel booking",
                "cheap flights",
                "free activities",
                "backpacking routes",
                "travel hacks",
            ],
            "tags": ["travel", "budget", "backpacking", "solo"],
            "category": "travel",
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
    ens_name: Optional[str] = None


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
    """Get top agents with their specifications and ENS names."""
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
            if spec.get("ens_name"):
                agent_data["ens_name"] = spec["ens_name"]
        agents.append(agent_data)
    return {"agents": agents}


@app.get("/discover")
def discover_agents(min_score: float = 0, limit: int = 10):
    """Discover agents above threshold with their specifications and ENS names."""
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
            if spec.get("ens_name"):
                agent_data["ens_name"] = spec["ens_name"]
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
    """Register or update an agent's specification with optional ENS name."""
    relevancy_engine.register_agent(req.address, req.model_dump())
    return {"status": "registered", "address": req.address.lower(), "ens_name": req.ens_name}


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
