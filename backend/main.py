# backend/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
import os
import uuid

# 🔽 Import the pause-to-speech analyzer
from analysis.audio_features import get_pause_to_speech_ratio

app = FastAPI()

# Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to localhost
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}.webm")
    output_path = os.path.join(UPLOAD_DIR, f"{file_id}.wav")

    # Save the uploaded .webm file
    with open(input_path, "wb") as f:
        f.write(await file.read())

    # Convert to .wav
    try:
        audio = AudioSegment.from_file(input_path, format="webm")
        audio.export(output_path, format="wav")
    except Exception as e:
        return {"error": "Conversion failed", "details": str(e)}

    # 🔍 Analyze pause-to-speech ratio
    result = get_pause_to_speech_ratio(output_path)
    print("Pause analysis:", result)

    # Return analysis result
    return {
        "message": "Audio processed and analyzed",
        "file_id": file_id,
        "pause_to_speech_analysis": result
    }
