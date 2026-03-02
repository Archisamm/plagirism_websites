from rapidfuzz import fuzz
import re


def split_sentences(text):
    sentences = re.split(r'(?<=[.!?]) +', text)
    return [s.strip() for s in sentences if len(s.strip()) > 40]


def highlight_matches(document_text, sources):

    sentences = split_sentences(document_text)

    highlights = []

    for sentence in sentences:

        best_score = 0
        best_source = None

        for src in sources:

            comparison_text = src.get("title", "")

            score = fuzz.partial_ratio(
                sentence.lower(),
                comparison_text.lower()
            )

            if score > best_score:
                best_score = score
                best_source = src

        # highlight only strong matches
        if best_score > 65:
            highlights.append({
                "sentence": sentence,
                "similarity": round(best_score / 10, 2),
                "source": best_source
            })

    return highlights