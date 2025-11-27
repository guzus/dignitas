import networkx as nx
from datetime import datetime
from typing import Dict, List, Tuple

class DignitasPageRank:
    """Weighted PageRank for AI agent reputation."""
    
    DAMPING = 0.85
    HALF_LIFE_DAYS = 30
    WEIGHT_X402 = 2.0
    WEIGHT_FEEDBACK = 1.2
    WEIGHT_NEGATIVE = 0.01  # Minimal weight, acts as a "dampener" or lack of trust
    
    def __init__(self):
        self.graph = nx.DiGraph()
    
    def add_interaction(
        self,
        from_agent: str,
        to_agent: str,
        interaction_type: str,
        timestamp: datetime = None
    ):
        """Add an edge between agents."""
        timestamp = timestamp or datetime.utcnow()
        weight = self._calc_weight(interaction_type, timestamp)
        
        if self.graph.has_edge(from_agent, to_agent):
            self.graph[from_agent][to_agent]['weight'] += weight
        else:
            self.graph.add_edge(from_agent, to_agent, weight=weight)
    
    def _calc_weight(self, interaction_type: str, timestamp: datetime) -> float:
        """Calculate weight with time decay."""
        if interaction_type == 'negative_feedback':
            base = self.WEIGHT_NEGATIVE
        elif interaction_type == 'x402':
            base = self.WEIGHT_X402
        else:
            base = self.WEIGHT_FEEDBACK
            
        days_ago = (datetime.utcnow() - timestamp).days
        decay = 0.5 ** (days_ago / self.HALF_LIFE_DAYS)
        return base * decay
    
    def compute_scores(self) -> Dict[str, float]:
        """Compute PageRank scores."""
        if len(self.graph) == 0:
            return {}
        
        scores = nx.pagerank(
            self.graph,
            alpha=self.DAMPING,
            weight='weight'
        )
        
        # Normalize to 0-1
        max_score = max(scores.values()) if scores else 1
        return {a: s / max_score for a, s in scores.items()}
    
    def get_top_agents(self, n: int = 10) -> List[Tuple[str, float]]:
        """Return top N agents."""
        scores = self.compute_scores()
        return sorted(scores.items(), key=lambda x: x[1], reverse=True)[:n]
    
    def get_score(self, agent: str) -> float:
        """Get score for one agent."""
        return self.compute_scores().get(agent.lower(), 0)
