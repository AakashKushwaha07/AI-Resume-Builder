import re
from typing import Any, Dict, List, Set, Tuple
from models.semantic_matcher import semantic_match
from models.semantic_matcher import semantic_text_similarity as compute_semantic_similarity


# -----------------------------
# Helpers
# -----------------------------
def normalize(text: str) -> str:
    if not text:
        return ""
    text = text.replace("-", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


def to_list(value: Any) -> List:
    """Coerce value into list."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def extract_years_from_text(text: str) -> float:
    """
    Extracts years of experience from free text like:
    '3+ years', '2 years', '1.5 years', '4 yrs'
    Returns 0 if nothing found.
    """
    if not text:
        return 0.0
    t = normalize(str(text))
    # matches 1, 1.5, 2+, 3.0 etc.
    m = re.search(r"(\d+(?:\.\d+)?)\s*\+?\s*(?:year|years|yr|yrs)\b", t)
    return float(m.group(1)) if m else 0.0


def extract_degrees(resume_json: Dict[str, Any]) -> Set[str]:
    """
    Supports common resume structures:
    - education: ["B.Tech", "MCA"]
    - education: [{"degree": "B.Tech", ...}, ...]
    - education: {"degree": "..."} (rare)
    """
    edu = resume_json.get("education", [])
    degrees: Set[str] = set()

    for item in to_list(edu):
        if isinstance(item, str):
            degrees.add(normalize(item))
        elif isinstance(item, dict):
            # common keys
            for k in ["degree", "qualification", "level", "title"]:
                if item.get(k):
                    degrees.add(normalize(str(item.get(k))))
        else:
            degrees.add(normalize(str(item)))

    return {d for d in degrees if d}


def extract_skills_from_resume(resume_json: Dict[str, Any]) -> Set[str]:
    """
    Supports:
    - skills: ["Java", "Spring Boot"]
    - skills: [{"name":"Java"}, ...]
    - technical_skills / soft_skills (optional)
    """
    skills: Set[str] = set()

    # main bucket
    raw = resume_json.get("skills", [])
    for item in to_list(raw):
        if isinstance(item, str):
            skills.add(normalize(item))
        elif isinstance(item, dict):
            # try typical keys
            if item.get("name"):
                skills.add(normalize(str(item["name"])))
            elif item.get("skill"):
                skills.add(normalize(str(item["skill"])))
            else:
                skills.add(normalize(str(item)))
        else:
            skills.add(normalize(str(item)))

    # optional buckets
    for key in ["technical_skills", "tech_skills", "soft_skills", "tools", "technologies"]:
        for item in to_list(resume_json.get(key, [])):
            if isinstance(item, str):
                skills.add(normalize(item))
            elif isinstance(item, dict):
                if item.get("name"):
                    skills.add(normalize(str(item["name"])))
                else:
                    skills.add(normalize(str(item)))
            else:
                skills.add(normalize(str(item)))

    return {s for s in skills if s}


def extract_skills_from_jd(jd_json: Dict[str, Any]) -> Tuple[Set[str], Set[str], Set[str]]:
    """
    Supports:
    - mandatory_skills: [...]
    - preferred_skills: [...]
    - soft_skills: [...]
    Also handles dict entries.
    """
    def read_bucket(key: str) -> Set[str]:
        out: Set[str] = set()
        for item in to_list(jd_json.get(key, [])):
            if isinstance(item, str):
                out.add(normalize(item))
            elif isinstance(item, dict):
                if item.get("name"):
                    out.add(normalize(str(item["name"])))
                elif item.get("skill"):
                    out.add(normalize(str(item["skill"])))
                else:
                    out.add(normalize(str(item)))
            else:
                out.add(normalize(str(item)))
        return {x for x in out if x}

    mandatory = read_bucket("mandatory_skills") or read_bucket("must_have_skills")
    preferred = read_bucket("preferred_skills") or read_bucket("nice_to_have_skills")
    soft = read_bucket("soft_skills")

    return mandatory, preferred, soft


def extract_min_experience(jd_json: Dict[str, Any]) -> float:
    """
    Supports:
    - min_experience: 2
    - min_experience: "2 years"
    - experience: "3+ years"
    """
    if "min_experience" in jd_json:
        v = jd_json.get("min_experience")
        if isinstance(v, (int, float)):
            return float(v)
        return extract_years_from_text(str(v))

    # fallback keys
    for key in ["experience", "experience_required", "required_experience"]:
        if jd_json.get(key):
            return extract_years_from_text(str(jd_json.get(key)))

    return 0.0


def extract_experience_years(resume_json: Dict[str, Any]) -> float:
    """
    Supports:
    - experience_years: 2
    - experience_years: "2 years"
    - experience: [{"duration":"2 years"}, ...]
    - summary: "3+ years experience" (fallback)
    """
    if "experience_years" in resume_json:
        v = resume_json.get("experience_years")
        if isinstance(v, (int, float)):
            return float(v)
        return extract_years_from_text(str(v))

    # If experience is a list of roles, try to extract from fields (best-effort)
    exp = resume_json.get("experience", [])
    years = 0.0
    for item in to_list(exp):
        if isinstance(item, dict):
            for k in ["duration", "tenure", "years", "experience"]:
                if item.get(k):
                    years = max(years, extract_years_from_text(str(item.get(k))))
        elif isinstance(item, str):
            years = max(years, extract_years_from_text(item))

    if years > 0:
        return years

    # fallback to summary
    return extract_years_from_text(str(resume_json.get("summary", "")))


def count_projects(resume_json: Dict[str, Any]) -> int:
    """
    Supports:
    - projects: [{"title":...}, ...]
    - projects: 3
    - project_count: 2
    """
    if isinstance(resume_json.get("projects"), int):
        return int(resume_json["projects"])
    if isinstance(resume_json.get("project_count"), int):
        return int(resume_json["project_count"])

    p = resume_json.get("projects", [])
    if isinstance(p, list):
        return len(p)
    if p:
        return 1
    return 0


def fuzzy_match_skills(resume_skills: Set[str], jd_skills: Set[str]) -> Set[str]:
    """
    Safer than `j in r or r in j` by using token overlap.
    Keeps substring check but reduces false positives.
    """
    matched = set()

    # pre-tokenize resume skills
    resume_tokens = {r: set(r.split()) for r in resume_skills}

    for j in jd_skills:
        jt = set(j.split())
        for r in resume_skills:
            # exact match
            if j == r:
                matched.add(j)
                continue

            # substring match (useful for "spring" vs "spring boot")
            # Only allow substring matching for words >= 4 characters to avoid matching single letters
            if len(j) >= 4 and (j in r or r in j):
                matched.add(j)
                continue

            # token overlap (avoid matching "c" in "react")
            rt = resume_tokens.get(r, set())
            if jt and (len(jt & rt) / len(jt)) >= 0.6:
                matched.add(j)

    return matched


# -----------------------------
# Main evaluator (frontend-friendly)
# -----------------------------
def evaluate_resume_against_jd(resume_json: Dict[str, Any], jd_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Returns a payload that can be sent directly to frontend:
    {
      eligibility: "PASS"/"FAIL",
      final_score: 0-100,
      summary: {...},
      details: {...}
    }
    """

    # ---- Extract real fields ----
    resume_degrees = extract_degrees(resume_json)
    jd_degrees = {normalize(x) for x in to_list(jd_json.get("education_criteria", [])) if str(x).strip()}

    resume_exp = extract_experience_years(resume_json)
    jd_min_exp = extract_min_experience(jd_json)

    resume_skills = extract_skills_from_resume(resume_json)
    jd_mandatory, jd_preferred, jd_soft = extract_skills_from_jd(jd_json)

    resume_projects = count_projects(resume_json)
    project_required = bool(jd_json.get("project_requirement", False))

    # ---- Education ----
    education_pass = bool(resume_degrees & jd_degrees) if jd_degrees else True  # if JD doesn't specify, don't fail
    education = {
        "pass": education_pass,
        "required": sorted(jd_degrees),
        "found": sorted(resume_degrees),
        "matched": sorted(resume_degrees & jd_degrees),
    }

    # ---- Experience ----
    experience_pass = resume_exp >= jd_min_exp if jd_min_exp > 0 else True
    experience = {
        "pass": experience_pass,
        "required_years": jd_min_exp,
        "found_years": resume_exp,
        "gap_years": round(max(0.0, jd_min_exp - resume_exp), 2),
    }

    # ---- Mandatory Skills ----
    fuzzy_matches = fuzzy_match_skills(resume_skills, jd_mandatory)
    semantic_matches, semantic_score = semantic_match(resume_skills, jd_mandatory)
    semantic_text_score = compute_semantic_similarity(
    " ".join(resume_skills),
    " ".join(jd_mandatory)
    )

    matched_mandatory = fuzzy_matches.union(semantic_matches)
    missing_mandatory = jd_mandatory - matched_mandatory

    mandatory_ratio = 0.0 if not jd_mandatory else (len(matched_mandatory) / len(jd_mandatory))
    mandatory_pass = mandatory_ratio >= 0.6 if jd_mandatory else False

    # ---- Preferred Skills (bonus) ----
    matched_preferred = fuzzy_match_skills(resume_skills, jd_preferred)
    missing_preferred = jd_preferred - matched_preferred
    preferred_ratio = (len(matched_preferred) / len(jd_preferred)) if jd_preferred else 0.0

    # ---- Soft Skills (bonus) ----
    matched_soft = fuzzy_match_skills(resume_skills, jd_soft)
    missing_soft = jd_soft - matched_soft
    soft_ratio = (len(matched_soft) / len(jd_soft)) if jd_soft else 0.0

    skills = {
        "mandatory": {
            "pass": mandatory_pass,
            "matched": sorted(matched_mandatory),
            "missing": sorted(missing_mandatory),
            "match_ratio": round(mandatory_ratio * 100, 2),
        },
        "preferred": {
            "matched": sorted(matched_preferred),
            "missing": sorted(missing_preferred),
            "match_ratio": round(preferred_ratio * 100, 2),
        },
        "soft": {
            "matched": sorted(matched_soft),
            "missing": sorted(missing_soft),
            "match_ratio": round(soft_ratio * 100, 2),
        },
        # helpful for UI chips/autocomplete
        "resume_all_skills": sorted(resume_skills),
    }

    # ---- Projects ----
    projects_pass = (resume_projects > 0) if project_required else True
    projects = {
        "pass": projects_pass,
        "required": project_required,
        "found_count": resume_projects,
    }

    # ---- Eligibility ----
    eligibility_bool = education_pass and experience_pass and mandatory_pass and projects_pass

    # ---- Scoring (0-100) ----
    # weights tuned for real use:
    score = 0.0
    score += 10.0 if education_pass else 0.0
    score += 10.0 * semantic_score
    score += 10.0 * semantic_text_score
    score += 20.0 if experience_pass else max(0.0, 20.0 - (experience["gap_years"] * 5.0))  # small penalty per gap year
    score += 30.0 * mandatory_ratio
    score += 10.0 if projects_pass else 0.0

    bonus = 0.0
    bonus += 5.0 * preferred_ratio
    bonus += 5.0 * soft_ratio
    score += bonus

    score = max(0.0, min(score, 100.0))

    # ---- Frontend-friendly result ----
    return {
        "eligibility": "PASS" if eligibility_bool else "FAIL",
        "final_score": round(score, 2),
        "summary": {
            "matched_mandatory_count": len(matched_mandatory),
            "total_mandatory_count": len(jd_mandatory),
            "missing_mandatory_count": len(missing_mandatory),
            "experience_required_years": jd_min_exp,
            "experience_found_years": resume_exp,
            "projects_found_count": resume_projects,
        },
        "details": {
            "education": education,
            "experience": experience,
            "skills": skills,
            "projects": projects,
        },
    }
