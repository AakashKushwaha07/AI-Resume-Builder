from sentence_transformers import SentenceTransformer, util
import pickle

# Load pre-trained model for job matching
model = SentenceTransformer('all-MiniLM-L6-v2')

def match_job_description(resume_text, job_description):
    # Compute embeddings for resume and job description
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    job_desc_embedding = model.encode(job_description, convert_to_tensor=True)
    
    # Compute cosine similarity between the two embeddings
    cosine_similarity = util.pytorch_cos_sim(resume_embedding, job_desc_embedding)[0][0].item()

    return cosine_similarity
