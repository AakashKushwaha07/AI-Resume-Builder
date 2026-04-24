import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Simple TF-IDF based semantic matching (fallback when sentence-transformers fails)
vectorizer = TfidfVectorizer(stop_words=None, max_features=1000, ngram_range=(1, 2))


def semantic_match(resume_skills, jd_skills, threshold=0.3):
    """
    Match skills using TF-IDF and cosine similarity
    Returns: (matched_skills_set, average_similarity_score)
    """
    if not resume_skills or not jd_skills:
        return set(), 0.0

    # Convert sets to lists for processing
    resume_list = list(resume_skills)
    jd_list = list(jd_skills)

    # Create corpus for TF-IDF
    all_skills = resume_list + jd_list

    try:
        # Fit and transform
        tfidf_matrix = vectorizer.fit_transform(all_skills)

        # Split the matrix
        resume_vectors = tfidf_matrix[:len(resume_list)]
        jd_vectors = tfidf_matrix[len(resume_list):]

        matched = set()
        scores = []

        for i, jd_skill in enumerate(jd_list):
            # Calculate similarity between this JD skill and all resume skills
            similarities = cosine_similarity(jd_vectors[i:i+1], resume_vectors)[0]
            max_score = float(similarities.max())

            scores.append(max_score)

            if max_score >= threshold:
                matched.add(jd_skill)

        avg_score = sum(scores) / len(scores) if scores else 0
        return matched, avg_score

    except Exception as e:
        # Fallback to simple string matching if TF-IDF fails
        print(f"TF-IDF failed, using fallback: {e}")
        matched = set()
        scores = []

        for jd_skill in jd_skills:
            max_score = 0.0
            for resume_skill in resume_skills:
                # Simple similarity based on common words
                jd_words = set(jd_skill.lower().split())
                resume_words = set(resume_skill.lower().split())
                if jd_words & resume_words:  # Any common words
                    overlap = len(jd_words & resume_words)
                    total = len(jd_words | resume_words)
                    score = overlap / total if total > 0 else 0
                    max_score = max(max_score, score)

            scores.append(max_score)
            if max_score >= threshold:
                matched.add(jd_skill)

        avg_score = sum(scores) / len(scores) if scores else 0
        return matched, avg_score


def semantic_text_similarity(text1, text2):
    """
    Calculate semantic similarity between two text strings
    """
    if not text1 or not text2:
        return 0.0

    try:
        # Use TF-IDF for text similarity
        vectors = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        return float(similarity)
    except Exception as e:
        # Fallback: simple word overlap
        print(f"Text similarity failed, using fallback: {e}")
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        if not words1 or not words2:
            return 0.0
        overlap = len(words1 & words2)
        total = len(words1 | words2)
        return overlap / total if total > 0 else 0.0