Your project is an AI Resume Builder and Career Intelligence platform. It helps users upload a resume, analyze it, compare it with job descriptions, get ATS-style feedback, receive career path suggestions, and chat with an AI-style resume optimizer for improvement guidance.

At a high level, it is a full-stack web application built with:

Frontend: React
Backend: Flask / Python
Database: MySQL
AI/NLP: spaCy, scikit-learn, sentence-transformers, custom parsing logic
Resume Parsing: PyMuPDF, pdfminer.six, python-docx
Authentication: JWT-based login/signup system
Project Overview

The main goal of this project is to help job seekers improve their resumes before applying for jobs. Instead of only creating a resume manually, the system analyzes the resume content, extracts important details, compares it with job requirements, and gives useful recommendations.

A user can:

Create an account and log in.
Upload a resume.
Extract resume text and convert it into structured JSON.
Paste a job description.
Check how well the resume matches that job.
Get ATS feedback.
Ask the AI optimizer how to improve the resume.
Explore career path suggestions based on skills and experience.
Frontend Description

The frontend is built using React. The main dashboard is handled by:

frontend/src/components/Dashboard.jsx
This dashboard provides navigation between the major features:

Resume Upload
Job Matcher
AI Optimizer
Career Path
ATS Feedback
The UI uses a sidebar layout with icons from lucide-react. Each section is displayed only when selected. The dashboard keeps shared state such as uploaded resume data, job match results, job description, optimizer results, career results, and ATS feedback.

Important frontend components include:

ResumeUpload.jsx
JobMatcher.jsx
ResumeOptimizer.jsx
CareerPath.jsx
ATSFeedback.jsx
Dashboard.jsx
The frontend communicates with the backend using API calls. The API base URL is configured through:

frontend/.env
Currently:

REACT_APP_API_URL=http://127.0.0.1:5000
Backend Description

The backend is built using Flask and starts from:

backend/app.py
This file creates the Flask app, enables CORS, registers routes, and exposes API endpoints.

Main backend features are split into route files:

backend/routes/auth.py
backend/routes/resume_parser.py
backend/routes/resume_optimizer.py
backend/routes/career_predictor.py
backend/routes/ats_simulator.py
The backend exposes APIs like:

/api/auth/signup
/api/auth/login
/api/auth/forgot-password
/api/auth/reset-password
/api/upload
/api/match
/api/optimizer/start-session
/api/optimizer/chat
/api/career-prediction
/api/ats-feedback
/api/job-roles
Authentication System

The authentication system is handled in:

backend/routes/auth.py
It supports:

Signup
Login
Forgot password
Reset password
JWT token generation
Password hashing
MySQL user storage
Email reset link through Gmail SMTP
Passwords are hashed using Werkzeug security helpers. Login returns a JWT token with user information.

Resume Upload and Parsing

The resume upload feature allows a user to upload a resume file. The backend extracts text from the file and then sends that text through a parser.

The upload endpoint is in:

backend/app.py
The parser converts raw resume text into structured data such as:

Education
Experience years
Technical skills
Soft skills
Projects
Raw resume text
This logic is mainly handled by:

backend/utils/resume_json_parser.py
It uses keyword matching and spaCy NLP to detect skills, education, projects, and experience.

Job Matching

The job matcher compares the uploaded resume with a pasted job description.

The job description is parsed by:

backend/utils/jd_json_parser.py
The resume and job description are then evaluated by:

backend/models/evaluation_engine.py
The matching system checks:

Education fit
Experience fit
Mandatory skills
Preferred skills
Soft skills
Project requirement
Semantic similarity
Final match score
Pass/fail eligibility
The response includes a score out of 100 and detailed information about matched and missing skills.

AI Resume Optimizer

The AI optimizer is a conversational assistant inside the app. It lets users ask questions like:

How can I improve my resume?
What are my weaknesses?
Rewrite my summary.
What skills should I learn next?
How is my score generated?
Frontend file:

frontend/src/components/ResumeOptimizer.jsx
Backend route:

backend/routes/resume_optimizer.py
Main agent logic:

backend/models/resume_optimizer.py
This optimizer currently works mostly as a rule-based AI assistant. It stores sessions, remembers resume data, analyzes the resume, and generates contextual responses based on the user’s question.

It can help with:

Professional summary improvement
Experience bullet optimization
Skills section improvement
ATS keywords
Weakness analysis
Score explanation
Resume rewrite planning
DOCX/PDF optimized resume export
Career Path Prediction

The career path module analyzes the user’s resume data and tries to recommend possible career paths or growth directions. It uses skill and career data from backend datasets.

Route file:

backend/routes/career_predictor.py
This feature is useful for suggesting what roles a user may be suitable for based on current skills and experience.

ATS Feedback

The ATS feedback module simulates how an Applicant Tracking System might evaluate the resume.

Route file:

backend/routes/ats_simulator.py
It gives suggestions to make the resume more ATS-friendly, such as improving keywords, skills, formatting, and job relevance.

Database Usage

The project uses MySQL for user authentication data. The database connection is handled through:

backend/db.py
Auth routes use this connection to store and retrieve users during signup, login, and password reset.

Project Flow

The normal user journey is:

User signs up or logs in
User uploads resume
Backend extracts resume text
Resume is converted into structured JSON
User enters job description
Backend parses job description
System compares resume against job description
User receives match score and feedback
User opens AI Optimizer
User chats with optimizer for improvement suggestions
User checks ATS feedback or career path recommendations
In Simple Words

This project is not just a resume builder. It is more like a resume analysis and career guidance system. It helps users understand whether their resume is suitable for a particular job, what skills are missing, how ATS systems may read their resume, and how they can improve their resume before applying.

A good project description for your resume or report could be:

AI Resume Builder is a full-stack web application built with React and Fl
