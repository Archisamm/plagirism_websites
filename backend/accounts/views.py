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
    - If profile not completed -> complete profile
    - Else redirect to unified dashboard
    """
    user = request.user

    if not getattr(user, "display_name", None):
        return redirect("/setup/profile/")

    return redirect("/dashboard/")


@login_required
def complete_profile_page(request):
    """Profile completion page"""
    return render(request, "setup/complete_profile.html")


@login_required
def me(request):
    """Get current user info"""
    u = request.user
    return JsonResponse({
        "email": u.email,
        "display_name": getattr(u, "display_name", ""),
    })


@login_required
@csrf_exempt
def save_profile(request):
    """Save user profile"""
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    user = request.user

    display_name = request.POST.get("display_name", "").strip()

    user.display_name = display_name or user.email.split("@")[0]
    user.institution = request.POST.get("institution", "")
    user.phone = request.POST.get("phone", "")
    user.bio = request.POST.get("bio", "")
    user.save()

    return JsonResponse({
        "message": "Profile saved",
        "redirect": "/dashboard/"
    })


@login_required
def logout_view(request):
    """Logout user"""
    logout(request)
    return redirect("/")