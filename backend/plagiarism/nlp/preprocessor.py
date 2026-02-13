import re

STOP_WORDS = {
    "a","an","the","and","or","but","if","to","of","in","on","for","with",
    "is","are","was","were","be","been","this","that","it","as","by"
}

def preprocess_text(text):

    text = (text or "").lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text)

    raw = text.split(".")

    result = []

    for s in raw:
        words = [w for w in s.split() if w not in STOP_WORDS and len(w) > 2]
        if len(words) >= 4:
            result.append(" ".join(words))

    return result
