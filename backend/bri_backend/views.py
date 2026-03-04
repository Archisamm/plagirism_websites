from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

# ==============================
# PUBLIC LANDING PAGES (No login required)
# ==============================

def public_home(request):
    """Main landing page with AI features"""
    return render(request, "home_public.html")

def home(request):
    """Alternative home page - redirect to public home"""
    return redirect('public_home')

def index(request):
    """Index page - redirect to public home"""
    return redirect('public_home')

def features_page(request):
    """Features section - uses same landing page with anchor"""
    return render(request, "home_public.html")

def pricing_page(request):
    """Pricing section - uses same landing page with anchor"""
    return render(request, "home_public.html")

def about_page(request):
    """About section - uses same landing page with anchor"""
    return render(request, "home_public.html")

def contact_page(request):
    """Contact section - uses same landing page with anchor"""
    return render(request, "home_public.html")

# ==============================
# AUTHENTICATION PAGES (Public)
# ==============================

def signup_page(request):
    """Signup page"""
    return render(request, "signup.html")

def forgot_password(request):
    """Forgot password page"""
    return render(request, "forgot_password.html")

# ==============================
# PROTECTED ANALYSIS PAGE (Login required)
# ==============================

@login_required(login_url='/login/')
def unified_dashboard(request):
    """Single unified analysis page for authenticated users"""
    return render(request, "unified.html")

# Alias for backward compatibility
@login_required(login_url='/login/')
def unified_upload(request):
    """Alias for dashboard"""
    return redirect('unified_dashboard')

@login_required(login_url='/login/')
def unified_results(request):
    """Alias for dashboard"""
    return redirect('unified_dashboard')

@login_required(login_url='/login/')
def unified_reports(request):
    """Alias for dashboard"""
    return redirect('unified_dashboard')

@login_required(login_url='/login/')
def unified_history(request):
    """Alias for dashboard"""
    return redirect('unified_dashboard')

@login_required(login_url='/login/')
def unified_copyright(request):
    """Alias for dashboard"""
    return redirect('unified_dashboard')

@login_required(login_url='/login/')
def unified_similarity(request):
    """Alias for dashboard"""
    return redirect('unified_dashboard')

@login_required(login_url='/login/')
def unified_citations(request):
    """Alias for dashboard"""
    return redirect('unified_dashboard')