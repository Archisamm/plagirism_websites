# # plagiarism/nlp/source_finder.py

# import requests
# from bs4 import BeautifulSoup
# from rapidfuzz import fuzz
# import re

# # =====================================
# # GOOGLE CUSTOM SEARCH CONFIG
# # =====================================

# GOOGLE_SEARCH_API = "https://www.googleapis.com/customsearch/v1"

# # ⚠️ MOVE THESE TO settings.py LATER
# API_KEY = "AIzaSyAnL8xfNRPxr0Rf8CWwyQQ5X3uZ_yylPiI"
# CX_ID = "b173eaadf448c4983"


# # =====================================
# # CLEAN TEXT (FAST)
# # =====================================
# def clean_text(text):
#     text = re.sub(r"\s+", " ", text)
#     return text.strip()


# # =====================================
# # SPLIT INTO SEARCHABLE SENTENCES
# # (important for speed)
# # =====================================
# def get_search_chunks(text, max_chunks=5):
#     sentences = re.split(r"[.!?]", text)

#     cleaned = []
#     for s in sentences:
#         s = s.strip()
#         if len(s) > 80:   # ignore tiny sentences
#             cleaned.append(s)

#     return cleaned[:max_chunks]


# # =====================================
# # GOOGLE SEARCH
# # =====================================
# def google_search(query):
#     params = {
#         "key": API_KEY,
#         "cx": CX_ID,
#         "q": query,
#         "num": 3,  # keep small for speed
#     }

#     try:
#         response = requests.get(GOOGLE_SEARCH_API, params=params, timeout=10)
#         data = response.json()
#         return data.get("items", [])
#     except Exception:
#         return []


# # =====================================
# # EXTRACT PAGE CONTENT
# # =====================================
# def fetch_page_text(url):
#     try:
#         headers = {
#             "User-Agent": "Mozilla/5.0"
#         }

#         r = requests.get(url, headers=headers, timeout=8)
#         soup = BeautifulSoup(r.text, "html.parser")

#         paragraphs = soup.find_all("p")
#         page_text = " ".join(p.get_text() for p in paragraphs)

#         return clean_text(page_text)

#     except Exception:
#         return ""


# # =====================================
# #

# plagiarism/nlp/source_finder.py

# import requests
# from bs4 import BeautifulSoup
# from rapidfuzz import fuzz
# import re

# # =====================================
# # GOOGLE CUSTOM SEARCH CONFIG
# # =====================================

# GOOGLE_SEARCH_API = "https://www.googleapis.com/customsearch/v1"

# API_KEY = "AIzaSyAnL8xfNRPxr0Rf8CWwyQQ5X3uZ_yylPiI"
# CX_ID = "b173eaadf448c4983"


# # =====================================
# # CLEAN TEXT
# # =====================================
# def clean_text(text):
#     text = re.sub(r"\s+", " ", text)
#     return text.strip()


# # =====================================
# # SPLIT TEXT INTO SEARCHABLE CHUNKS
# # =====================================
# def get_search_chunks(text, max_chunks=5):
#     sentences = re.split(r"[.!?]", text)

#     valid = []
#     for s in sentences:
#         s = s.strip()

#         # Google works best with 15–25 words
#         words = s.split()

#         if 12 <= len(words) <= 25:
#             valid.append(" ".join(words))

#     return valid[:max_chunks]

# # =====================================
# # GOOGLE SEARCH
# # =====================================
# def google_search(query):

#     params = {
#         "key": API_KEY,
#         "cx": CX_ID,
#         "q": query,
#         "num": 3,
#     }

#     try:
#         response = requests.get(
#             GOOGLE_SEARCH_API,
#             params=params,
#             timeout=10
#         )
#         data = response.json()
#         return data.get("items", [])
#     except Exception:
#         return []


# # =====================================
# # FETCH WEBPAGE TEXT
# # =====================================
# def fetch_page_text(url):

#     try:
#         headers = {"User-Agent": "Mozilla/5.0"}

#         r = requests.get(url, headers=headers, timeout=8)
#         soup = BeautifulSoup(r.text, "html.parser")

#         paragraphs = soup.find_all("p")
#         page_text = " ".join(p.get_text() for p in paragraphs)

#         return clean_text(page_text)

#     except Exception:
#         return ""


# # =====================================
# # AUTHOR EXTRACTION
# # =====================================
# def extract_author(page_text):

#     patterns = [
#         r"By\s+([A-Z][a-z]+\s[A-Z][a-z]+)",
#         r"Author[:\s]+([A-Z][a-z]+\s[A-Z][a-z]+)"
#     ]

#     for pattern in patterns:
#         match = re.search(pattern, page_text)
#         if match:
#             return match.group(1)

#     return "Unknown"


# # =====================================
# # MAIN SOURCE FINDER
# # =====================================
# def search_sources(text):
#     # print("Searching Google for", query)

#     chunks = get_search_chunks(text)

#     results = []

#     for chunk in chunks:

#         google_results = google_search(chunk)

#         for item in google_results:

#             url = item.get("link")
#             title = item.get("title")

#             if not url:
#                 continue

#             page_text = fetch_page_text(url)

#             if not page_text:
#                 continue

#             similarity = fuzz.partial_ratio(
#                 chunk.lower(),
#                 page_text.lower()
#             )

#             if similarity > 55:
#                 results.append({
#                     "title": title,
#                     "author": extract_author(page_text),
#                     "url": url,
#                     "similarity": similarity
#                 })

#     # remove duplicates
#     unique = {r["url"]: r for r in results}

#     return list(unique.values())[:5]

"""
source_finder.py - REAL Global Source Search using Google Custom Search API
"""

import requests
from bs4 import BeautifulSoup
from rapidfuzz import fuzz
import re
import sys

# =====================================
# FORCE PRINT TO FLUSH IMMEDIATELY
# =====================================
def log_print(*args, **kwargs):
    """Force print to appear immediately"""
    print(*args, **kwargs)
    sys.stdout.flush()  # This forces the print to show immediately

# =====================================
# GOOGLE CUSTOM SEARCH CONFIG
# =====================================
GOOGLE_SEARCH_API = "https://www.googleapis.com/customsearch/v1"
API_KEY = "AIzaSyAN2q0ZQe1uB1sGwSMXtchoGtnjSPAiwZw"
CX_ID = "b173eaadf448c4983"

# =====================================
# CLEAN TEXT
# =====================================
def clean_text(text):
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# =====================================
# EXTRACT AUTHOR FROM PAGE
# =====================================
def extract_author(soup):
    meta_author = soup.find("meta", {"name": "author"})
    if meta_author and meta_author.get("content"):
        return meta_author.get("content").strip()
    return "Unknown"

# =====================================
# EXTRACT TITLE FROM PAGE
# =====================================
def extract_title(soup):
    if soup.title and soup.title.string:
        return soup.title.string.strip()
    return "Unknown Source"

# =====================================
# FETCH PAGE CONTENT
# =====================================
def fetch_page_content(url, timeout=5):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=timeout)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = soup.get_text()
        text = ' '.join(text.split())
        
        return {
            'text': text[:5000],
            'title': extract_title(soup),
            'author': extract_author(soup)
        }
    except:
        return None

# =====================================
# GOOGLE SEARCH
# =====================================
def google_search(query, num_results=3):
    log_print(f"  🔍 Google search: {query[:80]}...")
    
    try:
        params = {
            'key': API_KEY,
            'cx': CX_ID,
            'q': query,
            'num': num_results
        }
        
        response = requests.get(GOOGLE_SEARCH_API, params=params, timeout=10)
        
        if response.status_code != 200:
            log_print(f"  ⚠️ Google API returned {response.status_code}")
            return []
        
        data = response.json()
        
        if 'error' in data:
            log_print(f"  ⚠️ API Error: {data['error'].get('message', 'Unknown')}")
            return []
        
        if 'items' not in data:
            log_print(f"  ℹ️ No results found")
            return []
        
        urls = [item['link'] for item in data['items']]
        log_print(f"  ✅ Found {len(urls)} URLs")
        return urls
        
    except Exception as e:
        log_print(f"  ❌ Google search error: {str(e)[:100]}")
        return []

# =====================================
# GET SEARCH QUERIES FROM TEXT
# =====================================
def get_search_queries(text, max_queries=2):
    sentences = re.split(r'[.!?]+', text)
    queries = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if 50 < len(sentence) < 300:
            queries.append(sentence[:150])
            if len(queries) >= max_queries:
                break
    
    if not queries and len(text) > 50:
        queries.append(text[:200])
    
    return queries

# =====================================
# MAIN SOURCE FINDER
# =====================================
def search_sources(text):
    log_print("\n" + "="*60)
    log_print("🌍 REAL GLOBAL SOURCE SEARCH STARTED")
    log_print("="*60)
    
    if not text or len(text) < 100:
        log_print("❌ Text too short")
        return []
    
    log_print(f"📝 Input text length: {len(text)} characters")
    
    queries = get_search_queries(text)
    log_print(f"🔍 Generated {len(queries)} search queries")
    
    all_sources = []
    seen_urls = set()
    
    for query_idx, query in enumerate(queries):
        log_print(f"\n📌 Processing query {query_idx + 1}/{len(queries)}")
        
        urls = google_search(query, num_results=2)
        
        for url in urls:
            if url in seen_urls:
                continue
            
            seen_urls.add(url)
            log_print(f"  🔗 Fetching: {url[:80]}...")
            
            page_data = fetch_page_content(url)
            if not page_data:
                continue
            
            # Calculate similarity
            similarity = fuzz.partial_ratio(
                query.lower(),
                page_data['text'][:1000].lower()
            )
            
            if similarity > 25:
                source = {
                    'title': page_data['title'][:100],
                    'author': page_data['author'],
                    'url': url,
                    'similarity': round(similarity, 1),
                    'type': 'web'
                }
                all_sources.append(source)
                log_print(f"  ✅ MATCH: {similarity}% - {page_data['title'][:60]}...")
    
    # Sort by similarity
    all_sources.sort(key=lambda x: x['similarity'], reverse=True)
    
    log_print("\n" + "="*60)
    log_print(f"✅ Search complete! Found {len(all_sources)} sources")
    log_print("="*60)
    
    return all_sources[:8]

