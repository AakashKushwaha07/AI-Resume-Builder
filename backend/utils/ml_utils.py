# backend/utils/ml_utils.py

import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer

# Define model and vectorizer paths
MODEL_PATH = 'backend/models/career_model.pkl'
VECTORIZER_PATH = 'backend/models/vectorizer.pkl'

# Load model and vectorizer
if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
    with open(MODEL_PATH, 'rb') as model_file:
        model = pickle.load(model_file)
    with open(VECTORIZER_PATH, 'rb') as vec_file:
        vectorizer = pickle.load(vec_file)
else:
    raise FileNotFoundError("Model or vectorizer file not found!")

def predict_career_path_from_text(resume_text):
    
    #Transform resume text and predict career path using loaded model.
    
    vectorized = vectorizer.transform([resume_text])
    prediction = model.predict(vectorized)
    return prediction[0]
