import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Load your data (this example assumes you have resumes and their corresponding career labels)
data = pd.read_csv('data/resumes.csv')  # Replace with actual data file

# Assuming data has columns: 'resume_text' (resume content) and 'career_label' (career path)
X = data['resume_text']  # Resume text column
y = data['career_label']  # Career label column

# Convert text data into numerical vectors using TF-IDF
vectorizer = TfidfVectorizer(stop_words='english')
X_vectorized = vectorizer.fit_transform(X)

# Train a logistic regression model
model = LogisticRegression()
model.fit(X_vectorized, y)

# Save the trained model to a file (career_model.pkl)
with open('backend/models/career_model.pkl', 'wb') as model_file:
    pickle.dump(model, model_file)

# Also save the vectorizer to use later for transforming new resume text
with open('backend/models/vectorizer.pkl', 'wb') as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)

print("Model training complete and saved as career_model.pkl.")
