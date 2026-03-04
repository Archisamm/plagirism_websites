from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login_page, name="login"),
    path("after-login/", views.after_login, name="after_login"),
    path("setup/username/", views.username_page, name="username_page"),
    path("save-username/", views.save_username, name="save_username"),
    path("me/", views.me, name="me"),
    path("logout/", views.logout_view, name="logout"),
]