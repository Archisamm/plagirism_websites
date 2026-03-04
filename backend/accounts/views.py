from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout


def login_page(request):
    """Login page"""
    return render(request, "public/login.html")


@login_required
def after_login(request):
    """
    After Google login:
    - If user has no display_name -> ask for username
    - Else -> go to dashboard
    """
    user = request.user
    
    # Check if user already has a username/display_name
    if not user.display_name:
        return redirect("/setup/username/")
    
    return redirect("/dashboard/")


@login_required
def username_page(request):
    """Username setup page"""
    return render(request, "setup/username.html")


@login_required
@csrf_exempt
def save_username(request):
    """Save username only"""
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    
    user = request.user
    username = request.POST.get("display_name", "").strip()
    
    if not username:
        return JsonResponse({"error": "Username is required"}, status=400)
    
    if len(username) < 2:
        return JsonResponse({"error": "Username must be at least 2 characters"}, status=400)
    
    # Save only the username/display_name
    user.display_name = username
    user.save()
    
    return JsonResponse({
        "message": "Username saved",
        "redirect": "/dashboard/"
    })


@login_required
def me(request):
    """Get current user info"""
    u = request.user
    return JsonResponse({
        "email": u.email,
        "display_name": getattr(u, "display_name", ""),
    })


@login_required
def logout_view(request):
    """Logout user"""
    logout(request)
    return redirect("/")