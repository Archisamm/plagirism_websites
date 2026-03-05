# test_direct.py - Run this directly to test source_finder
import sys
from plagiarism.nlp import source_finder

test_text = """
The Transformer model introduced in the paper "Attention Is All You Need" 
revolutionized natural language processing. It uses self-attention mechanisms 
instead of recurrent neural networks.
"""

print("="*60)
print("DIRECT TEST OF SOURCE FINDER")
print("="*60)

results = source_finder.search_sources(test_text)

print(f"\n✅ Found {len(results)} sources")
for r in results:
    print(f"  - {r['similarity']}%: {r['title']}")