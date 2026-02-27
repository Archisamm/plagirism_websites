from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = "Create Google SocialApp automatically (for Render deployment)"

    def handle(self, *args, **kwargs):

        # ✅ CHANGE THESE VALUES (same as Google Cloud Console)
        GOOGLE_CLIENT_ID = "PASTE_YOUR_GOOGLE_CLIENT_ID"
        GOOGLE_SECRET = "PASTE_YOUR_GOOGLE_CLIENT_SECRET"

        site, _ = Site.objects.get_or_create(
            id=1,
            defaults={
                "domain": "plagirism-websites.onrender.com",
                "name": "plagirism-websites"})