from sentence_transformers import SentenceTransformer, util

# Load the Sentence-BERT model
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

def match_job(resume_text, job_description):
    # Convert texts into embeddings
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    job_embedding = model.encode(job_description, convert_to_tensor=True)

    # Compute cosine similarity
    similarity = util.pytorch_cos_sim(resume_embedding, job_embedding).item()
    
    # Return similarity as a percentage
    return {"similarity": round(similarity * 100, 2)}
