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
import re
from rapidfuzz import fuzz


GOOGLE_SEARCH_API = "https://www.googleapis.com/customsearch/v1"


API_KEY = "AIzaSyAnL8xfNRPxr0Rf8CWwyQQ5X3uZ_yylPiI"
CX_ID = "b173eaadf448c4983"


# ---------------------------------------
# CLEAN TEXT
# ---------------------------------------
def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# ---------------------------------------
# SPLIT TEXT INTO SEARCH QUERIES
# ---------------------------------------
def get_search_chunks(text, max_chunks=4):

    sentences = re.split(r"[.!?]", text)

    chunks = []
    for s in sentences:
        s = s.strip()
        if len(s) > 80:
            chunks.append(s)

    return chunks[:max_chunks]


# ---------------------------------------
# GOOGLE SEARCH
# ---------------------------------------
def google_search(query):

    params = {
        "key": API_KEY,
        "cx": CX_ID,
        "q": query,
        "num": 3,
    }

    try:
        r = requests.get(GOOGLE_SEARCH_API, params=params, timeout=10)
        data = r.json()
        return data.get("items", [])
    except Exception as e:
        print("Google search error:", e)
        return []


# ---------------------------------------
# EXTRACT AUTHOR FROM PAGE META
# ---------------------------------------
def extract_author(soup):

    meta_author = soup.find("meta", {"name": "author"})
    if meta_author:
        return meta_author.get("content")

    return "Unknown"


# ---------------------------------------
# FETCH PAGE TEXT (OPTIONAL SIMILARITY)
# ---------------------------------------
def fetch_page_text(url):

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, headers=headers, timeout=6)

        soup = BeautifulSoup(r.text, "html.parser")

        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs)

        return clean_text(text), extract_author(soup)

    except Exception:
        return "", "Unknown"


# ---------------------------------------
# MAIN SOURCE SEARCH
# ---------------------------------------
def search_sources(text):

    chunks = get_search_chunks(text)

    results = []
    seen_urls = set()

    for chunk in chunks:

        google_results = google_search(chunk)

        for item in google_results:

            url = item.get("link")
            title = item.get("title")

            if not url or url in seen_urls:
                continue

            seen_urls.add(url)

            # ⭐ ALWAYS include source even if similarity fails
            page_text, author = fetch_page_text(url)

            similarity = 0

            if page_text:
                similarity = fuzz.partial_ratio(
                    chunk.lower(),
                    page_text[:4000].lower()
                )

            results.append({
                "title": title,
                "author": author,
                "url": url,
                "similarity": round(similarity / 10, 2)
            })

    return results[:6]