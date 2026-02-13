from django.contrib import admin
from .models import Document, PlagiarismReport

admin.site.register(Document)
admin.site.register(PlagiarismReport)
