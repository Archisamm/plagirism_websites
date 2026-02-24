from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create default admin user automatically"

    def handle(self, *args, **kwargs):

        email = "shashi@gmail.com"
        password = "admin123"   # change later if you want

        if not User.objects.filter(email=email).exists():

            self.stdout.write("Creating admin user...")

            User.objects.create_superuser(
                email=email,
                password=password,
                username="archith"
            )

            self.stdout.write(self.style.SUCCESS("Admin created!"))

        else:
            self.stdout.write("Admin already exists.")