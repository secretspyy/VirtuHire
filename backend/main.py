from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from analysis.filler_detection import detect_filler_words
from analysis.audio_features import get_pause_to_speech_ratio
from pydub import AudioSegment
import os
import uuid
import whisper

app = FastAPI()

# Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load Whisper model once (outside endpoint)
whisper_model = whisper.load_model("base")  # Or "small", "medium" for more accuracy

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

    # Analyze pause-to-speech
    pause_result = get_pause_to_speech_ratio(output_path)

    # Transcribe audio with Whisper
    try:
        transcription = whisper_model.transcribe(output_path)
        transcript_text = transcription.get("text", "")
    except Exception as e:
        transcript_text = "Transcription failed: " + str(e)

    # Detect filler words using audio (you can update this to use transcript if needed)
    filler_result = detect_filler_words(output_path)

    return {
        "message": "Audio processed and analyzed",
        "file_id": file_id,
        "pause_to_speech_analysis": pause_result,
        "filler_word_analysis": filler_result,
        "transcription": transcript_text
    }
