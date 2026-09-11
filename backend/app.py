from flask import Flask, request, jsonify, session
from flask_cors import CORS
from db import get_db_connection
from transcript_cleaner import clean_transcript
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import subprocess
import os
import requests

load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "development-secret-key")

CORS(app, supports_credentials=True)

FFMPEG_PATH = "ffmpeg"
FFPROBE_PATH = "ffprobe"

PARAKEET_PYTHON = r"C:\Users\harsh\Desktop\HARSHITHA N\Project\blog\parakeet-env\Scripts\python.exe"

PARAKEET_SCRIPT = os.path.join(
    app.root_path,
    "parakeet_transcriber.py"
)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


@app.route("/")
def home():
    return "Backend is running!"


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No registration data received"
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name:
        return jsonify({
            "success": False,
            "message": "Name is required"
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters long"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT user_id FROM users WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "An account with this email already exists"
            }), 409

        password_hash = generate_password_hash(password)

        cursor.execute("""
            INSERT INTO users
            (name, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING user_id
        """, (name, email, password_hash))

        user_id = cursor.fetchone()[0]

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful",
            "user_id": user_id
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Registration failed",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No login data received"
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT user_id, name, email, password_hash
            FROM users
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        user_id, name, stored_email, password_hash = user

        if not check_password_hash(password_hash, password):
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        session["user_id"] = user_id
        session["user_name"] = name
        session["user_email"] = stored_email

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "user_id": user_id,
                "name": name,
                "email": stored_email
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Login failed",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route("/session", methods=["GET"])
def get_session():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "authenticated": False
        }), 401

    return jsonify({
        "success": True,
        "authenticated": True,
        "user": {
            "user_id": session.get("user_id"),
            "name": session.get("user_name"),
            "email": session.get("user_email")
        }
    }), 200


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    }), 200


def get_video_duration(video_path):
    command = [
        FFPROBE_PATH,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise Exception("Could not determine video duration")

    return float(result.stdout.strip())


def extract_audio(video_url, output_path):
    processing_folder = os.path.join(
        app.root_path,
        "processing"
    )

    os.makedirs(
        processing_folder,
        exist_ok=True
    )

    video_path = os.path.join(
        processing_folder,
        "temp_video.mp4"
    )

    response = requests.get(video_url)

    if response.status_code != 200:
        raise Exception(
            "Could not download video from Cloudinary"
        )

    with open(video_path, "wb") as file:
        file.write(response.content)

    command = [
        FFMPEG_PATH,
        "-y",
        "-i", video_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        output_path
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if os.path.exists(video_path):
        os.remove(video_path)

    if result.returncode != 0:
        raise Exception(
            "FFmpeg audio extraction failed: " + result.stderr
        )

    return output_path

def transcribe_audio(audio_path):
    result = subprocess.run(
        [PARAKEET_PYTHON, PARAKEET_SCRIPT, audio_path],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip())

    return result.stdout.strip()


def save_transcript(video_id, transcript):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO transcripts
            (video_id, transcript_text)
            VALUES (%s, %s)
            RETURNING transcript_id
        """, (
            video_id,
            transcript
        ))

        transcript_id = cursor.fetchone()[0]

        connection.commit()

        return transcript_id

    except Exception as e:
        if connection:
            connection.rollback()

        raise Exception(
            "Failed to save transcript: " + str(e)
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.route("/upload", methods=["POST"])
def upload_video():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "You must be logged in to upload a video"
        }), 401

    if "video" not in request.files:
        return jsonify({
            "success": False,
            "message": "No video file uploaded"
        }), 400

    video = request.files["video"]

    if video.filename == "":
        return jsonify({
            "success": False,
            "message": "No video selected"
        }), 400

    if not video.filename.lower().endswith(".mp4"):
        return jsonify({
            "success": False,
            "message": "Only MP4 videos are supported"
        }), 400

    upload_folder = os.path.join(
        app.root_path,
        "uploads"
    )

    os.makedirs(
        upload_folder,
        exist_ok=True
    )

    temp_path = os.path.join(
        upload_folder,
        video.filename
    )

    video.save(temp_path)

    try:
        duration = get_video_duration(temp_path)

        max_duration = 30 * 60

        if duration > max_duration:
            os.remove(temp_path)

            return jsonify({
                "success": False,
                "message": "Video duration exceeds 30 minutes",
                "duration_seconds": round(duration, 2)
            }), 400

        result = cloudinary.uploader.upload(
            temp_path,
            resource_type="video",
            folder="blog_videos"
        )

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO videos
            (
                user_id,
                filename,
                format,
                duration_seconds,
                cloudinary_url
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING video_id
        """, (
            user_id,
            video.filename,
            "mp4",
            round(duration),
            result.get("secure_url")
        ))

        video_id = cursor.fetchone()[0]

        connection.commit()

        cursor.close()
        connection.close()

        os.remove(temp_path)

        processing_folder = os.path.join(
            app.root_path,
            "processing"
        )

        os.makedirs(
            processing_folder,
            exist_ok=True
        )

        audio_path = os.path.join(
            processing_folder,
            "audio.wav"
        )

        extract_audio(
            result.get("secure_url"),
            audio_path
        )

        raw_transcript = transcribe_audio(audio_path)

        cleaned_transcript = clean_transcript(
            raw_transcript
        )

        transcript_id = save_transcript(
            video_id,
            cleaned_transcript
        )

        return jsonify({
            "success": True,
            "message": "Video uploaded and transcript generated successfully",
            "video_id": video_id,
            "filename": video.filename,
            "duration_seconds": round(duration, 2),
            "public_id": result.get("public_id"),
            "video_url": result.get("secure_url"),
            "audio_file": audio_path,
            "transcript_id": transcript_id,
            "raw_transcript": raw_transcript,
            "transcript": cleaned_transcript
        }), 200

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)

        return jsonify({
            "success": False,
            "message": "Video processing failed",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)