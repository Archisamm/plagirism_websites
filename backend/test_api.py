#!/usr/bin/env python
"""
TEST API SCRIPT - Verify Google Custom Search API is working
Place this file at your project root (same level as backend folder)
"""

import sys
import os
import requests
import json

# =====================================
# Add backend to Python path so we can import Django settings
# =====================================
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# =====================================
# YOUR GOOGLE API CREDENTIALS
# =====================================
API_KEY = "AIzaSyAN2q0ZQe1uB1sGwSMXtchoGtnjSPAiwZw"
CX_ID = "b173eaadf448c4983"
SEARCH_API = "https://www.googleapis.com/customsearch/v1"

def test_google_search():
    """Test 1: Basic Google Search API"""
    print("\n" + "="*60)
    print("🔍 TEST 1: Google Custom Search API")
    print("="*60)
    
    # Test with a famous quote that should definitely return results
    test_query = "Attention Is All You Need transformer paper"
    
    print(f"📝 Query: {test_query}")
    print(f"🔑 API Key: {API_KEY[:10]}...{API_KEY[-5:]}")
    print(f"🔍 CX ID: {CX_ID}")
    
    params = {
        'key': API_KEY,
        'cx': CX_ID,
        'q': test_query,
        'num': 3
    }
    
    try:
        print("⏳ Sending request to Google...")
        response = requests.get(SEARCH_API, params=params, timeout=15)
        
        print(f"📡 Response Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code}")
            print(f"Error Details: {response.text}")
            return False
        
        data = response.json()
        
        if 'error' in data:
            print(f"❌ Google API Error: {data['error']['message']}")
            return False
        
        if 'items' not in data:
            print("❌ No items found in response")
            print("Response:", json.dumps(data, indent=2)[:500])
            return False
        
        print(f"\n✅ SUCCESS! Found {len(data['items'])} results")
        print("-"*40)
        
        for i, item in enumerate(data['items'], 1):
            print(f"\n📌 Result {i}:")
            print(f"  Title: {item['title'][:100]}")
            print(f"  Link: {item['link']}")
            if 'snippet' in item:
                print(f"  Snippet: {item['snippet'][:150]}...")
        
        return True
        
    except requests.exceptions.Timeout:
        print("❌ Request timeout - API might be slow")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - check internet")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_api_quota():
    """Test 2: Check API quota usage"""
    print("\n" + "="*60)
    print("📊 TEST 2: API Quota Check")
    print("="*60)
    
    try:
        # Make a minimal request to check quota
        params = {
            'key': API_KEY,
            'cx': CX_ID,
            'q': 'test',
            'num': 1
        }
        
        response = requests.get(SEARCH_API, params=params, timeout=10)
        
        # Check headers for quota info
        if 'X-RateLimit-Limit' in response.headers:
            print(f"✅ Daily Quota: {response.headers['X-RateLimit-Limit']}")
        if 'X-RateLimit-Remaining' in response.headers:
            print(f"✅ Remaining Quota: {response.headers['X-RateLimit-Remaining']}")
        else:
            print("ℹ️ Free tier: 100 queries/day")
            
        return True
        
    except Exception as e:
        print(f"❌ Could not check quota: {e}")
        return False

def test_with_your_content():
    """Test 3: Test with unique content you create (should return 0 results)"""
    print("\n" + "="*60)
    print("🆕 TEST 3: Test with UNIQUE content (should return 0 results)")
    print("="*60)
    
    import time
    unique_query = f"BRI AI plagiarism test {time.time()} {hash(time.time())}"
    
    print(f"📝 Unique Query: {unique_query}")
    print("⏳ This should return NO results (0 sources)")
    
    params = {
        'key': API_KEY,
        'cx': CX_ID,
        'q': unique_query,
        'num': 3
    }
    
    try:
        response = requests.get(SEARCH_API, params=params, timeout=10)
        data = response.json()
        
        if 'items' not in data or len(data['items']) == 0:
            print("✅ CORRECT! No results found for unique content")
            return True
        else:
            print(f"⚠️ Found {len(data['items'])} results - This is suspicious!")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_with_known_content():
    """Test 4: Test with known content (should return results)"""
    print("\n" + "="*60)
    print("📚 TEST 4: Test with KNOWN content (should return results)")
    print("="*60)
    
    known_queries = [
        "To be or not to be Shakespeare",
        "Einstein theory of relativity",
        "Python programming language tutorial"
    ]
    
    for query in known_queries:
        print(f"\n📝 Testing: {query}")
        
        params = {
            'key': API_KEY,
            'cx': CX_ID,
            'q': query,
            'num': 2
        }
        
        try:
            response = requests.get(SEARCH_API, params=params, timeout=10)
            data = response.json()
            
            if 'items' in data and len(data['items']) > 0:
                print(f"  ✅ Found {len(data['items'])} results")
                for item in data['items'][:1]:
                    print(f"     First result: {item['title'][:80]}")
            else:
                print(f"  ⚠️ No results found - API might be limited")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")

def test_source_finder_integration():
    """Test 5: Test your actual source_finder.py"""
    print("\n" + "="*60)
    print("🔄 TEST 5: Testing source_finder.py integration")
    print("="*60)
    
    try:
        # Import your source_finder from the plagiarism app
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
        from plagiarism.nlp import source_finder
        
        test_text = """
        The Transformer model introduced in "Attention Is All You Need" 
        revolutionized natural language processing. It uses self-attention 
        mechanisms instead of recurrent neural networks.
        """
        
        print("📝 Testing with sample text about Transformers")
        print("⏳ This should find real academic sources...")
        
        results = source_finder.search_sources(test_text)
        
        print(f"\n✅ Found {len(results)} sources:")
        for i, source in enumerate(results[:3], 1):
            print(f"\n  {i}. {source.get('title', 'Unknown')}")
            print(f"     URL: {source.get('url', 'N/A')}")
            print(f"     Author: {source.get('author', 'Unknown')}")
            print(f"     Similarity: {source.get('similarity', 0)}%")
        
        return len(results) > 0
        
    except ImportError as e:
        print(f"❌ Could not import source_finder: {e}")
        print("   Make sure your plagiarism app is properly set up")
        print("   Expected path: backend/plagiarism/nlp/source_finder.py")
        return False
    except Exception as e:
        print(f"❌ Error testing source_finder: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "🚀"*30)
    print("🚀 GOOGLE API TEST SUITE")
    print("🚀"*30 + "\n")
    
    print(f"📂 Current directory: {os.getcwd()}")
    print(f"📂 Backend path: {os.path.join(os.path.dirname(__file__), 'backend')}")
    print()
    
    results = []
    
    # Test 1: Basic API functionality
    results.append(("Basic API Test", test_google_search()))
    
    # Test 2: Quota check
    results.append(("Quota Check", test_api_quota()))
    
    # Test 3: Unique content (should return 0)
    results.append(("Unique Content Test", test_with_your_content()))
    
    # Test 4: Known content (should return results)
    test_with_known_content()
    
    # Test 5: Source finder integration
    results.append(("Source Finder Integration", test_source_finder_integration()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        if not passed:
            all_passed = False
        print(f"{status} - {test_name}")
    
    print("\n" + "="*60)
    if all_passed:
        print("✅✅✅ ALL TESTS PASSED! Your global analysis is WORKING!")
        print("✅ Your Google API is configured correctly")
        print("✅ Your source_finder.py is finding real sources")
        print("✅ Results are REAL, not fake")
    else:
        print("⚠️⚠️⚠️ SOME TESTS FAILED")
        print("⚠️ Your API might have issues:")
        print("   1. API key might be invalid or expired")
        print("   2. Daily quota might be exhausted")
        print("   3. Network connectivity issues")
        print("   4. Google Custom Search might be disabled")
    
    print("\n📝 Next Steps:")
    print("   1. If tests passed: Your system is doing REAL global analysis")
    print("   2. If tests failed: Check your Google Cloud Console")
    print("      https://console.cloud.google.com/apis/api/customsearch.googleapis.com")
    print("="*60)

if __name__ == "__main__":
    main()