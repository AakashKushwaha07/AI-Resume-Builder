import json
import re
import os

def load_job_descriptions(file_path="data/job_descriptions.json"):
    """
    Loads job descriptions from JSON file.
    """
    if not os.path.exists(file_path):
        return {}
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def check_sections(resume_text, required_sections):
    """
    Check if resume contains required sections.
    """
    feedback = []
    for section in required_sections:
        if not re.search(section, resume_text, re.IGNORECASE):
            feedback.append(f"Missing section: {section}")
    return feedback

def ats_score(resume_text, job_keywords):
    """
    Calculate ATS score based on keyword matching.
    """
    if not job_keywords:
        return {
            "ats_score": 0,
            "matched_keywords": [],
            "missing_keywords": []
        }

    resume_text_lower = resume_text.lower()

    matched = [kw for kw in job_keywords if kw.lower() in resume_text_lower]
    missing = [kw for kw in job_keywords if kw.lower() not in resume_text_lower]

    ats_score = int((len(matched) / len(job_keywords)) * 100)

    return {
        "ats_score": ats_score,
        "matched_keywords": matched,
        "missing_keywords": missing
    }

