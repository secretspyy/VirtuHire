from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import os
import uuid
from pydub import AudioSegment
import whisper

from database import Base, engine, SessionLocal
import models
from routers import auth, profile
from routers.auth import get_current_user
from analysis.filler_detection import detect_filler_words
from analysis.audio_features import get_pause_to_speech_ratio
from analysis.stress_detection import analyze_stress
from routers.reports import router as reports_router




# -------------------
# DB Init
# -------------------
Base.metadata.create_all(bind=engine)

# -------------------
# FastAPI App
# -------------------
app = FastAPI(
    title="VirtuHire API",
    description="API for VirtuHire - AI-powered interview practice platform",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to VirtuHire API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# -------------------
# Allow frontend requests (CORS)
# -------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# -------------------
# Register Routers (IMPORTANT)
# -------------------
# ✅ Do not duplicate include_router() — just include once
app.include_router(auth.router)     # Has prefix="/auth"
app.include_router(profile.router)  # Has prefix="/profile"
app.include_router(reports_router)  # Has prefix="/interview"
# -------------------
# Audio Analysis Setup
# -------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

whisper_model = whisper.load_model("base")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------
# Protected Audio Endpoint
# -------------------
@app.post("/analyze-audio")
async def analyze_audio(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}.webm")
    output_path = os.path.join(UPLOAD_DIR, f"{file_id}.wav")

    try:
        # Save uploaded file
        with open(input_path, "wb") as f:
            f.write(await file.read())

        # Convert to .wav
        try:
            audio = AudioSegment.from_file(input_path, format="webm")
            audio.export(output_path, format="wav")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Audio conversion failed: {str(e)}")

        # Run analyses
        pause_result = get_pause_to_speech_ratio(output_path)
        filler_result = detect_filler_words(output_path)
        stress_result = analyze_stress(output_path)

        transcript_text = filler_result.get("transcription", "")
        filler_words = list(filler_result.get("filler_words", {}).keys())

        # Save to DB
        analysis_record = models.AudioAnalysis(
            file_id=file_id,
            transcription=transcript_text,
            pause_to_speech_analysis=pause_result,
            filler_word_analysis=filler_result,
            stress_analysis=stress_result,
            user_id=current_user.id
        )
        db.add(analysis_record)
        db.commit()

        return {
            "message": "Audio processed and saved",
            "file_id": file_id,
            "user_email": current_user.email,
            "pause_to_speech_analysis": pause_result,
            "filler_word_analysis": {"filler_words": filler_words},
            "stress_analysis": stress_result,
            "transcription": transcript_text
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temporary files
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.remove(path)

# -------------------
# Fetch analyses for logged-in user
# -------------------
@app.get("/my-analyses")
def get_my_analyses(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = db.query(models.AudioAnalysis).filter_by(user_id=current_user.id).all()
    return analyses
