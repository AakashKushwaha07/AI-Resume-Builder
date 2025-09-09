import fitz  # PyMuPDF
import docx
from io import BytesIO
import re

def extract_text_from_pdf(file_stream):
    """Extract text from a PDF file stream."""
    text = ""
    doc = fitz.open(stream=file_stream, filetype="pdf")
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def extract_text_from_docx(file_stream):
    """Extract text from a DOCX file stream."""
    text = ""
    doc = docx.Document(file_stream)
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def extract_email(text):
    """Extract first valid email from text."""
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group(0) if match else None

def extract_name(text):
    """A very simple name extractor (can be replaced with ML-based approach)."""
    lines = text.split("\n")
    return lines[0].strip() if lines else "Unknown"

def extract_skills(text, predefined_skills=None):
    """Extract skills from text based on a predefined skill list."""
    if predefined_skills is None:
        predefined_skills = ["Python", "Java", "Flask", "Machine Learning", "React", "SQL"]

    found_skills = []
    for skill in predefined_skills:
        if skill.lower() in text.lower():
            found_skills.append(skill)
    return found_skills
