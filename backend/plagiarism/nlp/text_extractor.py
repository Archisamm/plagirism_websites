import os
import pdfplumber
import docx

# OCR imports (for scanned thesis PDFs)
import pytesseract
from PIL import Image



# --------------------------------------------------
# OPTIONAL: SET TESSERACT PATH (Windows only)
# Change path if different in your system
# --------------------------------------------------
pytesseract.pytesseract.tesseract_cmd = r"C:\Users\user\Downloads\tesseract-ocr.exe"


# --------------------------------------------------
# MAIN TEXT EXTRACTION FUNCTION
# --------------------------------------------------
def extract_text(file_path):
    """
    Extract text safely from supported files.

    Supported:
        - PDF (normal + scanned OCR)
        - DOCX
        - TXT

    Always returns STRING (never None)
    """

    if not file_path or not os.path.exists(file_path):
        return ""

    file_path = file_path.lower()

    try:
        # ---------------- PDF ----------------
        if file_path.endswith(".pdf"):
            return extract_pdf_text(file_path)

        # ---------------- DOCX ----------------
        elif file_path.endswith(".docx"):
            return extract_docx_text(file_path)

        # ---------------- TXT ----------------
        elif file_path.endswith(".txt"):
            return extract_txt_text(file_path)

    except Exception as e:
        print("TEXT EXTRACTION ERROR:", e)

    return ""


# --------------------------------------------------
# PDF EXTRACTION (NORMAL + OCR FALLBACK)
# --------------------------------------------------
def extract_pdf_text(file_path):

    text = ""

    try:
        with pdfplumber.open(file_path) as pdf:
            MAX_PAGES = 12
            for page in pdf.pages[:MAX_PAGES]:
                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

            # --------------------------------------------------
            # OCR FALLBACK (for scanned/image thesis PDFs)
            # --------------------------------------------------
            if len(text.strip()) < 50:
                print("⚠ OCR MODE ACTIVATED (Scanned PDF detected)")
                
                for page in pdf.pages:
                    try:
                        # Convert page to image
                        img = page.to_image(resolution=300).original

                        ocr_text = pytesseract.image_to_string(img)

                        if ocr_text:
                            text += ocr_text + "\n"

                    except Exception as ocr_error:
                        print("OCR page failed:", ocr_error)

    except Exception as e:
        print("PDF extraction failed:", e)

    return text.strip()


# --------------------------------------------------
# DOCX EXTRACTION
# --------------------------------------------------
def extract_docx_text(file_path):

    text = ""

    try:
        document = docx.Document(file_path)

        for paragraph in document.paragraphs:
            if paragraph.text:
                text += paragraph.text + "\n"

    except Exception as e:
        print("DOCX extraction failed:", e)

    return text.strip()


# --------------------------------------------------
# TXT EXTRACTION
# --------------------------------------------------
def extract_txt_text(file_path):

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()

    except Exception as e:
        print("TXT extraction failed:", e)

    return ""