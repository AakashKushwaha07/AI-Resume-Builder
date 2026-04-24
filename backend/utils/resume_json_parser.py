import re
import spacy
from typing import Dict, Any, List

# Load spaCy model for NLP
nlp = spacy.load("en_core_web_sm")

# -------------------- PREDEFINED SKILL LISTS --------------------
TECH_SKILLS = [
    "python", "java", "c++", "c#", "node.js", "react", "angular",
    "spring", "sql", "mongodb", "aws", "azure", "docker",
    "kubernetes", "terraform", "rest api", "graphql", "typescript",
    "javascript", "html", "css", "django", "flask", "fastapi",
    "machine learning", "data analysis", "statistics", "pandas",
    "numpy", "scikit-learn", "tensorflow", "pytorch", "deep learning",
    "nlp", "computer vision", "data science", "big data", "hadoop",
    "spark", "tableau", "power bi", "excel", "git", "linux", "windows"
]

SOFT_SKILLS = [
    "communication", "leadership", "teamwork", "problem solving",
    "ownership", "adaptability", "proactive", "collaboration",
    "decision making", "time management"
]

STOPWORDS = set([
    "experience", "role", "responsibility", "tasks", "systems",
    "features", "team", "we", "you", "this", "the"
])

# -------------------- RESUME PARSER --------------------
def parse_resume_to_json(resume_text):
    text_lower = resume_text.lower()
    
    return {
        "education": extract_education(text_lower),
        "experience_years": extract_experience(text_lower),
        "tech_skills": extract_tech_skills(text_lower),
        "soft_skills": extract_soft_skills(resume_text),
        "projects": extract_projects(text_lower),
        "raw_text": resume_text
    }

def extract_education(text):
    degrees = []
    if any(k in text for k in ["b.tech", "btech", "bachelor", "b.sc", "b.e"]):
        degrees.append("Bachelors")
    if any(k in text for k in ["m.tech", "mtech", "master", "m.sc", "m.e"]):
        degrees.append("Masters")
    return degrees

def extract_experience(text):
    matches = re.findall(r"(\d+(\.\d+)?)\+?\s*(years?|yrs?)", text)
    return max([float(m[0]) for m in matches], default=0)

def extract_tech_skills(text):
    """Extract technical skills using both predefined matching and NLP"""
    skills = set()

    # First, check for exact matches with predefined skills
    text_lower = text.lower()
    for skill in TECH_SKILLS:
        if skill in text_lower:
            skills.add(skill)

    # Use NLP to extract additional potential skills
    doc = nlp(text)

    # Extract noun phrases that might be skills (more selective)
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.lower().strip()
        # Filter out common words, names, and short/irrelevant phrases
        if (len(chunk_text.split()) <= 2 and  # Max 2 words
            len(chunk_text) > 2 and
            not any(word in chunk_text for word in ['experience', 'role', 'responsibility', 'team', 'we', 'you', 'this', 'the', 'and', 'or', 'john', 'doe', 'b.tech', 'm.tech', 'education', 'skills', 'requirements', 'position', 'scientist', 'preferred'])):
            # Check if it looks like a technical skill
            if any(keyword in chunk_text for keyword in [
                'programming', 'language', 'framework', 'tool', 'database',
                'cloud', 'platform', 'system', 'software', 'development',
                'analysis', 'learning', 'data', 'web', 'mobile', 'api',
                'machine', 'deep', 'neural', 'algorithm', 'model'
            ]) or chunk.root.pos_ in ['NOUN', 'PROPN']:
                # Additional filter: must contain at least one tech-related word
                tech_indicators = ['python', 'java', 'sql', 'data', 'machine', 'learning', 'web', 'api', 'cloud', 'database', 'framework', 'tool']
                if any(indicator in chunk_text for indicator in tech_indicators):
                    skills.add(chunk_text)

    return list(skills)

def extract_soft_skills(text):
    """Extract soft skills using keyword matching"""
    text_lower = text.lower()
    matched = []

    for skill in SOFT_SKILLS:
        if skill in text_lower:
            matched.append(skill)

    return matched

def extract_projects(text):
    """Count the number of projects mentioned in the resume"""
    import re

    # Look for project section headers
    project_section_pattern = r'(?:projects?|project experience)(?:\s*:|\s*\n)'
    section_match = re.search(project_section_pattern, text, re.IGNORECASE)

    if section_match:
        # If there's a projects section, count bullet points or numbered items after it
        start_pos = section_match.end()
        section_text = text[start_pos:]

        # Count bullet points (-, *, •) or numbered items (1., 2., etc.)
        bullet_pattern = r'(?:^|\n)\s*[-*•]\s+'
        numbered_pattern = r'(?:^|\n)\s*\d+\.\s+'

        bullets = len(re.findall(bullet_pattern, section_text, re.MULTILINE))
        numbers = len(re.findall(numbered_pattern, section_text, re.MULTILINE))

        return max(bullets, numbers)

    # If no section, look for project mentions in context
    # Count distinct project descriptions (more selective)
    sentences = re.split(r'[.!?]+', text)
    project_sentences = 0
    project_keywords = ['developed', 'built', 'created', 'designed', 'implemented', 'deployed']
    project_indicators = ['application', 'system', 'platform', 'tool', 'website', 'app', 'api', 'service', 'framework']

    seen_projects = set()  # Avoid counting the same project multiple times

    for sentence in sentences:
        sentence_lower = sentence.lower().strip()
        if len(sentence_lower) < 10:  # Skip very short sentences
            continue

        # Must contain both an action word AND a project indicator
        has_action = any(keyword in sentence_lower for keyword in project_keywords)
        has_indicator = any(indicator in sentence_lower for indicator in project_indicators)

        if has_action and has_indicator:
            # Create a simple hash of the sentence to avoid duplicates
            sentence_hash = hash(sentence_lower[:50])  # First 50 chars
            if sentence_hash not in seen_projects:
                seen_projects.add(sentence_hash)
                project_sentences += 1

    return min(project_sentences, 5)  # Cap at 5 to be reasonable

# -------------------- JD PARSER --------------------
def parse_jd_to_json(jd_text):
    text_lower = jd_text.lower()
    
    return {
        "education_criteria": extract_education(text_lower),
        "min_experience": extract_experience(text_lower),
        "required_tech_skills": extract_tech_skills(text_lower),
        "required_soft_skills": extract_soft_skills(jd_text),
        "project_requirement": extract_projects(text_lower),
        "raw_text": jd_text
    }

# -------------------- EVALUATION --------------------
def evaluate_resume_against_jd(resume_json, jd_json):
    results = {}

    # EDUCATION
    jd_degrees = set(jd_json.get("education_criteria", []))
    resume_degrees = set(resume_json.get("education", []))
    results["education"] = {
        "pass": True if not jd_degrees else bool(resume_degrees & jd_degrees),
        "required": list(jd_degrees),
        "found": list(resume_degrees)
    }

    # EXPERIENCE
    jd_exp = jd_json.get("min_experience", 0)
    resume_exp = resume_json.get("experience_years", 0)
    results["experience"] = {
        "pass": True if resume_exp >= jd_exp else False,
        "required": jd_exp,
        "found": resume_exp
    }

    # TECH SKILLS
    jd_tech = set(jd_json.get("required_tech_skills", []))
    resume_tech = set(resume_json.get("tech_skills", []))
    matched_tech = resume_tech & jd_tech
    missing_tech = jd_tech - resume_tech
    results["tech_skills"] = {
        "matched": sorted(matched_tech),
        "missing": sorted(missing_tech),
        "pass": len(matched_tech) / max(len(jd_tech),1) >= 0.5  # 50% threshold
    }

    # SOFT SKILLS
    jd_soft = set(jd_json.get("required_soft_skills", []))
    resume_soft = set(resume_json.get("soft_skills", []))
    matched_soft = resume_soft & jd_soft
    missing_soft = jd_soft - resume_soft
    results["soft_skills"] = {
        "matched": sorted(matched_soft),
        "missing": sorted(missing_soft),
        "pass": len(matched_soft) / max(len(jd_soft),1) >= 0.5
    }

    # PROJECTS
    jd_project = jd_json.get("project_requirement", False)
    resume_project = resume_json.get("projects", False)
    results["projects"] = {
        "pass": True if not jd_project else resume_project,
        "required": jd_project,
        "found": resume_project
    }

    # FINAL SCORE
    score = 0
    score += 20 if results["education"]["pass"] else 0
    score += 20 if results["experience"]["pass"] else 0
    score += 30 if results["tech_skills"]["pass"] else 0
    score += 20 if results["soft_skills"]["pass"] else 0
    score += 10 if results["projects"]["pass"] else 0

    final_score = min(score, 100)
    results["final_score"] = final_score
    results["eligibility"] = "PASS" if final_score >= 60 else "FAIL"

    return results
