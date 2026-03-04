from plagiarism.models import Document
from .text_extractor import extract_text
from .preprocessor import preprocess_text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def calculate_plagiarism_score(uploaded_sentences):
    """Calculate plagiarism score against database documents"""
    
    # Get all reference documents
    documents = Document.objects.filter(is_reference=True)
    
    # If no reference documents, return default values
    if documents.count() == 0:
        print("⚠️ No reference documents found")
        return 0.0, [], {
            "identical": 0,
            "minor_changes": 0,
            "paraphrased": 0,
            "unique": 100,
        }
    
    # Collect all reference sentences
    db_sentences = []
    doc_titles = []
    
    for doc in documents:
        try:
            text = extract_text(doc.file.path)
            if text and len(text) > 100:
                sents = preprocess_text(text)
                db_sentences.extend(sents)
                doc_titles.extend([doc.title] * len(sents))
        except Exception as e:
            print(f"Error processing {doc.title}: {e}")
            continue
    
    # If no sentences found, return default
    if not db_sentences or not uploaded_sentences:
        return 0.0, [], {
            "identical": 0,
            "minor_changes": 0,
            "paraphrased": 0,
            "unique": 100,
        }
    
    # Combine corpus
    corpus = uploaded_sentences + db_sentences
    
    try:
        # Vectorize
        vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        tfidf = vectorizer.fit_transform(corpus)
        
        # Split
        up = tfidf[:len(uploaded_sentences)]
        db = tfidf[len(uploaded_sentences):]
        
        # Calculate similarities
        similarities = cosine_similarity(up, db)
        
        # Classify matches
        identical = 0
        minor = 0
        paraphrased = 0
        unique = 0
        all_scores = []
        matches = []
        
        for i, row in enumerate(similarities):
            if len(row) > 0:
                best_match_idx = np.argmax(row)
                best_score = row[best_match_idx] * 100
                all_scores.append(best_score)
                
                # Classify based on score
                if best_score >= 80:
                    identical += 1
                elif best_score >= 55:
                    minor += 1
                elif best_score >= 25:
                    paraphrased += 1
                else:
                    unique += 1
                
                # Store match info
                if best_score > 25:
                    matches.append({
                        'sentence': uploaded_sentences[i][:100],
                        'matched_document': doc_titles[best_match_idx] if best_match_idx < len(doc_titles) else "Unknown",
                        'similarity': round(best_score, 2)
                    })
        
        # Calculate percentages
        total = len(uploaded_sentences)
        if total == 0:
            return 0.0, [], {
                "identical": 0,
                "minor_changes": 0,
                "paraphrased": 0,
                "unique": 100,
            }
        
        breakdown = {
            "identical": round((identical / total) * 100, 2),
            "minor_changes": round((minor / total) * 100, 2),
            "paraphrased": round((paraphrased / total) * 100, 2),
            "unique": round((unique / total) * 100, 2)
        }
        
        # Calculate average score
        plagiarism_score = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0
        
        return plagiarism_score, matches[:10], breakdown
        
    except Exception as e:
        print(f"Error in similarity calculation: {e}")
        return 0.0, [], {
            "identical": 0,
            "minor_changes": 0,
            "paraphrased": 0,
            "unique": 100,
        }