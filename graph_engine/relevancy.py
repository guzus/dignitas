import os
import json
import google.generativeai as genai
from typing import Dict, List, Optional


class RelevancyEngine:
    """LLM-based relevancy scoring using Gemini 2.5 Flash."""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-2.5-flash")
        else:
            self.model = None
            print("Warning: GEMINI_API_KEY not set, relevancy scoring disabled")

        # Agent specifications storage (in production, use a database)
        self.agent_specs: Dict[str, dict] = {}

    def register_agent(self, address: str, spec: dict):
        """Register or update an agent's specification."""
        self.agent_specs[address.lower()] = {
            "name": spec.get("name", "Unknown Agent"),
            "description": spec.get("description", ""),
            "capabilities": spec.get("capabilities", []),
            "tags": spec.get("tags", []),
            "category": spec.get("category", "general"),
        }

    def get_agent_spec(self, address: str) -> Optional[dict]:
        """Get agent specification."""
        return self.agent_specs.get(address.lower())

    def get_all_specs(self) -> Dict[str, dict]:
        """Get all agent specifications."""
        return self.agent_specs

    async def compute_relevancy(self, query: str, agents: List[dict]) -> List[dict]:
        """
        Compute relevancy scores for agents based on user query.
        Returns agents with added 'relevancy_score' field.
        """
        if not self.model or not query:
            # No LLM available or no query, return agents as-is with 1.0 relevancy
            for agent in agents:
                agent["relevancy_score"] = 1.0
            return agents

        # Build agent info for the prompt
        agents_info = []
        for agent in agents:
            addr = agent["address"]
            spec = self.agent_specs.get(addr, {})
            agents_info.append(
                {
                    "address": addr,
                    "name": spec.get("name", "Unknown"),
                    "description": spec.get("description", "No description"),
                    "capabilities": spec.get("capabilities", []),
                    "tags": spec.get("tags", []),
                    "category": spec.get("category", "general"),
                }
            )

        prompt = f"""You are an AI agent matchmaker. Given a user's request and a list of AI agents with their specifications, rate how relevant each agent is to the request.

USER REQUEST: "{query}"

AGENTS:
{json.dumps(agents_info, indent=2)}

For each agent, provide a relevancy score from 0.0 to 1.0 where:
- 1.0 = Perfect match, agent is exactly what the user needs
- 0.7-0.9 = Good match, agent can likely help
- 0.4-0.6 = Partial match, some overlap
- 0.1-0.3 = Weak match, minimal relevance
- 0.0 = No relevance at all

Respond ONLY with a JSON object mapping agent addresses to their relevancy scores.
Example: {{"0x1234...": 0.85, "0x5678...": 0.3}}
"""

        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.strip()

            # Extract JSON from response
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            scores = json.loads(text)

            # Apply scores to agents
            for agent in agents:
                addr = agent["address"]
                agent["relevancy_score"] = scores.get(addr, 0.5)

            return agents

        except Exception as e:
            print(f"Relevancy scoring error: {e}")
            # Fallback: all agents get neutral relevancy
            for agent in agents:
                agent["relevancy_score"] = 0.5
            return agents

    def compute_combined_score(
        self,
        pagerank_score: float,
        relevancy_score: float,
        pagerank_weight: float = 0.4,
        relevancy_weight: float = 0.6,
    ) -> float:
        """
        Combine PageRank and relevancy scores.
        Default weights favor relevancy slightly over reputation.
        """
        return (pagerank_score * pagerank_weight) + (relevancy_score * relevancy_weight)
