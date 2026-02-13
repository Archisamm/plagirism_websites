from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout


def login_page(request):
    return render(request, "public/login.html")


@login_required
def after_login(request):
    """
    After Google login:
    - if profile not completed -> complete profile
    - else redirect to role dashboard
    """
    user = request.user

    if not getattr(user, "display_name", None) or not user.role:
        return redirect("/accounts/setup/profile/")

    return redirect(f"/{user.role}/dashboard/")


@login_required
def complete_profile_page(request):
    return render(request, "setup/complete_profile.html")


@login_required
def me(request):
    u = request.user
    return JsonResponse({
        "email": u.email,
        "display_name": getattr(u, "display_name", ""),
        "role": u.role
    })


@login_required
@csrf_exempt
def save_profile(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    user = request.user

    display_name = request.POST.get("display_name", "").strip()
    role = request.POST.get("role", "").strip()

    if role not in ["student", "professional", "researcher"]:
        return JsonResponse({"error": "Please select a valid category"}, status=400)

    # ✅ Role lock
    if user.role and user.role != role:
        return JsonResponse({"error": "Role change requires premium or new email"}, status=403)

    # ✅ save optional fields
    user.display_name = display_name or user.email.split("@")[0]
    user.role = role
    user.institution = request.POST.get("institution", "")
    user.phone = request.POST.get("phone", "")
    user.bio = request.POST.get("bio", "")
    user.save()

    return JsonResponse({
        "message": "Profile saved",
        "redirect": f"/{role}/dashboard/"
    })


@login_required
def logout_view(request):
    logout(request)
    return redirect("/")
