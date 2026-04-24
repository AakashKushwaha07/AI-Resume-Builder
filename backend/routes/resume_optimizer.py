import json
import time

from flask import Blueprint, request, jsonify, Response, stream_with_context
from models.resume_optimizer import ResumeOptimizerAgent
from utils.resume_json_parser import parse_resume_to_json
from utils.jd_json_parser import parse_jd_to_json

optimizer_bp = Blueprint('optimizer', __name__)

# Initialize the AI agent
optimizer_agent = ResumeOptimizerAgent()

@optimizer_bp.route('/start-session', methods=['POST'])
def start_optimization_session():
    """Start a new resume optimization session"""
    try:
        data = request.get_json()
        resume_text = data.get('resume_text', '').strip()
        job_description = data.get('job_description', '').strip()

        if not resume_text:
            return jsonify({'error': 'Resume text is required'}), 400

        # Parse resume and JD
        try:
            resume_json = parse_resume_to_json(resume_text)
        except Exception as e:
            return jsonify({'error': f'Error parsing resume: {str(e)}'}), 400

        jd_json = None
        if job_description:
            try:
                jd_json = parse_jd_to_json(job_description)
            except Exception as e:
                return jsonify({'error': f'Error parsing job description: {str(e)}'}), 400

        # Start session
        session_id = optimizer_agent.start_session(resume_json, jd_json)

        # Get initial analysis
        try:
            initial_analysis = optimizer_agent.analyze_resume(resume_json, jd_json)
        except Exception as e:
            initial_analysis = f"Session started (analysis pending). Error: {str(e)}"

        return jsonify({
            'session_id': session_id,
            'initial_analysis': initial_analysis,
            'message': 'Resume optimization session started. How can I help you improve your resume?'
        })

    except Exception as e:
        import traceback
        print(f"Error in start_optimization_session: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': f'Failed to start session: {str(e)}',
            'details': traceback.format_exc()
        }), 500

@optimizer_bp.route('/chat', methods=['POST'])
def chat_with_optimizer():
    """Chat with the AI optimizer agent"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        user_message = data.get('message', '').strip()

        if not session_id or not user_message:
            return jsonify({'error': 'Session ID and message are required'}), 400

        # Get AI response
        response = optimizer_agent.process_message(session_id, user_message)

        return jsonify({
            'response': response,
            'session_id': session_id
        })

    except Exception as e:
        import traceback
        print(f"Error in chat_with_optimizer: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': f'Error processing message: {str(e)}',
            'details': traceback.format_exc()
        }), 500


@optimizer_bp.route('/chat-stream', methods=['POST'])
def chat_with_optimizer_stream():
    """Stream chat response for a more real-time UX."""
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id')
        user_message = data.get('message', '').strip()

        if not session_id or not user_message:
            return jsonify({'error': 'Session ID and message are required'}), 400

        if session_id not in optimizer_agent.sessions:
            return jsonify({'error': 'Session expired. Please start a new optimization session.'}), 400

        def generate():
            try:
                response_text = optimizer_agent.process_message(session_id, user_message)

                # Stream sentence-sized chunks so the UI can render progressively.
                chunks = []
                buffer = []
                for part in response_text.split('\n'):
                    if part.strip():
                        buffer.append(part)
                    else:
                        if buffer:
                            chunks.append('\n'.join(buffer))
                            buffer = []
                        chunks.append('\n')
                if buffer:
                    chunks.append('\n'.join(buffer))

                for chunk in chunks:
                    payload = json.dumps({'chunk': chunk})
                    yield f"data: {payload}\n\n"
                    time.sleep(0.02)

                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as stream_error:
                yield f"data: {json.dumps({'error': str(stream_error)})}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        )

    except Exception as e:
        import traceback
        print(f"Error in chat_with_optimizer_stream: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': f'Error starting stream: {str(e)}',
            'details': traceback.format_exc()
        }), 500

@optimizer_bp.route('/suggestions', methods=['GET'])
def get_optimization_suggestions():
    """Get specific optimization suggestions"""
    session_id = request.args.get('session_id')

    if not session_id:
        return jsonify({'error': 'Session ID is required'}), 400

    suggestions = optimizer_agent.get_suggestions(session_id)

    return jsonify({
        'suggestions': suggestions,
        'session_id': session_id
    })
