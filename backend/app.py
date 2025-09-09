from flask import Flask, request, jsonify
from flask_cors import CORS

from routes.auth import auth_bp
from routes.resume_parser import parse_resume
from routes.job_matching import match_job
from routes.career_predictor import predict_career_path
from routes.ats_simulator import ats_feedback


app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})




app.register_blueprint(auth_bp, url_prefix="/api/auth")

# Endpoint to upload and parse resume
@app.route('/api/upload', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        from routes.resume_parser import parse_resume  # Safe here
        parsed_data = parse_resume(file)
        return jsonify({
            'message': 'Resume uploaded successfully',
            'data': parsed_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Endpoint for job matching
@app.route('/api/match', methods=['POST'])
def job_matching():
    data = request.get_json()
    resume_text = data.get('resume_text')
    job_description = data.get('job_description')

    if not resume_text or not job_description:
        return jsonify({'error': 'Missing resume text or job description'}), 400

    result = match_job(resume_text, job_description)
    
    return jsonify(result)



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
    app.run(debug=True)
    





#PS C:\Users\KUSHW\OneDrive\Desktop\ai-resume-builder> venv\scripts\activate
#(venv) PS C:\Users\KUSHW\OneDrive\Desktop\ai-resume-builder> cd backend
#(venv) PS C:\Users\KUSHW\OneDrive\Desktop\ai-resume-builder\backend> python app.py