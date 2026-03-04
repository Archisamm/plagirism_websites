from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from accounts import views as account_views
from . import views


urlpatterns = [

    # ==============================
    # ADMIN
    # ==============================
    path("admin/", admin.site.urls),

    # ==============================
    # PUBLIC LANDING PAGES (No login required)
    # ==============================
    path("", views.public_home, name="public_home"),
    path("home/", views.home, name="home"),
    path("index/", views.index, name="index"),
    path("features/", views.features_page, name="features"),
    path("pricing/", views.pricing_page, name="pricing"),
    path("about/", views.about_page, name="about"),
    path("contact/", views.contact_page, name="contact"),

    # ==============================
    # AUTHENTICATION PAGES (Public)
    # ==============================
    path("login/", account_views.login_page, name="login"),
    path("signup/", views.signup_page, name="signup"),
    path("forgot-password/", views.forgot_password, name="forgot_password"),

    # ==============================
    # DJANGO ALLAUTH (Google OAuth)
    # ==============================
    path("accounts/", include("allauth.urls")),

    # ==============================
    # ACCOUNT MANAGEMENT (Protected)
    # ==============================
    path("accounts/", include("accounts.urls")),
    path("after-login/", account_views.after_login, name="after_login"),
    path("setup/profile/", account_views.complete_profile_page, name="complete_profile"),
    path("save-profile/", account_views.save_profile, name="save_profile"),

    # ==============================
    # PLAGIARISM API
    # ==============================
    path("api/", include("plagiarism.urls")),

    # ==============================
    # PROTECTED ANALYSIS PAGE (Login required)
    # ==============================
    path("dashboard/", views.unified_dashboard, name="unified_dashboard"),
    path("analyze/", views.unified_dashboard, name="analyze"),  # Alias
]

# ==============================
# MEDIA FILES (DEV ONLY)
# ==============================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)