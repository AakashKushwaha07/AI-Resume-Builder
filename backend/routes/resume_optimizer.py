import base64
import os
from io import BytesIO

from flask import Blueprint, jsonify, request
from gtts import gTTS
import speech_recognition as sr

optimizer_bp = Blueprint("optimizer", __name__)


SYSTEM_PROMPT = """
You are Jarvis, an intelligent AI assistant.

- Speak like a human: natural and conversational
- Be slightly witty but professional
- Keep answers concise but helpful
- Act like a personal assistant
- If the user gives commands, respond like you are executing them

Example tone:
"Sure, I've got that covered."
"Here's what I found."
"""


def generate_jarvis_reply(message, history=None, resume_text="", job_description=""):
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured in the backend environment.")

    try:
        from groq import Groq
    except ImportError as exc:
        raise RuntimeError("The groq package is not installed. Install backend requirements again.") from exc

    context = ""
    if resume_text:
        context += f"\nResume context available to you:\n{resume_text[:6000]}\n"
    if job_description:
        context += f"\nJob description context available to you:\n{job_description[:4000]}\n"

    messages = [{"role": "system", "content": SYSTEM_PROMPT + context}]

    for item in history or []:
        user_message = (item.get("user") or "").strip()
        assistant_message = (item.get("assistant") or "").strip()
        if user_message:
            messages.append({"role": "user", "content": user_message})
        if assistant_message:
            messages.append({"role": "assistant", "content": assistant_message})

    messages.append({"role": "user", "content": message})

    client = Groq(api_key=groq_api_key)
    response = client.chat.completions.create(
        model=os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant"),
        messages=messages,
        temperature=float(request.json.get("temperature", 0.5)) if request.is_json else 0.5,
        max_tokens=int(request.json.get("max_tokens", 512)) if request.is_json else 512,
        stream=False,
    )

    return response.choices[0].message.content


def text_to_speech_data_url(text):
    audio_buffer = BytesIO()
    gTTS(text).write_to_fp(audio_buffer)
    encoded_audio = base64.b64encode(audio_buffer.getvalue()).decode("utf-8")
    return f"data:audio/mpeg;base64,{encoded_audio}"


def voice_to_text(audio_file):
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)
        return recognizer.recognize_google(audio)
    except Exception:
        return "Sorry, I couldn't understand the audio."


@optimizer_bp.route("/chat", methods=["POST", "OPTIONS"])
def chat_with_jarvis():
    if request.method == "OPTIONS":
        return "", 204

    try:
        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()
        history = data.get("history") or []
        resume_text = (data.get("resume_text") or "").strip()
        job_description = (data.get("job_description") or "").strip()

        if not message:
            return jsonify({"error": "Message is required"}), 400

        reply = generate_jarvis_reply(
            message=message,
            history=history,
            resume_text=resume_text,
            job_description=job_description,
        )
        audio = text_to_speech_data_url(reply)

        return jsonify({
            "reply": reply,
            "audio": audio,
            "source": "groq",
        })

    except Exception as e:
        return jsonify({
            "error": "Error processing Jarvis message",
            "message": str(e),
        }), 500


@optimizer_bp.route("/voice-to-text", methods=["POST", "OPTIONS"])
def handle_voice_input():
    if request.method == "OPTIONS":
        return "", 204

    if "audio" not in request.files:
        return jsonify({"error": "Audio file is required"}), 400

    text = voice_to_text(request.files["audio"])
    return jsonify({"text": text})
