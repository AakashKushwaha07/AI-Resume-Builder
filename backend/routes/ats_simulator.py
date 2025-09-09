from utils.ats_utils import check_sections, ats_score, load_job_descriptions

def ats_feedback(resume_data, job_role=None):
    """
    Simulates ATS feedback by checking sections & job-specific keywords.
    """
    if not resume_data:
        return {
            "feedback": ["No resume data received"],
            "ats_score": 0,
            "matched_keywords": [],
            "missing_keywords": []
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
    # ✅ Normalize keywords to lowercase
    job_keywords = [kw.lower() for kw in job_info.get("keywords", [])]

    # --- Check resume structure (sections) ---
    section_feedback = check_sections(resume_text, required_sections)

    # --- Keyword Matching & ATS Scoring ---
    score_data = ats_score(resume_text.lower(), job_keywords)

    # --- Feedback ---
    feedback = section_feedback[:]
    if score_data["matched_keywords"]:
        feedback.append(f"Good job! You included important keywords: {', '.join(score_data['matched_keywords'])}.")
    if score_data["missing_keywords"]:
        feedback.append(f"Consider adding missing keywords: {', '.join(score_data['missing_keywords'])}.")

    # ✅ Debug log
    print("[ATS RESULT] Job Role:", job_role)
    print("[ATS RESULT] Score:", score_data["ats_score"])
    print("[ATS RESULT] Matched:", score_data["matched_keywords"])
    print("[ATS RESULT] Missing:", score_data["missing_keywords"])
    print("=" * 50)

    # Final response
    return {
        "feedback": feedback if feedback else ["Your resume is well structured for this job role."],
        "ats_score": score_data["ats_score"],   # ✅ Fixed
        "matched_keywords": score_data["matched_keywords"],
        "missing_keywords": score_data["missing_keywords"]
    }
