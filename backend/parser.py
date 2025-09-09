import os
import fitz  # PyMuPDF
import docx

def extract_text_from_resume(file_path):
    text = ""
    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".pdf":
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text()
        elif ext == ".docx":
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            return None  # Unsupported file format
    except Exception as e:
        print(f"Error extracting text: {e}")
        return None

    return text.strip()

def predict_career_path(resume_path):
    resume_text = extract_text_from_resume(resume_path)

    if not resume_text:
        return {"error": "Resume content could not be extracted."}

    resume_text = resume_text.lower()

    # Dummy prediction logic
    if "data" in resume_text or "python" in resume_text:
        return {"predicted_path": "Data Scientist"}
    elif "java" in resume_text or "spring" in resume_text:
        return {"predicted_path": "Java Developer"}
    else:
        return {"predicted_path": "Software Engineer"}
