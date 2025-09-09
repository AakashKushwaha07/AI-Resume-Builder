
from io import BytesIO
from utils.parser_utils import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_email,
    extract_name,
    extract_skills
)

def parse_resume(file):
    text = ""

    filename = file.filename.lower()
    print("File received:", file.filename)

    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(file.read())

    elif filename.endswith(".docx"):
        in_memory_file = BytesIO(file.read())
        text = extract_text_from_docx(in_memory_file)

    else:
        raise ValueError("Unsupported file format")

    # Parsed result using utils
    parsed_data = {
        "name": extract_name(text),
        "email": extract_email(text) or "Not found",
        "skills": extract_skills(text),
        "text": text.strip()
    }

    return parsed_data

