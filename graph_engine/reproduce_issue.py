from pagerank import DignitasPageRank
from datetime import datetime, timedelta
import random

def test_engine():
    engine = DignitasPageRank()
    
    agents = [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333",
    ]
    
    interactions = [
        (agents[0], agents[1], "x402"),
        (agents[1], agents[0], "feedback"),
    ]
    
    for from_a, to_a, itype in interactions:
        days_ago = random.randint(1, 25)
        ts = datetime.utcnow() - timedelta(days=days_ago)
        engine.add_interaction(from_a.lower(), to_a.lower(), itype, ts)
        
    print("Computing scores...")
    try:
        scores = engine.compute_scores()
        print("Scores:", scores)
    except Exception as e:
        print("Error computing scores:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_engine()
