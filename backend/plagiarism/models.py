from django.db import models


class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # ✅ Optional: marks global/reference documents for local comparison
    is_reference = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class PlagiarismReport(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="reports")
    plagiarism_percentage = models.FloatField()
    verdict = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    # ✅ Store top matches + breakdown
    matches_json = models.JSONField(default=list, blank=True)
    breakdown_json = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.document.title} - {self.plagiarism_percentage}%"
