from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = "Create Google SocialApp automatically for production"

    def handle(self, *args, **kwargs):

        # =====================================
        # 🔴 PUT YOUR GOOGLE CLOUD VALUES HERE
        # =====================================

        GOOGLE_CLIENT_ID = "PASTE_YOUR_CLIENT_ID_HERE"
        GOOGLE_SECRET = "PASTE_YOUR_CLIENT_SECRET_HERE"

        # =====================================
        # SITE CONFIGURATION
        # =====================================

        site, created = Site.objects.get_or_create(
            id=1,
            defaults={
                "domain": "plagirism-websites.onrender.com",
                "name": "BRI Plagiarism Platform",
            },
        )

        if not created:
            site.domain = "plagirism-websites.onrender.com"
            site.name = "BRI Plagiarism Platform"
            site.save()

        # =====================================
        # CREATE OR UPDATE SOCIAL APP
        # =====================================

        app, created = SocialApp.objects.get_or_create(
            provider="google",
            name="Google OAuth",
            defaults={
                "client_id": GOOGLE_CLIENT_ID,
                "secret": GOOGLE_SECRET,
            },
        )

        # update credentials if already exists
        app.client_id = GOOGLE_CLIENT_ID
        app.secret = GOOGLE_SECRET
        app.save()

        # attach site
        app.sites.clear()
        app.sites.add(site)

        self.stdout.write(
            self.style.SUCCESS(
                "✅ Google SocialApp created/updated successfully!"
            )
        )