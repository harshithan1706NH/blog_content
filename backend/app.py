from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import subprocess
import os
import requests
FFMPEG_PATH = r"C:\Users\Abi-sakthi\Downloads\ffmpeg-9.0.1-essentials_build\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\Users\Abi-sakthi\Downloads\ffmpeg-9.0.1-essentials_build\ffmpeg-9.0.1-essentials_build\bin\ffprobe.exe"


load_dotenv()

app = Flask(__name__)

CORS(app)

# -----------------------------
# Cloudinary Configuration
# -----------------------------

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


# -----------------------------
# Get Video Duration
# -----------------------------

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


# -----------------------------
# Extract Audio using FFmpeg
# -----------------------------

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

    # Download video from Cloudinary
    response = requests.get(video_url)

    if response.status_code != 200:
        raise Exception(
            "Could not download video from Cloudinary"
        )

    with open(video_path, "wb") as file:
        file.write(response.content)

    # FFmpeg command
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

    # Delete temporary video
    if os.path.exists(video_path):
        os.remove(video_path)

    if result.returncode != 0:
        raise Exception(
            "FFmpeg audio extraction failed: "
            + result.stderr
        )

    return output_path


# -----------------------------
# Home Route
# -----------------------------

@app.route("/")
def home():

    return "Backend is running!"


# -----------------------------
# Video Upload Route
# -----------------------------

@app.route("/upload", methods=["POST"])
def upload_video():

    # Check whether video was uploaded
    if "video" not in request.files:

        return jsonify({
            "success": False,
            "message": "No video file uploaded"
        }), 400

    video = request.files["video"]

    # Check whether file was selected
    if video.filename == "":

        return jsonify({
            "success": False,
            "message": "No video selected"
        }), 400

    # Check file format
    if not video.filename.lower().endswith(".mp4"):

        return jsonify({
            "success": False,
            "message": "Only MP4 videos are supported"
        }), 400


    # -----------------------------
    # Temporary Upload Folder
    # -----------------------------

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

    # Save video temporarily
    video.save(temp_path)


    try:

        # -----------------------------
        # Check Video Duration
        # -----------------------------

        duration = get_video_duration(
            temp_path
        )

        max_duration = 30 * 60

        # Reject videos longer than 30 minutes
        if duration > max_duration:

            os.remove(temp_path)

            return jsonify({
                "success": False,
                "message": "Video duration exceeds 30 minutes",
                "duration_seconds": round(
                    duration,
                    2
                )
            }), 400


        # -----------------------------
        # Upload Video to Cloudinary
        # -----------------------------

        result = cloudinary.uploader.upload(
            temp_path,
            resource_type="video",
            folder="blog_videos"
        )


        # -----------------------------
        # Save Video to PostgreSQL
        # -----------------------------

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
            1,
            video.filename,
            "mp4",
            round(duration),
            result.get("secure_url")
        ))

        video_id = cursor.fetchone()[0]

        connection.commit()

        cursor.close()

        connection.close()


        # -----------------------------
        # Delete Temporary Video
        # -----------------------------

        os.remove(temp_path)


        # -----------------------------
        # Prepare Audio File
        # -----------------------------

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


        # -----------------------------
        # Extract Audio
        # -----------------------------

        extract_audio(
            result.get("secure_url"),
            audio_path
        )


        # -----------------------------
        # Return Response
        # -----------------------------

        return jsonify({

            "success": True,

            "message":
                "Video uploaded and audio extracted successfully",

            "video_id":
                video_id,

            "filename":
                video.filename,

            "duration_seconds":
                round(duration, 2),

            "public_id":
                result.get("public_id"),

            "video_url":
                result.get("secure_url"),

            "audio_file":
                audio_path
        })


    except Exception as e:

        # Delete temporary upload if it still exists
        if os.path.exists(temp_path):

            os.remove(temp_path)

        return jsonify({

            "success": False,

            "message":
                "Video processing failed",

            "error":
                str(e)
        }), 500


# -----------------------------
# Start Flask
# -----------------------------

if __name__ == "__main__":

    app.run(
        debug=True
    )