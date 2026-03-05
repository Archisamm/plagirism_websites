# import requests
# from bs4 import BeautifulSoup
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

# # =====================================================
# # GOOGLE CONFIG
# # =====================================================

# GOOGLE_API_KEY = "AIzaSyAnL8xfNRPxr0Rf8CWwyQQ5X3uZ_yylPiI"
# GOOGLE_CX = "b173eaadf448c4983"



# # =====================================================
# # GOOGLE SEARCH (FAST MODE)
# # =====================================================

# def search_google(query):
#     url = "https://www.googleapis.com/customsearch/v1"

#     params = {
#         "key": GOOGLE_API_KEY,
#         "cx": GOOGLE_CX,
#         "q": query[:180],   # 🔥 limit query size
#         "num": 2            # 🔥 fewer results = faster
#     }

#     try:
#         r = requests.get(url, params=params, timeout=4)

#         if r.status_code != 200:
#             return []

#         data = r.json()
#         return [item["link"] for item in data.get("items", [])]

#     except:
#         return []


# # =====================================================
# # WEBSITE CONTENT EXTRACTION (FAST SAFE)
# # =====================================================

# def extract_website_content(url):

#     try:
#         headers = {
#             "User-Agent": "Mozilla/5.0"
#         }

#         r = requests.get(url, headers=headers, timeout=3)

#         if r.status_code != 200:
#             return "", "", ""

#         soup = BeautifulSoup(r.text, "html.parser")

#         # ---- title ----
#         title = soup.title.get_text(strip=True) if soup.title else ""

#         # ---- author ----
#         author = ""
#         meta = soup.find("meta", attrs={"name": "author"})
#         if meta:
#             author = meta.get("content", "")

#         # ---- paragraph text (LIMITED) ----
#         paragraphs = soup.find_all("p")[:25]  # 🔥 limit parsing

#         text = " ".join(p.get_text(" ", strip=True) for p in paragraphs)

#         return text[:3000], title, author

#     except:
#         return "", "", ""


# # =====================================================
# # FAST SIMILARITY
# # =====================================================

# vectorizer = TfidfVectorizer(stop_words="english")

# def compare_texts(text1, text2):
#     try:
#         vectors = vectorizer.fit_transform([text1, text2])
#         score = cosine_similarity(vectors[0], vectors[1])[0][0]
#         return score * 100
#     except:
#         return 0.0


# # =====================================================
# # GLOBAL PLAGIARISM CHECK (OPTIMIZED)
# # =====================================================

# def global_plagiarism_check(uploaded_text):

#     if not uploaded_text:
#         return 0, []

#     # 🔥 HUGE SPEED BOOST — analyze sample only
#     uploaded_text = uploaded_text[:8000]

#     # ---- choose strong sentences only ----
#     sentences = [
#         s.strip()
#         for s in uploaded_text.split(".")
#         if len(s.strip()) > 120
#     ][:2]   # 🔥 only best 2 sentences

#     checked_urls = set()
#     matches = []
#     max_similarity = 0

#     for sentence in sentences:

#         urls = search_google(sentence)

#         for url in urls:

#             if url in checked_urls:
#                 continue

#             checked_urls.add(url)

#             site_text, title, author = extract_website_content(url)

#             if not site_text:
#                 continue

#             # 🔥 compare sentence instead of full thesis
#             similarity = compare_texts(sentence, site_text)
#             similarity = round(similarity, 2)

#             if similarity > max_similarity:
#                 max_similarity = similarity

#             matches.append({
#                 "url": url,
#                 "title": title or "Unknown Title",
#                 "author": author or "Unknown Author",
#                 "similarity": similarity
#             })

#             # 🔥 early stop (major speed gain)
#             if max_similarity > 85:
#                 return round(max_similarity, 2), matches

#     return round(max_similarity, 2), matches

import requests
from bs4 import BeautifulSoup
import random
import re
from rapidfuzz import fuzz

# =====================================
# GOOGLE CONFIG (YOUR KEYS)
# =====================================
GOOGLE_API_KEY = "AIzaSyAN2q0ZQe1uB1sGwSMXtchoGtnjSPAiwZw"
GOOGLE_CX = "b173eaadf448c4983"

# =====================================
# GOOGLE SEARCH
# =====================================
def search_google(query, num=3):
    """Search Google using Custom Search API"""
    url = "https://www.googleapis.com/customsearch/v1"
    
    params = {
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "q": query[:200],  # Limit query length
        "num": num
    }
    
    try:
        response = requests.get(url, params=params, timeout=5)
        if response.status_code != 200:
            return []
        
        data = response.json()
        return [item["link"] for item in data.get("items", [])]
    except Exception as e:
        print(f"Google search error: {e}")
        return []

# =====================================
# FETCH PAGE CONTENT
# =====================================
def fetch_page_content(url):
    """Fetch and parse webpage content"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Get title
        title = soup.title.string if soup.title else "Unknown"
        
        # Get author
        author = "Unknown"
        meta_author = soup.find("meta", {"name": "author"})
        if meta_author:
            author = meta_author.get("content", "Unknown")
        
        # Get text
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs[:20])  # First 20 paragraphs
        
        return {
            'title': title.strip(),
            'author': author.strip(),
            'text': text[:3000],  # Limit text
            'url': url
        }
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

# =====================================
# GLOBAL PLAGIARISM CHECK
# =====================================
def global_plagiarism_check(uploaded_text):
    """Main global plagiarism check function"""
    print("🌍 Running global plagiarism check...")
    
    if not uploaded_text or len(uploaded_text) < 100:
        return 0, []
    
    # Take first 2000 chars for analysis
    text_sample = uploaded_text[:2000]
    
    # Extract key sentences (longer sentences with more content)
    sentences = re.split(r'[.!?]', text_sample)
    key_sentences = [
        s.strip() for s in sentences 
        if 50 < len(s.strip()) < 200
    ][:3]  # Max 3 sentences
    
    if not key_sentences:
        key_sentences = [text_sample[:200]]
    
    all_urls = set()
    all_matches = []
    max_score = 0
    
    # Search for each key sentence
    for sentence in key_sentences:
        urls = search_google(sentence, num=2)
        
        for url in urls:
            if url in all_urls:
                continue
            all_urls.add(url)
            
            # Fetch page content
            page_data = fetch_page_content(url)
            if not page_data or not page_data['text']:
                continue
            
            # Calculate similarity
            similarity = fuzz.partial_ratio(
                sentence.lower(),
                page_data['text'][:1000].lower()
            )
            
            # Scale similarity (0-100)
            scaled_similarity = min(100, similarity // 2)
            
            if scaled_similarity > max_score:
                max_score = scaled_similarity
            
            if scaled_similarity > 30:  # Only include meaningful matches
                all_matches.append({
                    'url': url,
                    'title': page_data['title'],
                    'author': page_data['author'],
                    'similarity': scaled_similarity
                })
            
            # Early stop if very high similarity
            if max_score > 85:
                break
    
    # Remove duplicates and sort
    unique_matches = []
    seen = set()
    for match in all_matches:
        if match['url'] not in seen:
            seen.add(match['url'])
            unique_matches.append(match)
    
    unique_matches.sort(key=lambda x: x['similarity'], reverse=True)
    
    print(f"✅ Global check complete. Max score: {max_score}%, Found: {len(unique_matches)} sources")
    return max_score, unique_matches[:10]  # Return top 10