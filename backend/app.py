from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

from routes.auth import auth_bp
from routes.resume_parser import parse_resume
#from routes.job_matching import match_job
from routes.career_predictor import predict_career_path
from routes.ats_simulator import ats_feedback
from routes.resume_optimizer import optimizer_bp
from utils.candidate_ranker import rank_candidates_from_file, rank_resumes, rankings_to_csv, resume_rankings_to_csv


app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": [
    "https://airesumebuilder-six-brown.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]}})


app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(optimizer_bp, url_prefix="/api/optimizer")

# Endpoint to upload and parse resume

        
@app.route('/api/upload', methods=['POST'])
def upload_resume():

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # File → text extraction
        from routes.resume_parser import parse_resume
        parsed_data = parse_resume(file)  # contains "text"

        resume_text = parsed_data.get("text")
        if not resume_text:
            return jsonify({
                "error": "No readable text found in this resume. Please upload a text-based PDF or DOCX file."
            }), 422

        # Text → evaluation (LINKING HERE)
        from utils.resume_json_parser import parse_resume_to_json
        evaluated_json = parse_resume_to_json(resume_text)

        return jsonify({
            'message': 'Resume uploaded and evaluated successfully',
            'resume_json': evaluated_json
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route("/api/match", methods=["POST"])
def job_matching():
    data = request.get_json(silent=True) or {}

    resume_text = (data.get("resume_text") or "").strip()
    job_description = (data.get("job_description") or "").strip()
    temperature = float(data.get("temperature", 0.5))
    max_tokens = int(data.get("max_tokens", 512))

    if not resume_text or not job_description:
        return jsonify({
            "error": "Missing resume text or job description",
            "required_fields": ["resume_text", "job_description"]
        }), 400

    try:
        analysis = analyze_resume_with_groq(
            resume_text=resume_text,
            job_description=job_description,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return jsonify({
            "analysis": analysis,
            "evaluation_report": {
                "analysis": analysis,
                "source": "groq",
            },
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to process match request",
            "message": str(e)
        }), 500


@app.route("/api/rephrase", methods=["POST"])
def rephrase_resume_text():
    data = request.get_json(silent=True) or {}

    text = (data.get("text") or "").strip()
    temperature = float(data.get("temperature", 0.5))
    max_tokens = int(data.get("max_tokens", 512))

    if not text:
        return jsonify({
            "error": "Missing text to rephrase",
            "required_fields": ["text"]
        }), 400

    try:
        rephrased_text = rephrase_text_with_groq(
            text=text,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return jsonify({
            "rephrased_text": rephrased_text,
            "source": "groq",
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to rephrase text",
            "message": str(e)
        }), 500


@app.route("/api/cover-letter", methods=["POST", "OPTIONS"])
def cover_letter_generator():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}

    resume_text = (data.get("resume_text") or "").strip()
    job_description = (data.get("job_description") or "").strip()
    temperature = float(data.get("temperature", 0.5))
    max_tokens = int(data.get("max_tokens", 512))

    if not resume_text or not job_description:
        return jsonify({
            "error": "Missing resume text or job description",
            "required_fields": ["resume_text", "job_description"]
        }), 400

    try:
        cover_letter = generate_cover_letter_with_groq(
            resume_text=resume_text,
            job_description=job_description,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return jsonify({
            "cover_letter": cover_letter,
            "source": "groq",
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to generate cover letter",
            "message": str(e)
        }), 500


@app.route("/api/rank-candidates", methods=["POST", "OPTIONS"])
def rank_candidates():
    if request.method == "OPTIONS":
        return "", 204

    candidate_file = request.files.get("candidates")
    job_description = ""
    top_n = 100

    if request.form:
        job_description = (request.form.get("job_description") or "").strip()
        top_n = int(request.form.get("top_n") or 100)

    if request.is_json:
        data = request.get_json(silent=True) or {}
        job_description = (data.get("job_description") or "").strip()
        top_n = int(data.get("top_n") or 100)
        candidates = data.get("candidates")
        if candidates:
            from io import StringIO
            candidate_file = StringIO(json.dumps(candidates))

    if candidate_file is None:
        return jsonify({
            "error": "Missing candidates file",
            "required_fields": ["candidates"]
        }), 400

    try:
        rankings = rank_candidates_from_file(candidate_file, job_description=job_description, top_n=top_n)
        csv_text = rankings_to_csv(rankings)

        return jsonify({
            "rankings": rankings,
            "csv": csv_text,
            "count": len(rankings),
            "source": "deterministic_candidate_ranker",
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to rank candidates",
            "message": str(e)
        }), 500


@app.route("/api/rank-resumes", methods=["POST", "OPTIONS"])
def rank_resume_files():
    if request.method == "OPTIONS":
        return "", 204

    resume_files = request.files.getlist("resumes")
    job_description = (request.form.get("job_description") or "").strip()
    top_n = int(request.form.get("top_n") or 100)

    if not resume_files:
        return jsonify({
            "error": "Missing resume files",
            "required_fields": ["resumes", "job_description"]
        }), 400

    if not job_description:
        return jsonify({
            "error": "Missing job description",
            "required_fields": ["job_description"]
        }), 400

    parsed_resumes = []
    skipped = []

    for index, file in enumerate(resume_files, start=1):
        filename = file.filename or f"resume_{index}"
        try:
            parsed = parse_resume(file)
            text = (parsed.get("text") or "").strip()
            if not text:
                skipped.append({
                    "filename": filename,
                    "reason": "No readable text found"
                })
                continue

            parsed_resumes.append({
                "resume_id": f"RESUME_{index:04d}",
                "filename": filename,
                "text": text,
            })
        except Exception as exc:
            skipped.append({
                "filename": filename,
                "reason": str(exc)
            })

    if not parsed_resumes:
        return jsonify({
            "error": "No readable resumes found",
            "skipped": skipped
        }), 422

    try:
        rankings = rank_resumes(parsed_resumes, job_description=job_description, top_n=top_n)
        csv_text = resume_rankings_to_csv(rankings)

        return jsonify({
            "rankings": rankings,
            "csv": csv_text,
            "count": len(rankings),
            "skipped": skipped,
            "source": "deterministic_resume_ranker",
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to rank resumes",
            "message": str(e),
            "skipped": skipped,
        }), 500


def generate_groq_response(message: str, system_prompt: str, temperature: float = 0.5, max_tokens: int = 512):
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured in the backend environment.")

    try:
        from groq import Groq
    except ImportError as exc:
        raise RuntimeError("The groq package is not installed. Install backend requirements again.") from exc

    client = Groq(api_key=groq_api_key)
    conversation = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message},
    ]

    response = client.chat.completions.create(
        model=os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant"),
        messages=conversation,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=False,
    )

    return response.choices[0].message.content


def analyze_resume_with_groq(resume_text, job_description, temperature: float = 0.5, max_tokens: int = 512):
    prompt = f"""
Please analyze the following resume in the context of the job description provided.
Strictly check every single line in the job description and analyze the resume for exact matches.
Maintain high ATS standards and give scores only to the correct matches.
Focus on missing hard skills and soft skills.

Provide the following details:
1. The match percentage of the resume to the job description.
2. A list of accurate missing keywords.
3. Final thoughts on the resume's overall match with the job description in 3 lines.
4. Recommendations on how to add the missing keywords and improve the resume in 3-4 points with examples.

Job Description:
{job_description}

Resume:
{resume_text}
"""
    return generate_groq_response(
        prompt,
        "You are an expert ATS resume analyzer.",
        temperature=temperature,
        max_tokens=max_tokens,
    )


def rephrase_text_with_groq(text, temperature: float = 0.5, max_tokens: int = 512):
    prompt = f"""
Please rephrase the following text according to ATS standards, including quantifiable measures and improvements where possible.
Maintain precise and concise points which will pass ATS screening.

Original Text:
{text}
"""
    return generate_groq_response(
        prompt,
        "You are an expert in rephrasing content for ATS optimization.",
        temperature=temperature,
        max_tokens=max_tokens,
    )


def generate_cover_letter_with_groq(resume_text, job_description, temperature: float = 0.5, max_tokens: int = 512):
    prompt = f"""
Generate a cover letter in this structure:

1. Opening paragraph (role + company interest)
2. Skills & experience matching job
3. Achievements with metrics
4. Closing paragraph with enthusiasm

Keep it ATS-friendly and impactful.

Resume:
{resume_text}

Job Description:
{job_description}
"""
    return generate_groq_response(
        prompt,
        "You are an expert cover letter writer for ATS-friendly job applications.",
        temperature=temperature,
        max_tokens=max_tokens,
    )




# Endpoint for career path prediction
@app.route('/api/career-prediction', methods=['POST'])
def career_prediction():
    data = request.get_json()
    resume_data = data.get('resume_data')
    
    predicted_career = predict_career_path(resume_data)
    return jsonify(predicted_career)



# Endpoint for ATS simulation and feedback
@app.route('/api/ats-feedback', methods=['POST'])
def ats_feedback_route():
    data = request.get_json()
    resume_data = data.get('resume_data')
    job_role = data.get('job_role')
    
    ats_feedback_result = ats_feedback(resume_data, job_role)
    return jsonify(ats_feedback_result)

# Endpoint to get available job roles
@app.route('/api/job-roles', methods=['GET'])
def get_job_roles():
    from utils.ats_utils import load_job_descriptions
    job_descriptions = load_job_descriptions()

    # Handle list case (some JSON loaders may return list of dicts)
    if isinstance(job_descriptions, list) and len(job_descriptions) > 0:
        job_descriptions = job_descriptions[0]

    return jsonify({"roles": list(job_descriptions.keys())})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
    





#PS C:\Users\KUSHW\OneDrive\Desktop\ai-resume-builder> venv\scripts\activate
#(venv) PS C:\Users\KUSHW\OneDrive\Desktop\ai-resume-builder> cd backend
#(venv) PS C:\Users\KUSHW\OneDrive\Desktop\ai-resume-builder\backend> python app.py
