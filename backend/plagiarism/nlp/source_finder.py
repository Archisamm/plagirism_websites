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
source_finder.py - Global Source Search using Tavily API (FREE, 1000 searches/month)
"""

"""
source_finder.py - Global Source Search using Tavily API (FREE, 1000 searches/month)
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
    sys.stdout.flush()

# =====================================
# TAVILY API CONFIG
# =====================================
TAVILY_API_KEY = "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"
TAVILY_SEARCH_URL = "https://api.tavily.com/search"

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
    """Extract author information from webpage"""
    meta_author = soup.find("meta", {"name": "author"})
    if meta_author and meta_author.get("content"):
        return meta_author.get("content").strip()
    
    meta_prop = soup.find("meta", {"property": "article:author"})
    if meta_prop and meta_prop.get("content"):
        return meta_prop.get("content").strip()
    
    byline = soup.find(class_=re.compile(r"author|byline", re.I))
    if byline:
        return byline.get_text().strip()
    
    return "Unknown"

# =====================================
# EXTRACT TITLE FROM PAGE
# =====================================
def extract_title(soup):
    """Extract page title"""
    if soup.title and soup.title.string:
        return soup.title.string.strip()
    
    h1 = soup.find("h1")
    if h1:
        return h1.get_text().strip()
    
    meta_title = soup.find("meta", {"property": "og:title"})
    if meta_title and meta_title.get("content"):
        return meta_title.get("content").strip()
    
    return "Unknown Source"

# =====================================
# FETCH PAGE CONTENT
# =====================================
def fetch_page_content(url, timeout=5):
    """Fetch and parse webpage content"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        main_content = soup.find('article') or soup.find('main') or soup.find('div', class_=re.compile(r'content|article|post', re.I))
        
        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
        else:
            text = soup.get_text(separator=' ', strip=True)
        
        text = clean_text(text)
        
        if len(text) < 200:
            return None
        
        return {
            'text': text[:5000],
            'title': extract_title(soup),
            'author': extract_author(soup)
        }
        
    except Exception as e:
        log_print(f"  ⚠️ Error fetching {url[:50]}...: {str(e)[:50]}")
        return None

# =====================================
# TAVILY SEARCH
# =====================================
def tavily_search(query, num_results=3):
    """Search using Tavily API"""
    log_print(f"  🔍 Tavily search: {query[:80]}...")
    
    try:
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": query,
            "search_depth": "basic",
            "max_results": num_results,
            "include_images": False,
            "include_answer": False,
            "include_raw_content": False
        }
        
        response = requests.post(TAVILY_SEARCH_URL, json=payload, timeout=10)
        
        if response.status_code != 200:
            log_print(f"  ⚠️ Tavily API returned {response.status_code}")
            if response.status_code == 401:
                log_print("     ❌ Invalid API key - check your key")
            elif response.status_code == 429:
                log_print("     ⏰ Rate limit exceeded - try again later")
            return []
        
        data = response.json()
        
        if 'results' in data and data['results']:
            urls = [result['url'] for result in data['results']]
            log_print(f"  ✅ Found {len(urls)} URLs")
            return urls
        else:
            log_print(f"  ℹ️ No results found")
            return []
        
    except requests.exceptions.Timeout:
        log_print("  ⏰ Tavily API timeout")
        return []
    except requests.exceptions.ConnectionError:
        log_print("  🔌 Tavily API connection error")
        return []
    except Exception as e:
        log_print(f"  ❌ Tavily search error: {str(e)[:100]}")
        return []

# =====================================
# GET SEARCH QUERIES FROM TEXT
# =====================================
def get_search_queries(text, max_queries=3):
    """Extract meaningful search queries from text"""
    sentences = re.split(r'[.!?]+', text)
    
    queries = []
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 50 or len(sentence) > 300:
            continue
        
        sentence = re.sub(r'^(In this paper|This paper|We propose|Our approach|The authors|This study)', '', sentence, flags=re.I)
        
        query = sentence[:150].strip()
        
        if query and len(query) > 30:
            queries.append(query)
        
        if len(queries) >= max_queries:
            break
    
    if not queries and len(text) > 50:
        first_part = text[:300]
        last_period = first_part.rfind('.')
        if last_period > 50:
            queries.append(first_part[:last_period+1])
        else:
            queries.append(first_part[:200])
    
    return queries

# =====================================
# CALCULATE SIMILARITY
# =====================================
def calculate_similarity(text1, text2):
    """Calculate similarity between two texts using fuzzy matching"""
    if not text1 or not text2:
        return 0
    
    similarity = fuzz.partial_ratio(
        text1.lower(),
        text2.lower()
    )
    
    return similarity

# =====================================
# MAIN SOURCE FINDER
# =====================================
def search_sources(text):
    """
    Main function to search for sources globally using Tavily API
    Returns list of sources with title, author, url, similarity
    """
    log_print("\n" + "="*60)
    log_print("🌍 REAL GLOBAL SOURCE SEARCH STARTED (Tavily API)")
    log_print("="*60)
    
    if not text or len(text) < 100:
        log_print("❌ Text too short (min 100 chars required)")
        return []
    
    log_print(f"📝 Input text length: {len(text)} characters")
    
    queries = get_search_queries(text)
    log_print(f"🔍 Generated {len(queries)} search queries:")
    for i, q in enumerate(queries, 1):
        log_print(f"   Query {i}: {q[:80]}...")
    
    all_urls = set()
    all_sources = []
    api_calls = 0
    
    for query_idx, query in enumerate(queries):
        log_print(f"\n📌 Processing query {query_idx + 1}/{len(queries)}")
        
        urls = tavily_search(query, num_results=3)
        api_calls += 1
        
        for url_idx, url in enumerate(urls):
            if url in all_urls:
                continue
            
            log_print(f"  🔗 URL {url_idx + 1}: {url[:80]}...")
            all_urls.add(url)
            
            page_data = fetch_page_content(url)
            if not page_data:
                continue
            
            similarity = calculate_similarity(query, page_data['text'][:2000])
            
            if similarity > 25:
                source = {
                    'title': page_data['title'][:200],
                    'author': page_data['author'],
                    'url': url,
                    'similarity': round(similarity, 1),
                    'type': 'web'
                }
                all_sources.append(source)
                log_print(f"  ✅ MATCH FOUND: {similarity}% - {page_data['title'][:60]}...")
                
                if similarity > 85:
                    log_print(f"  🎯 High similarity match found, stopping early")
                    break
            else:
                log_print(f"  ⚠️ Low similarity: {similarity}%")
    
    # Remove duplicates by URL
    unique_sources = []
    seen_urls = {}
    
    for source in all_sources:
        url = source['url']
        if url not in seen_urls or source['similarity'] > seen_urls[url]['similarity']:
            seen_urls[url] = source
    
    unique_sources = list(seen_urls.values())
    unique_sources.sort(key=lambda x: x['similarity'], reverse=True)
    
    top_sources = unique_sources[:8]
    
    log_print("\n" + "="*60)
    log_print(f"🔎 SEARCH COMPLETE")
    log_print(f"📊 Total API calls: {api_calls}")
    log_print(f"🌐 Total URLs checked: {len(all_urls)}")
    log_print(f"✅ Unique sources found: {len(unique_sources)}")
    log_print(f"📋 Top {len(top_sources)} sources:")
    for i, src in enumerate(top_sources, 1):
        log_print(f"   {i}. {src['similarity']}% - {src['title'][:80]}...")
    log_print("="*60)
    
    return top_sources