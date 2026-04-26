from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime, secrets, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from db import get_db_connection
from config import SECRET_KEY, GMAIL_EMAIL, GMAIL_APP_PASSWORD

auth_bp = Blueprint("auth", __name__)

# Temporary token storage (use DB in production)
reset_tokens = {}


# -----------------------------
# Signup
# -----------------------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not (name and email and password):
        return jsonify({"error": "All fields are required"}), 400

    hashed_pw = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if email already exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    print("CHECK EXISTING USER:", existing_user)  # DEBUG

    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    # Insert new user with debug
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed_pw)
        )

        print("INSERT QUERY EXECUTED")  # DEBUG

        conn.commit()
        print("COMMIT DONE")  # DEBUG

        print("Rows affected:", cursor.rowcount)  # DEBUG

    except Exception as e:
        print("❌ DB ERROR:", e)
        return jsonify({"error": "Database insert failed"}), 500

    cursor.close()
    conn.close()

    return jsonify({"message": "User created successfully!"}), 201
# -----------------------------
# Login
# -----------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {"id": user["id"], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    })


# -----------------------------
# Forgot Password (SMTP FIXED)
# -----------------------------
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    print("🔥 FORGOT PASSWORD API HIT 🔥")
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    print("USER FOUND:", user)
    cursor.close()
    conn.close()

    # Security: don't reveal if email exists
    if not user:
        return jsonify({"message": "If that email exists, a reset link has been sent"}), 200

    # Generate token
    reset_token = secrets.token_urlsafe(32)
    reset_tokens[reset_token] = {
        "email": email,
        "expires": datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    }

    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"

    # ---------------- SMTP ----------------
    try:
        print("Connecting to SMTP...")

        msg = MIMEMultipart()
        msg["From"] = GMAIL_EMAIL
        msg["To"] = email
        msg["Subject"] = "Password Reset - AI Resume Builder"

        body = f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password.</p>
            <p>Click below:</p>
            <a href="{reset_link}">Reset Password</a>
            <p>This link expires in 15 minutes.</p>
        </body>
        </html>
        """

        msg.attach(MIMEText(body, "html"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()

        print("Logging in...")
        server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)

        print("Sending email...")
        server.sendmail(GMAIL_EMAIL, [email], msg.as_string())

        server.quit()
        print("Email sent successfully ✅")

    except Exception as e:
        print("SMTP ERROR:", e)
        return jsonify({"error": "Failed to send reset email"}), 500

    return jsonify({"message": "Password reset link sent to your email"}), 200


# -----------------------------
# Reset Password
# -----------------------------
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    token_data = reset_tokens.get(token)

    if not token_data:
        return jsonify({"error": "Invalid or expired token"}), 400

    if token_data["expires"] < datetime.datetime.utcnow():
        del reset_tokens[token]
        return jsonify({"error": "Token has expired"}), 400

    email = token_data["email"]
    hashed_pw = generate_password_hash(new_password)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "UPDATE users SET password = %s WHERE email = %s",
        (hashed_pw, email)
    )
    conn.commit()
    cursor.close()
    conn.close()

    del reset_tokens[token]

    return jsonify({
        "message": "Password reset successfully! You can now login."
    }), 200