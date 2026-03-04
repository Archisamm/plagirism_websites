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


import requests
from bs4 import BeautifulSoup
from rapidfuzz import fuzz
import re
import time
from urllib.parse import quote_plus

# =====================================
# GOOGLE CUSTOM SEARCH CONFIG (YOUR KEYS)
# =====================================
GOOGLE_SEARCH_API = "https://www.googleapis.com/customsearch/v1"
API_KEY = "AIzaSyAnL8xfNRPxr0Rf8CWwyQQ5X3uZ_yylPiI"
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
    # Try meta tags first
    meta_author = soup.find("meta", {"name": "author"})
    if meta_author and meta_author.get("content"):
        return meta_author.get("content").strip()
    
    # Try meta property
    meta_prop = soup.find("meta", {"property": "article:author"})
    if meta_prop and meta_prop.get("content"):
        return meta_prop.get("content").strip()
    
    # Try byline classes
    byline = soup.find(class_=re.compile(r"author|byline", re.I))
    if byline:
        return byline.get_text().strip()
    
    return "Unknown"

# =====================================
# EXTRACT TITLE FROM PAGE
# =====================================
def extract_title(soup):
    # Try title tag
    if soup.title:
        return soup.title.string.strip() if soup.title.string else "Unknown"
    
    # Try h1
    h1 = soup.find("h1")
    if h1:
        return h1.get_text().strip()
    
    return "Unknown Source"

# =====================================
# FETCH PAGE CONTENT (with timeout)
# =====================================
def fetch_page_content(url, timeout=5):
    """Fetch and parse webpage content"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading/trailing space
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return {
            'text': text[:5000],  # Limit text length
            'title': extract_title(soup),
            'author': extract_author(soup)
        }
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

# =====================================
# GOOGLE SEARCH
# =====================================
def google_search(query, num_results=3):
    """Search Google Custom Search API"""
    try:
        params = {
            'key': API_KEY,
            'cx': CX_ID,
            'q': query,
            'num': num_results
        }
        
        response = requests.get(GOOGLE_SEARCH_API, params=params, timeout=10)
        data = response.json()
        
        if 'items' in data:
            return [item['link'] for item in data['items']]
        else:
            print(f"No results for query: {query[:50]}...")
            return []
    except Exception as e:
        print(f"Google search error: {e}")
        return []

# =====================================
# GET SEARCH QUERIES FROM TEXT
# =====================================
def get_search_queries(text, max_queries=3):
    """Extract meaningful search queries from text"""
    # Split into sentences
    sentences = re.split(r'[.!?]', text)
    
    queries = []
    for sentence in sentences:
        # Clean and filter
        sentence = sentence.strip()
        if len(sentence) < 50 or len(sentence) > 200:
            continue
        
        # Take first 100 chars
        queries.append(sentence[:150])
        
        if len(queries) >= max_queries:
            break
    
    # If no good sentences, take first part of text
    if not queries and len(text) > 50:
        queries.append(text[:200])
    
    return queries

# =====================================
# MAIN SOURCE FINDER (WORKING VERSION)
# =====================================
def search_sources(text):
    """Main function to search for sources"""
    print("🌍 Starting global source search...")
    
    if not text or len(text) < 50:
        print("❌ Text too short")
        return []
    
    # Get search queries
    queries = get_search_queries(text)
    print(f"🔍 Generated {len(queries)} search queries")
    
    all_urls = set()
    all_sources = []
    
    # Search for each query
    for i, query in enumerate(queries):
        print(f"  Searching query {i+1}: {query[:50]}...")
        
        urls = google_search(query, num_results=2)
        
        for url in urls:
            if url in all_urls:
                continue
            
            all_urls.add(url)
            
            # Fetch page content
            page_data = fetch_page_content(url)
            if not page_data:
                continue
            
            # Calculate similarity
            similarity = fuzz.partial_ratio(
                query.lower(),
                page_data['text'][:1000].lower()
            )
            
            # Only include if similarity > 30%
            if similarity > 30:
                source = {
                    'title': page_data['title'],
                    'author': page_data['author'],
                    'url': url,
                    'similarity': round(similarity / 10, 2),  # Convert to 0-10 scale
                    'type': 'web'
                }
                all_sources.append(source)
                print(f"  ✅ Found source: {source['title'][:50]}... ({source['similarity']}%)")
    
    # Remove duplicates by URL
    unique_sources = []
    seen_urls = set()
    for source in all_sources:
        if source['url'] not in seen_urls:
            seen_urls.add(source['url'])
            unique_sources.append(source)
    
    # Sort by similarity (highest first)
    unique_sources.sort(key=lambda x: x['similarity'], reverse=True)
    
    print(f"🔎 Total unique sources found: {len(unique_sources)}")
    return unique_sources[:10]  # Return top 10 sources