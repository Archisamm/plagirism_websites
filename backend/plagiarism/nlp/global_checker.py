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

import random
import asyncio
import aiohttp
import requests
from bs4 import BeautifulSoup
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# =====================================
# GOOGLE CONFIG
# =====================================
GOOGLE_API_KEY = "AIzaSyAnL8xfNRPxr0Rf8CWwyQQ5X3uZ_yylPiI"
GOOGLE_CX = "b173eaadf448c4983"


# =====================================
# GOOGLE SEARCH
# =====================================

def search_google(query):

    url = "https://www.googleapis.com/customsearch/v1"

    params = {
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CX,
        "q": query,
        "num": 2
    }

    try:
        r = requests.get(url, params=params, timeout=4)

        if r.status_code != 200:
            return []

        data = r.json()
        return [i["link"] for i in data.get("items", [])]

    except Exception as e:
        print("Google search error:", e)
        return []


# =====================================
# FETCH WEBSITE (ASYNC)
# =====================================

async def fetch_page(session, url):

    try:
        async with session.get(url, timeout=6) as response:

            if response.status != 200:
                return None

            html = await response.text()

            soup = BeautifulSoup(html, "html.parser")

            title = soup.title.string.strip() if soup.title else ""

            author = ""
            meta = soup.find("meta", attrs={"name": "author"})
            if meta:
                author = meta.get("content", "")

            paragraphs = soup.find_all("p")
            text = " ".join(p.get_text(" ", strip=True) for p in paragraphs)

            return {
                "url": url,
                "text": text[:3500],
                "title": title,
                "author": author
            }

    except:
        return None


# =====================================
# SIMILARITY
# =====================================

def compare_texts(a, b):

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=3000
        )

        vectors = vectorizer.fit_transform([a, b])
        score = cosine_similarity(vectors[0], vectors[1])[0][0]

        return score * 100

    except:
        return 0


# =====================================
# ASYNC ENGINE
# =====================================

async def async_global_check(uploaded_text, urls):

    matched = []
    max_score = 0

    timeout = aiohttp.ClientTimeout(total=8)

    async with aiohttp.ClientSession(timeout=timeout) as session:

        tasks = [fetch_page(session, u) for u in urls]
        results = await asyncio.gather(*tasks)

        for result in results:

            if not result or not result["text"]:
                continue

            sim = round(compare_texts(uploaded_text, result["text"]), 2)

            matched.append({
                "url": result["url"],
                "title": result["title"],
                "author": result["author"],
                "similarity": sim
            })

            if sim > max_score:
                max_score = sim

            if max_score > 85:
                break

    return max_score, matched


# =====================================
# MAIN ENTRY FUNCTION (DJANGO SAFE)
# =====================================

def global_plagiarism_check(uploaded_text):

    if not uploaded_text or len(uploaded_text) < 80:
        return 0, []

    uploaded_text = uploaded_text[:6000]

    sentences = [
        s.strip()
        for s in uploaded_text.split(".")
        if 80 < len(s.strip()) < 300
    ]

    if not sentences:
        return 0, []

    sentences = random.sample(sentences, min(3, len(sentences)))

    all_urls = set()

    for sentence in sentences:
        urls = search_google(sentence)
        all_urls.update(urls)

    if not all_urls:
        return 0, []

    # SAFE asyncio execution for Django
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    score, sources = loop.run_until_complete(
        async_global_check(uploaded_text, list(all_urls))
    )

    loop.close()

    return round(score, 2), sources