from plagiarism.models import Document
from .text_extractor import extract_text
from .preprocessor import preprocess_text

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def calculate_plagiarism_score(uploaded_sentences):

    documents = Document.objects.all()

    if documents.count() <= 1:
        return 0.0, [], {
            "identical": 0,
            "minor_changes": 0,
            "paraphrased": 0,
            "unique": 100,
        }

    db_sentences = []

    for doc in documents:
        try:
            text = extract_text(doc.file.path)
            sents = preprocess_text(text)
            db_sentences.extend(sents)
        except:
            continue

    corpus = uploaded_sentences + db_sentences

    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform(corpus)

    up = tfidf[:len(uploaded_sentences)]
    db = tfidf[len(uploaded_sentences):]

    sim = cosine_similarity(up, db)

    identical = minor = paraphrased = unique = 0
    scores = []

    for row in sim:

        best = row.max() * 100
        scores.append(best)

        if best >= 80:
            identical += 1
        elif best >= 55:
            minor += 1
        elif best >= 25:
            paraphrased += 1
        else:
            unique += 1

    total = len(uploaded_sentences)

    breakdown = {
        "identical": round((identical/total)*100,2),
        "minor_changes": round((minor/total)*100,2),
        "paraphrased": round((paraphrased/total)*100,2),
        "unique": round((unique/total)*100,2)
    }

    plagiarism_score = round(sum(scores)/len(scores),2)

    return plagiarism_score, [], breakdown
