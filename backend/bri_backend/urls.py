from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from accounts import views as account_views
from . import views  # bri_backend/views.py


urlpatterns = [

    # ==============================
    # ADMIN
    # ==============================
    path("admin/", admin.site.urls),

    # ==============================
    # PUBLIC LANDING PAGE
    # ==============================
    path("", views.public_home, name="home"),

    # ==============================
    # LOGIN PAGE (your custom page)
    # ==============================
    path("login/", account_views.login_page, name="login"),

    # ==============================
    # ✅ DJANGO ALLAUTH (CRITICAL FIX)
    # ==============================
    # Google OAuth MUST live under /accounts/
    path("accounts/", include("allauth.urls")),

    # ==============================
    # YOUR CUSTOM ACCOUNT ROUTES
    # ==============================
    # path("accounts/", include("accounts.urls")),

    path("after-login/", account_views.after_login, name="after_login"),
    path("setup/profile/", account_views.complete_profile_page, name="complete_profile"),
    path("save-profile/", account_views.save_profile, name="save_profile"),

    # ==============================
    # PLAGIARISM API
    # ==============================
    path("api/", include("plagiarism.urls")),

    # ==============================
    # OPTIONAL PAGES
    # ==============================
    path("forgot-password/", views.forgot_password, name="forgot_password"),

    # ==============================
    # STUDENT ROUTES
    # ==============================
    path("student/dashboard/", views.student_dashboard, name="student_dashboard"),
    path("student/upload/", views.student_upload, name="student_upload"),
    path("student/results/", views.student_results, name="student_results"),
    path("student/reports/", views.student_reports, name="student_reports"),

    # ==============================
    # PROFESSIONAL ROUTES
    # ==============================
    path("professional/dashboard/", views.professional_dashboard, name="professional_dashboard"),
    path("professional/upload/", views.professional_upload, name="professional_upload"),
    path("professional/history/", views.professional_history, name="professional_history"),
    path("professional/reports/", views.professional_reports, name="professional_reports"),
    path("professional/copyright/", views.professional_copyright, name="professional_copyright"),

    # ==============================
    # RESEARCHER ROUTES
    # ==============================
    path("researcher/dashboard/", views.researcher_dashboard, name="researcher_dashboard"),
    path("researcher/upload/", views.researcher_upload, name="researcher_upload"),
    path("researcher/similarity/", views.researcher_similarity, name="researcher_similarity"),
    path("researcher/citations/", views.researcher_citations, name="researcher_citations"),
    path("researcher/results/", views.researcher_results, name="researcher_results"),
    path("researcher/reports/", views.researcher_reports, name="researcher_reports"),
]


# ==============================
# MEDIA FILES (DEV ONLY)
# ==============================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)