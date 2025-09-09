# Import required libraries
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Sample data (replace with your actual dataset)
resume_texts = [
    "Experienced software developer with expertise in Python and Java.",
    "Data scientist skilled in machine learning and data analysis.",
    "Electrical engineer with a background in power systems.",
    # Add more resume text here
]

career_paths = [
    "Software Engineer",
    "Data Scientist",
    "Electrical Engineer",
    # Corresponding career paths for the resume text
]

# Split data for training and testing
X_train, X_test, y_train, y_test = train_test_split(resume_texts, career_paths, test_size=0.2)

# Create a TF-IDF Vectorizer to convert text to numerical data
vectorizer = TfidfVectorizer()
X_train_tfidf = vectorizer.fit_transform(X_train)

# Train a model using Random Forest Classifier
model = RandomForestClassifier()
model.fit(X_train_tfidf, y_train)

# Save the trained model and vectorizer to disk
with open('models/career_model.pkl', 'wb') as model_file:
    pickle.dump(model, model_file)

with open('models/vectorizer.pkl', 'wb') as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)


print("Model and vectorizer saved successfully!")
