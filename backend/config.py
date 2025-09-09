import os

# Paths to models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

CAREER_MODEL_PATH = os.path.join(MODEL_DIR, 'career_model.pkl')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'vectorizer.pkl')

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")

# Database Config (MySQL)
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',       # change if you use another user
    'password': '',       # set your MySQL password
    'database': 'resume_ai'
}
