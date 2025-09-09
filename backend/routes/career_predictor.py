
import os
import pandas as pd
from sentence_transformers import SentenceTransformer, util

# Load Sentence-BERT model
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Load career paths CSV
csv_path = os.path.join("data", "career_path.csv")
career_df = pd.read_csv(csv_path)

def predict_career_path(resume_data):
    if not resume_data:
        return {
            "predicted_career": None,
            "score": 0,
            "method": None,
            "matched_skills": []
        }

    resume_text = resume_data.lower()

    best_career = None
    best_score = -100
    matched_skills = []
    method_used = "embedding"

    # ---- 1. Embedding-based similarity ----
    try:
        resume_embedding = model.encode(resume_text, convert_to_tensor=True)

        for _, row in career_df.iterrows():
            career = row["career_path"]
            required_skills = row["required_skills"].replace(";", " ")

            career_embedding = model.encode(required_skills, convert_to_tensor=True)
            similarity = util.pytorch_cos_sim(resume_embedding, career_embedding).item()

            if similarity > best_score:
                best_score = similarity
                best_career = career

        # If similarity too weak (< 0.63), fallback to keyword method
        if best_score < 0.63:
            method_used = "keyword-fallback"
            best_career, matched_skills, best_score = keyword_fallback(resume_text)
            # best_score already scaled to percentage in fallback
        else:
            best_score = round(best_score * 100, 2)  # scale to percentage
    except Exception as e:
        print(f"[ERROR] Embedding step failed: {e}")
        method_used = "keyword-fallback"
        best_career, matched_skills, best_score = keyword_fallback(resume_text)

    print(f"[RESULT] Predicted Career: {best_career}")
    print(f"[RESULT] Best Score: {best_score}% (Method: {method_used})")
    print(f"[RESULT] Matched Skills: {matched_skills}")
    print("="*50)

    return {
        "predicted_career": best_career,
        "score": best_score,
        "method": method_used,
        "matched_skills": matched_skills
    }

# ---- 2. Keyword Fallback Method ----
def keyword_fallback(resume_text):
    best_career = None
    best_match_count = -1
    matched_skills = []
    best_score = 0

    for _, row in career_df.iterrows():
        career = row["career_path"]
        skills = [s.strip().lower() for s in row["required_skills"].split(";")]

        matches = [s for s in skills if s in resume_text]
        match_count = len(matches)

        if match_count > best_match_count:
            best_match_count = match_count
            best_career = career
            matched_skills = matches
            if len(skills) > 0:
                best_score = round((match_count / len(skills)) * 100, 2)  # percentage

    return best_career, matched_skills, best_score

