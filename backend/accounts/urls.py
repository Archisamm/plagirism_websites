from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login_page, name="login"),

    # ✅ After google login
    path("after-login/", views.after_login, name="after_login"),

    # ✅ Setup profile
    path("setup/profile/", views.complete_profile_page, name="complete_profile"),
    path("save-profile/", views.save_profile, name="save_profile"),

    # ✅ Current user info
    path("me/", views.me, name="me"),

    # ✅ Logout
    path("logout/", views.logout_view, name="logout"),
]
