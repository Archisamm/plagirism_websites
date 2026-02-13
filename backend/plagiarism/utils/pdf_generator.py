from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def generate_plagiarism_pdf(report, file_path):
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Plagiarism Analysis Report")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 100, f"Document: {report.document.title}")
    c.drawString(50, height - 130, f"Plagiarism Percentage: {report.plagiarism_percentage}%")
    c.drawString(50, height - 160, f"Verdict: {report.verdict}")
    c.drawString(50, height - 190, f"Analyzed On: {report.created_at.strftime('%Y-%m-%d %H:%M')}")

    c.showPage()
    c.save()
