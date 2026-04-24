
import os
import re
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from utils.resume_json_parser import parse_resume_to_json

# Load Sentence-BERT model
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Load career paths CSV
csv_path = os.path.join("data", "career_path.csv")
career_df = pd.read_csv(csv_path)


def _normalize_text(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", " ", text.lower())


def _extract_resume_text(resume_data):
    if isinstance(resume_data, dict):
        return str(resume_data.get("raw_text", ""))
    if isinstance(resume_data, str):
        return resume_data
    return str(resume_data)


def _extract_resume_skills(resume_text: str):
    resume_json = parse_resume_to_json(resume_text)
    tech_skills = [s.lower() for s in resume_json.get("tech_skills", [])]
    soft_skills = [s.lower() for s in resume_json.get("soft_skills", [])]
    return set(tech_skills + soft_skills)


def predict_career_path(resume_data):
    if not resume_data:
        return {
            "predicted_career": None,
            "score": 0,
            "method": None,
            "matched_skills": [],
            "top_roles": []
        }

    raw_text = _extract_resume_text(resume_data)
    resume_text = _normalize_text(raw_text)
    resume_skills = _extract_resume_skills(raw_text)

    best_role = None
    best_score = -1
    method_used = "combo"
    role_candidates = []

    try:
        resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    except Exception as e:
        print(f"[ERROR] Embedding generation failed: {e}")
        resume_embedding = None

    for _, row in career_df.iterrows():
        career = row["career_path"]
        required_skills = [s.strip().lower() for s in str(row["required_skills"]).split(";") if s.strip()]
        skill_text = " ".join(required_skills)

        matched_skills = [s for s in required_skills if s in resume_text or s in resume_skills]
        keyword_score = (len(matched_skills) / len(required_skills) * 100) if required_skills else 0

        embedding_score = 0.0
        if resume_embedding is not None and skill_text:
            try:
                career_embedding = model.encode(skill_text, convert_to_tensor=True)
                embedding_score = util.pytorch_cos_sim(resume_embedding, career_embedding).item() * 100
            except Exception as e:
                print(f"[WARNING] Embedding similarity failed for {career}: {e}")
                embedding_score = 0.0

        final_score = round((embedding_score * 0.6) + (keyword_score * 0.4), 2)
        if embedding_score == 0.0:
            method = "keyword-only"
            final_score = round(keyword_score, 2)
        else:
            method = "combo"

        role_candidates.append({
            "career_path": career,
            "final_score": final_score,
            "embedding_score": round(embedding_score, 2),
            "keyword_score": round(keyword_score, 2),
            "matched_skills": matched_skills,
            "required_skills": required_skills,
            "method": method,
        })

        if final_score > best_score:
            best_score = final_score
            best_role = career
            method_used = method

    role_candidates.sort(key=lambda x: x["final_score"], reverse=True)
    top_roles = role_candidates[:5]
    matched_skills = top_roles[0]["matched_skills"] if top_roles else []

    return {
        "predicted_career": best_role,
        "score": round(best_score, 2),
        "method": method_used,
        "matched_skills": matched_skills,
        "top_roles": top_roles,
        "resume_skills": sorted(resume_skills)
    }

