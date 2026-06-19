import csv
import io
import json
import math
import re
from datetime import date, datetime
from heapq import heappop, heappush


DEFAULT_JOB_DESCRIPTION = """
Senior AI Engineer, Founding Team at Redrob AI. Needs 5-9 years of experience,
production embeddings-based retrieval, vector databases or hybrid search,
strong Python, ranking evaluation frameworks such as NDCG, MRR, MAP and A/B
testing, and a product-engineering mindset. Nice to have: LLM fine-tuning,
learning-to-rank, HR-tech or marketplace exposure, distributed systems,
large-scale inference, and open-source AI/ML signal. Prefer Pune or Noida,
India hybrid, relocation from tier-1 Indian cities, short notice period, and
recent platform engagement.
"""


CORE_TERMS = {
    "embeddings": 9,
    "embedding": 9,
    "semantic search": 9,
    "retrieval": 9,
    "rag": 7,
    "ranking": 9,
    "ranker": 8,
    "recommendation": 7,
    "recommender": 7,
    "search": 6,
    "nlp": 6,
    "information retrieval": 9,
    "llm": 5,
    "fine-tuning": 5,
    "finetuning": 5,
    "machine learning": 6,
    "ml": 4,
    "python": 7,
    "sentence-transformers": 8,
    "openai embeddings": 6,
    "bge": 6,
    "e5": 5,
    "vector": 6,
    "vector database": 9,
    "hybrid search": 9,
    "faiss": 8,
    "pinecone": 8,
    "weaviate": 8,
    "qdrant": 8,
    "milvus": 8,
    "opensearch": 7,
    "elasticsearch": 7,
    "ndcg": 9,
    "mrr": 8,
    "map": 5,
    "a/b testing": 7,
    "ab testing": 7,
    "evaluation": 5,
    "xgboost": 5,
    "learning-to-rank": 7,
    "lora": 5,
    "qlora": 5,
    "peft": 5,
    "distributed systems": 4,
    "inference": 4,
}

TITLE_TERMS = {
    "ai engineer",
    "machine learning engineer",
    "ml engineer",
    "applied scientist",
    "data scientist",
    "search engineer",
    "ranking engineer",
    "nlp engineer",
    "backend engineer",
    "data engineer",
}

NEGATIVE_TITLE_TERMS = {
    "hr manager",
    "marketing manager",
    "sales executive",
    "graphic designer",
    "content writer",
    "accountant",
    "civil engineer",
    "mechanical engineer",
}

CONSULTING_COMPANIES = {
    "tcs",
    "infosys",
    "wipro",
    "accenture",
    "cognizant",
    "capgemini",
    "mindtree",
    "ltimindtree",
    "hcl",
    "tech mahindra",
}

INDIA_TIER1_CITIES = {
    "pune",
    "noida",
    "delhi",
    "gurgaon",
    "gurugram",
    "mumbai",
    "hyderabad",
    "bangalore",
    "bengaluru",
    "chennai",
}

TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9.+#/-]*")


def rank_candidates_from_file(file_obj, job_description="", top_n=100):
    top_n = max(1, min(int(top_n or 100), 100))
    rankings = []

    for candidate in iter_candidates(file_obj):
        score, details = score_candidate(candidate, job_description or DEFAULT_JOB_DESCRIPTION)
        item = {
            "candidate_id": candidate.get("candidate_id", ""),
            "score": round(score, 4),
            "reasoning": build_reason(candidate, details),
            "details": details,
        }
        heap_key = (item["score"], reverse_id(item["candidate_id"]))
        if len(rankings) < top_n:
            heappush(rankings, (heap_key, item))
        elif heap_key > rankings[0][0]:
            heappop(rankings)
            heappush(rankings, (heap_key, item))

    ordered = [item for _, item in sorted(rankings, key=lambda row: (-row[1]["score"], row[1]["candidate_id"]))]
    for idx, item in enumerate(ordered, start=1):
        item["rank"] = idx
    return ordered


def rank_resumes(resume_items, job_description="", top_n=100):
    top_n = max(1, min(int(top_n or 100), 100))
    rankings = []

    for index, resume in enumerate(resume_items, start=1):
        resume_id = resume.get("resume_id") or f"RESUME_{index:04d}"
        filename = resume.get("filename") or resume_id
        text = resume.get("text") or ""
        score, details = score_resume_text(text, job_description or DEFAULT_JOB_DESCRIPTION)
        item = {
            "candidate_id": resume_id,
            "filename": filename,
            "score": round(score, 4),
            "reasoning": build_resume_reason(filename, text, details),
            "details": details,
        }
        heap_key = (item["score"], reverse_id(item["candidate_id"]))
        if len(rankings) < top_n:
            heappush(rankings, (heap_key, item))
        elif heap_key > rankings[0][0]:
            heappop(rankings)
            heappush(rankings, (heap_key, item))

    ordered = [item for _, item in sorted(rankings, key=lambda row: (-row[1]["score"], row[1]["candidate_id"]))]
    for idx, item in enumerate(ordered, start=1):
        item["rank"] = idx
    return ordered


def score_resume_text(resume_text, job_description):
    full_text = normalized_text(resume_text)
    header_text = normalized_text(" ".join(str(resume_text or "").splitlines()[:18]))
    jd_terms = extract_jd_terms(job_description)
    matched_core = sorted(
        [term for term in CORE_TERMS if term in full_text],
        key=lambda term: CORE_TERMS[term],
        reverse=True,
    )[:8]

    core_matches = weighted_matches(full_text, CORE_TERMS)
    jd_overlap = token_overlap_score(full_text, jd_terms)
    title_score = title_match_score(header_text)
    production_score = production_evidence_score(full_text, [{"duration_months": 0}])
    evaluation_score = phrase_score(full_text, ["ndcg", "mrr", "map", "a/b testing", "ab testing", "offline benchmark", "online experiment"])
    experience_years = extract_years_from_text(full_text)
    experience_score = experience_fit(experience_years)
    skill_density = clamp(len(matched_core) / 8, 0, 1)
    negative_title_penalty = 0.10 if any(term in header_text for term in NEGATIVE_TITLE_TERMS) else 0

    score = (
        0.30 * core_matches
        + 0.22 * production_score
        + 0.14 * title_score
        + 0.12 * jd_overlap
        + 0.10 * evaluation_score
        + 0.07 * experience_score
        + 0.05 * skill_density
        - negative_title_penalty
    )

    return clamp(score, 0, 1), {
        "core_match_score": round(core_matches, 3),
        "production_score": round(production_score, 3),
        "title_score": round(title_score, 3),
        "evaluation_score": round(evaluation_score, 3),
        "experience_score": round(experience_score, 3),
        "jd_overlap_score": round(jd_overlap, 3),
        "penalty": round(negative_title_penalty, 3),
        "matched_core_terms": matched_core,
        "experience_years": experience_years,
        "word_count": len(full_text.split()),
    }


def iter_candidates(file_obj):
    stream = getattr(file_obj, "stream", file_obj)
    first = stream.read(1)
    while first in (b" ", b"\n", b"\r", b"\t", " ", "\n", "\r", "\t"):
        first = stream.read(1)

    if not first:
        return

    first_text = first.decode("utf-8-sig") if isinstance(first, bytes) else first
    if first_text == "[":
        rest = stream.read()
        if isinstance(rest, bytes):
            rest = rest.decode("utf-8-sig")
        for item in json.loads(first_text + rest):
            if isinstance(item, dict):
                yield item
        return

    first_line = first + stream.readline() if isinstance(first, bytes) else first + stream.readline()
    for line in chain_first_line(first_line, stream):
        if isinstance(line, bytes):
            line = line.decode("utf-8-sig")
        line = line.strip()
        if line:
            item = json.loads(line)
            if isinstance(item, dict):
                yield item


def chain_first_line(first_line, stream):
    yield first_line
    for line in stream:
        yield line


def score_candidate(candidate, job_description):
    profile = candidate.get("profile") or {}
    signals = candidate.get("redrob_signals") or {}
    career = candidate.get("career_history") or []
    skills = candidate.get("skills") or []

    full_text = normalized_text(candidate_text(candidate))
    title = normalized_text(" ".join([
        str(profile.get("current_title") or ""),
        str(profile.get("headline") or ""),
    ]))
    skill_names = [str(skill.get("name") or "") for skill in skills]
    skill_text = normalized_text(" ".join(skill_names))

    jd_terms = extract_jd_terms(job_description)
    core_matches = weighted_matches(full_text, CORE_TERMS)
    jd_overlap = token_overlap_score(full_text, jd_terms)
    title_score = title_match_score(title)
    skill_depth = skill_depth_score(skills)
    production_score = production_evidence_score(full_text, career)
    evaluation_score = phrase_score(full_text, ["ndcg", "mrr", "map", "a/b testing", "ab testing", "offline benchmark", "online experiment"])
    experience_score = experience_fit(float(profile.get("years_of_experience") or 0))
    behavior_score = behavioral_score(signals)
    location_score = location_fit(profile, signals)
    company_score = company_fit(career)
    honeypot_penalty = honeypot_penalty_score(candidate)
    negative_title_penalty = 0.12 if any(term in title for term in NEGATIVE_TITLE_TERMS) else 0

    required_signal = (
        0.34 * core_matches
        + 0.18 * production_score
        + 0.14 * title_score
        + 0.10 * skill_depth
        + 0.08 * evaluation_score
        + 0.06 * jd_overlap
        + 0.05 * experience_score
        + 0.05 * company_score
    )
    total = (
        0.78 * required_signal
        + 0.14 * behavior_score
        + 0.08 * location_score
        - honeypot_penalty
        - negative_title_penalty
    )
    total = clamp(total, 0, 1)

    matched_core = sorted(
        [term for term in CORE_TERMS if term in full_text or term in skill_text],
        key=lambda term: CORE_TERMS[term],
        reverse=True,
    )[:8]

    return total, {
        "core_match_score": round(core_matches, 3),
        "production_score": round(production_score, 3),
        "title_score": round(title_score, 3),
        "skill_depth_score": round(skill_depth, 3),
        "evaluation_score": round(evaluation_score, 3),
        "experience_score": round(experience_score, 3),
        "behavior_score": round(behavior_score, 3),
        "location_score": round(location_score, 3),
        "company_score": round(company_score, 3),
        "penalty": round(honeypot_penalty + negative_title_penalty, 3),
        "matched_core_terms": matched_core,
        "skill_count": len(skills),
        "open_to_work": bool(signals.get("open_to_work_flag")),
        "response_rate": signals.get("recruiter_response_rate"),
        "notice_period_days": signals.get("notice_period_days"),
    }


def candidate_text(candidate):
    profile = candidate.get("profile") or {}
    chunks = [
        profile.get("headline"),
        profile.get("summary"),
        profile.get("current_title"),
        profile.get("current_industry"),
    ]
    for job in candidate.get("career_history") or []:
        chunks.extend([job.get("title"), job.get("industry"), job.get("description")])
    for edu in candidate.get("education") or []:
        chunks.extend([edu.get("degree"), edu.get("field_of_study"), edu.get("institution")])
    for skill in candidate.get("skills") or []:
        chunks.append(skill.get("name"))
    for cert in candidate.get("certifications") or []:
        chunks.extend([cert.get("name"), cert.get("issuer")])
    return " ".join(str(chunk or "") for chunk in chunks)


def normalized_text(value):
    return " ".join(TOKEN_RE.findall(str(value).lower()))


def extract_jd_terms(job_description):
    tokens = set(TOKEN_RE.findall(str(job_description or DEFAULT_JOB_DESCRIPTION).lower()))
    return {token for token in tokens if len(token) > 2}


def weighted_matches(text, terms):
    total = sum(terms.values())
    found = sum(weight for term, weight in terms.items() if term in text)
    return clamp(found / total * 2.1, 0, 1)


def token_overlap_score(text, jd_terms):
    tokens = set(TOKEN_RE.findall(text))
    if not jd_terms:
        return 0
    return clamp(len(tokens & jd_terms) / max(20, len(jd_terms)) * 2.5, 0, 1)


def title_match_score(title):
    if any(term in title for term in TITLE_TERMS):
        if any(term in title for term in ["ai engineer", "machine learning engineer", "ml engineer", "ranking engineer", "search engineer"]):
            return 1
        return 0.72
    if "engineer" in title and any(term in title for term in ["backend", "data", "software"]):
        return 0.55
    return 0.15 if "engineer" in title else 0


def skill_depth_score(skills):
    if not skills:
        return 0
    proficiency_weight = {"beginner": 0.2, "intermediate": 0.45, "advanced": 0.75, "expert": 1.0}
    weighted = 0
    relevant = 0
    for skill in skills:
        name = normalized_text(skill.get("name") or "")
        if any(term in name for term in CORE_TERMS):
            relevant += 1
            duration = min(float(skill.get("duration_months") or 0) / 48, 1)
            endorsements = min(float(skill.get("endorsements") or 0) / 40, 1)
            prof = proficiency_weight.get(str(skill.get("proficiency") or "").lower(), 0.35)
            weighted += 0.55 * prof + 0.30 * duration + 0.15 * endorsements
    return clamp((weighted / 7) + min(relevant, 8) * 0.035, 0, 1)


def production_evidence_score(text, career):
    production_terms = ["production", "deployed", "shipped", "built", "launched", "scale", "users", "latency", "pipeline", "retrieval", "ranking", "recommendation", "search"]
    score = phrase_score(text, production_terms)
    current_or_recent_months = sum(int(job.get("duration_months") or 0) for job in career[:3])
    return clamp(score * 0.75 + min(current_or_recent_months / 72, 1) * 0.25, 0, 1)


def phrase_score(text, phrases):
    hits = sum(1 for phrase in phrases if phrase in text)
    return clamp(hits / max(4, len(phrases) * 0.45), 0, 1)


def experience_fit(years):
    if 5 <= years <= 9:
        return 1
    if 4 <= years < 5 or 9 < years <= 11:
        return 0.72
    if 3 <= years < 4 or 11 < years <= 14:
        return 0.45
    return 0.18 if years else 0


def behavioral_score(signals):
    response = float(signals.get("recruiter_response_rate") or 0)
    response_time = float(signals.get("avg_response_time_hours") or 72)
    notice = float(signals.get("notice_period_days") or 180)
    github = float(signals.get("github_activity_score") if signals.get("github_activity_score") is not None else -1)
    completion = float(signals.get("profile_completeness_score") or 0) / 100
    interview = float(signals.get("interview_completion_rate") or 0)
    offer = float(signals.get("offer_acceptance_rate") if signals.get("offer_acceptance_rate") is not None else -1)
    saved = min(float(signals.get("saved_by_recruiters_30d") or 0) / 8, 1)
    active = recency_score(signals.get("last_active_date"))
    verification = sum(bool(signals.get(key)) for key in ["verified_email", "verified_phone", "linkedin_connected"]) / 3

    return clamp(
        0.20 * response
        + 0.12 * (1 - min(response_time / 72, 1))
        + 0.12 * (1 - min(notice / 90, 1))
        + 0.12 * active
        + 0.10 * completion
        + 0.10 * interview
        + 0.08 * (0 if offer < 0 else offer)
        + 0.07 * saved
        + 0.05 * (0 if github < 0 else github / 100)
        + 0.04 * verification
        + (0.08 if signals.get("open_to_work_flag") else 0),
        0,
        1,
    )


def recency_score(value):
    try:
        last_active = datetime.strptime(str(value), "%Y-%m-%d").date()
    except Exception:
        return 0
    days = max((date.today() - last_active).days, 0)
    return 1 - min(days / 180, 1)


def location_fit(profile, signals):
    location = normalized_text(" ".join([str(profile.get("location") or ""), str(profile.get("country") or "")]))
    city_score = 1 if any(city in location for city in ["pune", "noida"]) else 0.65 if any(city in location for city in INDIA_TIER1_CITIES) else 0
    india_score = 0.25 if "india" in location else 0
    relocation = 0.25 if signals.get("willing_to_relocate") else 0
    work_mode = 0.1 if signals.get("preferred_work_mode") in {"hybrid", "flexible", "onsite"} else 0
    return clamp(city_score + india_score + relocation + work_mode, 0, 1)


def company_fit(career):
    if not career:
        return 0
    companies = [normalized_text(job.get("company") or "") for job in career]
    industries = normalized_text(" ".join(str(job.get("industry") or "") for job in career))
    consulting_count = sum(any(name in company for name in CONSULTING_COMPANIES) for company in companies)
    product_signal = 1 if any(term in industries for term in ["software", "internet", "saas", "product", "technology", "ai"]) else 0.45
    consulting_penalty = 0.55 if consulting_count == len(companies) else 0.18 if consulting_count else 0
    return clamp(product_signal - consulting_penalty, 0, 1)


def honeypot_penalty_score(candidate):
    skills = candidate.get("skills") or []
    expert_zero = sum(
        1
        for skill in skills
        if str(skill.get("proficiency") or "").lower() == "expert" and int(skill.get("duration_months") or 0) <= 1
    )
    suspicious_skill_load = len(skills) >= 10 and expert_zero >= 4
    career_months = sum(int(job.get("duration_months") or 0) for job in candidate.get("career_history") or [])
    years = float((candidate.get("profile") or {}).get("years_of_experience") or 0)
    duration_mismatch = career_months and years and abs(career_months / 12 - years) > 5
    return (0.18 if suspicious_skill_load else 0) + (0.08 if duration_mismatch else 0)


def build_reason(candidate, details):
    profile = candidate.get("profile") or {}
    signals = candidate.get("redrob_signals") or {}
    title = profile.get("current_title") or "Candidate"
    years = profile.get("years_of_experience") or 0
    location = profile.get("location") or profile.get("country") or "unknown location"
    terms = details.get("matched_core_terms") or []
    response = signals.get("recruiter_response_rate")
    notice = signals.get("notice_period_days")
    concerns = []
    if details.get("penalty", 0) >= 0.12:
        concerns.append("profile consistency/title-fit concerns")
    if notice is not None and notice > 60:
        concerns.append(f"{notice} day notice")
    if response is not None and response < 0.2:
        concerns.append(f"low recruiter response rate {response:.2f}")

    term_text = ", ".join(terms[:4]) if terms else "limited explicit AI/retrieval keywords"
    reason = f"{title} with {years} yrs in {location}; strongest matches: {term_text}."
    if response is not None:
        reason += f" Response rate {response:.2f}"
        if notice is not None:
            reason += f", notice {notice} days"
        reason += "."
    if concerns:
        reason += " Concern: " + "; ".join(concerns[:2]) + "."
    return reason[:450]


def build_resume_reason(filename, resume_text, details):
    terms = details.get("matched_core_terms") or []
    years = details.get("experience_years") or 0
    word_count = details.get("word_count") or 0
    term_text = ", ".join(terms[:4]) if terms else "limited explicit JD keywords"
    reason = f"{filename}: strongest matches are {term_text}."
    if years:
        reason += f" Detected about {years:g} yrs of experience."
    reason += f" Evidence scores: production {details.get('production_score', 0):.2f}, JD overlap {details.get('jd_overlap_score', 0):.2f}."
    if word_count < 80:
        reason += " Concern: very little readable resume text was extracted."
    if details.get("penalty", 0) > 0:
        reason += " Concern: header/title appears weak for this JD."
    return reason[:450]


def extract_years_from_text(text):
    matches = re.findall(r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)", text)
    if not matches:
        return 0
    return max(float(match) for match in matches)


def rankings_to_csv(rankings):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["candidate_id", "rank", "score", "reasoning"])
    writer.writeheader()
    for row in rankings:
        writer.writerow({
            "candidate_id": row["candidate_id"],
            "rank": row["rank"],
            "score": f"{row['score']:.4f}",
            "reasoning": row["reasoning"],
        })
    return output.getvalue()


def resume_rankings_to_csv(rankings):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["filename", "rank", "score", "reasoning"])
    writer.writeheader()
    for row in rankings:
        writer.writerow({
            "filename": row.get("filename") or row["candidate_id"],
            "rank": row["rank"],
            "score": f"{row['score']:.4f}",
            "reasoning": row["reasoning"],
        })
    return output.getvalue()


def reverse_id(candidate_id):
    digits = re.sub(r"\D", "", candidate_id or "")
    return -int(digits or 0)


def clamp(value, low, high):
    if math.isnan(value):
        return low
    return max(low, min(high, value))
