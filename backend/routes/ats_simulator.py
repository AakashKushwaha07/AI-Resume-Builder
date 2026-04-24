import re
from utils.ats_utils import check_sections, ats_score, load_job_descriptions

def _compute_section_coverage(required_sections, resume_text):
    if not required_sections:
        return 100

    missing = [section for section in required_sections if not re.search(section, resume_text, re.IGNORECASE)]
    return int(((len(required_sections) - len(missing)) / len(required_sections)) * 100)


def ats_feedback(resume_data, job_role=None):
    """
    Simulates ATS feedback by checking sections & job-specific keywords.
    """
    if not resume_data:
        return {
            "feedback": ["No resume data received"],
            "ats_score": 0,
            "keyword_score": 0,
            "section_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "missing_sections": []
        }

    # Ensure resume text is plain string
    resume_text = resume_data if isinstance(resume_data, str) else str(resume_data)

    # Load job descriptions from JSON
    job_descriptions = load_job_descriptions()

    # Handle case where job descriptions are stored inside a list
    if isinstance(job_descriptions, list) and len(job_descriptions) > 0:
        job_descriptions = job_descriptions[0]

    job_info = job_descriptions.get(job_role, {})
    required_sections = job_info.get("sections", [])
    job_keywords = [kw.lower() for kw in job_info.get("keywords", [])]

    # --- Check resume structure (sections) ---
    section_feedback = check_sections(resume_text, required_sections)
    section_score = _compute_section_coverage(required_sections, resume_text)

    # --- Keyword Matching & ATS Scoring ---
    score_data = ats_score(resume_text.lower(), job_keywords)
    keyword_score = score_data["ats_score"]

    # --- Combined role capability score for this specific role ---
    capability_score = round((keyword_score * 0.65) + (section_score * 0.35), 2)

    # --- Feedback ---
    feedback = []
    if required_sections:
        feedback.append(
            f"Your resume covers {section_score}% of the expected role sections for {job_role}."
        )
    if job_keywords:
        feedback.append(
            f"Keyword coverage for this role is {keyword_score}% based on {len(job_keywords)} target terms."
        )

    feedback.extend(section_feedback)
    if score_data["matched_keywords"]:
        feedback.append(f"Good job! You included important keywords: {', '.join(score_data['matched_keywords'])}.")
    if score_data["missing_keywords"]:
        feedback.append(f"Consider adding missing keywords: {', '.join(score_data['missing_keywords'])}.")

    if capability_score >= 85:
        feedback.append("Your resume is very well aligned with this role.")
    elif capability_score >= 60:
        feedback.append("Your resume has a solid base for this role but could improve in a few areas.")
    else:
        feedback.append("This role requires stronger alignment; focus on keywords and missing sections.")

    missing_sections = [section for section in required_sections if not re.search(section, resume_text, re.IGNORECASE)]

    # Final response
    return {
        "feedback": feedback if feedback else ["Your resume is well structured for this job role."],
        "ats_score": capability_score,
        "keyword_score": keyword_score,
        "section_score": section_score,
        "matched_keywords": score_data["matched_keywords"],
        "missing_keywords": score_data["missing_keywords"],
        "missing_sections": missing_sections,
        "job_role": job_role,
        "required_sections": required_sections,
    }
