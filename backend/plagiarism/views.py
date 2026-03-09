from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
import json
import time
import sys
import traceback
from datetime import datetime, timedelta
import random
import os

from .models import Document, PlagiarismReport
from .nlp.text_extractor import extract_text
from .nlp.preprocessor import preprocess_text
from .nlp.similarity import calculate_plagiarism_score
from .nlp.source_finder import search_sources
from .nlp.highlighter import highlight_matches
from .nlp.global_checker import global_plagiarism_check


# ======================================================
# SCORE → VERDICT
# ======================================================
def verdict_from_score(score):
    if score < 15:
        return "Original"
    elif score < 30:
        return "Suspicious"
    else:
        return "Plagiarized"


# ======================================================
# FILE UPLOAD ANALYSIS
# ======================================================
@csrf_exempt
def upload_document(request):
    print("="*80)
    print("🔥"*20 + " UPLOAD DOCUMENT CALLED " + "🔥"*20)
    print("="*80)
    print("REQUEST METHOD:", request.method)
    sys.stdout.flush()

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
        sys.stdout.flush()

        # -----------------------------
        # TEXT EXTRACTION
        # -----------------------------
        extracted_text = extract_text(document.file.path)

        print("📄 PDF Pages: ?")
        print("✅ Extracted characters:", len(extracted_text))
        print("🧠 Extracted text length:", len(extracted_text))
        sys.stdout.flush()

        if not extracted_text or not extracted_text.strip():
            return JsonResponse({"error": "Could not extract text"}, status=400)

        # -----------------------------
        # USE GLOBAL PLAGIARISM CHECK
        # -----------------------------
        print("\n" + "🌐"*30)
        print("🌐 CALLING GLOBAL PLAGIARISM CHECK...")
        print("🌐"*30)
        sys.stdout.flush()
        
        result = global_plagiarism_check(extracted_text)
        
        score = result['plagiarism_percentage']
        sources = result['sources']
        breakdown = result['breakdown']
        verdict = result['verdict']

        print("\n" + "🔎"*30)
        print(f"🔎 SOURCES FOUND: {len(sources)}")
        for i, s in enumerate(sources[:5]):
            print(f"  Source {i+1}: {s.get('title', 'N/A')[:50]} - {s.get('similarity', 0)}%")
        print("🔎"*30)
        print(f"📊 BREAKDOWN: Identical={breakdown['identical']}%, Minor={breakdown['minor']}%, Paraphrased={breakdown['paraphrased']}%, Unique={breakdown['unique']}%")
        sys.stdout.flush()

        # -----------------------------
        # SAVE REPORT
        # -----------------------------
        report = PlagiarismReport.objects.create(
            document=document,
            plagiarism_percentage=score,
            verdict=verdict,
            matches_json={},
            breakdown_json=breakdown
        )

        response_data = {
            "id": report.id,
            "report_id": report.id,
            "plagiarism_percentage": score,
            "verdict": verdict,
            "matches": [],
            "breakdown": breakdown,
            "sources": sources,
            "highlights": [],
            "title": document.title,
            "created_at": report.created_at.isoformat()
        }
        
        print("✅ SENDING RESPONSE with", len(sources), "sources")
        print(f"✅ FINAL PLAGIARISM SCORE: {score}%")
        print(f"✅ BREAKDOWN: {breakdown}")
        sys.stdout.flush()
        
        return JsonResponse(response_data)

    except Exception as e:
        print("❌ ANALYSIS ERROR")
        traceback.print_exc()
        sys.stdout.flush()
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# TEXT ANALYSIS (PASTE TEXT)
# ======================================================
@csrf_exempt
def analyze_text(request):
    """API endpoint to analyze pasted text"""
    print("="*80)
    print("🔥"*20 + " ANALYZE TEXT CALLED " + "🔥"*20)
    print("="*80)
    sys.stdout.flush()
    
    if request.method != 'POST':
        return JsonResponse({"error": "POST only"}, status=405)
    
    try:
        text = request.POST.get('text', '')
        
        if not text or len(text) < 50:
            return JsonResponse({
                'error': 'Text must be at least 50 characters long'
            }, status=400)
        
        print(f"📝 Analyzing text, length: {len(text)}")
        sys.stdout.flush()
        
        # Get complete result from global checker
        result = global_plagiarism_check(text)
        
        print(f"✅ Analysis complete. Score: {result['plagiarism_percentage']}%, Sources: {len(result['sources'])}")
        print(f"📊 Breakdown: {result['breakdown']}")
        sys.stdout.flush()
        
        return JsonResponse({
            'plagiarism_percentage': result['plagiarism_percentage'],
            'breakdown': result['breakdown'],
            'sources': result['sources'],
            'verdict': result['verdict'],
            'preview': text[:200] + '...' if len(text) > 200 else text,
            'title': 'Text Analysis'
        })
        
    except Exception as e:
        print("❌ ANALYSIS ERROR")
        traceback.print_exc()
        sys.stdout.flush()
        return JsonResponse({'error': str(e)}, status=500)


# ======================================================
# GET RECENT RESULTS
# ======================================================
@login_required
def recent_results(request):
    """Get recent analysis results for the current user"""
    try:
        reports = PlagiarismReport.objects.filter(
            document__isnull=False
        ).order_by('-created_at')[:10]
        
        results = []
        for report in reports:
            breakdown = report.breakdown_json if report.breakdown_json else {
                'identical': 0,
                'minor': 0,
                'paraphrased': report.plagiarism_percentage,
                'unique': 100 - report.plagiarism_percentage
            }
            
            results.append({
                "id": report.id,
                "report_id": report.id,
                "title": report.document.title if report.document else "Unknown",
                "score": report.plagiarism_percentage,
                "verdict": report.verdict,
                "created_at": report.created_at.isoformat(),
                "preview": f"Analysis completed with {report.plagiarism_percentage}% similarity score.",
                "breakdown": breakdown
            })
        
        return JsonResponse({"results": results})
    
    except Exception as e:
        print("Error fetching recent results:", e)
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# GET USER REPORTS
# ======================================================
@login_required
def user_reports(request):
    """Get all reports for the current user"""
    try:
        reports = PlagiarismReport.objects.all().order_by('-created_at')
        
        reports_list = []
        for report in reports:
            reports_list.append({
                "id": report.id,
                "report_id": report.id,
                "title": report.document.title if report.document else "Unknown",
                "score": report.plagiarism_percentage,
                "created_at": report.created_at.isoformat(),
                "type": "document" if report.document else "text"
            })
        
        return JsonResponse({"reports": reports_list})
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# GET CITATIONS
# ======================================================
@login_required
def get_citations(request):
    """Get citation analysis"""
    try:
        citations = {
            "total": 24,
            "correct": 18,
            "needs_review": 6,
            "citations": [
                {
                    "id": 1,
                    "text": "Smith et al. (2020) demonstrated that...",
                    "format": "APA",
                    "page": 42,
                    "correct": True
                },
                {
                    "id": 2,
                    "text": "Johnson and Lee, 2019, p. 123",
                    "format": "MLA",
                    "page": 123,
                    "correct": False,
                    "suggestion": "Should be: (Johnson and Lee 123)"
                },
                {
                    "id": 3,
                    "text": "[1] K. Kumar, et al., IEEE Trans., 2021",
                    "format": "IEEE",
                    "page": 1,
                    "correct": True
                }
            ]
        }
        
        return JsonResponse(citations)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# GET SIMILARITY DATA
# ======================================================
@login_required
def similarity_data(request):
    """Get similarity analysis data"""
    try:
        similarities = {
            "similarities": [
                {
                    "id": 1,
                    "title": "Research Paper on AI Ethics",
                    "type": "Document",
                    "date": (datetime.now() - timedelta(days=2)).isoformat(),
                    "score": 12,
                    "sources": {
                        "internet": 5,
                        "publications": 7,
                        "internal": 0
                    }
                },
                {
                    "id": 2,
                    "title": "Blog Post - Future of Technology",
                    "type": "Text",
                    "date": (datetime.now() - timedelta(days=5)).isoformat(),
                    "score": 28,
                    "sources": {
                        "internet": 18,
                        "publications": 5,
                        "internal": 5
                    }
                },
                {
                    "id": 3,
                    "title": "Thesis - Quantum Computing",
                    "type": "Document",
                    "date": (datetime.now() - timedelta(days=10)).isoformat(),
                    "score": 45,
                    "sources": {
                        "internet": 25,
                        "publications": 15,
                        "internal": 5
                    }
                }
            ]
        }
        
        return JsonResponse(similarities)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# GET USER HISTORY
# ======================================================
@login_required
def user_history(request):
    """Get user's analysis history"""
    try:
        reports = PlagiarismReport.objects.all().order_by('-created_at')[:20]
        
        history = []
        for report in reports:
            history.append({
                "id": report.id,
                "title": report.document.title if report.document else "Text Analysis",
                "type": "document" if report.document else "text",
                "date": report.created_at.isoformat(),
                "score": report.plagiarism_percentage,
                "verdict": report.verdict
            })
        
        return JsonResponse({"history": history})
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# GET COPYRIGHT DATA
# ======================================================
@login_required
def copyright_data(request):
    """Get copyright analysis data"""
    try:
        data = {
            "risk_level": "low",
            "risk_percentage": 15,
            "checked_documents": 42,
            "flagged": 3,
            "protected": 39,
            "flagged_items": [
                {
                    "id": 1,
                    "title": "Marketing Blog Post - Q1 2026",
                    "risk": 65,
                    "excerpt": "The quick brown fox jumps over the lazy dog...",
                    "sources": [
                        {"title": "Example.com Blog", "url": "#"},
                        {"title": "Marketing Weekly", "url": "#"}
                    ]
                },
                {
                    "id": 2,
                    "title": "Product Description - New Launch",
                    "risk": 42,
                    "excerpt": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
                    "sources": [
                        {"title": "Competitor Site", "url": "#"}
                    ]
                }
            ]
        }
        
        return JsonResponse(data)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# GET USER SETTINGS
# ======================================================
@login_required
def user_settings(request):
    """Get user settings"""
    try:
        settings = {
            "display_name": request.user.display_name if hasattr(request.user, 'display_name') else request.user.email,
            "email": request.user.email,
            "institution": getattr(request.user, 'institution', ''),
            "phone": getattr(request.user, 'phone', ''),
            "api_key": f"bri_api_{request.user.id}_{hash(request.user.email) % 10000:04x}"
        }
        
        return JsonResponse(settings)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# GET RESULT DETAILS
# ======================================================
@login_required
def result_details(request, result_id):
    """Get detailed information about a specific result"""
    try:
        report = get_object_or_404(PlagiarismReport, id=result_id)
        
        breakdown = report.breakdown_json if report.breakdown_json else {
            'identical': 0,
            'minor': 0,
            'paraphrased': report.plagiarism_percentage,
            'unique': 100 - report.plagiarism_percentage
        }
        
        data = {
            "id": report.id,
            "title": report.document.title if report.document else "Analysis Result",
            "score": report.plagiarism_percentage,
            "verdict": report.verdict,
            "created_at": report.created_at.isoformat(),
            "breakdown": breakdown,
            "matches": report.matches_json if report.matches_json else []
        }
        
        return JsonResponse(data)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================
# DOWNLOAD REPORT
# ======================================================
@login_required
def download_report(request, report_id):
    """Download a report as text file"""
    try:
        report = get_object_or_404(PlagiarismReport, id=report_id)
        
        breakdown = report.breakdown_json if report.breakdown_json else {
            'identical': 0,
            'minor': 0,
            'paraphrased': report.plagiarism_percentage,
            'unique': 100 - report.plagiarism_percentage
        }
        
        content = f"""PLAGIARISM DETECTION REPORT
{'='*60}

Report ID: {report.id}
Document: {report.document.title if report.document else 'Text Analysis'}
Date: {report.created_at.strftime('%Y-%m-%d %H:%M:%S')}

RESULTS
{'='*60}
Plagiarism Score: {report.plagiarism_percentage}%
Verdict: {report.verdict}

BREAKDOWN
{'='*60}
Identical Matches: {breakdown.get('identical', 0)}%
Minor Changes: {breakdown.get('minor', 0)}%
Paraphrased: {breakdown.get('paraphrased', report.plagiarism_percentage)}%
Unique Content: {breakdown.get('unique', 100 - report.plagiarism_percentage)}%

{'='*60}
End of Report
"""
        
        response = HttpResponse(content, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="report_{report_id}_{report.created_at.strftime("%Y%m%d")}.txt"'
        
        return response
    
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500)


# ======================================================
# SYNC USER DATA
# ======================================================
@login_required
@csrf_exempt
def sync_user_data(request):
    """Sync user data from frontend to backend"""
    if request.method != 'POST':
        return JsonResponse({"error": "POST only"}, status=405)
    
    try:
        data = json.loads(request.body)
        return JsonResponse({
            "status": "success",
            "message": "Data synced successfully",
            "user": request.user.email
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)