from django.shortcuts import render

def home(request):
    return render(request, 'index.html')

def signup_page(request):
    return render(request, 'signup.html')

def login_page(request):
    return render(request, 'login.html')

def dashboard_page(request):
    return render(request, 'dashboard.html')

def upload_page(request):
    return render(request, 'upload.html')

def forgot_password(request):
    return render(request, "forgot_password.html")

def public_home(request):
    return render(request, "home_public.html")




# Student
def student_dashboard(request): return render(request, "student/dashboard.html")
def student_upload(request): return render(request, "student/upload.html")
def student_results(request): return render(request, "student/results.html")
def student_reports(request): return render(request, "student/reports.html")

# Professional
def professional_dashboard(request): return render(request, "professional/dashboard.html")
def professional_upload(request): return render(request, "professional/upload.html")
def professional_history(request): return render(request, "professional/history.html")
def professional_reports(request): return render(request, "professional/reports.html")
def professional_copyright(request): return render(request, "professional/copyright.html")

# Researcher
def researcher_dashboard(request): return render(request, "researcher/dashboard.html")
def researcher_upload(request): return render(request, "researcher/upload.html")
def researcher_similarity(request): return render(request, "researcher/similarity.html")
def researcher_citations(request): return render(request, "researcher/citations.html")
def researcher_results(request): return render(request, "researcher/results.html")
def researcher_reports(request): return render(request, "researcher/reports.html")


