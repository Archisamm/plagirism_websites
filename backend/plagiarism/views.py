# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt

# from .models import Document, PlagiarismReport
# from .nlp.text_extractor import extract_text
# from .nlp.preprocessor import preprocess_text
# from .nlp.similarity import calculate_plagiarism_score
# from .nlp.global_checker import global_plagiarism_check


# # -----------------------------------
# # Score → Verdict
# # -----------------------------------
# def verdict_from_score(score):
#     if score <= 10:
#         return "Original"
#     elif score <= 24:
#         return "Minor Changes"
#     else:
#         return "Plagiarized"


# # -----------------------------------
# # Upload File
# # -----------------------------------
# @csrf_exempt
# def upload_document(request):

#     if request.method != "POST":
#         return JsonResponse({"error": "POST only"}, status=405)

#     uploaded_file = request.FILES.get("file")
#     if not uploaded_file:
#         return JsonResponse({"error": "No file uploaded"}, status=400)

#     try:
#         # Save document
#         document = Document.objects.create(
#             title=uploaded_file.name,
#             file=uploaded_file
#         )

#         # Extract text
#         extracted_text = extract_text(document.file.path)

#         if not extracted_text.strip():
#             return JsonResponse({"error": "Could not extract text"}, status=400)

#         # Preprocess
#         sentences = preprocess_text(extracted_text)

#         if not sentences:
#             return JsonResponse({"error": "Text too short"}, status=400)

#         # LOCAL plagiarism check
#         score, matches, breakdown = calculate_plagiarism_score(sentences)

#         score = round(float(score), 2)
#         verdict = verdict_from_score(score)

#         # Save report
#         PlagiarismReport.objects.create(
#             document=document,
#             plagiarism_percentage=score,
#             verdict=verdict,
#             matches_json=matches,
#             breakdown_json=breakdown
#         )

#         return JsonResponse({
#             "plagiarism_percentage": score,
#             "verdict": verdict,
#             "matches": matches,
#             "breakdown": breakdown
#         })

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({"error": "Analysis failed"}, status=500)


# # -----------------------------------
# # Analyze Pasted Text
# # -----------------------------------
# @csrf_exempt
# def analyze_text(request):

#     if request.method != "POST":
#         return JsonResponse({"error": "POST only"}, status=405)

#     text = request.POST.get("text", "").strip()

#     if len(text) < 50:
#         return JsonResponse({"error": "Text too short"}, status=400)

#     try:
#         score, sources = global_plagiarism_check(text)

#         if score <= 10:
#             verdict = "Original"
#         elif score <= 24:
#             verdict = "Minor Changes"
#         else:
#             verdict = "Plagiarized"

#         return JsonResponse({
#             "plagiarism_percentage": score,
#             "verdict": verdict,
#             "sources": sources
#         })

#     except Exception as e:
#         print("GLOBAL ERROR:", e)
#         return JsonResponse({"error": "Global analysis failed"}, status=500)




from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import time
import traceback

from .models import Document, PlagiarismReport
from .nlp.text_extractor import extract_text
from .nlp.preprocessor import preprocess_text
from .nlp.similarity import calculate_plagiarism_score
from .nlp.source_finder import search_sources


# ======================================================
# SCORE → VERDICT
# ======================================================
def verdict_from_score(score):
    if score <= 10:
        return "Original"
    elif score <= 24:
        return "Minor Changes"
    else:
        return "Plagiarized"


# ======================================================
# FILE UPLOAD ANALYSIS
# ======================================================
@csrf_exempt
def upload_document(request):

    print("✅ upload_document called")
    print("REQUEST METHOD:", request.method)

    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    try:
        # -----------------------------
        # SAVE FILE
        # -----------------------------
        document = Document.objects.create(
            title=uploaded_file.name,
            file=uploaded_file
        )

        print("📁 File saved at:", document.file.path)

        # ⭐ IMPORTANT FOR RENDER FILESYSTEM
        time.sleep(0.5)

        # -----------------------------
        # TEXT EXTRACTION
        # -----------------------------
        extracted_text = extract_text(document.file.path)

        print("🧠 Extracted text length:", len(extracted_text))

        if not extracted_text or not extracted_text.strip():
            return JsonResponse(
                {"error": "Could not extract text"},
                status=400
            )

        # -----------------------------
        # PREPROCESS
        # -----------------------------
        sentences = preprocess_text(extracted_text)

        if not sentences:
            return JsonResponse(
                {"error": "Text too short"},
                status=400
            )

        # -----------------------------
        # LOCAL SIMILARITY
        # -----------------------------
        score, matches, breakdown = calculate_plagiarism_score(sentences)

        score = round(float(score), 2)
        verdict = verdict_from_score(score)

        # -----------------------------
        # GLOBAL SOURCE SEARCH
        # -----------------------------
        print("🌍 Searching global sources...")
        sources = search_sources(extracted_text)

        print("🔎 Sources found:", len(sources))

        # -----------------------------
        # SAVE REPORT
        # -----------------------------
        PlagiarismReport.objects.create(
            document=document,
            plagiarism_percentage=score,
            verdict=verdict,
            matches_json=matches,
            breakdown_json=breakdown
        )

        # -----------------------------
        # RESPONSE
        # -----------------------------
        return JsonResponse({
            "plagiarism_percentage": score,
            "verdict": verdict,
            "matches": matches,
            "breakdown": breakdown,
            "sources": sources
        })

    except Exception as e:
        print("❌ ANALYSIS ERROR")
        traceback.print_exc()

        return JsonResponse(
            {"error": "Analysis failed"},
            status=500
        )


# ======================================================
# TEXT ANALYSIS (PASTE TEXT)
# ======================================================
@csrf_exempt
def analyze_text(request):

    print("✅ analyze_text called")

    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    text = request.POST.get("text", "").strip()

    if len(text) < 50:
        return JsonResponse({"error": "Text too short"}, status=400)

    try:
        print("🌍 Running global search...")

        sources = search_sources(text)

        # simple scoring logic
        score = min(len(sources) * 15, 100)
        verdict = verdict_from_score(score)

        return JsonResponse({
            "plagiarism_percentage": score,
            "verdict": verdict,
            "sources": sources
        })

    except Exception as e:
        print("❌ GLOBAL ERROR:", e)
        traceback.print_exc()

        return JsonResponse(
            {"error": "Global analysis failed"},
            status=500
        )