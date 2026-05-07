# AI Resume Builder

AI Resume Builder is a full-stack resume analysis and career guidance app. Users can sign up, upload a PDF or DOCX resume, extract resume information, compare it with job descriptions, generate ATS-style feedback, get career path suggestions, and chat with an AI resume optimizer.

## Tech Stack

- Frontend: React, React Router, Tailwind CSS, lucide-react
- Backend: Python, Flask, Flask-CORS, Gunicorn
- Database: MySQL
- AI and NLP: Groq API, spaCy, sentence-transformers
- Resume parsing: PyMuPDF, python-docx
- Voice features: gTTS, SpeechRecognition

## Project Structure

```text
ai-resume-builder/
  backend/
    app.py
    config.py
    db.py
    requirements.txt
    runtime.txt
    data/
    routes/
    utils/
  frontend/
    package.json
    src/
      components/
      pages/
```

## Prerequisites

Install these before running the project:

- Python 3.11
- Node.js and npm
- MySQL server or a hosted MySQL database
- Git
- A Groq API key for AI features
- Optional: Gmail app password for forgot-password emails

The backend is configured for Python `3.11.9` in `backend/runtime.txt`.

## 1. Clone the Repository

```bash
git clone https://github.com/AakashKushwaha07/AI-Resume-Builder
cd ai-resume-builder
```

## 2. Backend Setup

Open a terminal from the project root.

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

Windows PowerShell:

```bash
venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```bash
venv\Scripts\activate.bat
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Note: the first install may take time because `sentence-transformers`, `spacy`, and their dependencies are large.

## 3. Backend Environment Variables

Create a file named `.env` inside the `backend` folder:

```env
SECRET_KEY=change_this_to_a_long_random_secret

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_resume_builder
DB_PORT=3306
DB_SSL_DISABLED=true

GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

Required variables:

- `SECRET_KEY`: used for JWT authentication.
- `GROQ_API_KEY`: required for job match, rephrase, cover letter, and optimizer chat features.
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: required for signup/login.

Optional variables:

- `GROQ_MODEL`: defaults to `llama-3.1-8b-instant` if not set.
- `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD`: required only for forgot-password email sending.

Never commit real `.env` files or API keys to Git.

## 4. MySQL Database Setup

Create the database:

```sql
CREATE DATABASE ai_resume_builder;
USE ai_resume_builder;
```

Create the `users` table:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Make sure the database name and credentials match your `backend/.env` file.

## 5. Run the Backend

From the `backend` folder with the virtual environment activated:

```bash
python app.py
```

The backend should start at:

```text
http://127.0.0.1:5000
```

Important: run the backend from inside the `backend` folder. Some data files are loaded using relative paths such as `data/career_path.csv` and `data/job_descriptions.json`.

The first backend startup may download the sentence-transformers model `paraphrase-MiniLM-L6-v2`. Keep internet enabled for the first run.

## 6. Frontend Setup

Open a second terminal from the project root.

```bash
cd frontend
npm install
```

Create a file named `.env` inside the `frontend` folder:

```env
REACT_APP_API_URL=http://127.0.0.1:5000
DISABLE_ESLINT_PLUGIN=true
```

Start the frontend:

```bash
npm start
```

The frontend should open at:

```text
http://localhost:3000
```

If it does not open automatically, visit that URL in your browser.

## 7. Local Run Checklist

To run the full project locally:

1. Start MySQL.
2. Create the database and `users` table.
3. Add `backend/.env`.
4. Start the backend from the `backend` folder with `python app.py`.
5. Add `frontend/.env`.
6. Start the frontend from the `frontend` folder with `npm start`.
7. Open `http://localhost:3000`.
8. Sign up, log in, upload a resume, and test the dashboard features.

## Main Backend APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/upload`
- `POST /api/match`
- `POST /api/rephrase`
- `POST /api/cover-letter`
- `POST /api/career-prediction`
- `POST /api/ats-feedback`
- `GET /api/job-roles`
- `POST /api/optimizer/chat`
- `POST /api/optimizer/voice-to-text`

## Build Frontend for Production

From the `frontend` folder:

```bash
npm run build
```

This creates a production build in:

```text
frontend/build
```

## Render Backend Deployment Notes

For Render, use the backend requirements file:

```bash
pip install -r backend/requirements.txt
```

Example start command:

```bash
gunicorn --chdir backend app:app --bind 0.0.0.0:$PORT
```

Add the same backend environment variables in the Render dashboard. Do not upload `.env` files.

## Troubleshooting

Backend cannot connect to MySQL:

- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.
- Make sure the `users` table exists.
- For local MySQL, `DB_SSL_DISABLED=true` is usually fine.

Frontend cannot reach backend:

- Confirm the backend is running at `http://127.0.0.1:5000`.
- Confirm `frontend/.env` contains `REACT_APP_API_URL=http://127.0.0.1:5000`.
- Restart `npm start` after changing frontend `.env`.

spaCy model error:

- Reinstall backend requirements:

```bash
pip install -r requirements.txt
```

Sentence-transformers model download is slow:

- Keep internet enabled during first backend startup.
- After the model is cached locally, later startups should be faster.

Forgot password email fails:

- Use a Gmail app password, not your normal Gmail password.
- Check `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD`.

Large dependency install:

- This is expected because career prediction uses `sentence-transformers`, which installs ML libraries such as PyTorch.

## Security Notes

- Keep `.env` files private.
- Rotate any API keys or passwords that were accidentally committed or shared.
- Use a strong `SECRET_KEY` in production.
- Configure production CORS origins before deploying publicly.
