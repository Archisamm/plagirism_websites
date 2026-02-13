from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Document, PlagiarismReport
from .nlp.text_extractor import extract_text
from .nlp.preprocessor import preprocess_text
from .nlp.similarity import calculate_plagiarism_score


# -----------------------------------
# Score → Verdict
# -----------------------------------
def verdict_from_score(score):
    if score <= 10:
        return "Original"
    elif score <= 24:
        return "Minor Changes"
    else:
        return "Plagiarized"


# -----------------------------------
# Upload File
# -----------------------------------
@csrf_exempt
def upload_document(request):

    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    try:
        # Save document
        document = Document.objects.create(
            title=uploaded_file.name,
            file=uploaded_file
        )

        # Extract text
        extracted_text = extract_text(document.file.path)

        if not extracted_text.strip():
            return JsonResponse({"error": "Could not extract text"}, status=400)

        # Preprocess
        sentences = preprocess_text(extracted_text)

        if not sentences:
            return JsonResponse({"error": "Text too short"}, status=400)

        # LOCAL plagiarism check
        score, matches, breakdown = calculate_plagiarism_score(sentences)

        score = round(float(score), 2)
        verdict = verdict_from_score(score)

        # Save report
        PlagiarismReport.objects.create(
            document=document,
            plagiarism_percentage=score,
            verdict=verdict,
            matches_json=matches,
            breakdown_json=breakdown
        )

        return JsonResponse({
            "plagiarism_percentage": score,
            "verdict": verdict,
            "matches": matches,
            "breakdown": breakdown
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Analysis failed"}, status=500)


# -----------------------------------
# Analyze Pasted Text
# -----------------------------------
@csrf_exempt
def analyze_text(request):

    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    text = request.POST.get("text", "").strip()

    if len(text) < 40:
        return JsonResponse({"error": "Text too short"}, status=400)

    try:
        sentences = preprocess_text(text)

        score, matches, breakdown = calculate_plagiarism_score(sentences)

        score = round(float(score), 2)
        verdict = verdict_from_score(score)

        return JsonResponse({
            "plagiarism_percentage": score,
            "verdict": verdict,
            "matches": matches,
            "breakdown": breakdown
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Analysis failed"}, status=500)
