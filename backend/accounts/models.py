from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


# ==========================================
# CUSTOM USER MANAGER
# ==========================================
class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            username=email,  # Django still needs username internally
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)
        return user


    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(email, password, **extra_fields)


# ==========================================
# USER MODEL
# ==========================================
class User(AbstractUser):

    ROLE_CHOICES = (
        ("student", "Student"),
        ("professional", "Professional"),
        ("researcher", "Researcher"),
    )

    # login fields
    email = models.EmailField(unique=True)

    # keep username internally (required by AbstractUser)
    username = models.CharField(max_length=150, blank=True, null=True)

    # profile
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, blank=True, null=True)
    display_name = models.CharField(max_length=100, blank=True)
    institution = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email