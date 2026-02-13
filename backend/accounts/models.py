from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("professional", "Professional"),
        ("researcher", "Researcher"),
    )

    # ✅ role fixed after choosing (locked)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, blank=True, null=True)

    # ✅ profile info
    display_name = models.CharField(max_length=100, blank=True)
    institution = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    # ✅ IMPORTANT for google OAuth
    username = models.CharField(max_length=150, unique=False, blank=True, null=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
