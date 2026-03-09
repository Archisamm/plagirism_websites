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
import re
from rapidfuzz import fuzz

# =====================================
# TAVILY CONFIG (YOUR KEYS)
# =====================================
TAVILY_API_KEY = "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"
TAVILY_SEARCH_URL = "https://api.tavily.com/search"

# =====================================
# TAVILY SEARCH
# =====================================
def search_tavily(query, num=3):
    """Search using Tavily API"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TAVILY_API_KEY}"
    }
    
    payload = {
        "query": query[:200],
        "search_depth": "basic",
        "max_results": num,
        "include_answer": False,
        "include_raw_content": False,
        "include_images": False
    }
    
    try:
        response = requests.post(
            TAVILY_SEARCH_URL,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"Tavily API error: {response.status_code}")
            return []
        
        data = response.json()
        return [result["url"] for result in data.get("results", [])]
        
    except Exception as e:
        print(f"Tavily search error: {e}")
        return []

# =====================================
# FETCH PAGE CONTENT
# =====================================
def fetch_page_content(url):
    """Fetch and parse webpage content"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Get title
        title = soup.title.string if soup.title else "Unknown"
        
        # Get author (try multiple methods)
        author = "Unknown"
        meta_author = soup.find("meta", {"name": "author"})
        if meta_author:
            author = meta_author.get("content", "Unknown")
        else:
            meta_author = soup.find("meta", {"property": "article:author"})
            if meta_author:
                author = meta_author.get("content", "Unknown")
        
        # Get text from paragraphs
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs[:20])
        
        # Clean text
        text = re.sub(r'\s+', ' ', text).strip()
        
        return {
            'title': title.strip(),
            'author': author.strip(),
            'text': text[:3000],
            'url': url
        }
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

# =====================================
# CALCULATE BREAKDOWN FROM SOURCES
# =====================================
def calculate_breakdown(plagiarism_score, sources):
    """
    Calculate the breakdown of identical, minor, paraphrased matches
    based on source similarity scores
    """
    if not sources or plagiarism_score == 0:
        return {
            'identical': 0,
            'minor': 0,
            'paraphrased': 0,
            'unique': 100
        }
    
    # Initialize counters
    identical = 0
    minor = 0
    paraphrased = 0
    
    # Analyze each source's similarity to determine distribution
    for source in sources:
        sim = source.get('similarity', 0)
        
        # Categorize based on similarity percentage
        if sim >= 80:
            # Very high similarity - likely identical or very close
            identical += sim * 0.4
            minor += sim * 0.3
            paraphrased += sim * 0.3
        elif sim >= 60:
            # High similarity - minor changes
            identical += sim * 0.2
            minor += sim * 0.4
            paraphrased += sim * 0.4
        elif sim >= 40:
            # Medium similarity - paraphrased with some minor changes
            identical += sim * 0.1
            minor += sim * 0.3
            paraphrased += sim * 0.6
        else:
            # Low similarity - mostly paraphrased
            identical += sim * 0.05
            minor += sim * 0.15
            paraphrased += sim * 0.8
    
    # Calculate totals
    total_sim = sum(s.get('similarity', 0) for s in sources)
    
    if total_sim > 0:
        # Scale to match the plagiarism score
        identical = (identical / total_sim) * plagiarism_score
        minor = (minor / total_sim) * plagiarism_score
        paraphrased = (paraphrased / total_sim) * plagiarism_score
    
    # Round values
    identical = round(identical)
    minor = round(minor)
    paraphrased = round(paraphrased)
    
    # Ensure sum equals plagiarism_score (adjust if rounding caused issues)
    total = identical + minor + paraphrased
    if total != plagiarism_score:
        # Adjust paraphrased (largest category) to fix sum
        paraphrased = plagiarism_score - identical - minor
    
    unique = 100 - plagiarism_score
    
    # Final validation
    if paraphrased < 0:
        paraphrased = 0
        minor = plagiarism_score - identical
        if minor < 0:
            minor = 0
            identical = plagiarism_score
    
    return {
        'identical': max(0, identical),
        'minor': max(0, minor),
        'paraphrased': max(0, paraphrased),
        'unique': max(0, unique)
    }

# =====================================
# GLOBAL PLAGIARISM CHECK
# =====================================
def global_plagiarism_check(uploaded_text):
    """Main global plagiarism check function"""
    print("🌍 Running global plagiarism check with Tavily...")
    
    if not uploaded_text or len(uploaded_text) < 100:
        return {
            'plagiarism_percentage': 0,
            'breakdown': {
                'identical': 0,
                'minor': 0,
                'paraphrased': 0,
                'unique': 100
            },
            'sources': [],
            'verdict': 'Original'
        }
    
    # Take first 2000 chars for analysis
    text_sample = uploaded_text[:2000]
    
    # Extract key sentences
    sentences = re.split(r'[.!?]', text_sample)
    key_sentences = [
        s.strip() for s in sentences 
        if 40 < len(s.strip()) < 200
    ][:3]
    
    if not key_sentences:
        chunks = []
        for i in range(0, len(text_sample), 150):
            chunk = text_sample[i:i+150].strip()
            if len(chunk) > 50:
                chunks.append(chunk)
        key_sentences = chunks[:3]
    
    all_urls = set()
    all_matches = []
    max_score = 0
    
    print(f"🔍 Searching for {len(key_sentences)} key phrases...")
    
    for idx, sentence in enumerate(key_sentences):
        print(f"  📝 Phrase {idx+1}: {sentence[:50]}...")
        urls = search_tavily(sentence, num=2)
        
        if not urls:
            print(f"  ⚠️ No results found for phrase {idx+1}")
            continue
            
        print(f"  ✅ Found {len(urls)} URLs")
        
        for url in urls:
            if url in all_urls:
                continue
            all_urls.add(url)
            
            page_data = fetch_page_content(url)
            if not page_data or not page_data['text']:
                continue
            
            # Calculate similarity
            similarity = fuzz.partial_ratio(
                sentence.lower(),
                page_data['text'][:1000].lower()
            )
            
            if similarity > max_score:
                max_score = similarity
            
            if similarity > 20:
                all_matches.append({
                    'url': url,
                    'title': page_data['title'],
                    'author': page_data['author'],
                    'similarity': similarity
                })
                print(f"    📊 Match: {similarity}% - {page_data['title'][:50]}...")
            
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
    
    # Calculate final plagiarism score
    if unique_matches:
        # Use the highest match as the score
        plagiarism_score = unique_matches[0]['similarity']
    else:
        plagiarism_score = 0
    
    # Calculate breakdown
    breakdown = calculate_breakdown(plagiarism_score, unique_matches[:10])
    
    # Determine verdict
    if plagiarism_score < 15:
        verdict = 'Original'
    elif plagiarism_score < 30:
        verdict = 'Suspicious'
    else:
        verdict = 'Plagiarized'
    
    print(f"✅ Global check complete. Score: {plagiarism_score}%, Found: {len(unique_matches)} sources")
    print(f"📊 Breakdown: Identical={breakdown['identical']}%, Minor={breakdown['minor']}%, Paraphrased={breakdown['paraphrased']}%, Unique={breakdown['unique']}%")
    
    # Return COMPLETE response with breakdown
    return {
        'plagiarism_percentage': plagiarism_score,
        'breakdown': breakdown,
        'sources': unique_matches[:10],
        'verdict': verdict
    }